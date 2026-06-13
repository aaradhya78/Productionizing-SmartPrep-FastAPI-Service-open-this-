import logging
from typing import Dict, Any, List

logger = logging.getLogger("ai_service")

def predict_exam_performance(
    quiz_results: List[Dict[str, Any]], 
    mock_results: List[Dict[str, Any]],
    schedule_completion_rate: float = 0.70
) -> Dict[str, Any]:
    """
    Predict student readiness percentage and estimated score.
    Inputs:
    - quiz_results: List of quiz submissions
    - mock_results: List of mock test submissions
    - schedule_completion_rate: Fraction of completed study plan tasks (0.0 to 1.0)
    """
    total_quizzes = len(quiz_results)
    total_mocks = len(mock_results)
    
    # Calculate average quiz accuracy
    quiz_accuracies = []
    for q in quiz_results:
        q_score = q.get("score", 0)
        q_tot = q.get("totalQuestions", 1) or 1
        quiz_accuracies.append(q_score / q_tot)
        
    avg_quiz_acc = sum(quiz_accuracies) / len(quiz_accuracies) if quiz_accuracies else 0.75
    
    # Calculate average mock test accuracy
    mock_accuracies = []
    for m in mock_results:
        m_score = m.get("score", 0)
        m_tot = m.get("totalQuestions", 1) or 1
        mock_accuracies.append(m_score / m_tot)
        
    avg_mock_acc = sum(mock_accuracies) / len(mock_accuracies) if mock_accuracies else 0.72
    
    # Overall readiness score = 40% Quiz average + 40% Mock average + 20% Schedule completion
    readiness_float = (avg_quiz_acc * 0.4) + (avg_mock_acc * 0.4) + (schedule_completion_rate * 0.2)
    readiness_percentage = int(readiness_float * 100)
    readiness_percentage = max(10, min(99, readiness_percentage))
    
    # Predicted score (out of 100)
    predicted_score_val = int(readiness_percentage * 0.95 + 2)
    predicted_score_val = min(100, max(30, predicted_score_val))
    predicted_score = f"{predicted_score_val}/100"
    
    # Model Confidence based on data points
    total_data_points = total_quizzes + total_mocks
    if total_data_points >= 8:
        confidence_level = "High"
        confidence_percentage = 92
    elif total_data_points >= 3:
        confidence_level = "Medium"
        confidence_percentage = 78
    else:
        confidence_level = "Low"
        confidence_percentage = 55
        
    # Subject breakdown
    subjects_tracked = {}
    for q in quiz_results:
        sub = q.get("topic", "General")
        if sub not in subjects_tracked:
            subjects_tracked[sub] = []
        subjects_tracked[sub].append(q.get("score", 0) / (q.get("totalQuestions", 1) or 1))
        
    for m in mock_results:
        sub = m.get("subject", "General")
        if sub not in subjects_tracked:
            subjects_tracked[sub] = []
        subjects_tracked[sub].append(m.get("score", 0) / (m.get("totalQuestions", 1) or 1))
        
    breakdown = []
    for sub, accs in subjects_tracked.items():
        sub_avg = sum(accs) / len(accs)
        sub_readiness = int(sub_avg * 80 + schedule_completion_rate * 20)
        sub_readiness = max(20, min(98, sub_readiness))
        
        # Grade classification
        if sub_readiness >= 90:
            grade = "A+"
        elif sub_readiness >= 80:
            grade = "A"
        elif sub_readiness >= 70:
            grade = "B"
        elif sub_readiness >= 60:
            grade = "C+"
        else:
            grade = "C"
            
        breakdown.append({
            "subject": sub,
            "readiness": sub_readiness,
            "grade": grade
        })
        
    # Default breakdown if empty
    if not breakdown:
        breakdown = [
            {"subject": "Algorithms", "readiness": 90, "grade": "A+"},
            {"subject": "Database Systems", "readiness": 75, "grade": "B"},
            {"subject": "Networks", "readiness": 65, "grade": "C+"}
        ]
        
    return {
        "readinessPercentage": readiness_percentage,
        "predictedScore": predicted_score,
        "confidenceLevel": confidence_level,
        "confidencePercentage": confidence_percentage,
        "breakdown": breakdown
    }


