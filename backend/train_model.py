import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
import joblib
import os

def split_skills(skill_str):
    if pd.isna(skill_str):
        return []
    return [s.strip() for s in skill_str.split(',')]

def main():
    # Load dataset
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "..", "data", "career_dataset_massive.xlsx")
    
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Please run dataset_generator.py first.")
        return

    df = pd.read_excel(data_path)
    
    # Preprocessing
    X = df.drop(columns=["Recommended_Career"])
    y = df["Recommended_Career"]

    # Preprocessing
    categorical_features = ["Education_Level", "Specialization", "Certifications"]
    numeric_features = ["CGPA"]
    text_feature = "Skills"

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            # Use a custom tokenizer to split by comma instead of spaces
            ("text", CountVectorizer(tokenizer=split_skills, token_pattern=None), text_feature)
        ]
    )

    # To get 99% accuracy on deterministic data, we can increase n_estimators or use a deeper tree if needed, 
    # but RF usually overfits deterministic data perfectly.
    model = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(n_estimators=150, max_depth=None, random_state=42))
    ])

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    print("Training model...")
    model.fit(X_train, y_train)

    # Evaluate
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    
    print(f"Training Accuracy: {train_acc * 100:.2f}%")
    print(f"Testing Accuracy: {test_acc * 100:.2f}%")

    if test_acc >= 0.99:
        print("Success: Model achieved >= 99% accuracy!")
    else:
        print("Warning: Model did not achieve 99% accuracy. Check dataset generation logic.")

    # Save model
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model.pkl")
    joblib.dump(model, model_path, compress=3)
    print(f"Model saved to {model_path}")
    return model

if __name__ == "__main__":
    main()
