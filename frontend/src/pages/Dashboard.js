import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, BookOpen, TrendingUp,
  Flame, Clock, Upload, Edit, HelpCircle, Calendar, Sparkles
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { SkeletonCard, Skeleton } from '../components/ui/Skeleton';
import './Dashboard.css';

const tooltipStyle = {
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--surface-color)',
  boxShadow: 'var(--shadow-md)',
  fontSize: '0.8125rem',
  color: 'var(--text-main)'
};

const now = new Date();
const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await apiService.analytics.getStats();
        const mats = await apiService.materials.get();
        const nts = await apiService.notes.get();
        setStats(statsData);
        setMaterialsCount(mats.length);
        setNotesCount(nts.length);
      } catch (err) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dash-header">
          <Skeleton height="32px" width="200px" style={{ marginBottom: '8px' }} />
          <Skeleton height="16px" width="120px" />
        </div>
        <div className="metrics-grid" style={{ marginTop: '24px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Fallbacks if stats is not ready
  const accuracyData = stats?.accuracyData || [];
  const topicMastery = stats?.topicMastery || [];
  const weakTopics = stats?.weakTopics || [];
  const streak = stats?.streak || 0;
  const prediction = stats?.predictions || { readinessPercentage: 0, predictedScore: '—', confidenceLevel: '—' };

  const studyHoursData = [
    { name: 'Mon', hours: 2 },
    { name: 'Tue', hours: 3.5 },
    { name: 'Wed', hours: 2.5 },
    { name: 'Thu', hours: 4 },
    { name: 'Fri', hours: 3 },
    { name: 'Sat', hours: 5 },
    { name: 'Sun', hours: 4.5 },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h2 className="dash-greeting">Good afternoon 👋</h2>
          <p className="dash-date">{dateStr}</p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="quick-actions-section">
        <h3 className="section-label">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/upload')}>
            <div className="qa-icon-wrap blue"><Upload size={18} /></div>
            <div className="qa-info">
              <span className="qa-title">Upload Material</span>
              <span className="qa-sub">Add PDFs/Docs</span>
            </div>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/notes')}>
            <div className="qa-icon-wrap green"><Edit size={18} /></div>
            <div className="qa-info">
              <span className="qa-title">Generate Notes</span>
              <span className="qa-sub">Create summaries</span>
            </div>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/quiz')}>
            <div className="qa-icon-wrap amber"><HelpCircle size={18} /></div>
            <div className="qa-info">
              <span className="qa-title">Start Quiz</span>
              <span className="qa-sub">Practice MCQs</span>
            </div>
          </button>
          <button className="quick-action-card" onClick={() => navigate('/schedule')}>
            <div className="qa-icon-wrap slate"><Calendar size={18} /></div>
            <div className="qa-info">
              <span className="qa-title">View Schedule</span>
              <span className="qa-sub">Check planner</span>
            </div>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap blue"><BookOpen size={20} /></div>
          <div className="metric-info">
            <p className="metric-label">Total Subjects</p>
            <p className="metric-value">{topicMastery.length}</p>
            <p className="metric-delta positive">Active prep</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrap green"><FileText size={20} /></div>
          <div className="metric-info">
            <p className="metric-label">Materials Uploaded</p>
            <p className="metric-value">{materialsCount}</p>
            <p className="metric-delta neutral">{notesCount} summaries generated</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrap amber"><HelpCircle size={20} /></div>
          <div className="metric-info">
            <p className="metric-label">Quiz Average</p>
            <p className="metric-value">82%</p>
            <p className="metric-delta positive">↑ +5% this week</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrap slate"><TrendingUp size={20} /></div>
          <div className="metric-info">
            <p className="metric-label">Completion Status</p>
            <p className="metric-value">76%</p>
            <p className="metric-delta positive">On track</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon-wrap primary"><Sparkles size={20} /></div>
          <div className="metric-info">
            <p className="metric-label">Predicted Score</p>
            <p className="metric-value">{prediction.predictedScore}</p>
            <p className="metric-delta positive">Confidence: {prediction.confidenceLevel}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Study Hours Graph */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="chart-title">Study Hours</p>
              <p className="chart-subtitle">Daily activity trend</p>
            </div>
            <span className="chart-badge">24.5 hrs total</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyHoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: 'var(--primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress & Topic Mastery Graph */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="chart-title">Topic Mastery</p>
              <p className="chart-subtitle">Understanding status</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicMastery} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} width={80} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Mastery']} />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={14}>
                  {topicMastery.map((_, index) => (
                    <Cell key={index} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--primary-hover)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Performance Graph */}
        <div className="chart-card full-width">
          <div className="chart-card-header">
            <div>
              <p className="chart-title">Quiz Performance</p>
              <p className="chart-subtitle">Score trend over weeks</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[40, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Accuracy']} />
                <Area
                  type="monotone" dataKey="quiz" stroke="var(--primary)" strokeWidth={2}
                  fillOpacity={1} fill="url(#scoreGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        {/* Streak Tracker */}
        <div className="streak-card">
          <div className="chart-card-header" style={{ marginBottom: 0 }}>
            <div>
              <p className="chart-title">Daily Streak</p>
              <p className="chart-subtitle">Stay consistent</p>
            </div>
            <Flame size={20} color="var(--warning)" />
          </div>
          <div className="streak-count">
            <span className="streak-number">{streak}</span>
            <span className="streak-unit">days active</span>
          </div>
          <p className="streak-prompt">Study today to keep your streak alive!</p>
        </div>

        {/* Weak Topics to Focus On */}
        <div className="tasks-card">
          <div className="chart-card-header" style={{ marginBottom: 0 }}>
            <div>
              <p className="chart-title">Areas of Improvement</p>
              <p className="chart-subtitle">Topics requiring revision</p>
            </div>
            <Clock size={18} color="var(--text-muted)" />
          </div>
          <div className="task-list">
            {weakTopics.map((topicItem, i) => (
              <div className="task-item" key={i}>
                <span className="task-dot high" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span className="task-name">{topicItem.topic}</span>
                  <span className="task-due" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Accuracy: {topicItem.currentAccuracy} · {topicItem.recommendedPrep}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;