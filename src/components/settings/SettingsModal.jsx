import React, { useState } from 'react';
import {
  X,
  Sliders,
  Shield,
  Bell,
  Eye,
  LogOut,
  Trash2,
  Lock,
  Moon,
  Sun,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/dashboard.css';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, userProfile, logout, showToast } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Settings State matching Flutter settings_screen
  const [ageRange, setAgeRange] = useState(35);
  const [maxDistance, setMaxDistance] = useState(50);
  const [showMeOnSnellum, setShowMeOnSnellum] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    showToast('Settings saved successfully!', 'success');
    onClose();
  };

  return (
    <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Settings & Preferences</h3>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-body-scroll">
          {/* Discovery Preferences */}
          <div className="settings-group">
            <h4>
              <Sliders size={15} /> Discovery Filters
            </h4>

            <div className="setting-control-row">
              <div className="setting-label-col">
                <span>Maximum Distance</span>
                <small>{maxDistance} km</small>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
              />
            </div>

            <div className="setting-control-row">
              <div className="setting-label-col">
                <span>Maximum Age Limit</span>
                <small>Up to {ageRange} years old</small>
              </div>
              <input
                type="range"
                min="18"
                max="65"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
              />
            </div>
          </div>

          {/* Privacy & Safety */}
          <div className="settings-group">
            <h4>
              <Shield size={15} /> Privacy & Visibility
            </h4>

            <div className="setting-toggle-row">
              <div>
                <span>Show me on Snellum</span>
                <small>While disabled, your card will be hidden from discovery</small>
              </div>
              <input
                type="checkbox"
                checked={showMeOnSnellum}
                onChange={(e) => setShowMeOnSnellum(e.target.checked)}
              />
            </div>

            <div className="setting-toggle-row">
              <div>
                <span>Incognito Mode (VIP)</span>
                <small>Only people you like can view your profile</small>
              </div>
              <input
                type="checkbox"
                checked={incognitoMode}
                onChange={(e) => setIncognitoMode(e.target.checked)}
              />
            </div>
          </div>

          {/* Notifications & Appearance */}
          <div className="settings-group">
            <h4>
              <Bell size={15} /> Appearance & Alerts
            </h4>

            <div className="setting-toggle-row">
              <div>
                <span>Push & In-App Notifications</span>
                <small>Get notified for likes, gifts, and messages</small>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
            </div>

            <div className="setting-toggle-row">
              <div>
                <span>Appearance Mode</span>
                <small>Current theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</small>
              </div>
              <button type="button" className="btn-secondary-sm" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} Switch
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="settings-group danger-zone">
            <h4>Account</h4>
            <div className="account-action-buttons">
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                <LogOut size={15} /> Sign Out of Snellum
              </button>
            </div>
          </div>
        </div>

        <div className="modal-actions-row">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
