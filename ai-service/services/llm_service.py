import json
import re
import logging
import httpx
from typing import Dict, Any, Optional, List
from config import OPENAI_API_KEY, GEMINI_API_KEY, OLLAMA_HOST, OLLAMA_MODEL

logger = logging.getLogger("ai_service")

async def call_llm(
    prompt: str, 
    system_instruction: Optional[str] = None, 
    response_format: Optional[str] = None,
    context_text: Optional[str] = None
) -> str:
    """
    Call the configured LLM provider (Gemini, OpenAI, Ollama) asynchronously.
    Falls back to a local heuristic NLP engine if no LLM provider is available.
    """
    # 1. Try Gemini API
    if GEMINI_API_KEY:
        try:
            logger.info("Using Gemini API for LLM request...")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            
            contents_payload = {
                "parts": [{"text": prompt}]
            }
            
            payload = {
                "contents": [contents_payload]
            }
            
            if system_instruction:
                payload["systemInstruction"] = {
                    "parts": [{"text": system_instruction}]
                }
                
            if response_format == "json":
                payload["generationConfig"] = {
                    "responseMimeType": "application/json"
                }
                
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text_out = data["candidates"][0]["content"]["parts"][0]["text"]
                    return text_out
                else:
                    logger.error(f"Gemini API error: {res.status_code} - {res.text}")
        except Exception as e:
            logger.error(f"Failed to communicate with Gemini API: {e}")

    # 2. Try OpenAI API
    if OPENAI_API_KEY:
        try:
            logger.info("Using OpenAI API for LLM request...")
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": messages
            }
            
            if response_format == "json":
                payload["response_format"] = {"type": "json_object"}
                
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text_out = data["choices"][0]["message"]["content"]
                    return text_out
                else:
                    logger.error(f"OpenAI API error: {res.status_code} - {res.text}")
        except Exception as e:
            logger.error(f"Failed to communicate with OpenAI API: {e}")

    # 3. Try Ollama (Local LLM)
    if OLLAMA_HOST:
        try:
            logger.info(f"Attempting Local Ollama ({OLLAMA_MODEL}) on {OLLAMA_HOST}...")
            url = f"{OLLAMA_HOST}/api/chat"
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False
            }
            
            if response_format == "json":
                payload["format"] = "json"
                
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text_out = data["message"]["content"]
                    return text_out
                else:
                    logger.error(f"Ollama API error: {res.status_code} - {res.text}")
        except Exception as e:
            logger.warning(f"Failed to communicate with Ollama service: {e}")

    # 4. Heuristic Fallback Engine (Rule-based NLP generator using context_text)
    logger.warning("No LLM service was successful. Running local Heuristic Fallback Engine.")
    return generate_heuristic_fallback(prompt, response_format, context_text)

