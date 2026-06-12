import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List

logger = logging.getLogger("ai_service")

def generate_study_plan(
    exam_date_str: str, 
    study_hours_per_day: int, 
    subjects: List[Dict[str, Any]], 
    weak_topics: List[str] = None
) -> Dict[str, Any]:
    """
    Generate a dynamic study schedule.
    Inputs:
    - exam_date_str: "YYYY-MM-DD"
    - study_hours_per_day: int (e.g. 4)
    - subjects: [{"name": str, "weight": "High"|"Medium"|"Low"}]
    - weak_topics: list of subject names or subtopics
    """
    try:
        exam_date = datetime.strptime(exam_date_str.split("T")[0], "%Y-%m-%d").date()
    except Exception as e:
        logger.error(f"Error parsing exam date {exam_date_str}: {e}")
        # Default to 14 days from today
        exam_date = datetime.now().date() + timedelta(days=14)
        
    start_date = datetime.now().date()
    delta_days = (exam_date - start_date).days
    
    if delta_days <= 0:
        delta_days = 10 # Default fallback
        exam_date = start_date + timedelta(days=10)
        
    # Sort subjects by weight
    weight_map = {"High": 3, "Medium": 2, "Low": 1}
    sorted_subjects = sorted(
        subjects, 
        key=lambda s: weight_map.get(s.get("weight", "Medium"), 2), 
        reverse=True
    )
    
    if not sorted_subjects:
        sorted_subjects = [{"name": "General Study", "weight": "Medium"}]
        
    tasks = []
    
    # Study plan layout:
    # Day 0 to Exam-3: Core study + Revision slots
    # Exam-2: Practice Mock Test
    # Exam-1: Buffer / Light Review
    # Exam Day: Exam Day
    
    for i in range(delta_days + 1):
        current_day = start_date + timedelta(days=i)
        current_day_str = current_day.strftime("%Y-%m-%d")
        
        # Determine day type
        days_to_exam = (exam_date - current_day).days
        
        if days_to_exam == 0:
            tasks.append({
                "id": f"task-{int(datetime.now().timestamp())}-{i}",
                "date": current_day_str,
                "subject": "All Subjects",
                "hours": 1,
                "completed": False,
                "type": "Exam",
                "label": "Final Exam Day"
            })
        elif days_to_exam == 1:
            tasks.append({
                "id": f"task-{int(datetime.now().timestamp())}-{i}",
                "date": current_day_str,
                "subject": "Buffer Day",
                "hours": min(2, study_hours_per_day),
                "completed": False,
                "type": "Revision",
                "label": "Light formula review & rest"
            })
        elif days_to_exam == 2:
            tasks.append({
                "id": f"task-{int(datetime.now().timestamp())}-{i}",
                "date": current_day_str,
                "subject": sorted_subjects[0]["name"],
                "hours": study_hours_per_day,
                "completed": False,
                "type": "Practice",
                "label": "Full-Length Mock Test & Evaluation"
            })
        else:
            # Standard study days
            # Rotate subjects, prioritizing weak topics or high weight subjects
            sub_idx = i % len(sorted_subjects)
            subject = sorted_subjects[sub_idx]
            sub_name = subject["name"]
            
            # Every 4th day is a dedicated spacing review slot
            is_revision = (i > 0 and i % 4 == 0)
            
            if is_revision:
                tasks.append({
                    "id": f"task-{int(datetime.now().timestamp())}-{i}",
                    "date": current_day_str,
                    "subject": sorted_subjects[(i - 1) % len(sorted_subjects)]["name"],
                    "hours": max(1, study_hours_per_day // 2),
                    "completed": False,
                    "type": "Revision",
                    "label": f"Spaced revision of previous chapters"
                })
            else:
                # Normal study slot
                label = f"Study & Notes Review"
                if weak_topics and sub_name in weak_topics:
                    label = "Focus: Weak Topic Deep-Dive"
                    
                tasks.append({
                    "id": f"task-{int(datetime.now().timestamp())}-{i}",
                    "date": current_day_str,
                    "subject": sub_name,
                    "hours": study_hours_per_day,
                    "completed": False,
                    "type": "Study",
                    "label": label
                })
                
    return {
        "examDate": exam_date.strftime("%Y-%m-%d"),
        "studyHoursPerDay": study_hours_per_day,
        "subjects": subjects,
        "tasks": tasks
    }
