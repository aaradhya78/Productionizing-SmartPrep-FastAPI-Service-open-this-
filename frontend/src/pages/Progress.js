import React, { useState, useEffect } from 'react';
import { BarChart3, Flame, CheckCircle, AlertCircle, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import './pages.css';

const tooltipStyle = {
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--surface-color)',
  color: 'var(--text-main)',
  boxShadow: 'var(--shadow-md)',
  fontSize: '0.8125rem',
};

const Progress = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.analytics.getStats();
        setStats(data);
      } catch {
        toast.error('Failed to load progress details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="page-container">
        <Skeleton height="36px" width="180px" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '24px' }}>
          <Skeleton height="280px" />
          <Skeleton height="280px" />
        </div>
      </div>
    );
  }

  const accuracyData = stats?.accuracyData || [];
  const streak = stats?.streak || 0;
  const topicMastery = stats?.topicMastery || [];
  const weakTopics = stats?.weakTopics || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-header-title">Progress Analytics</h2>
        <p className="page-header-sub">View detailed topic understanding and quiz accuracy trends.</p>
      </div>

      {/* Top Cards row */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-icon-wrap amber"><Flame size={20} /></div>
          <div className="metric-info">
            <p className="metric-label">Current Study Streak</p>
            <p className="metric-value">{streak} Days</p>
            <p className="metric-delta positive">Keep it up!</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap blue"><CheckCircle size={20} /></div>
          <div className="metric-info">
            <p className="metric-label">Average Accuracy</p>
            <p className="metric-value">82%</p>
            <p className="metric-delta positive">↑ +3% since last week</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap green"><TrendingUp size={20} /></div>
          <div className="metric-info">
            <p className="metric-label">Completed Tasks</p>
            <p className="metric-value">14 / 20</p>
            <p className="metric-delta positive">70% schedule completion</p>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="charts-grid">
        {/* Accuracy Trend Graph */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="chart-title">Accuracy Trend</p>
              <p className="chart-subtitle">Quiz vs Mock Test scores comparison</p>
            </div>
            <span className="chart-badge">Weekly Performance</span>
          </div>
          <div className="chart-container" style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[40, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.8125rem' }} />
                <Line type="monotone" name="Quiz Score" dataKey="quiz" stroke="var(--primary)" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Mock Test" dataKey="mock" stroke="var(--success)" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery BarChart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="chart-title">Topic Understanding</p>
              <p className="chart-subtitle">Completion progress in key curriculum areas</p>
            </div>
          </div>
          <div className="chart-container" style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicMastery} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} width={80} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Mastery']} />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={12}>
                  {topicMastery.map((_, index) => (
                    <Cell key={index} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--primary-hover)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Areas Checklist */}
      <div className="feature-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertCircle size={18} className="error" color="var(--error)" />
          <p className="section-label" style={{ margin: 0 }}>Weak Topics & Remedial Actions</p>
        </div>

        <div className="weak-topics-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {weakTopics.map((item, i) => (
            <div
              key={i}
              className="weak-topic-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-color)',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="topic-badge" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', borderColor: '#FECACA' }}>
                    Critical Review
                  </span>
                  <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>{item.topic}</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} color="var(--primary)" /> Recommendation: {item.recommendedPrep}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Current Accuracy:</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--error)' }}>
                  {item.currentAccuracy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;
