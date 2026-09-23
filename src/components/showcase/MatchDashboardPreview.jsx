import { useState } from 'react';
import {
  Flame,
  Compass,
  Heart,
  MessageCircle,
  User,
  Settings,
  Bell,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import SwipeView from '../swipe/SwipeView';
import ExploreScreen from '../explore/ExploreScreen';
import LikesScreen from '../likes/LikesScreen';
import MessagesPage from '../chat/MessagesPage';
import ProfileScreen from '../profile/ProfileScreen';
import PremiumStoreModal from '../premium/PremiumStoreModal';
import NotificationDrawer from '../notifications/NotificationDrawer';
import SettingsModal from '../settings/SettingsModal';
import ThemeToggle from '../common/ThemeToggle';
import '../../styles/dashboard.css';

export default function MatchDashboardPreview() {
  const { user, userProfile } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('discover'); // discover | explore | likes | messages | profile
  const [selectedChat, setSelectedChat] = useState(null);

  // Modals & Drawers
  const [showPremiumStore, setShowPremiumStore] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartChatWithPartner = async (partner) => {
    const myUid = user?.uid;
    if (!myUid || !partner?.uid) return;
    try {
      const chatId = await chatService.getOrCreateChat(myUid, partner);
      if (chatId) {
        const photo = partner.photo || partner.avatar || partner.photos?.[0] || '';
        setSelectedChat({
          id: chatId,
          otherUid: partner.uid,
          participantDetails: {
            [myUid]: { name: 'You' },
            [partner.uid]: {
              name: partner.firstName || partner.name || 'Member',
              avatar: photo,
            },
          },
        });
      }
    } catch (e) {
      console.warn('Failed to open chat:', e);
    }
    setActiveTab('messages');
  };

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div
            className="dashboard-brand"
            onClick={() => {
              setActiveTab('discover');
              setSelectedChat(null);
            }}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/newlogo.png"
              alt="Snellum"
              onError={(e) => {
                e.target.src = '/logo.png';
              }}
            />
            <span>
              Snellum<span style={{ color: 'var(--primary)' }}>.</span>
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="dashboard-nav-tabs">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('discover');
                setSelectedChat(null);
              }}
            >
              <Flame size={16} /> Discover
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('explore');
                setSelectedChat(null);
              }}
            >
              <Compass size={16} /> Explore
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('likes');
                setSelectedChat(null);
              }}
            >
              <Heart size={16} /> Likes
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              <MessageCircle size={16} /> Messages
            </button>

          </div>

          {/* Right User Bar */}
          <div className="dashboard-user-bar">
            {/* Sparks & VIP Store Button */}
            <button
              type="button"
              className="btn-sparks-badge"
              onClick={() => setShowPremiumStore(true)}
              title="Sparks & VIP Store"
            >
              <Zap size={15} color="#F59E0B" />
              <span>{userProfile?.sparks || 100}</span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="btn-ghost notif-btn"
              onClick={() => setShowNotifications(true)}
              title="Notifications"
            >
              <Bell size={16} />
              <span className="notif-badge-dot" />
            </button>

            <ThemeToggle />

            {/* Profile Avatar Pill */}
            <div
              className="user-pill"
              onClick={() => {
                setActiveTab('profile');
                setSelectedChat(null);
              }}
              style={{
                cursor: 'pointer',
                border:
                  activeTab === 'profile'
                    ? '1px solid var(--primary)'
                    : '1px solid var(--border-light)',
              }}
              title="View Profile"
            >
              <img
                src={
                  userProfile?.avatar ||
                  user?.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={userProfile?.displayName || 'User'}
              />
              <span className="user-pill-name">
                {userProfile?.displayName || user?.displayName || 'Member'}
              </span>
            </div>

            {/* Settings */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="btn-ghost dashboard-settings-button"
              style={{ padding: '0.4rem 0.55rem' }}
              title="Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`dashboard-main tab-${activeTab}`}>
        {activeTab === 'discover' && <SwipeView />}

        {activeTab === 'explore' && <ExploreScreen />}

        {activeTab === 'likes' && (
          <LikesScreen
            onOpenPremium={() => setShowPremiumStore(true)}
            onStartChat={handleStartChatWithPartner}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesPage
            currentUserId={user?.uid}
            onNavigateToDiscover={() => {
              setActiveTab('discover');
              setSelectedChat(null);
            }}
            onStartMatch={handleStartChatWithPartner}
            pendingChat={selectedChat}
            onConsumePendingChat={() => setSelectedChat(null)}
            onUpgrade={() => setShowPremiumStore(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen
            onNavigateToDiscover={() => setActiveTab('discover')}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('discover');
            setSelectedChat(null);
          }}
          style={{ flexDirection: 'column', gap: '2px', fontSize: '10px' }}
        >
          <Flame size={16} /> Discover
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('explore');
            setSelectedChat(null);
          }}
          style={{ flexDirection: 'column', gap: '2px', fontSize: '10px' }}
        >
          <Compass size={16} /> Explore
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('likes');
            setSelectedChat(null);
          }}
          style={{ flexDirection: 'column', gap: '2px', fontSize: '10px' }}
        >
          <Heart size={16} /> Likes
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
          style={{ flexDirection: 'column', gap: '2px', fontSize: '10px' }}
        >
          <MessageCircle size={16} /> Chats
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('profile');
            setSelectedChat(null);
          }}
          style={{ flexDirection: 'column', gap: '2px', fontSize: '10px' }}
        >
          <User size={16} /> Profile
        </button>
      </nav>

      {/* Global Modals & Drawers */}
      <PremiumStoreModal
        isOpen={showPremiumStore}
        onClose={() => setShowPremiumStore(false)}
      />

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSelectedChat(null);
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