def generate_heuristic_fallback(prompt: str, response_format: Optional[str], context_text: Optional[str]) -> str:
    """Generate structured response using local rule-based NLP extraction from context_text."""
    context = context_text or "General Study Material: Standard computer science concepts, algorithms, databases, networking, and programming definitions."
    
    # Clean up context to sentences
    sentences = re.split(r"(?<=[.!?])\s+", context)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 15]
    
    # Clean up context to keywords
    words = re.findall(r"\b[a-zA-Z]{4,15}\b", context.lower())
    common_stops = {"this", "that", "with", "from", "they", "have", "were", "their", "which", "there", "about"}
    keywords = list(set([w for w in words if len(w) > 4 and w not in common_stops]))[:30]
    
    # 1. Notes Generation Fallback
    if "notes" in prompt.lower() or "summary" in prompt.lower():
        notes = []
        # Group sentences into 3 conceptual note topics
        note_topics = ["Introduction & Definition", "Core Characteristics", "Practical Applications"]
        for i, topic in enumerate(note_topics):
            start = i * min(3, len(sentences)//3)
            end = start + 3
            content_list = sentences[start:end] if start < len(sentences) else sentences[:3]
            content_str = " ".join(content_list) if content_list else f"Detailed explanation regarding {topic} concepts in the study material."
            notes.append({
                "title": f"Key Concept: {topic}",
                "content": content_str,
                "topic": "Curriculum Focus"
            })
            
        if response_format == "json":
            return json.dumps({"notes": notes})
        else:
            return "\n\n".join([f"### {n['title']}\n{n['content']}" for n in notes])
            
    # 2. Flashcard Generation Fallback
    elif "flashcard" in prompt.lower():
        fcs = []
        # Find defining sentences (e.g. "X is Y", "X refers to Y", "X defines Y")
        definition_sentences = []
        def_patterns = [r"\bis\b", r"\brefers\s+to\b", r"\bdefines\b", r"\bmeans\b"]
        for s in sentences:
            if any(re.search(pat, s, re.IGNORECASE) for pat in def_patterns):
                definition_sentences.append(s)
                
        if not definition_sentences:
            definition_sentences = sentences[:5]
            
        for i, s in enumerate(definition_sentences[:6]):
            # Try to split definition into Q and A
            parts = re.split(r"\b(?:is|refers\s+to|defines|means)\b", s, maxsplit=1, flags=re.IGNORECASE)
            if len(parts) == 2:
                q = f"What is {parts[0].strip()}?"
                a = parts[1].strip().capitalize()
            else:
                q = f"Explain this concept: {s[:30]}..."
                a = s
                
            diff = "Easy" if len(a) < 50 else ("Medium" if len(a) < 120 else "Hard")
            fcs.append({
                "question": q,
                "answer": a,
                "difficulty": diff,
                "topic": "Concept Review"
            })
            
        if response_format == "json":
            return json.dumps({"flashcards": fcs})
        else:
            return json.dumps(fcs)
            
    # 3. Quiz Generation Fallback
    elif "quiz" in prompt.lower() or "mcq" in prompt.lower():
        quiz = []
        # Find 3 definition-like sentences to convert to questions
        quiz_sentences = [s for s in sentences if "is" in s or "has" in s or "use" in s]
        if len(quiz_sentences) < 3:
            quiz_sentences = sentences[:3]
            
        for idx, s in enumerate(quiz_sentences[:5]):
            parts = re.split(r"\b(?:is|has|uses|for)\b", s, maxsplit=1, flags=re.IGNORECASE)
            q_text = f"Which of the following is associated with: {s}?"
            correct_answer_str = s
            
            # Create dummy distractors from other sentences
            distractors = []
            for other_s in sentences:
                if other_s != s and len(distractors) < 3:
                    distractors.append(other_s)
                    
            while len(distractors) < 3:
                distractors.append(f"Standard alternative concept option {len(distractors) + 1} for evaluation.")
                
            options = [correct_answer_str] + distractors
            # Shuffle options deterministically
            import random
            random.seed(idx)
            random.shuffle(options)
            correct_idx = options.index(correct_answer_str)
            
            quiz.append({
                "question": f"Based on the study material, which statement is correct regarding {keywords[idx % len(keywords)] if keywords else 'the subject'}?",
                "options": [opt[:100] for opt in options],
                "correctAnswer": correct_idx,
                "explanation": f"The correct answer is derived from the text: '{s}'."
            })
            
        if response_format == "json":
            return json.dumps({"quiz": quiz})
        else:
            return json.dumps(quiz)
            
    # 4. AI Tutor Chat Fallback
    else:
        # Chat reply: search sentences for matching words
        query_words = re.findall(r"\b\w{4,15}\b", prompt.lower())
        matching_sentences = []
        for s in sentences:
            if any(qw in s.lower() for qw in query_words):
                matching_sentences.append(s)
                
        if matching_sentences:
            response = "According to your study material: " + " ".join(matching_sentences[:3])
        else:
            response = "I couldn't find a direct reference to that question in your study materials. However, in general terms, this relates to study concepts where proper scheduling, consistent revision, and active quiz testing lead to higher exam readiness."
            
        return json.dumps({"response": response, "sources": []})
