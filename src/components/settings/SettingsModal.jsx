import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  HelpCircle,
  Lock,
  LogOut,
  Settings,
  Shield,
  MessageCircle,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { settingsService } from '../../services/settingsService';
import '../../styles/dashboard.css';

const DEFAULT_SETTINGS = {
  showAge: true,
  showDistance: true,
  hideProfile: false,
  allowMessages: true,
};

function SettingTile({ icon: Icon, tone = 'pink', title, subtitle, children, onClick }) {
  const content = (
    <>
      <span className={`settings-tile-icon ${tone}`}><Icon size={19} /></span>
      <span className="settings-tile-copy">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      {children || <ChevronRight className="settings-tile-chevron" size={18} />}
    </>
  );

  return onClick ? (
    <button type="button" className="settings-tile" onClick={onClick}>{content}</button>
  ) : <div className="settings-tile">{content}</div>;
}

export default function SettingsModal({ isOpen, onClose }) {
  const { user, userProfile, logout, showToast } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    let isCurrent = true;
    setIsLoading(true);
    settingsService.getSettings(user?.uid)
      .then((savedSettings) => {
        if (isCurrent) setSettings(savedSettings);
      })
      .catch(() => {
        if (isCurrent) showToast('Could not load saved preferences.', 'error');
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, [isOpen, user?.uid, showToast]);

  if (!isOpen) return null;

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await settingsService.saveSettings(user?.uid, settings);
      showToast('Preferences saved.', 'success');
    } catch {
      showToast('Unable to save preferences. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="drawer-backdrop-fixed animate-fade-in" onClick={onClose}>
      <aside className="settings-drawer animate-slide-left" onClick={(event) => event.stopPropagation()} aria-label="Settings">
        <header className="settings-drawer-header">
          <div className="drawer-title">
            <div className="settings-title-icon"><Settings size={18} /></div>
            <div>
              <h3>Settings</h3>
              <p>Manage your account and preferences</p>
            </div>
          </div>
          <button type="button" className="notification-close-button" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </header>

        <div className="settings-drawer-scroll" aria-busy={isLoading}>
          <section className="settings-section">
            <h4>Account</h4>
            <div className="settings-profile-summary">
              <img src={userProfile?.avatar} alt="Your profile" />
              <div>
                <strong>{userProfile?.displayName || user?.displayName || 'Snellum Member'}</strong>
                <span>{user?.email || 'Your Snellum profile'}</span>
              </div>
              {userProfile?.isVerified && <CheckCircle2 size={18} />}
            </div>
            <SettingTile
              icon={UserRound}
              title="Edit profile"
              subtitle="Photos, bio, and personal details"
              onClick={() => showToast('Profile editing is available from your profile page.', 'info')}
            />
            <SettingTile
              icon={Shield}
              tone="green"
              title="Security"
              subtitle={userProfile?.isVerified ? 'Your profile is verified' : 'Complete verification to build trust'}
              onClick={() => showToast('Safety tools are coming soon.', 'info')}
            />
          </section>

          <section className="settings-section">
            <h4>Privacy & discovery</h4>
            <SettingTile icon={UserRound} title="Show age" subtitle="Let others see your age on your profile">
              <label className="settings-switch" aria-label="Show age">
                <input type="checkbox" checked={settings.showAge} onChange={(e) => updateSetting('showAge', e.target.checked)} />
                <span />
              </label>
            </SettingTile>
            <SettingTile icon={Eye} tone="blue" title="Show distance" subtitle="Let others see how far away you are">
              <label className="settings-switch" aria-label="Show distance">
                <input type="checkbox" checked={settings.showDistance} onChange={(e) => updateSetting('showDistance', e.target.checked)} />
                <span />
              </label>
            </SettingTile>
            <SettingTile icon={Lock} tone="purple" title="Hide profile" subtitle="Temporarily remove your profile from discovery">
              <label className="settings-switch" aria-label="Hide profile">
                <input type="checkbox" checked={settings.hideProfile} onChange={(e) => updateSetting('hideProfile', e.target.checked)} />
                <span />
              </label>
            </SettingTile>
            <SettingTile icon={MessageCircle} tone="green" title="Allow messages" subtitle="Let your matches start a conversation">
              <label className="settings-switch" aria-label="Allow messages">
                <input type="checkbox" checked={settings.allowMessages} onChange={(e) => updateSetting('allowMessages', e.target.checked)} />
                <span />
              </label>
            </SettingTile>
          </section>

          <section className="settings-section">
            <h4>Support</h4>
            <SettingTile icon={HelpCircle} tone="blue" title="Help center" subtitle="Get help with your account" onClick={() => showToast('Help center is coming soon.', 'info')} />
            <SettingTile icon={FileText} tone="blue" title="Terms of service" subtitle="Review Snellum’s terms and policies" onClick={() => showToast('Terms of service are coming soon.', 'info')} />
          </section>

          <button type="button" className="settings-signout-button" onClick={async () => { await logout(); onClose(); }}>
            <LogOut size={17} /> Sign out of Snellum
          </button>
        </div>

        <footer className="settings-drawer-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn-primary" onClick={saveSettings} disabled={isSaving || isLoading}>
            {isSaving ? 'Saving…' : 'Save privacy settings'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
