import React, { useState } from 'react';
import { MessageCircle, LogOut, Flame, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SwipeView from '../swipe/SwipeView';
import ProfileScreen from '../profile/ProfileScreen';
import ThemeToggle from '../common/ThemeToggle';
import '../../styles/dashboard.css';

export default function MatchDashboardPreview() {
  const { user, userProfile, logout, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-brand" onClick={() => setActiveTab('discover')} style={{ cursor: 'pointer' }}>
            <img
              src="/newlogo.png"
              alt="Snellum"
              onError={(e) => { e.target.src = '/logo.png'; }}
            />
            <span>
              Snellum<span style={{ color: 'var(--primary)' }}>.</span>
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="dashboard-nav-tabs">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
            >
              <Flame size={16} /> Discover
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('messages');
                showToast('Messages feature coming next!', 'info');
              }}
            >
              <MessageCircle size={16} /> Messages
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} /> Profile
            </button>
          </div>

          {/* Right User Bar */}
          <div className="dashboard-user-bar">
            <ThemeToggle />

            <div
              className="user-pill"
              onClick={() => setActiveTab('profile')}
              style={{ cursor: 'pointer', border: activeTab === 'profile' ? '1px solid var(--primary)' : '1px solid var(--border-light)' }}
              title="View Profile"
            >
              <img
                src={userProfile?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={userProfile?.displayName || 'User'}
              />
              <span className="user-pill-name">
                {userProfile?.displayName || user?.displayName || 'Member'}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="btn-ghost"
              style={{ padding: '0.4rem 0.65rem' }}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      {activeTab === 'profile' ? (
        <ProfileScreen onNavigateToDiscover={() => setActiveTab('discover')} />
      ) : activeTab === 'messages' ? (
        <main className="dashboard-main">
          <div className="match-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 77, 133, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
              <MessageCircle size={30} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Your Matches & Conversations</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', marginBottom: '1.5rem' }}>
              When you and another member like each other, you can start chatting here.
            </p>
            <button type="button" className="btn-primary" onClick={() => setActiveTab('discover')}>
              <Flame size={16} /> Start Discovering
            </button>
          </div>
        </main>
      ) : (
        <main className="dashboard-main">
          <SwipeView />
        </main>
      )}

      {/* Mobile Bottom Tab Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
          style={{ flexDirection: 'column', gap: '2px', fontSize: '11px' }}
        >
          <Flame size={18} /> Discover
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('messages');
            showToast('Messages feature coming next!', 'info');
          }}
          style={{ flexDirection: 'column', gap: '2px', fontSize: '11px' }}
        >
          <MessageCircle size={18} /> Messages
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          style={{ flexDirection: 'column', gap: '2px', fontSize: '11px' }}
        >
          <User size={18} /> Profile
        </button>
      </nav>
    </div>
  );
}
