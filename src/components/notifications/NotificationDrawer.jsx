import React, { useState } from 'react';
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import '../../styles/dashboard.css';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'New Like!',
    body: 'Someone just liked your profile! Open Who Liked Me to match.',
    type: 'like',
    time: '5m ago',
    icon: Heart,
    color: '#EC4899',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Match Alert!',
    body: 'You and Vanessa are a mutual match. Say hello now!',
    type: 'match',
    time: '1h ago',
    icon: Sparkles,
    color: '#F59E0B',
    unread: true,
  },
];

export default function NotificationDrawer({ isOpen, onClose, onNavigateTab }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="drawer-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="notification-drawer animate-slide-left" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <Bell size={18} color="var(--primary)" />
            <h3>Activity & Notifications</h3>
          </div>
          <div className="drawer-actions">
            <button
              type="button"
              className="btn-mark-read"
              onClick={markAllRead}
              title="Mark all as read"
            >
              <CheckCheck size={16} /> Mark read
            </button>
            <button type="button" className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notification-items-scroll">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`notif-item ${n.unread ? 'unread' : ''}`}
                onClick={() => {
                  if (n.type === 'match' || n.type === 'like') onNavigateTab('likes');
                  onClose();
                }}
              >
                <div className="notif-icon-circle" style={{ background: `${n.color}20`, color: n.color }}>
                  <Icon size={18} />
                </div>
                <div className="notif-content">
                  <div className="notif-top">
                    <h4>{n.title}</h4>
                    <span>{n.time}</span>
                  </div>
                  <p>{n.body}</p>
                </div>
                {n.unread && <span className="notif-unread-dot" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
