import sys
import os
import asyncio
import json

# Add root folder to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

async def test_doc_processing():
    print("\n--- Testing Document Processing ---")
    sample_text = "Draft\nImportant curriculum details regarding algorithms.\nPage 12 of 15\nconfidential"
    cleaned = doc_processor.clean_text(sample_text)
    print(f"Cleaned Text:\n'{cleaned}'")
    assert "algorithms" in cleaned
    assert "Page 12" not in cleaned
    assert "confidential" not in cleaned
    assert "Draft" not in cleaned
    
    chunks = doc_processor.chunk_text(cleaned, chunk_size=50, overlap=10)
    print(f"Chunks generated: {len(chunks)}")
    assert len(chunks) > 0
    print("SUCCESS: Document Processing Test Passed")

async def test_nlp_extraction():
    print("\n--- Testing NLP Topic Extraction ---")
    text = "Relational database design relies on database keys and functional dependencies. Quick Sort is a fast algorithms technique."
    res = nlp_pipeline.extract_nlp_metadata(text)
    print(f"Extracted NLP Data: {json.dumps(res, indent=2)}")
    assert "topics" in res
    assert "concepts" in res
    assert "keywords" in res
    print("SUCCESS: NLP Topic Extraction Test Passed")

async def test_generators():
    print("\n--- Testing Content Generators ---")
    text = "Quick Sort is a sorting algorithm that operates in O(n log n) average time complexity. It uses divide-and-conquer partition schemes."
    
    notes = await notes_generator.generate_notes(text, "Short")
    print(f"Generated Notes keys: {notes.keys()}")
    assert "notes" in notes
    assert len(notes["notes"]) > 0
    
    flashcards = await flashcard_generator.generate_flashcards(text)
    print(f"Generated Flashcards keys: {flashcards.keys()}")
    assert "flashcards" in flashcards
    assert len(flashcards["flashcards"]) > 0
    
    quiz = await quiz_generator.generate_quiz(text, "Easy", 3)
    print(f"Generated Quiz keys: {quiz.keys()}")
    assert "quiz" in quiz
    assert len(quiz["quiz"]) > 0
    print("SUCCESS: Content Generators Test Passed")

async def test_tutor_rag():
    print("\n--- Testing AI Tutor RAG ---")
    doc_text = "Operating systems manage CPU concurrency using locks and semaphores to avoid process deadlocks."
    ai_tutor.set_active_context(doc_text)
    
    res = await ai_tutor.chat_with_tutor("Explain semaphores and concurrency", [])
    print(f"Tutor Response: {res['response']}")
    assert len(res["response"]) > 0
    assert "Current Study Document" in res["sources"]
    print("SUCCESS: AI Tutor RAG Test Passed")

async def test_scheduler():
    print("\n--- Testing Study Scheduler ---")
    subjects = [
        {"name": "Algorithms", "weight": "High"},
        {"name": "Databases", "weight": "Medium"}
    ]
    res = scheduler.generate_study_plan("2026-06-25", 4, subjects, ["Algorithms"])
    print(f"Tasks scheduled: {len(res['tasks'])}")
    assert len(res["tasks"]) > 0
    assert res["examDate"] == "2026-06-25"
    print("SUCCESS: Study Scheduler Test Passed")

async def test_analytics_and_predictions():
    print("\n--- Testing Analytics, Weaknesses, Predictions & Strategies ---")
    quizzes = [
        {"topic": "IP Routing & Subnets", "score": 3, "totalQuestions": 10},
        {"topic": "Algorithms", "score": 9, "totalQuestions": 10}
    ]
    mocks = []
    
    # 1. Weakness
    weak = weakness_analyzer.analyze_weaknesses(quizzes, mocks)
    print(f"Detected Weaknesses count: {len(weak)}")
    assert len(weak) > 0
    
    # 2. Prediction
    pred = prediction_engine.predict_exam_performance(quizzes, mocks, 0.8)
    print(f"Predicted Performance: {json.dumps(pred, indent=2)}")
    assert "readinessPercentage" in pred
    assert "predictedScore" in pred
    
    # 3. Strategy
    strat = strategy_generator.generate_exam_strategy(weak, pred["breakdown"])
    print(f"Generated Strategy keys: {strat['strategy'].keys() if 'strategy' in strat else strat.keys()}")
    assert "timeAllocation" in strat or ("strategy" in strat and "timeAllocation" in strat["strategy"])
    print("SUCCESS: Analytics and Predictions Test Passed")

async def test_simulators():
    print("\n--- Testing Simulators & Cognitive Load ---")
    # What-If
    sim = whatif_simulator.simulate_score_impact(2, 4, 70, 0.8)
    print(f"Simulated Score Impact: {json.dumps(sim, indent=2)}")
    assert sim["simulatedReadiness"] > sim["currentReadiness"]
    
    # Cognitive Load
    cog = cognitive_load.assess_cognitive_load(4.5, 8.0, 0.4)
    print(f"Cognitive Assessment: {json.dumps(cog, indent=2)}")
    assert cog["fatigueLevel"] == "High"
    print("SUCCESS: Simulators and Cognitive Load Test Passed")

async def run_all_tests():
    try:
        await test_doc_processing()
        await test_nlp_extraction()
        await test_generators()
        await test_tutor_rag()
        await test_scheduler()
        await test_analytics_and_predictions()
        await test_simulators()
        print("\n==============================")
        print("ALL TESTS COMPLETED SUCCESSFULLY!")
        print("==============================")
        sys.exit(0)
    except AssertionError as ae:
        print(f"\nAssertion Failed: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"\nTest Execution Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_all_tests())
