import logging
from typing import Dict, Any

logger = logging.getLogger("ai_service")

def simulate_score_impact(
    current_hours: int,
    simulated_hours: int,
    current_readiness: int,
    consistency_rate: float = 0.75
) -> Dict[str, Any]:
    """
    Project score changes based on simulated study hours.
    Inputs:
    - current_hours: current study hours per day (e.g. 2)
    - simulated_hours: proposed study hours per day (e.g. 4)
    - current_readiness: current readiness percentage (e.g. 72)
    - consistency_rate: completion consistency rate (0.0 to 1.0)
    """
    hour_diff = simulated_hours - current_hours
    
    # Heuristics:
    # Each extra hour adds around 4-7% to readiness, depending on current level (diminishing returns near 100%)
    if hour_diff == 0:
        simulated_readiness = current_readiness
    elif hour_diff > 0:
        multiplier = 6.0 if current_readiness < 70 else (4.0 if current_readiness < 85 else 2.5)
        added_readiness = hour_diff * multiplier * consistency_rate
        simulated_readiness = int(current_readiness + added_readiness)
    else:
        # Reduced hours
        multiplier = 7.0 if current_readiness > 70 else 5.0
        lost_readiness = abs(hour_diff) * multiplier * (2.0 - consistency_rate)
        simulated_readiness = int(current_readiness - lost_readiness)
        
    simulated_readiness = max(10, min(99, simulated_readiness))
    
    # Calculate predicted score mapping
    current_score = int(current_readiness * 0.95 + 2)
    simulated_score = int(simulated_readiness * 0.95 + 2)
    
    current_score = min(100, max(30, current_score))
    simulated_score = min(100, max(30, simulated_score))
    
    # Plan recommendation
    if simulated_hours > current_hours:
        alt_plan = f"Boost study schedule to {simulated_hours} hrs/day. This adds spacing for weaker topics and an extra Mock Test slot."
    else:
        alt_plan = f"Reduce schedule to {simulated_hours} hrs/day. High focus must be placed on critical-weight topics only."
        
    return {
        "currentReadiness": current_readiness,
        "currentPredictedScore": f"{current_score}/100",
        "simulatedReadiness": simulated_readiness,
        "simulatedPredictedScore": f"{simulated_score}/100",
        "alternatePlanSuggestion": alt_plan,
        "efficiencyGain": f"+{simulated_readiness - current_readiness}%" if simulated_readiness > current_readiness else f"{simulated_readiness - current_readiness}%"
    }
