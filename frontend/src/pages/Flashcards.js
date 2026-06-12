import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, Check, X, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import './pages.css';

const Flashcards = () => {
  const toast = useToast();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loadingMats, setLoadingMats] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Study states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revisionMode, setRevisionMode] = useState(false); // only study unknown cards

  const loadData = async () => {
    setLoadingMats(true);
    try {
      const mats = await apiService.materials.get();
      setMaterials(mats);
      if (mats.length > 0) setSelectedMaterial(mats[0].id);

      const fcs = await apiService.flashcards.get();
      setFlashcards(fcs);
    } catch {
      toast.error('Failed to load flashcard information.');
    } finally {
      setLoadingMats(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedMaterial) {
      toast.warning('Please select a material first.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await apiService.flashcards.generate(selectedMaterial);
      if (res.success && res.flashcards.length > 0) {
        toast.success(`Generated ${res.flashcards.length} new flashcards!`);
        // Refresh cards
        const fcs = await apiService.flashcards.get();
        setFlashcards(fcs);
        setCurrentIndex(fcs.length - res.flashcards.length);
        setIsFlipped(false);
      }
    } catch {
      toast.error('Flashcard generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMastery = async (id, masteredVal) => {
    try {
      await apiService.flashcards.toggleMastered(id);
      // Update local state
      setFlashcards(prev => prev.map(fc => fc.id === id ? { ...fc, mastered: masteredVal } : fc));
      toast.success(masteredVal ? 'Marked as Known' : 'Marked as Unknown');
      
      // Auto move next after a small delay
      setTimeout(() => {
        handleNext();
      }, 500);
    } catch {
      toast.error('Failed to update card status.');
    }
  };

  // Get current active cards list based on revision mode
  const getActiveCards = () => {
    if (revisionMode) {
      return flashcards.filter(fc => !fc.mastered);
    }
    return flashcards;
  };

  const activeCards = getActiveCards();
  const currentCard = activeCards[currentIndex];

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-header-title">AI Flashcards</h2>
        <p className="page-header-sub">Generate flashcards from materials to self-test and review key terms.</p>
      </div>

      {/* Selector banner */}
      <div className="action-banner">
        <div className="action-banner-info">
          <div className="action-banner-icon"><Sparkles size={20} /></div>
          <div>
            <p className="action-banner-title">Create Flashcards</p>
            <p className="action-banner-sub">Select material to extract terms, definitions, and questions.</p>
          </div>
        </div>

        <div className="notes-generation-controls">
          {loadingMats ? (
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
            onClick={handleGenerate}
            disabled={isGenerating || materials.length === 0}
            isLoading={isGenerating}
          >
            Generate Cards
          </Button>
        </div>
      </div>

      {isGenerating && (
        <div className="loading-state">
          <Skeleton height="150px" width="100%" style={{ marginBottom: '16px' }} />
          <p>Extracting terminology and generating flashcard study decks...</p>
        </div>
      )}

      {!isGenerating && flashcards.length > 0 && (
        <div className="flashcards-study-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Controls row */}
          <div className="flashcards-controls" style={{ display: 'flex', justifyBetween: 'space-between', width: '100%', maxWidth: '500px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Card {activeCards.length > 0 ? currentIndex + 1 : 0} of {activeCards.length}
              {revisionMode && ' (Revision Mode)'}
            </span>
            <Button
              variant={revisionMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setRevisionMode(!revisionMode);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
            >
              <RefreshCw size={14} style={{ marginRight: '4px' }} />
              {revisionMode ? 'Show All Cards' : 'Study Unknowns Only'}
            </Button>
          </div>

          {activeCards.length === 0 ? (
            <div className="loading-state" style={{ width: '100%', maxWidth: '500px' }}>
              <p>Excellent! You have mastered all flashcards. Toggle Revision Mode off to review again.</p>
            </div>
          ) : (
            <>
              {/* 3D Flippable Flashcard */}
              <div
                className={`flashcard-item-wrap ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  perspective: '1000px',
                  width: '100%',
                  maxWidth: '500px',
                  height: '280px',
                  cursor: 'pointer'
                }}
              >
                <div
                  className="flashcard-inner"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none'
                  }}
                >
                  {/* Front Side */}
                  <div
                    className="flashcard-side front"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      backgroundColor: 'var(--surface-color)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-md)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <span className="topic-badge">{currentCard.topic}</span>
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginTop: 'auto', marginBottom: 'auto' }}>
                      {currentCard.question}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={12} /> Click card to reveal answer
                    </span>
                  </div>

                  {/* Back Side */}
                  <div
                    className="flashcard-side back"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      backgroundColor: 'var(--surface-color)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-md)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'center',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <span className="topic-badge" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                      Answer
                    </span>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 'auto', marginBottom: 'auto' }}>
                      {currentCard.answer}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Click card to see question
                    </span>
                  </div>
                </div>
              </div>

              {/* Mastery Action Buttons */}
              <div className="flashcard-actions-row" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <button
                  className="flashcard-action-btn-circle incorrect"
                  onClick={() => toggleMastery(currentCard.id, false)}
                  title="Mark Unknown"
                  style={{
                    height: '48px',
                    width: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <X size={20} />
                </button>
                <button
                  className="flashcard-action-btn-circle correct"
                  onClick={() => toggleMastery(currentCard.id, true)}
                  title="Mark Known (Mastered)"
                  style={{
                    height: '48px',
                    width: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Check size={20} />
                </button>
              </div>

              {/* Navigation buttons */}
              <div className="flashcard-navigation" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
                  <ChevronLeft size={16} /> Prev Card
                </Button>
                <Button variant="outline" onClick={handleNext} disabled={currentIndex === activeCards.length - 1}>
                  Next Card <ChevronRight size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {!isGenerating && flashcards.length === 0 && (
        <div className="loading-state">
          <HelpCircle size={32} style={{ opacity: 0.3 }} />
          <p>No flashcards generated yet. Select a material and click "Generate Cards" to build a study deck.</p>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
