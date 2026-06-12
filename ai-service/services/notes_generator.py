import json
import logging
from typing import Dict, Any, List
from services.llm_service import call_llm

logger = logging.getLogger("ai_service")

async def generate_notes(text: str, note_type: str = "Detailed") -> Dict[str, Any]:
    """
    Generate notes of type (Short, Detailed, Revision) from text.
    Returns:
    {
      "notes": [
        {"title": str, "content": str, "topic": str}
      ]
    }
    """
    if not text or len(text.strip()) == 0:
        return {"notes": []}
        
    prompt = f"""
    You are an expert academic tutor. Analyze the study material text below and generate structured, high-quality, exam-oriented {note_type} notes.
    The notes must cover:
    1. Chapter Summaries
    2. Key Points
    3. Important Concepts
    
    You MUST output your response in JSON format with a single key "notes" containing a list of note objects. 
    Each note object must have:
    - "title": A descriptive title for the concept.
    - "content": Detailed study notes, explanations, or summaries. Use markdown bullet points inside content if appropriate.
    - "topic": The general subject area.
    
    Format:
    {{
      "notes": [
        {{
          "title": "Concept Title",
          "content": "Notes content details...",
          "topic": "Topic Name"
        }}
      ]
    }}
    
    Text:
    {text[:8000]}
    """
    
    system_instruction = "You are an expert learning system that outputs structured notes in JSON format only."
    
    try:
        raw_res = await call_llm(
            prompt=prompt, 
            system_instruction=system_instruction, 
            response_format="json",
            context_text=text
        )
        
        # Clean JSON from markdown blocks if any
        raw_res = clean_json_string(raw_res)
        data = json.loads(raw_res)
        
        if "notes" in data:
            return data
            
        # Fallback parsing
        if isinstance(data, list):
            return {"notes": data}
            
    except Exception as e:
        logger.error(f"Failed to generate notes: {e}")
        
    # Heuristic fallback if parsing fails
    from services.llm_service import generate_heuristic_fallback
    fallback_res = generate_heuristic_fallback("generate notes", "json", text)
    return json.loads(fallback_res)

def clean_json_string(s: str) -> str:
    """Strip markdown code block wrappers from JSON string."""
    s = s.strip()
    if s.startswith("```json"):
        s = s[7:]
    elif s.startswith("```"):
        s = s[3:]
    if s.endswith("```"):
        s = s[:-3]
    return s.strip()
