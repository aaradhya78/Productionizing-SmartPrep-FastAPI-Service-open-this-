import logging
from typing import Dict, Any, List

logger = logging.getLogger("ai_service")

def generate_exam_strategy(
    weak_topics: List[Dict[str, Any]], 
    readiness_breakdown: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generate personalized exam strategy, priorities, and revision plan.
    """
    # 1. Default Time Allocation
    time_allocation = [
        {"section": "Section A (Multiple Choice Qs)", "time": "15 mins", "description": "Quick fire conceptual questions. Solve immediately."},
        {"section": "Section B (Short Answer Problems)", "time": "45 mins", "description": "Requires structural calculations. Allocate significant focus."},
        {"section": "Section C (Long Code/Design Essays)", "time": "60 mins", "description": "Design queries or algorithms. Leave for last to maximize marks."}
    ]
    
    # 2. Suggested attempt order based on strong vs weak areas
    # If student is weak in coding-heavy topics (like Algorithms), they should do conceptual sections first to secure marks
    strong_subjects = [item["subject"] for item in readiness_breakdown if item["readiness"] >= 80]
    
    if "Algorithms" in strong_subjects:
        attempt_order = ["Section A", "Section C", "Section B"] # Algorithms strong -> do essays early
    else:
        attempt_order = ["Section A", "Section B", "Section C"] # Else -> do shorter ones first
        
    # 3. Topic Priority Allocation
    topic_priority = []
    # Identify high priority topics from weak areas first
    for item in weak_topics[:3]:
        topic_priority.append({
            "topic": item["topic"],
            "priority": "High",
            "prepTime": "3.5 hrs"
        })
        
    # Fill up with default priorities if too few
    default_priorities = [
        {"topic": "B-Trees & Indexing (Databases)", "priority": "High", "prepTime": "3 hrs"},
        {"topic": "Dynamic Programming (Algorithms)", "priority": "High", "prepTime": "4 hrs"},
        {"topic": "OS Process Synchronization (OS)", "priority": "Medium", "prepTime": "2 hrs"},
        {"topic": "IP Subnetting (Networks)", "priority": "Medium", "prepTime": "1.5 hrs"}
    ]
    
    for dp in default_priorities:
        if len(topic_priority) < 4:
            # Check duplicates
            if not any(tp["topic"].split(" (")[0] in dp["topic"] for tp in topic_priority):
                topic_priority.append(dp)
                
    # 4. Custom actionable recommendations
    recommendations = []
    if weak_topics:
        for wt in weak_topics[:2]:
            recommendations.append(f"Revise and practice {wt['topic']} immediately. Heuristics show accuracy is currently at {wt['currentAccuracy']}.")
            
    recommendations.extend([
        "Focus on past papers from 2024 and 2025; they mirror the structural weightings of this upcoming exam cycle.",
        "Take a mock exam under strict 120-minute timed conditions to test speed and Section C allocation.",
        "Prioritize flashcard mastery for high-frequency terms in your weaker subject areas."
    ])
    
    return {
        "timeAllocation": time_allocation,
        "attemptOrder": attempt_order,
        "topicPriority": topic_priority,
        "recommendations": recommendations[:4] # Return top 4
    }
