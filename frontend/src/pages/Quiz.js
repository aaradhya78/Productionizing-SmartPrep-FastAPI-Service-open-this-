import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Play, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import './pages.css';

const Quiz = () => {
  const toast = useToast();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Active quiz states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const data = await apiService.materials.get();
        setMaterials(data);
        if (data.length > 0) setSelectedMaterial(data[0].id);
      } catch {
        toast.error('Failed to load study materials.');
      } finally {
        setLoadingMaterials(false);
      }
    };
    loadMaterials();
  }, [toast]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [quizStarted, showResults]);

  const handleStartQuiz = async () => {
    if (!selectedMaterial) {
      toast.warning('Please select a material first.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await apiService.quiz.generate(selectedMaterial);
      if (res.success && res.quiz && res.quiz.length > 0) {
        setQuizQuestions(res.quiz);
        setQuizStarted(true);
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setTimeElapsed(0);
        setShowResults(false);
        toast.success('Quiz generated! Let\'s go.');
      } else {
        toast.error('No questions were generated.');
      }
    } catch {
      toast.error('Quiz generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (optionIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIdx
    }));
  };

  const handlePrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate final score
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });

    const mat = materials.find(m => m.id === selectedMaterial);
    const topic = mat ? mat.filename.split('_')[0] : 'Algorithms';

    try {
      await apiService.quiz.submit(topic, score, quizQuestions.length);
      toast.success('Quiz submitted successfully!');
    } catch {
      toast.error('Failed to submit score to history.');
    }
    setShowResults(true);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuizHeading = () => {
    const mat = materials.find(m => m.id === selectedMaterial);
    return mat ? mat.filename : 'Concept Test';
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  // 1. Selector view
  if (!quizStarted) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-header-title">AI Practice Quizzes</h2>
          <p className="page-header-sub">Generate customized MCQ practice sets directly from your upload history.</p>
        </div>

        <div className="action-banner">
          <div className="action-banner-info">
            <div className="action-banner-icon"><HelpCircle size={20} /></div>
            <div>
              <p className="action-banner-title">Start Quiz session</p>
              <p className="action-banner-sub">Select a study material to generate questions on.</p>
            </div>
          </div>

          <div className="notes-generation-controls">
            {loadingMaterials ? (
              <Skeleton width="180px" height="36px" style={{ marginRight: '12px' }} />
            ) : (
              <select
                className="form-select"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                disabled={isGenerating || materials.length === 0}
                style={{ marginRight: '12px', height: '36px', fontSize: '0.875rem' }}
              >
                {materials.length === 0 ? (
                  <option>No materials uploaded</option>
                ) : (
                  materials.map(m => (
                    <option key={m.id} value={m.id}>{m.filename}</option>
                  ))
                )}
              </select>
            )}
            <Button
              variant="primary"
              onClick={handleStartQuiz}
              disabled={isGenerating || materials.length === 0}
              isLoading={isGenerating}
            >
              <Play size={15} style={{ marginRight: '6px' }} /> Start Quiz
            </Button>
          </div>
        </div>

        {isGenerating && (
          <div className="loading-state">
            <Skeleton height="24px" width="40%" style={{ marginBottom: '16px' }} />
            <Skeleton height="14px" width="100%" style={{ marginBottom: '8px' }} />
            <Skeleton height="14px" width="90%" style={{ marginBottom: '8px' }} />
            <Skeleton height="14px" width="60%" />
            <p style={{ marginTop: '16px' }}>AI is analyzing topics and generating quiz questions with explanations...</p>
          </div>
        )}
      </div>
    );
  }

  // 2. Results view
  if (showResults) {
    const score = calculateScore();
    const total = quizQuestions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-header-title">Quiz Summary</h2>
          <p className="page-header-sub">{getQuizHeading()} · completed in {formatTime(timeElapsed)}</p>
        </div>

        <div className="quiz-results-card">
          <div className="results-header">
            {percentage >= 70 ? (
              <CheckCircle size={48} color="var(--success)" />
            ) : (
              <XCircle size={48} color="var(--error)" />
            )}
            <h2>{percentage >= 70 ? 'Excellent Prep!' : 'Keep Practicing!'}</h2>
            <div className="score-display">
              <span className="score-number">{percentage}%</span>
              <span className="score-text">{score} of {total} correct answers</span>
            </div>
          </div>

          <div className="results-breakdown">
            <p className="section-label">Detailed Question Review</p>
            {quizQuestions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={idx} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-question">
                    {isCorrect ? (
                      <CheckCircle size={16} className="status-icon correct-icon" />
                    ) : (
                      <XCircle size={16} className="status-icon wrong-icon" />
                    )}
                    <p style={{ margin: 0 }}>{q.question}</p>
                  </div>
                  <div className="result-answer" style={{ marginTop: '6px' }}>
                    <p>Your answer: <strong style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>{q.options[userAnswer] || 'Unanswered'}</strong></p>
                    {!isCorrect && (
                      <p style={{ marginTop: '2px' }}>Correct answer: <strong style={{ color: 'var(--success)' }}>{q.options[q.correctAnswer]}</strong></p>
                    )}
                    {q.explanation && (
                      <div className="explanation-box" style={{ marginTop: '8px', padding: '8px 12px', borderLeft: '2px solid var(--border-color)', backgroundColor: 'var(--bg-color)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <Button variant="primary" onClick={() => setQuizStarted(false)}>
              <RefreshCw size={15} style={{ marginRight: '6px' }} /> Practice Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Quiz running view
  const question = quizQuestions[currentQuestion];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isSubmitDisabled = answeredCount < quizQuestions.length;

  return (
    <div className="page-container">
      <div className="page-header" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="page-header-title">{getQuizHeading()}</h2>
          <p className="page-header-sub">Answer all questions to view results and explanations.</p>
        </div>
        <div className="quiz-timer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--primary)' }}>
          <Clock size={16} /> {formatTime(timeElapsed)}
        </div>
      </div>

      <div className="quiz-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '1.5rem' }}>
        {/* Main Quiz Card */}
        <div className="feature-card" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', height: 'fit-content' }}>
          <div>
            <div className="quiz-meta">
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }} />
              </div>
              <span className="quiz-progress-text">Q{currentQuestion + 1} of {quizQuestions.length}</span>
            </div>

            <p className="question-text">{question.question}</p>

            <div className="options-container">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion] === idx;
                return (
                  <div
                    key={idx}
                    className={`option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleOptionSelect(idx)}
                  >
                    <div className="option-letter">{String.fromCharCode(65 + idx)}</div>
                    <span className="option-text">{option}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="quiz-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft size={16} /> Previous
            </Button>
            
            {currentQuestion === quizQuestions.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
              >
                Next <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Side Navigation panel */}
        <div className="feature-card" style={{ height: 'fit-content' }}>
          <p className="section-label">Questions</p>
          <div className="question-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {quizQuestions.map((_, idx) => {
              const isCurrent = currentQuestion === idx;
              const isAnswered = selectedAnswers[idx] !== undefined;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestion(idx)}
                  style={{
                    height: '38px',
                    width: '38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCurrent ? 'var(--primary)' : isAnswered ? 'var(--primary-light)' : 'var(--surface-color)',
                    color: isCurrent ? '#fff' : isAnswered ? 'var(--primary)' : 'var(--text-main)',
                    borderColor: isCurrent ? 'var(--primary)' : isAnswered ? 'var(--primary)' : 'var(--border-color)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary)', borderRadius: '50%' }} /> Active
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--primary-light)', borderRadius: '50%' }} /> Answered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;