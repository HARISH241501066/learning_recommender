import pandas as pd
import numpy as np
import random
import os
import json

# Load Master Data
with open(os.path.join(os.path.dirname(__file__), 'master_data.json'), 'r') as f:
    master_data = json.load(f)

EDUCATION_LEVELS = ["Matric", "Intermediate", "Bachelor's", "Master's", "PhD"]
SPECIALIZATIONS = master_data["specializations"]
SKILLS_POOL = master_data["skills"]
CERTIFICATIONS = master_data["certifications"]
CAREERS = master_data["careers"]
BLUEPRINTS = master_data["blueprints"]

def sample_record():
    education = random.choices(
        EDUCATION_LEVELS, weights=[0.15, 0.20, 0.35, 0.22, 0.08]
    )[0]
    
    # Randomly pick a target career to bias towards
    target_career = random.choice(CAREERS)
    blueprint = BLUEPRINTS[target_career]
    
    specialization = blueprint["category"]
    if random.random() < 0.2:
        specialization = random.choice(SPECIALIZATIONS)
        
    biased_pool = blueprint["core"] + blueprint["adv"]
    
    n_skills = random.randint(1, 5)
    
    # 70% chance to pick skills from the target career's pool
    if random.random() > 0.3 and biased_pool:
        skills = random.sample(biased_pool, min(n_skills, len(biased_pool)))
    else:
        skills = random.sample(SKILLS_POOL, min(n_skills, len(SKILLS_POOL)))
        
    skills_str = ", ".join(skills)

    # Certification bias
    if random.random() > 0.5:
        certification = random.choice(CERTIFICATIONS)
    else:
        certification = "None"

    cgpa = int(np.clip(np.random.normal(75, 10), 55, 98))

    return {
        "Education_Level": education,
        "Specialization": specialization,
        "Skills": skills_str,
        "Certifications": certification,
        "CGPA": cgpa,
        "Target_Career": target_career
    }

def main():
    N_RECORDS = 20000
    print(f"Generating {N_RECORDS} mock learner profiles with 371 careers...")
    records = [sample_record() for _ in range(N_RECORDS)]

    df = pd.DataFrame(records)

    # For training we need a label. We will just use the "Target_Career" we biased towards.
    # The model will learn the mapping.
    df['Recommended_Career'] = df['Target_Career']
    df.drop(columns=['Target_Career'], inplace=True)

    output_path = os.path.join(os.path.dirname(__file__), "career_dataset_massive.xlsx")
    df.to_excel(output_path, index=False)
    print(f"Generated {N_RECORDS} records -> {output_path}")

if __name__ == "__main__":
    main()
