import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, LogOut, Menu, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './TopNav.css';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/upload': 'Materials',
  '/notes': 'Notes',
  '/quiz': 'Quiz',
  '/schedule': 'Schedule',
  '/ai-tutor': 'AI Tutor',
  '/flashcards': 'Flashcards',
  '/mock-test': 'Mock Test',
  '/progress': 'Progress Analytics',
  '/pyq-analysis': 'PYQ Analysis',
  '/prediction': 'Prediction Dashboard',
  '/strategy': 'Exam Strategy',
};

const TopNav = ({ onMobileMenuClick }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'SmartPrep';
  const userEmail = user?.sub || 'student@example.com';
  const userInitial = userEmail.charAt(0).toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topnav-container">
      <div className="topnav-left">
        <button className="mobile-menu-btn icon-btn" onClick={onMobileMenuClick} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      <div className="topnav-actions">
        {/* Search */}
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search..." aria-label="Search" />
        </div>

        {/* Theme Toggler */}
        <button
          className="icon-btn theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notif-badge" />
        </button>

        <div className="topnav-divider" />

        {/* User Profile */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            className="user-profile"
            onClick={() => setDropdownOpen(o => !o)}
            role="button"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="avatar">{userInitial}</div>
            <span className="user-name">{userEmail}</span>
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="dropdown-header">
                <div className="dropdown-header-name">{userEmail.split('@')[0]}</div>
                <div className="dropdown-header-email">{userEmail}</div>
              </div>
              <button className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <Settings size={15} />
                Settings
              </button>
              <button
                className="dropdown-item danger"
                onClick={() => { setDropdownOpen(false); logout(); }}
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
