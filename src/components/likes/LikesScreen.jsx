import { useState, useEffect } from 'react';
import { Heart, Lock, Sparkles, MessageCircle, Flame, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { swipeService } from '../../services/swipeService';
import { profileService } from '../../services/authService';
import { toDate } from '../../models/chatModel';
import { isFirebaseConfigured } from '../../services/firebase';
import '../../styles/likes.css';

const MOCK_LIKES = [
  {
    uid: 'like-1',
    firstName: 'Amara',
    age: 23,
    location: 'Blantyre, Malawi',
    occupation: 'Fashion Designer',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    time: '2 hours ago',
    matchScore: '98%',
  },
  {
    uid: 'like-2',
    firstName: 'Tadala',
    age: 25,
    location: 'Lilongwe, Malawi',
    occupation: 'Biomedical Scientist',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
    time: '5 hours ago',
    matchScore: '94%',
  },
  {
    uid: 'like-3',
    firstName: 'Chikondi',
    age: 22,
    location: 'Mzuzu, Malawi',
    occupation: 'Creative Director',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    time: 'Yesterday',
    matchScore: '91%',
  },
  {
    uid: 'like-4',
    firstName: 'Zikomo',
    age: 27,
    location: 'Zomba, Malawi',
    occupation: 'Architect',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    time: '2 days ago',
    matchScore: '89%',
  },
];

export default function LikesScreen({ onOpenPremium, onStartChat }) {
  const { user, userProfile } = useAuth();
  const isPremium = userProfile?.isPremium === true;
  const [likesList, setLikesList] = useState([]);
  const [loading, setLoading] = useState(() => !isFirebaseConfigured ? false : true);
  // Demo fallback only when Firebase isn't configured.
  const likes = isFirebaseConfigured ? likesList : MOCK_LIKES;

  // Stream real likes (swipes where `toId == me`, `type == 'like'`) and
  // resolve each liker's profile.
  useEffect(() => {
    if (!isFirebaseConfigured || !user?.uid) return;

    let active = true;
    const unsub = swipeService.streamLikesReceived(user.uid, async (likeDocs) => {
      try {
        const resolved = await Promise.all(
          likeDocs.map(async (like) => {
            const profile = await profileService.getUserProfile(like.fromId);
            return buildLikeItem(profile, like);
          })
        );
        if (active) setLikesList(resolved.filter(Boolean));
      } catch (e) {
        console.warn('Failed to resolve likes:', e);
        if (active) setLikesList([]);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsub();
    };
  }, [user?.uid]);

  return (
    <div className="likes-screen-container animate-fade-in">
      {/* Header Banner */}
      <div className="likes-header-banner">
        <div className="likes-header-info">
          <div className="likes-count-pill">
            <Heart size={16} fill="var(--primary)" color="var(--primary)" />
            <span>{likes.length} People Liked You</span>
          </div>
          <h2>Who Likes You</h2>
          <p>
            {isPremium
              ? 'Enjoy unrestricted access to view and match instantly with people who liked you.'
              : 'Upgrade to Snellum Premium or Gold to unblur all your secret admirers and match instantly!'}
          </p>
        </div>

        {!isPremium && (
          <button type="button" className="btn-upgrade-glow" onClick={onOpenPremium}>
            <Sparkles size={16} /> Unlock All Admirers
          </button>
        )}
      </div>

      {/* New Likes strip — Flutter likes-screen rail parity */}
      {loading ? (
        <div className="likes-loading animate-fade-in">
          <div className="pulse-loader" />
          <p>Loading likes...</p>
        </div>
      ) : likes.length > 0 ? (
        <div className="likes-new-strip animate-fade-in">
          <div className="likes-new-strip-header">
            <div className="likes-new-strip-title">
              <Flame size={15} />
              <h3>New Likes</h3>
            </div>
            <button
              type="button"
              className="likes-strip-view-all"
              onClick={onOpenPremium}
              aria-label="View all likes"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          <div className="likes-new-strip-scroll">
            {likes.slice(0, 6).map((item) => (
              <button
                key={item.uid}
                type="button"
                className={`new-like-avatar-btn ${!isPremium ? 'locked' : ''}`}
                onClick={() => !isPremium && onOpenPremium && onOpenPremium()}
                aria-label={`${item.firstName}, ${item.age}`}
              >
                <span className="new-like-avatar-ring">
                  <img src={item.photo} alt={item.firstName} />
                  {!isPremium && (
                    <span className="new-like-avatar-lock">
                      <Lock size={10} />
                    </span>
                  )}
                </span>
                <span className="new-like-avatar-name">{item.firstName}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="likes-empty animate-fade-in">
          <div className="empty-icon-circle">
            <Heart size={32} />
          </div>
          <h3>No likes yet</h3>
          <p>Keep swiping — people who like you will show up here.</p>
        </div>
      )}

      {/* Grid of Admirers */}
      {likes.length > 0 && (
      <div className="likes-grid">
        {likes.map((item) => (
          <div key={item.uid} className={`like-card-item ${!isPremium ? 'blurred' : ''}`}>
            <img src={item.photo} alt={item.firstName} className="like-card-photo" />

            <div className="like-card-overlay">
              <div className="like-card-top">
                <span className="like-match-badge">{item.matchScore} Match</span>
                <span className="like-time-badge">{item.time}</span>
              </div>

              <div className="like-card-bottom">
                <h4>
                  {item.firstName}, {item.age}
                </h4>
                <p>{item.occupation}</p>
                <span className="like-card-loc">{item.location}</span>

                {isPremium ? (
                  <div className="like-card-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => onStartChat && onStartChat(item)}
                    >
                      <MessageCircle size={14} /> Match & Chat
                    </button>
                  </div>
                ) : (
                  <div className="like-locked-tag">
                    <Lock size={12} /> Premium to Reveal
                  </div>
                )}
              </div>
            </div>

            {!isPremium && (
              <div className="blur-lock-overlay" onClick={onOpenPremium}>
                <div className="lock-circle">
                  <Lock size={20} />
                </div>
                <span>Tap to Unlock</span>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

function buildLikeItem(profile, like) {
  if (!profile) return null;
  const photo = profile.avatar || profile.photos?.[0] || '';
  return {
    uid: profile.uid || like?.fromId,
    firstName: profile.firstName || profile.displayName,
    age: profile.age,
    location: profile.location,
    occupation: profile.occupation,
    photo,
    photos: profile.photos || [photo],
    avatar: photo,
    time: relativeTime(like?.timestamp),
    matchScore: profile.matchRate || '96%',
    isVerified: profile.isVerified === true,
  };
}

function relativeTime(date) {
  const d = toDate(date);
  if (!d) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
