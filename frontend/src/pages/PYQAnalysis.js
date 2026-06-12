import React, { useState, useEffect } from 'react';
import { History, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
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

const PYQAnalysis = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [frequencyData, setFrequencyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [importantTopics, setImportantTopics] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const mats = await apiService.materials.get();
        setMaterials(mats);
        if (mats.length > 0) {
          setSelectedMaterial(mats[0].id);
        } else {
          setLoading(false);
        }
      } catch {
        toast.error('Failed to load analysis parameters.');
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  useEffect(() => {
    if (!selectedMaterial) return;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const data = await apiService.pyq.analyze(selectedMaterial);
        setFrequencyData(data.frequencyData || []);
        setTrendData(data.trends || []);
        setImportantTopics(data.importantTopics || []);
      } catch {
        toast.error('Failed to analyze past papers for this material.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [selectedMaterial, toast]);

  if (loading) {
    return (
      <div className="page-container">
        <Skeleton height="36px" width="180px" />
        <Skeleton height="200px" style={{ marginTop: '24px' }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-header-title">Previous Year Questions (PYQ) Analysis</h2>
        <p className="page-header-sub">View AI-driven breakdowns of topic frequencies and exam weight trends.</p>
      </div>

      {/* Subject Selector */}
      <div className="action-banner">
        <div className="action-banner-info">
          <div className="action-banner-icon"><History size={20} /></div>
          <div>
            <p className="action-banner-title">Select Subject Focus</p>
            <p className="action-banner-sub">Analyze paper weightings and frequencies.</p>
          </div>
        </div>

        <select
          className="form-select"
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(e.target.value)}
          style={{ width: '220px', height: '36px', fontSize: '0.875rem' }}
        >
          {materials.map(m => (
            <option key={m.id} value={m.id}>{m.filename}</option>
          ))}
          {materials.length === 0 && <option>No materials uploaded</option>}
        </select>
      </div>

      {/* Frequency & Trend Graphs */}
      <div className="charts-grid">
        {/* Topic Frequency Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="chart-title">Topic Frequency</p>
              <p className="chart-subtitle">Total times topic appeared in papers</p>
            </div>
          </div>
          <div className="chart-container" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Occurrences']} />
                <Bar dataKey="frequency" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Analysis Line Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="chart-title">Trend Analysis</p>
              <p className="chart-subtitle">Marks weighting trend over past 4 years</p>
            </div>
          </div>
          <div className="chart-container" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} verticalAlign="top" wrapperStyle={{ fontSize: '0.75rem' }} />
                <Line type="monotone" dataKey="Algorithms" stroke="var(--primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="Databases" stroke="var(--success)" strokeWidth={2} />
                <Line type="monotone" dataKey="Networks" stroke="var(--warning)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights from AI */}
      <div className="feature-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={18} color="var(--primary)" />
          <p className="section-label" style={{ margin: 0 }}>AI-Driven PYQ Insights</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {importantTopics.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
              <AlertCircle size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                  High-Weight Topic Alert: {item.topic}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  This topic represents approximately {item.weight} of marks in recent exam cycles. Prioritize understanding core algorithms and definitions related to {item.topic}.
                </p>
              </div>
            </div>
          ))}
          {importantTopics.length === 0 && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>No dynamic insights loaded. Select a study material above to analyze.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PYQAnalysis;
