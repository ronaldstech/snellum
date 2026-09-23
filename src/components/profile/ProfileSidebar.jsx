import { UserRound, X } from 'lucide-react';
import ProfilePanel from './ProfilePanel';
import '../../styles/profile.css';

export default function ProfileSidebar({ isOpen, onClose, onOpenPremium }) {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop-fixed animate-fade-in" onClick={onClose}>
      <aside className="profile-drawer" onClick={(event) => event.stopPropagation()} aria-label="My profile">
        <header className="profile-drawer-header">
          <div className="drawer-title">
            <div className="profile-drawer-icon"><UserRound size={18} /></div>
            <div>
              <h3>My Profile</h3>
              <p>Your profile and membership</p>
            </div>
          </div>
          <button type="button" className="notification-close-button" onClick={onClose} aria-label="Close profile">
            <X size={18} />
          </button>
        </header>

        <div className="profile-drawer-scroll">
          <ProfilePanel mode="sidebar" onOpenPremium={onOpenPremium} />
        </div>
      </aside>
    </div>
  );
}