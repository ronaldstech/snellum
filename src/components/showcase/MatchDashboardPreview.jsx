import { useMemo, useState } from 'react';
import {
  Flame,
  Compass,
  Heart,
  MessageCircle,
  User,
  SlidersHorizontal,
  Bell,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import SwipeView from '../swipe/SwipeView';
import { countActiveFilters } from '../../utils/discoveryFilters';
import DiscoveryFiltersModal from '../swipe/DiscoveryFiltersModal';
import ProfileSidebar from '../profile/ProfileSidebar';
import ExploreScreen from '../explore/ExploreScreen';
import LikesScreen from '../likes/LikesScreen';
import MessagesPage from '../chat/MessagesPage';
import ProfileScreen from '../profile/ProfileScreen';
import PremiumStoreModal from '../premium/PremiumStoreModal';
import NotificationDrawer from '../notifications/NotificationDrawer';
import CartCheckoutPage from '../cart/CartCheckoutPage';
import '../../styles/dashboard.css';

export default function MatchDashboardPreview() {
  const { user, userProfile } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('discover'); // discover | explore | likes | messages | profile | cart
  const [selectedChat, setSelectedChat] = useState(null);
  const [cartCheckoutItem, setCartCheckoutItem] = useState(null);

  // Modals & Drawers
  const [showPremiumStore, setShowPremiumStore] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const activeFilterCount = useMemo(() => countActiveFilters(userProfile), [userProfile]);

  const handleProceedToCart = (item) => {
    setCartCheckoutItem(item);
    setShowPremiumStore(false);
    setActiveTab('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className={`dashboard-layout ${activeTab === 'discover' ? 'tab-discover-active' : ''}`}>
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
            {/* Premium Button */}
            <button
              type="button"
              className="header-action-btn btn-header-premium"
              onClick={() => setShowPremiumStore(true)}
              title="Upgrade to Premium & VIP Plans"
              aria-label="Upgrade to Premium & VIP Plans"
            >
              <Crown size={15} />
              <span className="btn-header-premium-label">
                {userProfile?.isPremium ? 'VIP Active' : 'Premium'}
              </span>
            </button>

            {/* Discovery Filters */}
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`header-action-btn icon-only dashboard-filters-button ${showFilters ? 'active' : ''}`}
              title="Discovery filters"
              aria-label="Discovery filters"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={16} />
              {activeFilterCount > 0 && (
                <span className="header-btn-badge">{activeFilterCount > 9 ? '9+' : activeFilterCount}</span>
              )}
            </button>

            {/* Notifications */}
            <button
              type="button"
              className={`header-action-btn icon-only notif-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(true)}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="notif-badge-dot" />
            </button>

            {/* Profile Avatar Pill → Profile Sidebar Drawer */}
            <button
              type="button"
              className={`header-action-btn user-pill ${activeTab === 'profile' || showProfile ? 'active' : ''}`}
              onClick={() => setShowProfile(true)}
              title="View Profile"
              aria-label="View Profile"
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
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`dashboard-main tab-${activeTab}`}>
        {activeTab === 'discover' && (
          <div className="discover-shell">
            <div className="discover-main">
              <SwipeView
                onOpenPremium={() => setShowPremiumStore(true)}
                onStartChat={handleStartChatWithPartner}
              />
            </div>
          </div>
        )}

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
            onOpenPremium={() => setShowPremiumStore(true)}
          />
        )}

        {activeTab === 'cart' && (
          <CartCheckoutPage
            item={cartCheckoutItem}
            onBack={() => {
              setActiveTab('discover');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
        onProceedToCart={handleProceedToCart}
      />

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSelectedChat(null);
        }}
      />

      {showFilters && (
        <DiscoveryFiltersModal
          onClose={() => setShowFilters(false)}
          onOpenPremium={() => setShowPremiumStore(true)}
        />
      )}

      <ProfileSidebar
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onOpenPremium={() => setShowPremiumStore(true)}
      />
    </div>
  );
}
