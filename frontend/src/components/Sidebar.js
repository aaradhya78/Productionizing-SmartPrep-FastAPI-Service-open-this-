import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, HelpCircle,
  Calendar, Bot, ChevronLeft, ChevronRight,
  Layers, FileQuestion, History, BarChart3, Target, Compass
} from 'lucide-react';
import './Sidebar.css';

const navSections = [
  {
    title: 'Core',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ]
  },
  {
    title: 'Study Tools',
    items: [
      { path: '/upload', label: 'Materials', icon: FileText },
      { path: '/notes', label: 'Notes', icon: BookOpen },
      { path: '/flashcards', label: 'Flashcards', icon: Layers },
      { path: '/ai-tutor', label: 'AI Tutor', icon: Bot },
    ]
  },
  {
    title: 'Testing',
    items: [
      { path: '/quiz', label: 'Quiz', icon: HelpCircle },
      { path: '/mock-test', label: 'Mock Test', icon: FileQuestion },
      { path: '/pyq-analysis', label: 'PYQ Analysis', icon: History },
    ]
  },
  {
    title: 'Analytics & Planning',
    items: [
      { path: '/schedule', label: 'Schedule', icon: Calendar },
      { path: '/progress', label: 'Progress', icon: BarChart3 },
      { path: '/prediction', label: 'Predictions', icon: Target },
      { path: '/strategy', label: 'Exam Strategy', icon: Compass },
    ]
  }
];

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">SP</div>
          <span className="sidebar-logo-text">SmartPrep</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="sidebar-section">
              <div className="sidebar-section-header">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onMobileClose}
                >
                  <item.icon className="nav-icon" size={18} />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="sidebar-footer">
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <ChevronRight size={18} />
              : <><ChevronLeft size={18} /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;