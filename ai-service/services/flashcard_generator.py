import json
import logging
from typing import Dict, Any, List
from services.llm_service import call_llm
from services.notes_generator import clean_json_string

logger = logging.getLogger("ai_service")

async def generate_flashcards(text: str) -> Dict[str, Any]:
    """
    Generate flashcard question-answer pairs with difficulty from text.
    Returns:
    {
      "flashcards": [
        {"question": str, "answer": str, "difficulty": str, "topic": str}
      ]
    }
    """
    if not text or len(text.strip()) == 0:
        return {"flashcards": []}
        
    prompt = f"""
    Analyze the study material below and extract key terms, formulas, and concepts to generate 6 to 10 study flashcards.
    Each flashcard must contain:
    - "question": A prompt or question (e.g. "What is X?", "Explain formula Y", "What is the purpose of Z?")
    - "answer": A concise, clear definition or answer.
    - "difficulty": Classified as "Easy", "Medium", or "Hard".
    - "topic": The sub-topic or category.
    
    You MUST output your response in JSON format with a single key "flashcards" containing a list of flashcard objects.
    
    Format:
    {{
      "flashcards": [
        {{
          "question": "Question text here?",
          "answer": "Answer text here.",
          "difficulty": "Medium",
          "topic": "Algorithms"
        }}
      ]
    }}
    
    Text:
    {text[:8000]}
    """
    
    system_instruction = "You are an AI study assistant that extracts flashcards in JSON format only."
    
    try:
        raw_res = await call_llm(
            prompt=prompt,
            system_instruction=system_instruction,
            response_format="json",
            context_text=text
        )
        
        raw_res = clean_json_string(raw_res)
        data = json.loads(raw_res)
        
        if "flashcards" in data:
            return data
            
        if isinstance(data, list):
            return {"flashcards": data}
            
    except Exception as e:
        logger.error(f"Failed to generate flashcards: {e}")
        
    # Heuristic fallback if parsing fails
    from services.llm_service import generate_heuristic_fallback
    fallback_res = generate_heuristic_fallback("generate flashcards", "json", text)
    return json.loads(fallback_res)
