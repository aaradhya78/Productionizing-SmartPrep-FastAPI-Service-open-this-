import json
import logging
from typing import Dict, Any, List
from services.llm_service import call_llm
from services.notes_generator import clean_json_string

logger = logging.getLogger("ai_service")

async def generate_quiz(text: str, difficulty: str = "Medium", num_questions: int = 5) -> Dict[str, Any]:
    """
    Generate dynamic MCQ questions from text.
    Returns:
    {
      "quiz": [
        {
          "question": str,
          "options": [str, str, str, str],
          "correctAnswer": int,
          "explanation": str
        }
      ]
    }
    """
    if not text or len(text.strip()) == 0:
        return {"quiz": []}
        
    prompt = f"""
    Create a multiple-choice practice quiz with exactly {num_questions} questions based on the study text below.
    The difficulty of the questions should be: {difficulty}.
    
    Each question in the quiz must have:
    - "question": The question text.
    - "options": An array of exactly 4 choices/options.
    - "correctAnswer": The integer index of the correct option (0, 1, 2, or 3).
    - "explanation": A detailed explanation of why the correct option is right.
    
    You MUST output your response in JSON format with a single key "quiz" containing a list of question objects.
    
    Format:
    {{
      "quiz": [
        {{
          "question": "What is the worst-case time complexity of Quick Sort?",
          "options": ["O(n log n)", "O(n)", "O(n^2)", "O(1)"],
          "correctAnswer": 2,
          "explanation": "Quick Sort has a worst-case time complexity of O(n^2) when the pivot selection repeatedly yields highly unbalanced partitions."
        }}
      ]
    }}
    
    Text:
    {text[:8000]}
    """
    
    system_instruction = "You are a professional exam coordinator that generates high-quality MCQ quizzes in JSON format only."
    
    try:
        raw_res = await call_llm(
            prompt=prompt,
            system_instruction=system_instruction,
            response_format="json",
            context_text=text
        )
        
        raw_res = clean_json_string(raw_res)
        data = json.loads(raw_res)
        
        if "quiz" in data:
            return data
            
        if isinstance(data, list):
            return {"quiz": data}
            
    except Exception as e:
        logger.error(f"Failed to generate quiz: {e}")
        
    # Heuristic fallback if parsing fails
    from services.llm_service import generate_heuristic_fallback
    fallback_res = generate_heuristic_fallback("generate quiz", "json", text)
    return json.loads(fallback_res)
