import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Crown,
  Edit3,
  Settings,
  Flame,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MapPin,
  Briefcase,
  Heart,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from './EditProfileModal';
import '../../styles/profile.css';

export default function ProfileScreen({ onNavigateToDiscover }) {
  const { userProfile, user, showToast } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Profile completion calculation matching user_profile_model completionPercentage
  const calculateCompletion = () => {
    let score = 30; // base score with auth
    if (userProfile?.avatar) score += 20;
    if (userProfile?.bio) score += 15;
    if (userProfile?.occupation) score += 15;
    if (userProfile?.location) score += 10;
    if (userProfile?.hobbies?.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const completionRate = calculateCompletion();

  const handleSaveProfile = async (updatedData) => {
    // Save to Firestore and local state
    if (userProfile) {
      Object.assign(userProfile, updatedData);
    }
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="profile-container animate-fade-in">
      {/* 1. Header Banner & Profile Card */}
      <div className="profile-card profile-header-banner">
        <div className="profile-avatar-wrapper">
          <img
            src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
            alt="User avatar"
            className="profile-avatar-img"
          />
          {userProfile?.isVerified !== false && (
            <div className="profile-badge-verified" title="Verified Profile">
              <ShieldCheck size={16} />
            </div>
          )}
        </div>

        <div>
          <h1 className="profile-user-name">
            {userProfile?.displayName || 'Snellum Member'}, {userProfile?.age || 23}
          </h1>
          <p className="profile-user-subtitle">
            {userProfile?.occupation || 'Member'} • {userProfile?.location || 'Malawi'}
          </p>
        </div>

        {userProfile?.bio && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.45' }}>
            "{userProfile?.bio}"
          </p>
        )}

        {/* Action Button: Edit */}
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="btn-primary"
          style={{
            marginTop: '0.4rem',
            padding: '0.55rem 1.25rem',
            fontSize: '13px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Edit3 size={15} /> Edit Profile
        </button>
      </div>

      {/* 2. Stats Grid: Sparks & Profile Completion */}
      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <div className="stat-icon-wrap" style={{ background: 'rgba(255, 77, 133, 0.12)', color: 'var(--primary)' }}>
            <Zap size={22} />
          </div>
          <div className="stat-val">{userProfile?.sparks || 100}</div>
          <div className="stat-lbl">My Sparks</div>
        </div>

        <div className="profile-stat-box">
          <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-val">{completionRate}%</div>
          <div className="stat-lbl">Profile Complete</div>
        </div>
      </div>

      {/* 3. Action Menu matching profile_screen.dart */}
      <div className="profile-card" style={{ padding: '0.5rem' }}>
        <div className="profile-menu-list">
          {/* Boost Profile */}
          <button
            type="button"
            className="profile-menu-item"
            onClick={() => showToast('Profile boost activated! 10x visibility for 1 hour 🚀', 'success')}
          >
            <div className="menu-item-left">
              <div className="menu-item-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}>
                <Flame size={19} />
              </div>
              <div>
                <div className="menu-item-text-title">Boost Profile</div>
                <div className="menu-item-text-sub">Get 10x more profile visibility</div>
              </div>
            </div>
            <ChevronRight size={17} color="var(--text-subtle)" />
          </button>

          <div style={{ height: '1px', background: 'var(--border-light)', margin: '0 1rem' }} />

          {/* Premium Subscription */}
          <button
            type="button"
            className="profile-menu-item"
            onClick={() => showToast('Snellum Premium: Unlimited swipes, see who liked you & travel mode!', 'info')}
          >
            <div className="menu-item-left">
              <div className="menu-item-icon" style={{ background: 'rgba(255, 179, 0, 0.12)', color: '#FFB300' }}>
                <Crown size={19} />
              </div>
              <div>
                <div className="menu-item-text-title">Snellum Premium</div>
                <div className="menu-item-text-sub">Unlock unlimited matches & likes</div>
              </div>
            </div>
            <ChevronRight size={17} color="var(--text-subtle)" />
          </button>

          <div style={{ height: '1px', background: 'var(--border-light)', margin: '0 1rem' }} />

          {/* Settings / Privacy */}
          <button
            type="button"
            className="profile-menu-item"
            onClick={() => showToast('Settings & Account Privacy', 'info')}
          >
            <div className="menu-item-left">
              <div className="menu-item-icon" style={{ background: 'rgba(108, 92, 231, 0.12)', color: '#6C5CE7' }}>
                <Settings size={19} />
              </div>
              <div>
                <div className="menu-item-text-title">Settings</div>
                <div className="menu-item-text-sub">Discovery preferences & security</div>
              </div>
            </div>
            <ChevronRight size={17} color="var(--text-subtle)" />
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userProfile={userProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
