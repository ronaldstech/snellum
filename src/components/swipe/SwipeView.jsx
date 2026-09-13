import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  MessageCircle,
  Ruler,
  UserRound,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/authService';
import { giftService, GIFT_CATALOG } from '../../services/giftService';
import { meetupService } from '../../services/meetupService';
import '../../styles/swipe.css';

export default function SwipeView({ categoryFilter }) {
  const { user, userProfile, showToast, spendSparks } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Swipe gesture & stamp feedback state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeExit, setSwipeExit] = useState(null);
  const [swipeHistory, setSwipeHistory] = useState([]); // For rewind feature

  // Modals matching Flutter swipe_view
  const [matchedUser, setMatchedUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [isSendingGift, setIsSendingGift] = useState(false);
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [meetupDate, setMeetupDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [meetupNote, setMeetupNote] = useState('');
  const [isSendingMeetup, setIsSendingMeetup] = useState(false);
  const [showBoostPrompt, setShowBoostPrompt] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const swipeTimer = useRef(null);

  // 1. Fetch Real Profiles from Firestore (with fallbacks)
  useEffect(() => {
    async function loadFeed() {
      try {
        if (user?.uid) {
          const firestoreUsers = await profileService.getDiscoveryUsers(user.uid, 30, categoryFilter);
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
  }, [user, categoryFilter]);

  useEffect(() => {
    const reveal = window.setTimeout(() => setShowBoostPrompt(true), 3200);
    const cycle = window.setInterval(() => setShowBoostPrompt(true), 25000);
    return () => {
      window.clearTimeout(reveal);
      window.clearInterval(cycle);
      window.clearTimeout(swipeTimer.current);
    };
  }, []);

  // Reset photo carousel index when active profile changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    setDragOffset({ x: 0, y: 0 });
  }, [currentIndex]);

  // A category change is a new deck, so restart from its first profile.
  useEffect(() => {
    setCurrentIndex(0);
    setSwipeHistory([]);
  }, [categoryFilter]);

  const visibleProfiles = useMemo(
    () => profiles.filter((profile) => profileMatchesCategory(profile, categoryFilter)),
    [profiles, categoryFilter],
  );

  const currentProfile = visibleProfiles[currentIndex];
  const nextProfile = visibleProfiles[currentIndex + 1];

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

  const runSwipe = (direction) => {
    if (!currentProfile || swipeExit) return;
    setIsDragging(false);
    setSwipeExit(direction);
    swipeTimer.current = window.setTimeout(() => {
      handleSwipeAction(direction);
      setSwipeExit(null);
      setDragOffset({ x: 0, y: 0 });
    }, 280);
  };

  const closeGiftModal = () => {
    if (isSendingGift) return;
    setSelectedGift(null);
    setShowGiftModal(false);
  };

  const sendGift = async () => {
    if (!selectedGift || !currentProfile || isSendingGift) return;
    const balance = Number(userProfile?.sparks ?? userProfile?.credits ?? 0);
    if (balance < selectedGift.cost) {
      showToast(`You need ${selectedGift.cost - balance} more sparks for ${selectedGift.name}.`, 'error');
      return;
    }
    setIsSendingGift(true);
    try {
      await giftService.sendGift({
        senderId: user?.uid,
        senderName: userProfile?.displayName || user?.displayName || 'Someone',
        recipient: currentProfile,
        gift: selectedGift,
      });
      spendSparks(selectedGift.cost);
      showToast(`${selectedGift.icon} ${selectedGift.name} sent to ${currentProfile.displayName}!`, 'success');
      setSelectedGift(null);
      setShowGiftModal(false);
    } catch (error) {
      showToast(error.message || 'Could not send the gift. Please try again.', 'error');
    } finally {
      setIsSendingGift(false);
    }
  };

  const sendMeetup = async () => {
    if (!currentProfile || isSendingMeetup) return;
    const balance = Number(userProfile?.sparks ?? userProfile?.credits ?? 0);
    if (balance < 100) return showToast('You need 100 sparks to send a meetup request.', 'error');
    setIsSendingMeetup(true);
    try {
      if (await meetupService.hasPending(user?.uid, currentProfile.uid)) throw new Error(`A meetup request to ${currentProfile.displayName} is already pending.`);
      await meetupService.request({ senderId: user?.uid, senderName: userProfile?.displayName || 'Someone', recipient: currentProfile, dateTime: new Date(meetupDate).toISOString(), note: meetupNote.trim() });
      spendSparks(100); setShowMeetupModal(false); setMeetupNote(''); showToast('Meetup request sent! 🎉', 'success');
    } catch (error) { showToast(error.message || 'Could not send meetup request.', 'error'); }
    finally { setIsSendingMeetup(false); }
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
    if (swipeExit) return;
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
      runSwipe('like');
    } else if (dragOffset.x < -threshold) {
      runSwipe('pass');
    } else if (dragOffset.y < -threshold) {
      runSwipe('superlike');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const cardRotation = dragOffset.x * 0.08;
  const stampOpacity = Math.min(Math.abs(dragOffset.x) / 80, 1);
  const superlikeOpacity = dragOffset.y < -40 ? Math.min(Math.abs(dragOffset.y) / 80, 1) : 0;
  const dragProgress = Math.min(Math.abs(dragOffset.x) / 180, 1);
  const exitTransform = swipeExit === 'like'
    ? 'translate3d(130vw, -4vh, 0) rotate(28deg)'
    : swipeExit === 'pass'
      ? 'translate3d(-130vw, -4vh, 0) rotate(-28deg)'
      : swipeExit === 'superlike'
        ? 'translate3d(0, -130vh, 0)'
        : null;

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
    <div className={`swipe-container animate-fade-in ${showBoostPrompt ? 'has-boost-prompt' : ''}`}>
      {showBoostPrompt && (
        <div className="boost-floating-popup" role="status">
          <button type="button" className="boost-message" onClick={() => { setShowBoostPrompt(false); showToast('Boost is coming soon — your profile is already looking great!', 'info'); }}>
            <Flame size={15} /> Boost your profile for 10× more visibility
          </button>
          <button type="button" className="boost-close" onClick={() => setShowBoostPrompt(false)} aria-label="Dismiss boost suggestion">×</button>
        </div>
      )}

      {/* Swipable card stack */}
      <div className="card-stack-wrap">
        {/* Next Card (Underneath) */}
        {nextProfile && (
          <div className="swipe-card back-card" style={{ transform: `scale(${0.955 + (dragProgress * 0.045)}) translateY(${14 - (dragProgress * 14)}px)`, opacity: 0.68 + (dragProgress * 0.32) }}>
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
            transform: exitTransform || `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${cardRotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
        >
          {/* Photo Pagination Segment Bars */}
          {currentPhotos.length > 1 && (
            <div className="photo-pagination-bars" role="tablist" aria-label="Profile photos">
              {currentPhotos.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  className={`photo-bar-segment ${i === currentPhotoIndex ? 'active' : ''}`}
                  role="tab"
                  aria-selected={i === currentPhotoIndex}
                  aria-label={`Show photo ${i + 1} of ${currentPhotos.length}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setCurrentPhotoIndex(i);
                  }}
                />
              ))}
              <span className="photo-count" aria-hidden="true">{currentPhotoIndex + 1}/{currentPhotos.length}</span>
            </div>
          )}

          {/* Touch navigation tap zones */}
          <div className="photo-tap-zone left" onClick={handlePrevPhoto} />
          <div className="photo-tap-zone right" onClick={handleNextPhoto} />
          {currentPhotos.length > 1 && (
            <>
              <button
                type="button"
                className="photo-edge-button photo-edge-button-left"
                aria-label="Previous photo"
                disabled={currentPhotoIndex === 0}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={handlePrevPhoto}
              ><ChevronLeft size={22} /></button>
              <button
                type="button"
                className="photo-edge-button photo-edge-button-right"
                aria-label="Next photo"
                disabled={currentPhotoIndex === currentPhotos.length - 1}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={handleNextPhoto}
              ><ChevronRight size={22} /></button>
            </>
          )}

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
          onClick={() => runSwipe('pass')}
          title="Pass"
        >
          <X size={24} />
        </button>

        <button type="button" className="action-circle-btn btn-meet-action" onClick={() => setShowMeetupModal(true)} title="Request a meetup">
          <CalendarPlus size={20} />
        </button>

        {/* Super Like */}
        <button
          type="button"
          className="action-circle-btn btn-superlike-action"
          onClick={() => runSwipe('superlike')}
          title="Super Like"
        >
          <Star size={20} fill="#3B82F6" />
        </button>

        {/* Like */}
        <button
          type="button"
          className="action-circle-btn btn-like-action"
          onClick={() => runSwipe('like')}
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

      {/* Full profile drawer — mirrors the settings sidebar while keeping actions available. */}
      {detailUser && createPortal(
        <div className="drawer-backdrop-fixed animate-fade-in" onClick={() => setDetailUser(null)}>
          <aside className="profile-detail-drawer animate-slide-left" onClick={(e) => e.stopPropagation()} aria-label={`${detailUser.displayName}'s full profile`}>
            <header className="profile-detail-header">
              <div><span>DISCOVER PROFILE</span><h2>{detailUser.displayName}, {detailUser.age || 23}</h2></div>
              <button type="button" className="notification-close-button" onClick={() => setDetailUser(null)} aria-label="Close profile"><X size={18} /></button>
            </header>
            <div className="profile-detail-scroll">
              <div className="profile-detail-photos">
                {(detailUser.photos?.length ? detailUser.photos : [detailUser.avatar]).map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`${detailUser.displayName} ${index + 1}`} />)}
              </div>
              <section className="profile-detail-intro">
                <div>{detailUser.isVerified && <span className="profile-verified"><ShieldCheck size={15} /> Verified</span>}<span className="profile-match"><Sparkles size={14} /> {detailUser.matchRate || '96%'} match</span></div>
                {(detailUser.occupation || detailUser.location) && <p>{detailUser.occupation && <><Briefcase size={15} /> {detailUser.occupation}</>}{detailUser.occupation && detailUser.location && <i>•</i>}{detailUser.location && <><MapPin size={15} /> {detailUser.location}</>}</p>}
              </section>
              {detailUser.bio && <ProfileSection icon={UserRound} title="About me"><p className="profile-detail-bio">{detailUser.bio}</p></ProfileSection>}
              <ProfileFacts profile={detailUser} />
              <ProfileFieldList icon={UserRound} title="Personal details" profile={detailUser} fields={[
                ['Body type', 'bodyType'], ['Relationship status', 'relationshipStatus'], ['Religion', 'religion'], ['Zodiac', 'zodiac'],
              ]} />
              {(detailUser.datingIntent || detailUser.lookingFor?.length) && <ProfileSection icon={Heart} title="Relationship goals"><ProfileChips values={[detailUser.datingIntent, ...(detailUser.lookingFor || [])]} accent /></ProfileSection>}
              <ProfileFieldList icon={Heart} title="Family & connection" profile={detailUser} fields={[
                ['Open to long distance', 'openToLongDistance', (value) => value ? 'Yes' : 'No'], ['Wants children', 'wantKids'], ['Family plans', 'familyPlans'],
              ]} />
              <ProfileFieldList icon={Briefcase} title="Work & education" profile={detailUser} fields={[
                ['Occupation', 'occupation'], ['Industry', 'industry'], ['Education', 'educationLevel'], ['School', 'school'],
              ]} />
              <ProfileFieldList icon={Sparkles} title="Lifestyle & habits" profile={detailUser} fields={[
                ['Smoking', 'smoking'], ['Drinking', 'drinking'], ['Fitness', 'fitness'], ['Diet', 'diet'], ['Sleep', 'sleepingHabits'], ['Pets', 'pets'],
              ]} />
              {detailUser.languages?.length > 0 && <ProfileSection icon={MessageCircle} title="Languages"><ProfileChips values={detailUser.languages} /></ProfileSection>}
              {(detailUser.hobbies?.length || detailUser.tags?.length) && <ProfileSection icon={Sparkles} title="Interests & hobbies"><ProfileChips values={detailUser.hobbies?.length ? detailUser.hobbies : detailUser.tags} /></ProfileSection>}
              {detailUser.musicGenres?.length > 0 && <ProfileSection icon={Sparkles} title="Music taste"><ProfileChips values={detailUser.musicGenres} /></ProfileSection>}
              {detailUser.moviesShows?.length > 0 && <ProfileSection icon={Sparkles} title="Movies & shows"><ProfileChips values={detailUser.moviesShows} /></ProfileSection>}
              {detailUser.weekendActivities?.length > 0 && <ProfileSection icon={Sparkles} title="Weekends"><ProfileChips values={detailUser.weekendActivities} /></ProfileSection>}
              <ProfileFieldList icon={UserRound} title="Personality & values" profile={detailUser} fields={[
                ['Social style', 'introvertExtrovert'], ['Love language', 'loveLanguage'], ['Communication style', 'communicationStyle'], ['Love style', 'loveStyle'], ['MBTI', 'mbti'], ['Political views', 'politicalViews'], ['Core values', 'coreValues'],
              ]} />
              <ProfilePrompts profile={detailUser} />
            </div>
            <footer className="profile-detail-actions">
              <button type="button" className="btn-ghost" onClick={() => { setDetailUser(null); runSwipe('pass'); }}><X size={17} /> Pass</button>
              <button type="button" className="btn-primary" onClick={() => { setDetailUser(null); runSwipe('like'); }}><Heart size={17} fill="#FFFFFF" /> Like</button>
              <button type="button" className="profile-message-button" onClick={() => showToast(`Messaging ${detailUser.displayName} is coming soon.`, 'info')} aria-label={`Message ${detailUser.displayName}`}><MessageCircle size={19} /></button>
            </footer>
          </aside>
        </div>
        , document.body
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

      {showGiftModal && (
        <div className="modal-overlay" onClick={closeGiftModal}>
          <div className="gift-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <div><h3>Send a gift</h3><span className="gift-balance">✦ {Number(userProfile?.sparks ?? userProfile?.credits ?? 0)} sparks</span></div>
              <button type="button" onClick={closeGiftModal} className="gift-close" disabled={isSendingGift} aria-label="Close gift selection"><X size={18} /></button>
            </div>
            <div className="gift-modal-body">
              <p>Surprise <strong>{currentProfile.displayName}</strong> with something special.</p>
              <div className="gift-grid">
                {GIFT_CATALOG.map((gift) => {
                  const canAfford = Number(userProfile?.sparks ?? userProfile?.credits ?? 0) >= gift.cost;
                  return <button key={gift.id} type="button" className={`gift-option ${selectedGift?.id === gift.id ? 'selected' : ''}`} style={{ '--gift-color': gift.color }} disabled={!canAfford || isSendingGift} onClick={() => setSelectedGift(gift)}><span className="gift-icon">{gift.icon}</span><strong>{gift.name}</strong><small>✦ {gift.cost}</small></button>;
                })}
              </div>
              {selectedGift && <div className="gift-confirmation"><span>{selectedGift.icon}</span><p>Send a <strong>{selectedGift.name}</strong> to {currentProfile.displayName} for <strong>{selectedGift.cost} sparks</strong>?</p><button type="button" className="btn-primary" onClick={sendGift} disabled={isSendingGift}>{isSendingGift ? 'Sending…' : `Send for ${selectedGift.cost} sparks`}</button></div>}
            </div>
          </div>
        </div>
      )}
      {showMeetupModal && (
        <div className="modal-overlay" onClick={() => !isSendingMeetup && setShowMeetupModal(false)}>
          <div className="meetup-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header"><div><h3>Meet {currentProfile.displayName}</h3><span>Send a meetup request · 100 sparks</span></div><button type="button" className="gift-close" onClick={() => setShowMeetupModal(false)} disabled={isSendingMeetup}><X size={18} /></button></div>
            <div className="meetup-modal-body">
              {(currentProfile.meetupLocation || currentProfile.meetupRate || currentProfile.meetupNotes) && <div className="meetup-preferences"><strong>{currentProfile.displayName}'s meetup preferences</strong>{currentProfile.meetupLocation && <span>📍 {currentProfile.meetupLocation}</span>}{currentProfile.meetupRate && <span>✦ {currentProfile.meetupRate}</span>}{currentProfile.meetupNotes && <span>{currentProfile.meetupNotes}</span>}</div>}
              <label>Date and time<input type="datetime-local" value={meetupDate} min={new Date().toISOString().slice(0, 16)} onChange={(e) => setMeetupDate(e.target.value)} /></label>
              <label>Personal message (optional)<textarea value={meetupNote} maxLength="280" placeholder="Suggest something they would enjoy…" onChange={(e) => setMeetupNote(e.target.value)} /></label>
              <button type="button" className="btn-primary" onClick={sendMeetup} disabled={isSendingMeetup}>{isSendingMeetup ? 'Sending…' : 'Send meetup request · 100 sparks'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSection({ icon: Icon, title, children }) {
  return (
    <section className="profile-detail-section">
      <h3><Icon size={16} /> {title}</h3>
      {children}
    </section>
  );
}

function ProfileChips({ values = [], accent = false }) {
  return <div className="profile-detail-chips">{[...new Set(values.filter(Boolean))].map((value) => <span className={accent ? 'accent' : ''} key={value}>{value}</span>)}</div>;
}

function ProfileFieldList({ icon, title, profile, fields }) {
  const rows = fields
    .map(([label, key, format]) => [label, format ? format(profile[key]) : profile[key]])
    .filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!rows.length) return null;
  return <ProfileSection icon={icon} title={title}><dl className="profile-detail-rows">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>)}</dl></ProfileSection>;
}

function ProfilePrompts({ profile }) {
  const prompts = [
    ['My perfect date', profile.promptPerfectDate], ['You will fall for me if', profile.promptFallForYou], ['My green flag', profile.promptGreenFlag], ['Two truths and a lie', profile.promptTwoTruths],
  ].filter(([, value]) => value);
  if (!prompts.length) return null;
  return <ProfileSection icon={MessageCircle} title="Conversation starters"><div className="profile-prompts">{prompts.map(([label, value]) => <article key={label}><strong>{label}</strong><p>{value}</p></article>)}</div></ProfileSection>;
}

function ProfileFacts({ profile }) {
  const facts = [
    [Ruler, 'Height', profile.height],
    [UserRound, 'Gender', profile.gender],
  ].filter(([, , value]) => value !== undefined && value !== null && value !== '');
  if (!facts.length) return null;
  return <ProfileSection icon={Info} title="Quick facts"><dl className="profile-detail-facts">{facts.map(([Icon, label, value]) => <div key={label}><Icon size={16} /><dt>{label}</dt><dd>{String(value)}</dd></div>)}</dl></ProfileSection>;
}

const CATEGORY_KEYWORDS = {
  Marriage: ['marriage', 'serious', 'life partner'],
  'Long Term Relationship': ['long term', 'serious partner', 'romantic'],
  'Short Term Relationship': ['short term relationship', 'something in between'],
  'Short Term Fun': ['short term fun', 'no strings', 'casual'],
  Coffee: ['coffee', 'chill', 'casual'],
  Hookups: ['hookup', 'spontaneous', 'no strings'],
  'New Friends': ['new friends', 'friends', 'activity buddies'],
  Sponsor: ['sponsor', 'travel the world', 'explore together'],
  'Learn Cultures': ['culture', 'global', 'international'],
  'Figuring Out': ['figuring out', 'open to anything', 'no pressure'],
};

function profileMatchesCategory(profile, categoryFilter) {
  if (!categoryFilter) return true;

  const categoryValues = [
    profile.datingIntent,
    profile.category,
    profile.intent,
    profile.relationshipStatus,
    ...(Array.isArray(profile.lookingFor) ? profile.lookingFor : [profile.lookingFor]),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  // Firestore category values use the same exact keys as the Explore list.
  // Only fall back to legacy free-text matching when a profile has no category.
  if (categoryValues.length > 0) {
    return categoryValues.includes(categoryFilter.toLowerCase());
  }

  const searchableProfileData = [
    ...categoryValues,
    profile.bio,
    ...(profile.tags || []),
    ...(profile.hobbies || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (CATEGORY_KEYWORDS[categoryFilter] || [categoryFilter.toLowerCase()])
    .some((keyword) => searchableProfileData.includes(keyword));
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
    datingIntent: 'Coffee',
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
    datingIntent: 'Long Term Relationship',
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
    datingIntent: 'Marriage',
    matchRate: '91%',
    isVerified: true,
  },
];
