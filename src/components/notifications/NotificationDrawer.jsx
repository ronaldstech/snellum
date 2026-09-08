import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  Sparkles,
  CheckCheck,
  Gift,
  ShieldCheck,
  Info,
  LoaderCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import '../../styles/dashboard.css';

const NOTIFICATION_META = {
  like: { icon: Heart, color: '#EC4899', tab: 'likes' },
  super_like: { icon: Heart, color: '#3B82F6', tab: 'likes' },
  match: { icon: Sparkles, color: '#10B981', tab: 'likes' },
  gift: { icon: Gift, color: '#8B5CF6', tab: 'messages' },
  missed_call: { icon: MessageCircle, color: '#EF4444', tab: 'messages' },
  reward: { icon: Gift, color: '#F59E0B' },
};

function getNotificationMeta(type) {
  if (type?.startsWith('booking_')) return { icon: Bell, color: '#F97316' };
  return NOTIFICATION_META[type] || { icon: ShieldCheck, color: '#64748B' };
}

function getNotificationText(notification) {
  if (notification.message) return notification.message;

  const sender = notification.senderName || 'Someone';
  const messages = {
    like: `${sender} liked your profile.`,
    super_like: `${sender} sent you a Super Like.`,
    match: `${sender} matched with you!`,
    missed_call: `${sender} missed your call.`,
    gift: `${sender} sent you a gift.`,
    booking_request: `${sender} proposed a date.`,
    booking_accepted: `${sender} accepted your date proposal.`,
    booking_declined: `${sender} declined your date proposal.`,
  };
  return messages[notification.type] || `${sender} interacted with your profile.`;
}

function formatNotificationTime(timestamp) {
  const date = timestamp?.toDate?.() || (timestamp ? new Date(timestamp) : null);
  if (!date || Number.isNaN(date.getTime())) return 'Just now';

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return 'Just now';
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
  if (elapsedSeconds < 604800) return `${Math.floor(elapsedSeconds / 86400)}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getNotificationGroup(timestamp) {
  const date = timestamp?.toDate?.() || (timestamp ? new Date(timestamp) : null);
  if (!date || Number.isNaN(date.getTime())) return 'Today';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (notificationDate.getTime() === today.getTime()) return 'Today';
  if (notificationDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return 'Earlier';
}

export default function NotificationDrawer({ isOpen, onClose, onNavigateTab }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.uid) {
      setNotifications([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setLoadError(false);
    return notificationService.streamNotifications(
      user.uid,
      (items) => {
        setNotifications(items);
        setIsLoading(false);
      },
      () => {
        setLoadError(true);
        setIsLoading(false);
      }
    );
  }, [isOpen, user?.uid]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );
  const notificationGroups = useMemo(() => notifications.reduce(
    (groups, notification) => {
      groups[getNotificationGroup(notification.timestamp)].push(notification);
      return groups;
    },
    { Today: [], Yesterday: [], Earlier: [] }
  ), [notifications]);

  if (!isOpen) return null;

  const markAllRead = async () => {
    await notificationService.markAllAsRead(notifications);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
    }

    const destination = NOTIFICATION_META[notification.type]?.tab;
    if (destination) onNavigateTab(destination);
    onClose();
  };

  return (
    <div className="drawer-backdrop-fixed animate-fade-in" onClick={onClose}>
      <aside className="notification-drawer animate-slide-left" onClick={(e) => e.stopPropagation()} aria-label="Notifications">
        <div className="drawer-header">
          <div className="drawer-title">
            <div className="drawer-title-icon"><Bell size={18} /></div>
            <div>
              <h3>Notifications</h3>
              <p>{unreadCount ? `${unreadCount} unread` : 'You are all caught up'}</p>
            </div>
          </div>
          <div className="drawer-actions">
            {unreadCount > 0 && (
              <button type="button" className="btn-mark-read" onClick={markAllRead} title="Mark all as read">
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
            <button type="button" className="notification-close-button" onClick={onClose} aria-label="Close notifications">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="notification-items-scroll">
          {isLoading && (
            <div className="notification-state">
              <LoaderCircle size={24} className="notification-spinner" />
              <p>Loading your activity…</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="notification-state">
              <Info size={26} />
              <h4>Unable to load notifications</h4>
              <p>Please check your connection and try again.</p>
            </div>
          )}

          {!isLoading && !loadError && notifications.length === 0 && (
            <div className="notification-state">
              <div className="notification-empty-icon"><Bell size={26} /></div>
              <h4>No notifications yet</h4>
              <p>Likes, matches, and messages will appear here.</p>
            </div>
          )}

          {!isLoading && !loadError && Object.entries(notificationGroups).map(([label, items]) => (
            items.length > 0 && (
              <section className="notification-group" key={label}>
                <h4 className="notification-group-label">{label}</h4>
                {items.map((notification) => {
                  const meta = getNotificationMeta(notification.type);
                  const Icon = meta.icon;
                  return (
                    <button
                      type="button"
                      key={notification.id}
                      className={`notif-item ${!notification.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notif-icon-circle" style={{ background: `${meta.color}1A`, color: meta.color }}>
                        <Icon size={18} />
                      </div>
                      <div className="notif-content">
                        <div className="notif-top">
                          <h4>{notification.senderName || 'Snellum'}</h4>
                          <span>{formatNotificationTime(notification.timestamp)}</span>
                        </div>
                        <p>{getNotificationText(notification)}</p>
                      </div>
                      {!notification.isRead && <span className="notif-unread-dot" />}
                    </button>
                  );
                })}
              </section>
            )
          ))}
        </div>
      </aside>
    </div>
  );
}
