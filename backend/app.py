from fastapi import FastAPI, Depends, HTTPException, status
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

# Load model
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
model = None
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    print(f"Warning: Model not found at {MODEL_PATH}")

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

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
def chat(
    payload: ChatMessage,
    current_user: models.User = Depends(auth.get_current_user)
):
    msg = payload.message.lower()
    if "goal" in msg or "career" in msg:
        return {"reply": f"That's a great goal, {current_user.username}! Could you tell me about your current education and any specific skills you have?"}
    elif "python" in msg or "sql" in msg or "react" in msg:
        return {"reply": "Awesome! Technical skills like those are highly valued. Do you have any certifications to go along with them?"}
    elif "thanks" in msg or "thank you" in msg:
        return {"reply": "You're welcome! Let me know if you need any adjustments to your learning path."}
    else:
        return {"reply": "I see. Let's update your profile with this information. You can use the Profile Wizard to make sure everything is captured accurately, and I'll generate a personalized path for you!"}
