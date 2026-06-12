import React, { useState, useEffect, useRef } from 'react';
import { FileQuestion, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import './pages.css';

// Standard mock test questions
const MOCK_QUESTIONS = [
  { question: 'What is the worst-case time complexity of Quick Sort?', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correctAnswer: 2, explanation: 'In the worst case (when pivot divides array into 0 and n-1 elements repeatedly), Quick Sort runs in quadratic time.' },
  { question: 'Which index type is best suited for range queries in relational databases?', options: ['Hash Index', 'B-Tree Index', 'Bitmap Index', 'GiST Index'], correctAnswer: 1, explanation: 'B-Trees maintain elements in sorted order, which allows for efficient range searches (O(log n + k)).' },
  { question: 'What layer of the OSI model handles routing, packet forwarding, and logical addressing?', options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Physical Layer'], correctAnswer: 1, explanation: 'The Network Layer (Layer 3) routes packets across networks using logical IP addressing.' },
  { question: 'What is the main purpose of a semaphore in operating systems?', options: ['Thread context switching', 'Memory paging allocation', 'Process synchronization and mutual exclusion', 'Interrupt scheduling priority'], correctAnswer: 2, explanation: 'Semaphores are integer variables used as signaling mechanisms to control access to shared resources by multiple processes.' },
  { question: 'Which scheduling algorithm can lead to process starvation?', options: ['Round Robin', 'First Come First Served', 'Shortest Job First (non-preemptive)', 'Priority Scheduling'], correctAnswer: 3, explanation: 'In priority scheduling, low-priority processes can starve if there is a steady stream of high-priority processes.' },
  { question: 'What does ACID stand for in relational databases?', options: ['Accuracy, Consistency, Integrity, Durability', 'Atomicity, Consistency, Isolation, Durability', 'Aggregation, Clustering, Indexing, Delivery', 'Atomicity, Concurrency, Isolation, Distribution'], correctAnswer: 1, explanation: 'ACID properties (Atomicity, Consistency, Isolation, Durability) guarantee database transactions are processed reliably.' },
  { question: 'What is the size of an IPv6 address?', options: ['32 bits', '64 bits', '128 bits', '256 bits'], correctAnswer: 2, explanation: 'IPv6 addresses are 128 bits (16 bytes) long, represented as eight groups of four hexadecimal digits.' },
  { question: 'Which protocol is used to resolve a logical IP address to a physical MAC address?', options: ['DNS', 'DHCP', 'ARP', 'ICMP'], correctAnswer: 2, explanation: 'Address Resolution Protocol (ARP) translates an IPv4 address to the hardware address (MAC address) on the local link.' },
  { question: 'In memory management, what is thrashing?', options: ['The process of deleting inactive pages', 'Excessive paging activity leading to low CPU utilization', 'Fragmenting memory allocations', 'Compacting memory sectors'], correctAnswer: 1, explanation: 'Thrashing occurs when the system spends more time swapping pages in and out of memory than executing actual processes.' },
  { question: 'Which logic gate represents the universal gate?', options: ['AND', 'OR', 'NAND', 'XOR'], correctAnswer: 2, explanation: 'NAND and NOR gates are universal gates because any logic boolean function can be constructed using only them.' },
];

const MockTest = () => {
  const toast = useToast();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [testType, setTestType] = useState('Section-Wise'); // Full-Length or Section-Wise
  const [testStarted, setTestStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active test states
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 mins (600s) default
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadMats = async () => {
      try {
        const data = await apiService.materials.get();
        setMaterials(data);
        if (data.length > 0) setSelectedMaterial(data[0].id);
      } catch {
        toast.error('Failed to load study materials.');
      } finally {
        setLoading(false);
      }
    };
    loadMats();
  }, [toast]);

  // Timer countdown hook
  useEffect(() => {
    if (testStarted && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto-submit test
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [testStarted, showResults]);

  const handleStartTest = () => {
    // Determine questions set size
    const testSize = testType === 'Full-Length' ? 10 : 5; // Simulating full-length with 10 questions and section with 5
    const selectedQs = MOCK_QUESTIONS.slice(0, testSize);
    
    setQuestions(selectedQs);
    setTimeRemaining(testType === 'Full-Length' ? 1200 : 300); // 20 mins vs 5 mins
    setTestStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    toast.success(`Started ${testType} mock test! Good luck.`);
  };

  const handleOptionSelect = (optionIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIdx
    }));
  };

  const handleAutoSubmit = () => {
    toast.warning('Time is up! Submitting your test automatically.');
    submitResults();
  };

  const submitResults = async () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });

    const mat = materials.find(m => m.id === selectedMaterial);
    const subject = mat ? mat.filename.split('_')[0] : 'Algorithms';
    const timeSpent = testType === 'Full-Length' 
      ? `${Math.floor((1200 - timeRemaining) / 60)} mins` 
      : `${Math.floor((300 - timeRemaining) / 60)} mins`;

    try {
      await apiService.mockTests.submit(subject, testType, score, questions.length, timeSpent);
      toast.success('Test results saved to analytics.');
    } catch {
      toast.error('Failed to save score.');
    }
    setShowResults(true);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSubjectName = () => {
    const mat = materials.find(m => m.id === selectedMaterial);
    return mat ? mat.filename : 'Concept Mock';
  };

  // 1. Selection screen
  if (!testStarted) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-header-title">Mock Tests</h2>
          <p className="page-header-sub">Simulate real examination conditions with timer constraints and automatic grade evaluation.</p>
        </div>

        <div className="schedule-form-card" style={{ padding: '2rem' }}>
          <div className="form-section">
            <h3 className="form-section-title">
              <FileQuestion size={16} /> Setup Mock Exam
            </h3>
            
            <div className="form-group" style={{ marginTop: '8px' }}>
              <label className="form-label">Select Subject / Material</label>
              {loading ? (
                <Skeleton height="36px" />
              ) : (
                <select
                  className="form-select"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  disabled={materials.length === 0}
                >
                  {materials.length === 0 ? (
                    <option>No materials uploaded yet</option>
                  ) : (
                    materials.map(m => (
                      <option key={m.id} value={m.id}>{m.filename}</option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Select Exam Format</label>
              <select
                className="form-select"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
              >
                <option value="Section-Wise">Section-Wise Test (5 Questions · 5 Minutes)</option>
                <option value="Full-Length">Full-Length Test (10 Questions · 20 Minutes)</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1rem', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} color="var(--warning)" /> Auto-submits when timer runs out.
            </span>
            <Button
              variant="primary"
              onClick={handleStartTest}
              disabled={materials.length === 0}
            >
              Start Mock Exam
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Results screen
  if (showResults) {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-header-title">Mock Test Results</h2>
          <p className="page-header-sub">{getSubjectName()} · {testType}</p>
        </div>

        <div className="quiz-results-card">
          <div className="results-header">
            <CheckCircle size={48} color={percentage >= 70 ? 'var(--success)' : 'var(--warning)'} />
            <h2>Exam Completed!</h2>
            <div className="score-display">
              <span className="score-number">{percentage}%</span>
              <span className="score-text">{score} of {questions.length} correct</span>
            </div>
          </div>

          <div className="results-breakdown">
            <p className="section-label">Review Panel</p>
            {questions.map((q, idx) => {
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
            <Button variant="primary" onClick={() => setTestStarted(false)}>
              Back to mock exams
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Test running view
  const question = questions[currentQuestion];
  const isTimeCritical = timeRemaining < 60; // Less than 1 minute

  return (
    <div className="page-container">
      <div className="page-header" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="page-header-title">{testType} Exam Mode</h2>
          <p className="page-header-sub">{getSubjectName()}</p>
        </div>
        <div
          className={`quiz-timer ${isTimeCritical ? 'critical' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '1rem',
            fontWeight: 700,
            color: isTimeCritical ? 'var(--error)' : 'var(--text-main)',
            animation: isTimeCritical ? 'ui-pulse 1s infinite' : 'none'
          }}
        >
          <Clock size={18} /> {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="quiz-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '1.5rem' }}>
        <div className="feature-card">
          <div className="quiz-meta">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
            </div>
            <span className="quiz-progress-text">Question {currentQuestion + 1} of {questions.length}</span>
          </div>

          <p className="question-text">{question?.question}</p>

          <div className="options-container">
            {question?.options.map((option, idx) => {
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

          <div className="quiz-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outline"
              onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft size={16} /> Prev
            </Button>
            
            {currentQuestion === questions.length - 1 ? (
              <Button variant="primary" onClick={submitResults}>
                Submit Test
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => currentQuestion < questions.length - 1 && setCurrentQuestion(currentQuestion + 1)}
              >
                Next <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Side question panel */}
        <div className="feature-card" style={{ height: 'fit-content' }}>
          <p className="section-label">Question Sheet</p>
          <div className="question-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {questions.map((_, idx) => {
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
        </div>
      </div>
    </div>
  );
};

export default MockTest;
