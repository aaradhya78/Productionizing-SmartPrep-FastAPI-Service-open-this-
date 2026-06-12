import React, { useState, useEffect } from 'react';
import { Target, Sparkles, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import './pages.css';

const PredictionDashboard = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const data = await apiService.analytics.getStats();
        setPrediction(data?.predictions);
      } catch {
        toast.error('Failed to load predicted data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [toast]);

  if (loading) {
    return (
      <div className="page-container">
        <Skeleton height="36px" width="180px" />
        <Skeleton height="200px" style={{ marginTop: '24px' }} />
      </div>
    );
  }

  const readiness = prediction?.readinessPercentage || 0;
  const score = prediction?.predictedScore || '—';
  const confidence = prediction?.confidenceLevel || '—';
  const confidencePercent = prediction?.confidencePercentage || 0;
  const breakdown = prediction?.breakdown || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-header-title">Exam Score Predictions</h2>
        <p className="page-header-sub">View AI predictions on readiness percentage and estimated marks.</p>
      </div>

      <div className="prediction-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Readiness circular/large layout card */}
        <div className="feature-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <p className="section-label" style={{ marginBottom: '1.5rem' }}>Overall Readiness</p>
          
          <div
            className="readiness-circle"
            style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `conic-gradient(var(--primary) ${readiness * 3.6}deg, var(--border-color) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              className="readiness-circle-inner"
              style={{
                width: '126px',
                height: '126px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
                {readiness}%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Ready
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem', marginBottom: 0 }}>
            Based on active calendar completion, flashcard mastery, and quiz accuracy averages.
          </p>
        </div>

        {/* Prediction metrics summary card */}
        <div className="feature-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--primary)" />
              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>Estimated Performance</strong>
            </div>
            <span className="topic-badge">Model V1</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Predicted Grade / Score</span>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {score}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>AI Confidence Index</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{confidence}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>({confidencePercent}% accuracy probability)</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ width: `${confidencePercent}%`, height: '100%', backgroundColor: 'var(--success)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise predicted details */}
      <div className="feature-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Target size={18} color="var(--primary)" />
          <p className="section-label" style={{ margin: 0 }}>Subject-wise readiness breakdown</p>
        </div>

        <div className="breakdown-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {breakdown.map((item, i) => (
            <div
              key={i}
              className="breakdown-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-color)',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    height: '24px',
                    width: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontWeight: 700
                  }}
                >
                  {item.grade}
                </span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{item.subject}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.readiness}% Readiness</span>
                  <div style={{ width: '100px', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.readiness}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictionDashboard;
