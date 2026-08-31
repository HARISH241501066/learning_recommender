# LearnAI: Personalized Career & Learning Path Recommender

LearnAI is an intelligent web application designed to help students discover their ideal career paths and generate custom-tailored learning curriculums. Powered by a Machine Learning engine trained on hundreds of professional careers, the platform analyzes a user's current skills, education, and specializations to recommend the perfect job and provide a step-by-step course roadmap to get there.

## Key Features
- **AI Career Prediction**: A Scikit-Learn Machine Learning pipeline trained on 20,000 synthetic records to recommend one of 371 specific careers based on user profiles.
- **Dynamic Learning Paths**: Automatically generates bridging courses and skill requirements based on the gap between the user's current skills and their target career.
- **Interactive Careers Explorer**: A searchable database of all 371 careers and their required skills, allowing users to manually bypass the AI and pursue a specific job.
- **AI Chat Assistant**: An integrated conversational interface to ask questions about the generated learning paths.
- **Premium UI/UX**: Built with modern "Glassmorphism" aesthetics, interactive SVG micro-animations, and full Light/Dark mode support.

---

## Tech Stack
- **Frontend**: React, Vite, React Router, CSS Variables (Custom Design System), Lucide-React (Icons)
- **Backend**: FastAPI, Python, SQLAlchemy, SQLite
- **Machine Learning**: Scikit-Learn (RandomForestClassifier, CountVectorizer, OneHotEncoder), Pandas
- **Data**: Synthetic dataset engine scaling to 20k records across 21+ industries

---

## Setup Instructions

### Prerequisites
You need to have the following installed on your machine:
- **Node.js** (v16+)
- **Python** (3.9+)

### 1. Extract the Project
Unzip the `learning_recommender.zip` archive into your desired folder.

### 2. Backend Setup
Open a terminal in the extracted `learning_recommender/backend` directory.

```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate  # On Windows

# Install the required Python packages
pip install -r requirements.txt

# Run the backend server
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```
*The backend API will now be running at `http://localhost:8000`*

### 3. Frontend Setup
Open a **new** terminal in the extracted `learning_recommender/frontend` directory.

```bash
# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
*The frontend application will now be running at `http://localhost:5173`*

---

## Project Structure
- `/backend`: Contains the FastAPI server (`app.py`), database models, auth logic, and the trained Machine Learning model (`model.pkl`).
- `/frontend`: Contains the React application, Vite config, and CSS stylesheets.
- `/data`: Contains the `master_data.json` blueprints and the data generation/parsing scripts used to build the ML dataset.

## Using the Application
1. Open your browser and navigate to `http://localhost:5173`.
2. Register a new account or log in.
3. Fill out the **Profile Wizard** by selecting your education, specialization, and multi-selecting your current skills.
4. View your **AI-Generated Dashboard** to see your recommended career and learning path.
5. Alternatively, click the **Careers** tab to browse all 371 jobs and manually generate a path for any of them!
