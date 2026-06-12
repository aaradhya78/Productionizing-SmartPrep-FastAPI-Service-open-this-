import time
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from config import HOST, PORT, LOG_LEVEL
from services import (
    doc_processor,
    nlp_pipeline,
    notes_generator,
    flashcard_generator,
    quiz_generator,
    ai_tutor,
    pyq_analyzer,
    scheduler,
    weakness_analyzer,
    prediction_engine,
    strategy_generator,
    whatif_simulator,
    cognitive_load
)

# 1. Setup Logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_service")

app = FastAPI(
    title="SmartPrep AI Engine",
    description="Production-ready AI service powering SmartPrep Notes, Quizzes, AI Tutor, and Study Analytics.",
    version="1.0.0"
)

# 2. CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Enable communication with Spring Boot and React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    method = request.method
    logger.info(f"Incoming Request: {method} {path}")
    
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"Completed Request: {method} {path} - Status: {response.status_code} - Duration: {process_time:.2f}ms")
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"Failed Request: {method} {path} - Duration: {process_time:.2f}ms - Error: {str(e)}")
        raise e

# 4. Pydantic Models for Input Validation
class ChatMessage(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = []

class ScheduleRequest(BaseModel):
    examDate: str
    studyHoursPerDay: int
    subjects: List[Dict[str, Any]]
    weakTopics: Optional[List[str]] = []

class NotesRequest(BaseModel):
    text: str
    noteType: Optional[str] = "Detailed"

class QuizRequest(BaseModel):
    text: str
    difficulty: Optional[str] = "Medium"
    numQuestions: Optional[int] = 5

class TextPayload(BaseModel):
    text: str

class PYQRequest(BaseModel):
    text: str

class AnalyticsRequest(BaseModel):
    quizResults: List[Dict[str, Any]] = []
    mockResults: List[Dict[str, Any]] = []
    scheduleCompletionRate: Optional[float] = 0.70

class WhatIfRequest(BaseModel):
    currentHours: int
    simulatedHours: int
    currentReadiness: int
    consistencyRate: Optional[float] = 0.75

class CognitiveLoadRequest(BaseModel):
    consecutiveHours: float
    dailyWorkloadHours: float
    scheduleCompletionRate: float

# 5. API Routes

@app.get("/")
def home():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "SmartPrep AI Service",
        "version": "1.0.0",
        "spacy_available": nlp_pipeline.SPACY_AVAILABLE
    }

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """Extract, clean, and chunk text from uploaded PDF, DOCX, or TXT document."""
    try:
        file_bytes = await file.read()
        logger.info(f"Extracting text from uploaded file: {file.filename} ({len(file_bytes)} bytes)")
        
        # 1. Extract text
        raw_text = doc_processor.extract_text(file_bytes, file.filename)
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Empty text or failed to extract text from document.")
            
        # 2. Clean text
        cleaned_text = doc_processor.clean_text(raw_text)
        
        # 3. Cache as active context for RAG AI Tutor
        ai_tutor.set_active_context(cleaned_text)
        
        # 4. Generate chunks
        chunks = doc_processor.chunk_text(cleaned_text)
        
        return {
            "filename": file.filename,
            "text": cleaned_text,
            "chunks_count": len(chunks),
            "chunks": chunks[:10]  # Return first 10 chunks as sample preview
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error extracting document text: {e}")
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

@app.post("/extract-topics")
async def extract_topics(payload: TextPayload):
    """Detect, extract, and rank topics, concepts, and keywords from text."""
    try:
        result = nlp_pipeline.extract_nlp_metadata(payload.text)
        return result
    except Exception as e:
        logger.error(f"Error in topic extraction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-notes")
async def generate_notes_endpoint(payload: Dict[str, Any]):
    """Generate structured study notes (Short, Detailed, Revision) from text."""
    try:
        # Support dict input to remain fully compatible with existing Spring Boot / raw json calls
        text = payload.get("text", "")
        note_type = payload.get("noteType", payload.get("note_type", "Detailed"))
        
        result = await notes_generator.generate_notes(text, note_type)
        return result
    except Exception as e:
        logger.error(f"Error generating notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-flashcards")
async def generate_flashcards_endpoint(payload: TextPayload):
    """Generate study flashcards from text."""
    try:
        result = await flashcard_generator.generate_flashcards(payload.text)
        return result
    except Exception as e:
        logger.error(f"Error generating flashcards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-quiz")
async def generate_quiz_endpoint(payload: Dict[str, Any]):
    """Generate MCQ practice quiz from text."""
    try:
        # Support dict input for Spring Boot backend compatibility
        text = payload.get("text", "")
        difficulty = payload.get("difficulty", "Medium")
        num_questions = int(payload.get("numQuestions", payload.get("num_questions", 5)))
        
        result = await quiz_generator.generate_quiz(text, difficulty, num_questions)
        return result
    except Exception as e:
        logger.error(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tutor-chat")
async def tutor_chat_endpoint(chat: ChatMessage):
    """Pedagogical context-aware RAG tutoring session."""
    try:
        result = await ai_tutor.chat_with_tutor(chat.message, chat.history)
        return result
    except Exception as e:
        logger.error(f"Error in tutor chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-schedule")
async def generate_schedule_endpoint(req: ScheduleRequest):
    """Generate personalized study calendar."""
    try:
        result = scheduler.generate_study_plan(
            exam_date_str=req.examDate,
            study_hours_per_day=req.studyHoursPerDay,
            subjects=req.subjects,
            weak_topics=req.weakTopics
        )
        return result
    except Exception as e:
        logger.error(f"Error generating schedule: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-pyq")
async def analyze_pyq_endpoint(payload: PYQRequest):
    """Analyze past paper text for topic frequencies and weightings."""
    try:
        result = await pyq_analyzer.analyze_pyqs(payload.text)
        return result
    except Exception as e:
        logger.error(f"Error analyzing PYQ: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-weakness")
async def analyze_weakness_endpoint(payload: AnalyticsRequest):
    """Detect weak topics and trace them back to foundational prerequisite concepts."""
    try:
        result = weakness_analyzer.analyze_weaknesses(payload.quizResults, payload.mockResults)
        return {"weakTopics": result}
    except Exception as e:
        logger.error(f"Error analyzing weaknesses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-readiness")
async def predict_readiness_endpoint(payload: AnalyticsRequest):
    """Predict exam score and readiness level using performance scores."""
    try:
        result = prediction_engine.predict_exam_performance(
            payload.quizResults, 
            payload.mockResults, 
            payload.scheduleCompletionRate
        )
        return result
    except Exception as e:
        logger.error(f"Error predicting performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-strategy")
async def generate_strategy_endpoint(payload: Dict[str, Any]):
    """Generate personalized exam attempt strategies and priority priorities."""
    try:
        weak_topics = payload.get("weakTopics", [])
        readiness_breakdown = payload.get("breakdown", [])
        result = strategy_generator.generate_exam_strategy(weak_topics, readiness_breakdown)
        return {"strategy": result}
    except Exception as e:
        logger.error(f"Error generating strategy: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate-whatif")
async def simulate_whatif_endpoint(payload: WhatIfRequest):
    """Simulate projected scores based on shifting daily study hours."""
    try:
        result = whatif_simulator.simulate_score_impact(
            payload.currentHours,
            payload.simulatedHours,
            payload.currentReadiness,
            payload.consistencyRate
        )
        return result
    except Exception as e:
        logger.error(f"Error simulating what-if impact: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-cognitive-load")
async def analyze_cognitive_load_endpoint(payload: CognitiveLoadRequest):
    """Detect fatigue and offer dynamic study adjustments and breaks."""
    try:
        result = cognitive_load.assess_cognitive_load(
            payload.consecutiveHours,
            payload.dailyWorkloadHours,
            payload.scheduleCompletionRate
        )
        return result
    except Exception as e:
        logger.error(f"Error assessing cognitive load: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
