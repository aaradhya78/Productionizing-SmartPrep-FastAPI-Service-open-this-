import logging
import re
from typing import Dict, Any, List, Optional
from services.llm_service import call_llm

logger = logging.getLogger("ai_service")

# Global in-memory storage for the active document text to enable RAG when called directly from the frontend
ACTIVE_CONTEXT: str = ""

def set_active_context(text: str):
    """Set the active document text for the RAG pipeline."""
    global ACTIVE_CONTEXT
    ACTIVE_CONTEXT = text
    logger.info(f"Active tutor context updated. Length: {len(text)} characters.")

def get_active_context() -> str:
    """Retrieve the active document text."""
    global ACTIVE_CONTEXT
    return ACTIVE_CONTEXT

def retrieve_relevant_context(query: str, document_text: str, max_sentences: int = 5) -> str:
    """Simple keyword-matching similarity to retrieve the most relevant sentences from the document."""
    if not document_text:
        return ""
        
    sentences = re.split(r"(?<=[.!?])\s+", document_text)
    query_words = set(re.findall(r"\b\w{4,15}\b", query.lower()))
    
    if not query_words:
        # If query is very short, just return the first few sentences
        return " ".join(sentences[:max_sentences])
        
    scored_sentences = []
    for idx, s in enumerate(sentences):
        s_clean = s.lower()
        # Count overlapping keywords
        matches = sum(1 for word in query_words if word in s_clean)
        if matches > 0:
            # Add small weight to earlier sentences to break ties
            score = matches - (idx * 0.001)
            scored_sentences.append((score, s))
            
    # Sort by score descending
    scored_sentences.sort(key=lambda x: x[0], reverse=True)
    
    # Retrieve top matches
    top_matches = [s for score, s in scored_sentences[:max_sentences]]
    
    if not top_matches:
        # If no keywords matched, return the first few sentences as default context
        return " ".join(sentences[:max_sentences])
        
    return " ".join(top_matches)

async def chat_with_tutor(message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Generate a tutor response using RAG on the active context.
    Returns:
    {
      "response": str,
      "answer": str,
      "sources": List[str]
    }
    """
    doc_context = get_active_context()
    relevant_passages = retrieve_relevant_context(message, doc_context) if doc_context else ""
    
    # Format conversation history
    history_str = ""
    for turn in history[-5:]:  # keep last 5 turns
        role = "Student" if turn.get("sender") == "user" else "Tutor"
        history_str += f"{role}: {turn.get('text') or turn.get('message')}\n"
        
    prompt = f"""
    You are an intelligent, supportive, and pedagogical AI Tutor for SmartPrep AI.
    Your goal is to help students understand their study materials.
    
    Here is the retrieved context from their study material:
    ---
    {relevant_passages}
    ---
    
    Conversation History:
    {history_str}
    
    Student: {message}
    
    Instructions:
    1. Answer the student's question clearly and educationaly.
    2. Try to ground your answer in the study material context provided above.
    3. If the answer is not in the context, use your general knowledge, but mention that it is not explicitly stated in their uploads.
    4. Keep your answer under 4 sentences unless a detailed explanation is needed.
    Tutor:
    """
    
    system_instruction = "You are a professional, friendly academic tutor. Explain concepts clearly and concisely."
    
    try:
        response_text = await call_llm(
            prompt=prompt,
            system_instruction=system_instruction,
            context_text=doc_context or message
        )
    except Exception as e:
        logger.error(f"Error in tutor chat: {e}")
        response_text = "I ran into a small error processing your request. How else can I help you study?"
        
    # Compile sources if context was matched
    sources = ["Current Study Document"] if doc_context and len(relevant_passages) > 0 else []
    
    return {
        "response": response_text,
        "answer": response_text,
        "sources": sources
    }
