from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
import joblib
import pandas as pd
import os
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta

import models, auth
from database import engine, get_db
import json
from urllib.parse import quote_plus
from dotenv import load_dotenv
load_dotenv()

# Load Master Data
base_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(base_dir, '../data/master_data.json')

try:
    with open(data_path, 'r', encoding='utf-8') as f:
        master_data = json.load(f)
        career_blueprints = master_data.get("blueprints", {})
except Exception as e:
    print("FAILED TO LOAD MASTER DATA:", e)
    master_data = None
    career_blueprints = {}


# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/metadata")
def get_metadata():
    if master_data:
        return {
            "specializations": master_data.get("specializations", []),
            "skills": master_data.get("skills", []),
            "certifications": master_data.get("certifications", [])
        }
    return {"specializations": [], "skills": [], "certifications": []}

import __main__
def split_skills(x):
    if pd.isna(x): return []
    return [s.strip() for s in x.split(',')]
__main__.split_skills = split_skills

# Load model or train automatically if missing
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully from disk.")
    except Exception as e:
        print(f"Error loading model from {MODEL_PATH}: {e}")

if model is None:
    print(f"Model not available at {MODEL_PATH}. Training model on startup...")
    try:
        import train_model
        model = train_model.main()
        if model is None and os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
        print("Model trained and loaded successfully.")
    except Exception as e:
        print(f"Failed to auto-train model on startup: {e}")

