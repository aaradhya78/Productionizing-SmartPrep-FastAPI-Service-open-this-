import React, { useState, useEffect } from 'react';
import { Compass, Clock, Sliders, CheckCircle2, ChevronRight } from 'lucide-react';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import './pages.css';

const ExamStrategy = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState(null);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const data = await apiService.analytics.getStats();
        setStrategy(data?.strategy);
      } catch {
        toast.error('Failed to load strategy metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStrategy();
  }, [toast]);

  if (loading) {
    return (
      <div className="page-container">
        <Skeleton height="36px" width="180px" />
        <Skeleton height="200px" style={{ marginTop: '24px' }} />
      </div>
    );
  }

  const timeAllocation = strategy?.timeAllocation || [];
  const attemptOrder = strategy?.attemptOrder || [];
  const topicPriority = strategy?.topicPriority || [];
  const recommendations = strategy?.recommendations || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-header-title">Exam Strategy Advice</h2>
        <p className="page-header-sub">View AI-generated time management tips and preparation recommendations.</p>
      </div>

      <div className="strategy-top-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
        
        {/* Time Allocation */}
        <div className="feature-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Clock size={18} color="var(--primary)" />
            <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>Recommended Time Allocation</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {timeAllocation.map((sec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {sec.time}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{sec.section}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{sec.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attempt Order */}
        <div className="feature-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Sliders size={18} color="var(--primary)" />
            <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>Section Attempt Order</strong>
          </div>
          
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            Order designed to lock in easy marks first and allocate maximum concentration to coding elements.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {attemptOrder.map((section, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: idx === 0 ? 'var(--primary-light)' : 'var(--surface-color)',
                  color: idx === 0 ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{idx + 1}</span>
                <span>{section}</span>
                {idx < attemptOrder.length - 1 && <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority prep topics & recommendations */}
      <div className="strategy-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Topic priority list */}
        <div className="feature-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <Compass size={18} color="var(--primary)" />
            <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>Topic Priority Prep Guide</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topicPriority.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  fontSize: '0.8125rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.topic}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated prep: {item.prepTime}</span>
                </div>
                <span className={`topic-badge ${item.priority === 'High' ? 'red' : 'amber'}`} style={{
                  backgroundColor: item.priority === 'High' ? 'var(--error-bg)' : '#FFFBEB',
                  color: item.priority === 'High' ? 'var(--error)' : 'var(--warning)',
                  borderColor: item.priority === 'High' ? '#FECACA' : '#FEF3C7',
                }}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable checklists */}
        <div className="feature-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <CheckCircle2 size={18} color="var(--primary)" />
            <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>Revision Checklists</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  color: 'var(--text-secondary)'
                }}
              >
                <div style={{ marginTop: '3px', height: '6px', width: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', flexShrink: 0 }} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamStrategy;
