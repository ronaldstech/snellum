import React, { useState } from 'react';
import { Heart, Lock, Sparkles, MessageCircle, Star, ShieldCheck, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
  const { userProfile } = useAuth();
  const isPremium = userProfile?.isPremium === true;
  const [likesList] = useState(MOCK_LIKES);

  return (
    <div className="likes-screen-container animate-fade-in">
      {/* Header Banner */}
      <div className="likes-header-banner">
        <div className="likes-header-info">
          <div className="likes-count-pill">
            <Heart size={16} fill="var(--primary)" color="var(--primary)" />
            <span>{likesList.length} People Liked You</span>
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

      {/* Grid of Admirers */}
      <div className="likes-grid">
        {likesList.map((item) => (
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
    </div>
  );
}