# --- Auth Endpoints ---

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/api/auth/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/api/auth/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me")
def read_users_me(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Fetch learning path if it exists
    path = current_user.learning_path
    
    return {
        "username": current_user.username,
        "has_path": path is not None,
        "learning_path_data": {
            "recommended_career": path.recommended_career,
            "learning_path": path.path_data,
            "explanation": path.explanation
        } if path else None
    }


# --- Learning Endpoints ---

class UserProfile(BaseModel):
    education: str
    specialization: str
    skills: list[str]
    certifications: str
    cgpa: int

class RecommendationResponse(BaseModel):
    recommended_career: str
    learning_path: list[dict]
    explanation: str

def get_course_links(topic: str, item_type: str = "Course") -> dict:
    """Generate real platform search/browse URLs for a given topic."""
    q = quote_plus(topic)
    skill_q = quote_plus(topic.split()[-1])  # last word as keyword for fCC

    if item_type == "Project":
        return {
            "github":       f"https://github.com/search?q={q}&type=repositories",
            "youtube":      f"https://www.youtube.com/results?search_query={q}+project+tutorial",
            "freecodecamp": f"https://www.freecodecamp.org/news/search/?query={skill_q}+project",
            "devto":        f"https://dev.to/search?q={q}",
        }
    elif item_type == "Certification":
        return {
            "coursera":  f"https://www.coursera.org/search?query={q}&productDifficultyLevel=Professional+Certificate",
            "udemy":     f"https://www.udemy.com/courses/search/?q={q}+certification",
            "linkedin":  f"https://www.linkedin.com/learning/search?keywords={q}",
            "credly":    f"https://www.credly.com/badges/search?query={q}",
        }
    else:  # Course (default)
        return {
            "udemy":        f"https://www.udemy.com/courses/search/?q={q}",
            "coursera":     f"https://www.coursera.org/search?query={q}",
            "youtube":      f"https://www.youtube.com/results?search_query={q}+full+course",
            "freecodecamp": f"https://www.freecodecamp.org/news/search/?query={skill_q}",
        }


def generate_mock_learning_path(career: str, user_skills: list[str]) -> list[dict]:
    path = []

    blueprint = career_blueprints.get(career, {"core": ["Industry Basics"], "adv": ["Advanced Concepts", "Tooling"]})

    # 1. Bridge the gap (Core Skills)
    for skill in blueprint["core"]:
        if skill not in user_skills:
            title = f"Foundations of {skill}"
            path.append({
                "title": title,
                "type": "Course",
                "duration": "4 weeks",
                "links": get_course_links(title, "Course")
            })

    # 2. Add advanced specialization
    for adv_skill in blueprint["adv"][:2]:
        title = f"Mastering {adv_skill}"
        path.append({
            "title": title,
            "type": "Course",
            "duration": "6 weeks",
            "links": get_course_links(title, "Course")
        })

    # 3. Always include a hands-on project
    title = f"Real-world {career} Capstone"
    path.append({
        "title": title,
        "type": "Project",
        "duration": "8 weeks",
        "links": get_course_links(title, "Project")
    })

    # 4. Final Certification
    title = f"Certified {career} Professional Exam"
    path.append({
        "title": title,
        "type": "Certification",
        "duration": "2 weeks",
        "links": get_course_links(title, "Certification")
    })

    return path


@app.post("/api/recommend", response_model=RecommendationResponse)
def get_recommendation(
    profile: UserProfile, 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not model:
        return {"recommended_career": "Unknown (Model not loaded)", "learning_path": [], "explanation": "Model failed to load."}
    
    input_data = pd.DataFrame([{
        "Education_Level": profile.education,
        "Specialization": profile.specialization,
        "Skills": ", ".join(profile.skills),
        "Certifications": profile.certifications,
        "CGPA": profile.cgpa
    }])
    
    career = model.predict(input_data)[0]
    path = generate_mock_learning_path(career, profile.skills)
    explanation = f"Based on your background in {profile.specialization} (CGPA: {profile.cgpa}) and skills in {', '.join(profile.skills)}, our AI strongly suggests pursuing a career as a {career}. We have tailored a learning path that focuses on bridging your skill gaps."
    
    # Save to database
    db_path = current_user.learning_path
    if not db_path:
        db_path = models.LearningPath(user_id=current_user.id)
        db.add(db_path)
    
    db_path.recommended_career = str(career)
    db_path.path_data = path
    db_path.explanation = explanation
    db.commit()

    return {
        "recommended_career": str(career),
        "learning_path": path,
        "explanation": explanation
    }

class SelectCareerRequest(BaseModel):
    career: str
    skills: list[str]

@app.post("/api/select_career")
def select_career(
    req: SelectCareerRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    path = generate_mock_learning_path(req.career, req.skills)
    explanation = f"You have chosen to pursue a career as a {req.career}. We have tailored a learning path that focuses on bridging your skill gaps based on your current profile."
    
    db_path = current_user.learning_path
    if not db_path:
        db_path = models.LearningPath(user_id=current_user.id)
        db.add(db_path)
    
    db_path.recommended_career = req.career
    db_path.path_data = path
    db_path.explanation = explanation
    db.commit()

    return {
        "recommended_career": req.career,
        "learning_path": path,
        "explanation": explanation
    }

@app.get("/api/careers")
def get_all_careers():
    # Convert dict to list of objects for easier frontend rendering
    return [{"title": k, "skills": v["core"] + v["adv"]} for k, v in career_blueprints.items()]

from groq import Groq

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        return Groq(api_key=api_key)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
        return None

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatMessage(BaseModel):
    message: str
    history: list[ChatHistoryItem] = []

@app.post("/api/chat")
def chat(
    payload: ChatMessage,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    groq_client = get_groq_client()

    # Build personalized context from user's current learning path
    user_context = f"Username: {current_user.username}\n"
    if current_user.learning_path:
        lp = current_user.learning_path
        if lp.recommended_career:
            user_context += f"Target/Recommended Career: {lp.recommended_career}\n"
        if lp.explanation:
            user_context += f"Profile Insights: {lp.explanation}\n"
        if lp.path_data and isinstance(lp.path_data, list):
            course_titles = [c.get("title", "") for c in lp.path_data if isinstance(c, dict) and "title" in c]
            if course_titles:
                user_context += f"Roadmap Milestones: {', '.join(course_titles)}\n"

    system_prompt = (
        "You are LearnAI, a friendly, highly intelligent AI Career & Learning Mentor. "
        "Your mission is to guide students and professionals on career pathways, skill mastery, "
        "curriculum roadmaps, study resources, portfolio projects, and technical interview advice. "
        "Provide clear, actionable, concise, and structured guidance. Use markdown bullet points and headings when helpful.\n\n"
        f"Learner Context:\n{user_context}"
    )

    if groq_client:
        candidate_models = [
            "openai/gpt-oss-120b",
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-20b",
            "groq/compound-mini"
        ]
        messages = [{"role": "system", "content": system_prompt}]
        # Include recent chat history
        for item in payload.history[-8:]:
            role = "assistant" if item.role in ["assistant", "ai"] else "user"
            messages.append({"role": role, "content": item.content})
        messages.append({"role": "user", "content": payload.message})

        for model_choice in candidate_models:
            try:
                completion = groq_client.chat.completions.create(
                    model=model_choice,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=900
                )
                reply = completion.choices[0].message.content
                if reply:
                    return {"reply": reply}
            except Exception as e:
                print(f"Groq error with model {model_choice}: {e}")
                continue

    # Fallback when GROQ_API_KEY is not configured
    msg = payload.message.lower()
    if "goal" in msg or "career" in msg:
        return {"reply": f"That's a great goal, {current_user.username}! To enable full conversational AI with live LLM intelligence, configure your GROQ_API_KEY environment variable. You can also generate your customized roadmap using the Profile Wizard."}
    elif "python" in msg or "sql" in msg or "react" in msg or "ai" in msg:
        return {"reply": "Awesome! In-demand technical skills like these are central to top industry roles. Check out your tailored learning roadmap to see bridging courses and recommended capstone projects."}
    else:
        return {"reply": f"Hello {current_user.username}! I am your LearnAI assistant. Set your GROQ_API_KEY on your server/environment to unlock full interactive coaching on any topic!"}



# --- Serve Built Frontend (Single-Deploy Support) ---
frontend_dist = os.path.abspath(os.path.join(base_dir, '../frontend/dist'))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
