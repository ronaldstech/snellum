import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  X,
  RotateCcw,
  Star,
  Gift,
  Flame,
  ShieldCheck,
  Sparkles,
  Info,
  MapPin,
  Briefcase,
  GraduationCap,
  MessageCircle,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/authService';
import '../../styles/swipe.css';

export default function SwipeView() {
  const { user, userProfile, showToast } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Swipe gesture & stamp feedback state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState([]); // For rewind feature

  // Modals & Floating popups matching Flutter swipe_view
  const [showBoostPopup, setShowBoostPopup] = useState(true);
  const [matchedUser, setMatchedUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });

  // 1. Fetch Real Profiles from Firestore (with fallbacks)
  useEffect(() => {
    async function loadFeed() {
      try {
        if (user?.uid) {
          const firestoreUsers = await profileService.getDiscoveryUsers(user.uid, 30);
          if (firestoreUsers && firestoreUsers.length > 0) {
            setProfiles(firestoreUsers);
          } else {
            setProfiles(DEFAULT_FALLBACK_PROFILES);
          }
        } else {
          setProfiles(DEFAULT_FALLBACK_PROFILES);
        }
      } catch (err) {
        console.warn('Using default feed:', err);
        setProfiles(DEFAULT_FALLBACK_PROFILES);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [user]);

  // Reset photo carousel index when active profile changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    setDragOffset({ x: 0, y: 0 });
  }, [currentIndex]);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  // Photos array
  const currentPhotos = (currentProfile?.photos && currentProfile.photos.length > 0)
    ? currentProfile.photos
    : [currentProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'];

  // Swipe Action Handlers
  const handleSwipeAction = (direction) => {
    if (!currentProfile) return;

    // Save for rewind
    setSwipeHistory((prev) => [...prev, { profile: currentProfile, index: currentIndex, direction }]);

    if (direction === 'like' || direction === 'superlike') {
      confetti({
        particleCount: direction === 'superlike' ? 90 : 65,
        spread: 65,
        origin: { y: 0.65 },
        colors: direction === 'superlike' ? ['#3B82F6', '#60A5FA', '#93C5FD'] : ['#FF4D85', '#FF85A1', '#8B5CF6'],
      });

      // Simulate Mutual Match event
      if (direction === 'superlike' || Math.random() > 0.4) {
        setMatchedUser(currentProfile);
      } else {
        showToast(`You liked ${currentProfile.displayName}!`, 'success');
      }
    } else if (direction === 'pass') {
      showToast(`Passed on ${currentProfile.displayName}`, 'info');
    }

    setCurrentIndex((prev) => prev + 1);
  };

  // Rewind Last Action (Flutter feature)
  const handleRewind = () => {
    if (swipeHistory.length === 0 || currentIndex === 0) return;
    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(last.index);
    showToast(`Rewound back to ${last.profile.displayName}`, 'info');
  };

  // Photo Carousel Tap Zone Navigation
  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIndex < currentPhotos.length - 1) {
      setCurrentPhotoIndex((prev) => prev + 1);
    }
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex((prev) => prev - 1);
    }
  };

  // Touch & Pointer Gesture Listeners
  const handlePointerDown = (e) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX || e.touches?.[0]?.clientX || 0, y: e.clientY || e.touches?.[0]?.clientY || 0 };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDragOffset({
      x: currentX - startPos.current.x,
      y: currentY - startPos.current.y,
    });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 110;
    if (dragOffset.x > threshold) {
      handleSwipeAction('like');
    } else if (dragOffset.x < -threshold) {
      handleSwipeAction('pass');
    } else if (dragOffset.y < -threshold) {
      handleSwipeAction('superlike');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const cardRotation = dragOffset.x * 0.08;
  const stampOpacity = Math.min(Math.abs(dragOffset.x) / 80, 1);
  const superlikeOpacity = dragOffset.y < -40 ? Math.min(Math.abs(dragOffset.y) / 80, 1) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '1rem' }}>
        <Sparkles size={32} color="var(--primary)" className="animate-spin" />
        <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Finding matches nearby...</span>
      </div>
    );
  }

  // End of Deck state
  if (!currentProfile) {
    return (
      <div className="swipe-container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255, 77, 133, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 1rem' }}>
          <Flame size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          You're All Caught Up!
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto 1.5rem' }}>
          There are no more new profiles in your area right now. Check back later or boost your profile!
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setCurrentIndex(0)}
        >
          <RotateCcw size={16} /> Revisit Feed
        </button>
      </div>
    );
  }

  return (
    <div className="swipe-container animate-fade-in">
      {/* 1. Floating Boost Banner (Flutter Feature) */}
      {showBoostPopup && (
        <div
          className="boost-floating-popup"
          onClick={() => showToast('Boost activated! Getting 10x visibility 🚀', 'success')}
        >
          <Flame size={14} /> Boost your profile for 10x matches!
        </div>
      )}

      {/* 2. Swipable Card Stack */}
      <div className="card-stack-wrap">
        {/* Next Card (Underneath) */}
        {nextProfile && (
          <div className="swipe-card back-card">
            <img
              src={nextProfile.avatar || nextProfile.photos?.[0]}
              alt=""
              className="match-card-image"
            />
          </div>
        )}

        {/* Current Active Card */}
        <div
          className="swipe-card active-card"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${cardRotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          {/* Photo Pagination Segment Bars */}
          {currentPhotos.length > 1 && (
            <div className="photo-pagination-bars">
              {currentPhotos.map((_, i) => (
                <div
                  key={i}
                  className={`photo-bar-segment ${i === currentPhotoIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          )}

          {/* Touch navigation tap zones */}
          <div className="photo-tap-zone left" onClick={handlePrevPhoto} />
          <div className="photo-tap-zone right" onClick={handleNextPhoto} />

          {/* Swipe Stamps */}
          {dragOffset.x > 20 && (
            <div className="stamp-overlay stamp-like" style={{ opacity: stampOpacity }}>
              LIKE
            </div>
          )}
          {dragOffset.x < -20 && (
            <div className="stamp-overlay stamp-pass" style={{ opacity: stampOpacity }}>
              PASS
            </div>
          )}
          {dragOffset.y < -40 && (
            <div className="stamp-overlay stamp-superlike" style={{ opacity: superlikeOpacity }}>
              SUPER LIKE
            </div>
          )}

          {/* Main Photo Image */}
          <img
            src={currentPhotos[currentPhotoIndex] || currentProfile.avatar}
            alt={currentProfile.displayName}
            className="match-card-image"
            draggable={false}
          />

          {/* Floating Badges */}
          <div className="match-card-top-badges" style={{ top: currentPhotos.length > 1 ? '1.5rem' : '0.85rem' }}>
            {currentProfile.isVerified && (
              <div className="badge-verified">
                <ShieldCheck size={13} /> Verified
              </div>
            )}
            <div className="badge-match-rate">
              <Sparkles size={12} /> {currentProfile.matchRate || '96% Match'}
            </div>
          </div>

          {/* Bottom Card Content with Info Button for Detail Sheet */}
          <div className="match-card-content">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 className="match-card-title">
                  {currentProfile.displayName}, {currentProfile.age || 23}
                </h2>
                <p className="match-card-meta">
                  {currentProfile.occupation || 'Member'} • {currentProfile.location || 'Malawi'}
                </p>
              </div>

              {/* Info Button to Open Full Profile Detail Sheet */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailUser(currentProfile);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="View Full Profile Details"
              >
                <Info size={18} />
              </button>
            </div>

            {currentProfile.bio && (
              <p className="match-card-bio">
                "{currentProfile.bio}"
              </p>
            )}

            {/* Interest Tags */}
            {currentProfile.tags && (
              <div className="match-card-tags">
                {currentProfile.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="match-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 5-Button Action Row matching Flutter action_button.dart */}
      <div className="swipe-action-row">
        {/* Rewind */}
        <button
          type="button"
          className="action-circle-btn btn-rewind"
          onClick={handleRewind}
          disabled={currentIndex === 0 || swipeHistory.length === 0}
          title="Rewind (Undo last swipe)"
        >
          <RotateCcw size={18} />
        </button>

        {/* Pass (Dislike) */}
        <button
          type="button"
          className="action-circle-btn btn-pass-action"
          onClick={() => handleSwipeAction('pass')}
          title="Pass"
        >
          <X size={24} />
        </button>

        {/* Super Like */}
        <button
          type="button"
          className="action-circle-btn btn-superlike-action"
          onClick={() => handleSwipeAction('superlike')}
          title="Super Like"
        >
          <Star size={20} fill="#3B82F6" />
        </button>

        {/* Like */}
        <button
          type="button"
          className="action-circle-btn btn-like-action"
          onClick={() => handleSwipeAction('like')}
          title="Like"
        >
          <Heart size={30} fill="#FFFFFF" />
        </button>

        {/* Send Virtual Gift */}
        <button
          type="button"
          className="action-circle-btn btn-gift-action"
          onClick={() => setShowGiftModal(true)}
          title="Send Sparks Gift"
        >
          <Gift size={20} />
        </button>
      </div>

      {/* 4. Full Profile Detail Sheet Modal (Flutter profile_detail_sheet.dart) */}
      {detailUser && (
        <div className="detail-sheet-modal" onClick={() => setDetailUser(null)}>
          <div className="detail-sheet-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={detailUser.avatar}
                  alt=""
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {detailUser.displayName}, {detailUser.age || 23}
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {detailUser.location}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="btn-ghost"
                style={{ borderRadius: '50%', padding: '0.4rem', width: '32px', height: '32px' }}
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {detailUser.bio && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>About</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {detailUser.bio}
                </p>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Interests</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(detailUser.tags || ['Travel', 'Music', 'Coffee']).map((tag, i) => (
                  <span key={i} className="chip-btn selected">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-ghost"
                style={{ flex: 1 }}
                onClick={() => {
                  setDetailUser(null);
                  handleSwipeAction('pass');
                }}
              >
                <X size={16} /> Pass
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setDetailUser(null);
                  handleSwipeAction('like');
                }}
              >
                <Heart size={16} fill="#FFFFFF" /> Like Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Mutual "It's a Match!" Celebration Modal */}
      {matchedUser && (
        <div className="match-success-overlay animate-fade-in" onClick={() => setMatchedUser(null)}>
          <div className="match-success-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 77, 133, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 0.75rem' }}>
              <Sparkles size={34} />
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(255, 77, 133, 0.6)' }}>
              IT'S A MATCH!
            </h1>
            <p style={{ fontSize: '14px', color: '#E2E8F0', marginTop: '0.25rem' }}>
              You and <strong style={{ color: '#FF85A1' }}>{matchedUser.displayName}</strong> liked each other!
            </p>

            <div className="match-avatars-overlap">
              <img
                src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                alt="You"
                className="match-avatar-circle"
              />
              <img
                src={matchedUser.avatar}
                alt={matchedUser.displayName}
                className="match-avatar-circle"
              />
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '15px' }}
              onClick={() => {
                setMatchedUser(null);
                showToast(`Opened chat with ${matchedUser.displayName}!`, 'success');
              }}
            >
              <MessageCircle size={18} /> Send a Message
            </button>

            <button
              type="button"
              onClick={() => setMatchedUser(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '1rem',
              }}
            >
              Keep Swiping
            </button>
          </div>
        </div>
      )}

      {/* 6. Virtual Sparks Gift Modal (Flutter gift_selection_sheet.dart) */}
      {showGiftModal && (
        <div className="modal-overlay" onClick={() => setShowGiftModal(false)}>
          <div className="edit-profile-modal animate-fade-in" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Send Sparks Gift 🎁</h3>
              <button type="button" onClick={() => setShowGiftModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="edit-modal-body" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Send a surprise gift to <strong style={{ color: 'var(--text-main)' }}>{currentProfile.displayName}</strong> to stand out!
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { icon: '🌹', name: 'Rose', cost: 20 },
                  { icon: '💎', name: 'Diamond', cost: 50 },
                  { icon: '👑', name: 'Crown', cost: 100 },
                ].map((g, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="profile-stat-box"
                    style={{ cursor: 'pointer', border: '1px solid var(--border-light)' }}
                    onClick={() => {
                      setShowGiftModal(false);
                      showToast(`Sent ${g.name} to ${currentProfile.displayName}! (-${g.cost} sparks)`, 'success');
                    }}
                  >
                    <span style={{ fontSize: '1.8rem' }}>{g.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{g.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--primary)' }}>{g.cost} sparks</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_FALLBACK_PROFILES = [
  {
    uid: 'm1',
    displayName: 'Vanessa Banda',
    age: 23,
    occupation: 'Fashion Designer',
    location: 'Lilongwe (4 km away)',
    bio: 'Looking for genuine vibes, laughter, and someone who appreciates art and sunset drives 🌅',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    ],
    tags: ['Cooking', 'Foodie', 'Fitness', 'Cinema'],
    matchRate: '91%',
    isVerified: true,
  },
];
