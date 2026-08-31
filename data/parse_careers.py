import json
import re
import random

def parse_careers():
    # Read the text file containing the careers
    with open('career_list.txt', 'r', encoding='utf-8') as f:
        text = f.read()

    categories = {}
    current_category = None
    
    # Simple regex parsing
    for line in text.split('\n'):
        line = line.strip()
        if not line or line.startswith('Page:'):
            continue
            
        # Check if it's a category (starts with number dot)
        cat_match = re.match(r'^\d+\.\s*(.+)', line)
        if cat_match:
            current_category = cat_match.group(1).strip()
            categories[current_category] = []
            continue
            
        # Check if it's a career (starts with roman numeral or text)
        # Some lines are just roman numerals alone, skip them
        if re.match(r'^[ivxlc]+\.$', line) or line in ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.', 'vii.', 'viii.', 'ix.', 'x.', 'xi.', 'xii.', 'xiii.', 'xiv.', 'xv.', 'xvi.', 'xvii.', 'xviii.', 'xix.', 'xx.', 'xxi.', 'xxii.', 'xxiii.', 'xxiv.', 'xxv.', 'xxvi.', 'xxvii.', 'xxviii.', 'xxix.', 'xxx.']:
            continue
            
        # Clean up roman numeral if present at the start of career name
        career_name = re.sub(r'^[ivxlc]+\.\s*', '', line).strip()
        if career_name and current_category and len(career_name) > 3 and career_name != 'List of Vocational Careers & pathways':
            categories[current_category].append(career_name)

    # Flatten and deduplicate
    all_careers = []
    career_to_category = {}
    for cat, careers in categories.items():
        for c in careers:
            if c not in all_careers:
                all_careers.append(c)
                career_to_category[c] = cat

    # We need to map categories to skills
    category_skills_map = {
        'Agriculture and Food': ['Biology', 'Agriculture', 'Soil Science', 'Botany', 'Data Analysis', 'Project Management'],
        'Allied Medical Sciences': ['Biology', 'Anatomy', 'Healthcare Management', 'Patient Care', 'Communication', 'Data Analysis'],
        'Animation and Graphics': ['Design', 'Animation', 'Creativity', 'Communication', 'Multimedia'],
        'Architecture': ['AutoCAD', 'Design', 'Mathematics', 'Project Management', 'Communication'],
        'Business Management': ['Management', 'Communication', 'Leadership', 'Data Analysis', 'Marketing', 'Accounting'],
        'Design': ['Design', 'Creativity', 'Communication', 'Project Management', 'Multimedia'],
        'Education & Teaching': ['Communication', 'Counseling', 'Public Speaking', 'Psychology', 'Management'],
        'Engineering': ['Mathematics', 'Physics', 'Problem Solving', 'Project Management', 'Data Analysis', 'AutoCAD'],
        'Finance Accounting & Banking': ['Accounting', 'Mathematics', 'Financial Analysis', 'Data Analysis', 'Risk Management'],
        'Fitness & well-being': ['Biology', 'Communication', 'Healthcare Management', 'Management'],
        'Government & Defence': ['Leadership', 'Communication', 'Physical Fitness', 'Problem Solving'],
        'Hospitality & Tourism': ['Communication', 'Management', 'Customer Service', 'Leadership'],
        'Information Technology': ['Python', 'SQL', 'Machine Learning', 'Networking', 'Problem Solving', 'Data Analysis', 'Security'],
        'IT/ITeS': ['Python', 'SQL', 'Data Analysis', 'Networking', 'Security', 'Cloud Computing'],
        'Journalism': ['Communication', 'Creative Writing', 'Public Speaking', 'Data Analysis'],
        'Legal Studies': ['Legal Research', 'Communication', 'Public Speaking', 'Problem Solving'],
        'Mass Communication': ['Communication', 'Public Speaking', 'Creativity', 'Marketing', 'Multimedia'],
        'Medical Sciences': ['Biology', 'Anatomy', 'Healthcare Management', 'Problem Solving', 'Patient Care'],
        'Performing Arts': ['Creativity', 'Communication', 'Public Speaking', 'Design'],
        'Sales & Marketing': ['Marketing', 'Communication', 'Data Analysis', 'Customer Service', 'Management'],
        'Science & Mathematics': ['Mathematics', 'Physics', 'Biology', 'Data Analysis', 'Problem Solving', 'Research'],
        'Social Sciences': ['Communication', 'Research', 'Psychology', 'Data Analysis', 'Public Speaking'],
        'Healthcare': ['Biology', 'Patient Care', 'Healthcare Management', 'Communication'],
        'Construction': ['AutoCAD', 'Project Management', 'Mathematics', 'Problem Solving'],
        'Management & Entrepreneurship': ['Management', 'Communication', 'Leadership', 'Marketing'],
        'Leather & Apparel': ['Design', 'Creativity', 'Project Management'],
        'Banking Financial Services & Insurance (BFSI)': ['Accounting', 'Mathematics', 'Financial Analysis', 'Communication'],
        'Defence& Security': ['Physical Fitness', 'Leadership', 'Communication'],
        'Media & Entertainment': ['Creativity', 'Communication', 'Multimedia', 'Public Speaking'],
        'Gem & Jewellery': ['Design', 'Creativity', 'Mathematics'],
        'Beauty & Wellness': ['Communication', 'Creativity', 'Customer Service'],
        'Electronics & Hardware': ['Physics', 'Problem Solving', 'Networking', 'Mathematics'],
        'Sales/Marketing/BPO': ['Communication', 'Marketing', 'Customer Service'],
        'Textile & Handloom': ['Design', 'Creativity']
    }

    # Generate skills and blueprints for each career
    blueprints = {}
    master_skills = set()
    
    for career in all_careers:
        cat = career_to_category[career]
        # Base skills from category
        possible_skills = category_skills_map.get(cat, ['Communication', 'Management', 'Problem Solving'])
        # Add some random specific skills based on words in career name
        if 'Engineer' in career or 'Technology' in career:
            possible_skills.extend(['Python', 'Mathematics'])
        if 'Manage' in career:
            possible_skills.extend(['Project Management', 'Leadership'])
        if 'Data' in career or 'Analyst' in career:
            possible_skills.extend(['Data Analysis', 'SQL'])
        if 'Design' in career or 'Art' in career:
            possible_skills.extend(['Design', 'Creativity'])

        possible_skills = list(set(possible_skills))
        random.shuffle(possible_skills)
        
        core = possible_skills[:max(2, len(possible_skills)//2)]
        adv = possible_skills[max(2, len(possible_skills)//2):]
        if not adv:
            adv = ['Advanced ' + c for c in core[:2]]

        blueprints[career] = {
            "category": cat,
            "core": core,
            "adv": adv
        }
        master_skills.update(core)
        master_skills.update(adv)

    # Master lists
    master_data = {
        "careers": all_careers,
        "skills": list(master_skills),
        "certifications": [
            "None", "AWS Certified Solutions Architect", "Google Data Analytics", "CFA Level 1", 
            "PMP (Project Management Professional)", "Cisco CCNA", "CompTIA Security+", 
            "Digital Marketing Professional", "AutoCAD Certified", "Certified Public Accountant (CPA)", 
            "Certified Nursing Assistant (CNA)", "Certified Human Resources Professional", 
            "Certified Ethical Hacker (CEH)", "Six Sigma Green Belt", "Certified ScrumMaster (CSM)",
            "ITIL Certification", "Microsoft Certified: Azure Fundamentals", "Certified Financial Planner (CFP)",
            "Salesforce Certified Administrator", "Certified Medical Assistant (CMA)"
        ],
        "specializations": list(categories.keys()) + ["None"],
        "blueprints": blueprints,
        "category_skills_map": category_skills_map
    }

    with open('master_data.json', 'w') as f:
        json.dump(master_data, f, indent=4)
        
    print(f"Parsed {len(all_careers)} unique careers and {len(master_skills)} unique skills.")

if __name__ == "__main__":
    parse_careers()
