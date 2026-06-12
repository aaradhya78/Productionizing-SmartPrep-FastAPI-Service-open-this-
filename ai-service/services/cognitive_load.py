import logging
from typing import Dict, Any, List

logger = logging.getLogger("ai_service")

def assess_cognitive_load(
    consecutive_hours: float,
    daily_workload_hours: float,
    schedule_completion_rate: float
) -> Dict[str, Any]:
    """
    Detect fatigue, recommend study breaks, and return adaptive study adjustments.
    """
    # 1. Fatigue Detection Logic
    if consecutive_hours >= 4.0 or daily_workload_hours >= 7.0:
        fatigue_level = "High"
        recommended_break = "Take a 30-minute walk or a power nap. Discontinue screen usage."
        adjustments = [
            "Split remaining study hours into two separate sessions.",
            "Postpone revision of complex topics to tomorrow morning.",
            "Reduce tomorrow's target study load by 1.5 hours to recover."
        ]
    elif consecutive_hours >= 2.0 or daily_workload_hours >= 4.0:
        fatigue_level = "Medium"
        recommended_break = "Take a 15-minute break. Walk around, stretch, and drink water."
        adjustments = [
            "Transition to active recall (flashcards) rather than passive reading.",
            "Take a short 5-minute stretch break every 45 minutes."
        ]
    else:
        fatigue_level = "Low"
        recommended_break = "Short 5-minute breather if transitioning topics."
        adjustments = [
            "Maintain current progress pace. You are in a high-efficiency cognitive zone."
        ]
        
    # Schedule completions adjustment heuristic:
    # If the student's task completion rate is low (< 50%), they might be overwhelmed
    if schedule_completion_rate < 0.50 and fatigue_level == "High":
        adjustments.append("Reschedule 2 pending tasks to buffer days to ease daily workload pressure.")
        
    return {
        "fatigueLevel": fatigue_level,
        "recommendedBreak": recommended_break,
        "adjustments": adjustments
    }
