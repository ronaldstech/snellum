import { useState } from 'react';
import {
  BadgeCheck,
  Crown,
  Zap,
  Settings,
  Heart,
  Eye,
  Wallet,
  Pencil,
  ChevronRight,
  CalendarCheck,
  Clock,
  Lock,
  ArrowRight,
  Rocket,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../services/firebase';
import EditProfileModal from './EditProfileModal';
import '../../styles/profile.css';

const SOLID_COLORS = {
  premium: '#FF4D85',
  elite: '#9C27B0',
  pro: '#29B6F6',
  amber: '#FFB300',
};

function toDate(value) {
  if (!value) return null;
  try {
    const d = value?.toDate ? value.toDate() : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function isPlanMonthlyFallback(profile, expiry, purchasedAt) {
  if (profile.isPlanMonthly != null) return profile.isPlanMonthly;
  if (expiry && purchasedAt) return expiry.getTime() - purchasedAt.getTime() >= 25 * 86400000;
  if (expiry) return expiry.getTime() - Date.now() >= 25 * 86400000;
  return true;
}

function formatDate(dt) {
  if (!dt) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = dt.getHours().toString().padStart(2, '0');
  const m = dt.getMinutes().toString().padStart(2, '0');
  return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}, ${h}:${m}`;
}

export default function ProfilePanel({ mode = 'page', onOpenPremium }) {
  const { userProfile, user, showToast } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isSidebar = mode === 'sidebar';

  const profile = userProfile;
  const avatar = profile?.avatar;
  const premiumPlan = profile?.subscriptionPlan || 'Premium';
  const isPremium = profile?.isPremium === true;
  const planLabel = (isPremium ? premiumPlan : 'FREE').toUpperCase();

  // Subscription status (mirrors profile_screen.dart subscription card)
  const expiry = toDate(profile?.premiumExpiry);
  const purchasedAt = toDate(profile?.premiumPurchasedAt);
  const isActive = isPremium && !(expiry && new Date() > expiry);
  const isExpired = isPremium && expiry && new Date() > expiry;
  const monthly = isPlanMonthlyFallback(profile || {}, expiry, purchasedAt);

  let remainingText = '';
  let progress = 1.0;
  if (isActive && expiry) {
    const remaining = expiry.getTime() - new Date().getTime();
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    if (days > 1) remainingText = `${days} days remaining`;
    else if (hours > 0) remainingText = `${hours} hours remaining`;
    else if (mins > 0) remainingText = `${mins} mins remaining`;
    else remainingText = 'Expiring soon';

    if (purchasedAt) {
      const total = expiry.getTime() - purchasedAt.getTime();
      const elapsed = new Date().getTime() - purchasedAt.getTime();
      if (total > 0) progress = Math.min(1, Math.max(0, 1 - elapsed / total));
    }
  }

  const accent = !isActive
    ? SOLID_COLORS.amber
    : planLabel.includes('ELITE')
      ? SOLID_COLORS.elite
      : planLabel.includes('PRO')
        ? SOLID_COLORS.pro
        : SOLID_COLORS.premium;

  const planAccentStyle = { '--pp-accent': accent };

  // Completion calculation (matches Flutter completionPercentage spirit)
  const calculateCompletion = () => {
    let score = 30;
    if (profile?.photos?.length) score += 15;
    if (profile?.avatar) score += 5;
    if (profile?.bio) score += 15;
    if (profile?.occupation) score += 15;
    if (profile?.location) score += 10;
    if (profile?.hobbies?.length) score += 10;
    if (profile?.educationLevel) score += 5;
    if (profile?.height) score += 5;
    return Math.min(score, 100);
  };
  const completion = calculateCompletion();

  // Stats (demo counts when Firebase is not configured, matching other demo fallbacks)
  const demoCounts = isFirebaseConfigured ? { likes: 0, views: 0 } : { likes: 12, views: 148 };
  const credits = profile?.sparks ?? 100;

  const handleSaveProfile = async (updatedData) => {
    if (profile) Object.assign(profile, updatedData);
    showToast('Profile updated successfully!', 'success');
  };

  const openEdit = () => setIsEditOpen(true);

  const handlePremium = () => {
    if (!onOpenPremium) {
      showToast('Snellum Premium: Unlimited swipes, see who liked you & travel mode!', 'info');
      return;
    }
    onOpenPremium();
  };

  return (
    <>
      <div className={`profile-panel ${isSidebar ? 'profile-panel-sidebar' : ''}`}>
        {/* 1. Profile Header (portrait ring + edit badge) */}
        <section className="profile-panel-section pp-header" onClick={openEdit} role="button" tabIndex={0}>
          <div className="pp-avatar-ring">
            <img className="pp-avatar-img" src={avatar} alt="User avatar" />
            <span className="pp-edit-badge" title="Edit Profile">
              <Pencil size={14} />
            </span>
          </div>

          <h2 className="pp-name">
            {profile?.displayName || 'Snellum Member'}
            {profile?.isVerified && <BadgeCheck className="pp-verified" size={20} />}
          </h2>
          {user?.email && <p className="pp-email">{user.email}</p>}
          {profile?.occupation && <p className="pp-occupation">{profile.occupation}{profile?.location ? ` • ${profile.location}` : ''}</p>}

          {isPremium && (
            <span className="pp-premium-badge">
              <Crown size={13} /> {premiumPlan.toUpperCase()} MEMBER
            </span>
          )}
        </section>

        {/* 2. Subscription Status Card */}
        <section className="profile-panel-section">
          <div className={`pp-sub-card ${isActive ? 'pp-sub-active' : ''}`} style={planAccentStyle}>
            <div className="pp-sub-head">
              <span className="pp-sub-icon">
                {isActive ? <Crown size={20} /> : <Lock size={20} />}
              </span>
              <div className="pp-sub-info">
                <div className="pp-sub-title-row">
                  <span className="pp-sub-title">{isActive ? `${planLabel} MEMBERSHIP` : 'FREE ACCOUNT'}</span>
                  <span className={`pp-sub-status ${isActive ? 'active' : isExpired ? 'expired' : ''}`}>
                    {isActive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'STANDARD'}
                  </span>
                </div>
                <span className="pp-sub-detail">
                  {isActive
                    ? `${monthly ? 'Monthly' : 'Weekly'} • ${remainingText || 'Active'}`
                    : 'Upgrade to unlock all VIP perks & boosts'}
                </span>
              </div>
            </div>

            {isActive && expiry && (
              <div className="pp-sub-progress">
                <div className="pp-progress-track">
                  <div className="pp-progress-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <div className="pp-sub-dates">
                  {purchasedAt && (
                    <div className="pp-sub-date-row">
                      <span><CalendarCheck size={13} /> Purchased on</span>
                      <b>{formatDate(purchasedAt)}</b>
                    </div>
                  )}
                  <div className="pp-sub-date-row">
                    <span><Clock size={13} /> Expires at</span>
                    <b>{formatDate(expiry)}</b>
                  </div>
                </div>
              </div>
            )}

            {isActive && (profile?.queuedSubscriptions?.length > 0) && (
              <div className="pp-queued">
                <div className="pp-queued-head">
                  <span>My Memberships ({profile.queuedSubscriptions.length + 1})</span>
                  <small>Tap Activate to switch</small>
                </div>
                {profile.queuedSubscriptions.map((q, i) => {
                  const qPlan = q?.plan || 'Premium';
                  const qMonthly = q?.isMonthly === true;
                  const qDays = Number(q?.days) || (qMonthly ? 30 : 7);
                  return (
                    <div className="pp-queued-item" key={i}>
                      <div className="pp-queued-item-info">
                        <b>{qPlan.toUpperCase()} ({qMonthly ? '1 Month' : `${qDays} Days`})</b>
                        <small>Preserved in queue • {qDays} days remaining</small>
                      </div>
                      <button
                        type="button"
                        className="pp-queued-activate"
                        onClick={() => showToast(`${qPlan} queued — active membership preserved in queue`, 'info')}
                      >
                        <Zap size={11} /> Activate
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button type="button" className="pp-sub-cta" onClick={handlePremium}>
              {isActive ? 'Manage or Upgrade Plan' : 'Upgrade to Premium'}
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* 3. Completion Card */}
        <section className="profile-panel-section">
          <div className={`pp-complete-card ${completion === 100 ? 'complete' : ''}`} onClick={openEdit} role="button" tabIndex={0}>
            <div className="pp-complete-ring" style={{ '--pct': completion }}>
              <span>{completion}%</span>
            </div>
            <div className="pp-complete-copy">
              <b>{completion === 100 ? 'Profile Complete!' : 'Complete Your Profile'}</b>
              <span>{completion === 100 ? 'Tap to update your details' : 'Profiles with photos & bio get 3x more matches'}</span>
            </div>
            <ChevronRight size={20} />
          </div>
        </section>

        {/* 4. Stats Grid */}
        <section className="profile-panel-section">
          <div className="pp-stats-grid">
            <button type="button" className="pp-stat-card" onClick={() => showToast('Likes received', 'info')}>
              <span className="pp-stat-icon" style={{ background: 'rgba(255, 51, 102, 0.12)', color: '#FF3366' }}>
                <Heart size={20} />
              </span>
              <b>{demoCounts.likes}</b>
              <small>Likes</small>
            </button>
            <button type="button" className="pp-stat-card" onClick={() => showToast('Profile views', 'info')}>
              <span className="pp-stat-icon" style={{ background: 'rgba(0, 200, 83, 0.12)', color: '#00C853' }}>
                <Eye size={20} />
              </span>
              <b>{demoCounts.views}</b>
              <small>Views</small>
            </button>
            <button type="button" className="pp-stat-card pp-stat-wide" onClick={handlePremium}>
              <span className="pp-stat-icon" style={{ background: 'rgba(255, 152, 0, 0.12)', color: '#FF9800' }}>
                <Wallet size={20} />
              </span>
              <div className="pp-stat-wide-copy">
                <small>My Sparks</small>
                <b>{credits}</b>
              </div>
              <ChevronRight size={18} className="pp-stat-arrow" />
            </button>
          </div>
        </section>

        {/* 5. Quick Actions Menu */}
        <section className="profile-panel-section">
          <div className="pp-menu">
            <button type="button" className="pp-menu-item" onClick={openEdit}>
              <span className="pp-menu-icon" style={{ background: 'rgba(255, 77, 133, 0.12)', color: '#FF4D85' }}>
                <Pencil size={18} />
              </span>
              <div className="pp-menu-copy">
                <b>Edit Profile</b>
                <small>Complete your profile</small>
              </div>
              <ChevronRight size={17} className="pp-menu-arrow" />
            </button>

            <div className="pp-menu-divider" />

            <button
              type="button"
              className="pp-menu-item pp-menu-boosted"
              onClick={() => showToast('Profile boost active — 10x visibility', 'success')}
            >
              <span className="pp-menu-icon" style={profile?.isBoosted
                ? { background: 'linear-gradient(135deg,#FF4D85,#FF9E00)', color: '#fff' }
                : { background: 'rgba(255, 158, 11, 0.12)', color: '#FF9E00' }}>
                <Rocket size={18} />
              </span>
              <div className="pp-menu-copy">
                <b>Boost Profile</b>
                <small>{profile?.isBoosted ? `Active until ${formatDate(toDate(profile.boostExpiry)) || 'scheduled'}` : 'Get 10x more profile visibility'}</small>
              </div>
              <ChevronRight size={17} className="pp-menu-arrow" />
            </button>

            <div className="pp-menu-divider" />

            <button type="button" className="pp-menu-item" onClick={handlePremium}>
              <span className="pp-menu-icon" style={{ background: 'rgba(255, 179, 0, 0.12)', color: '#FFB300' }}>
                <Crown size={18} />
              </span>
              <div className="pp-menu-copy">
                <b>{isPremium ? `${premiumPlan} Subscription` : 'Snellum Premium'}</b>
                <small>{isPremium ? 'Active Plan • Manage or Upgrade' : 'Unlock unlimited matches & likes'}</small>
              </div>
              <ChevronRight size={17} className="pp-menu-arrow" />
            </button>

            <div className="pp-menu-divider" />

            <button type="button" className="pp-menu-item" onClick={() => showToast('Settings & Account Privacy', 'info')}>
              <span className="pp-menu-icon" style={{ background: 'rgba(108, 92, 231, 0.12)', color: '#6C5CE7' }}>
                <Settings size={18} />
              </span>
              <div className="pp-menu-copy">
                <b>Settings</b>
                <small>Discovery preferences & security</small>
              </div>
              <ChevronRight size={17} className="pp-menu-arrow" />
            </button>
          </div>
        </section>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userProfile={profile}
        onSave={handleSaveProfile}
      />
    </>
  );
}