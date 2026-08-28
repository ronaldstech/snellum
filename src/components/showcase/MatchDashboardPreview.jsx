import React, { useState, useEffect } from 'react';
import { Heart, X, Sparkles, MessageCircle, LogOut, Flame, ShieldCheck, Loader2, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/authService';
import ProfileScreen from '../profile/ProfileScreen';
import ThemeToggle from '../common/ThemeToggle';
import '../../styles/dashboard.css';

const DEFAULT_MATCHES = [
  {
    uid: 'm1',
    displayName: 'Vanessa Banda',
    age: 23,
    occupation: 'Fashion Designer',
    location: 'Lilongwe (4 km away)',
    bio: 'Looking for genuine vibes, laughter, and someone who appreciates art and sunset drives 🌅',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    tags: ['Art & Design', 'Coffee', 'Travel', 'Music'],
    matchRate: '98%',
    isVerified: true,
  },
  {
    uid: 'm2',
    displayName: 'Alinafe Phiri',
    age: 25,
    occupation: 'Software Engineer & Musician',
    location: 'Blantyre (12 km away)',
    bio: 'Coding by day, acoustic guitar by night. Let’s grab a cocktail and talk about our dream travel spots! 🎶',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    tags: ['Tech', 'Music', 'Hiking', 'Photography'],
    matchRate: '95%',
    isVerified: true,
  },
  {
    uid: 'm3',
    displayName: 'Chisomo Tembo',
    age: 24,
    occupation: 'Culinary Chef',
    location: 'Mzuzu (6 km away)',
    bio: 'I can cook the best food you’ve ever tasted. Tell me your favorite dish and let’s see if we match! 🍝',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    tags: ['Cooking', 'Foodie', 'Fitness', 'Cinema'],
    matchRate: '91%',
    isVerified: true,
  },
];

export default function MatchDashboardPreview() {
  const { user, userProfile, logout, showToast } = useAuth();
  // Active Tab state: 'discover' | 'messages' | 'profile'
  const [activeTab, setActiveTab] = useState('discover');
  const [matches, setMatches] = useState(DEFAULT_MATCHES);
  const [matchIndex, setMatchIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real users from Firestore collection 'users'
  useEffect(() => {
    async function loadFirestoreUsers() {
      try {
        if (user?.uid) {
          const firestoreUsers = await profileService.getDiscoveryUsers(user.uid);
          if (firestoreUsers && firestoreUsers.length > 0) {
            setMatches(firestoreUsers);
          }
        }
      } catch (err) {
        console.warn('Using default matches feed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFirestoreUsers();
  }, [user]);

  const currentMatch = matches[matchIndex % matches.length];

  const handleLike = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#FF4D85', '#FF85A1', '#8B5CF6'],
    });
    showToast(`You liked ${currentMatch.displayName || currentMatch.name}! It's a match! 🎉`, 'success');
    setMatchIndex((prev) => prev + 1);
  };

  const handlePass = () => {
    showToast(`Passed on ${currentMatch.displayName || currentMatch.name}`, 'info');
    setMatchIndex((prev) => prev + 1);
  };

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

          {/* Navigation Tabs including Discover, Messages, and Profile */}
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
        /* Discovery Canvas */
        <main className="dashboard-main">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', gap: '1rem' }}>
              <Loader2 size={32} color="var(--primary)" className="animate-spin" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading discovery...</span>
            </div>
          ) : (
            <>
              <div className="match-card animate-fade-in">
                {/* Profile Image */}
                <img
                  src={currentMatch.avatar || currentMatch.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'}
                  alt={currentMatch.displayName || currentMatch.firstName}
                  className="match-card-image"
                />

                {/* Floating badges */}
                <div className="match-card-top-badges">
                  {currentMatch.isVerified && (
                    <div className="badge-verified">
                      <ShieldCheck size={13} /> Verified
                    </div>
                  )}

                  <div className="badge-match-rate">
                    <Sparkles size={12} /> {currentMatch.matchRate || '96% Match'}
                  </div>
                </div>

                {/* Card Bottom Gradient Content */}
                <div className="match-card-content">
                  <h2 className="match-card-title">
                    {currentMatch.displayName || currentMatch.firstName}, {currentMatch.age || 23}
                  </h2>
                  <p className="match-card-meta">
                    {currentMatch.occupation || 'Member'} • {currentMatch.location || 'Malawi'}
                  </p>
                  {currentMatch.bio && (
                    <p className="match-card-bio">
                      "{currentMatch.bio}"
                    </p>
                  )}

                  {/* Interest Tags */}
                  {currentMatch.tags && (
                    <div className="match-card-tags">
                      {currentMatch.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="match-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="match-actions-bar">
                <button
                  type="button"
                  onClick={handlePass}
                  className="action-btn-pass"
                  title="Pass"
                >
                  <X size={22} />
                </button>

                <button
                  type="button"
                  onClick={handleLike}
                  className="action-btn-like"
                  title="Like & Connect"
                >
                  <Heart size={28} fill="#FFFFFF" />
                </button>
              </div>
            </>
          )}
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
