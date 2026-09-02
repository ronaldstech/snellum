import React, { useState } from 'react';
import { Coffee, Calendar, MapPin, Check, X, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/meetups.css';

const MOCK_MEETUPS = [
  {
    id: 'meet-1',
    partnerName: 'Vanessa Phiri',
    partnerPhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
    location: 'Four Seasons Lounge, Lilongwe',
    dateTime: 'Saturday, 4:00 PM',
    note: 'Looking forward to meeting up for a coffee chat!',
    status: 'accepted',
    isSender: false,
  },
  {
    id: 'meet-2',
    partnerName: 'Tamandani Banda',
    partnerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    location: 'Latitude 13° Hotel Garden',
    dateTime: 'Sunday, 2:30 PM',
    note: 'Would love to discuss creative projects and photography.',
    status: 'pending',
    isSender: true,
  },
];

export default function MeetupsScreen({ onStartChat }) {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [meetups, setMeetups] = useState(MOCK_MEETUPS);

  const handleUpdateStatus = (id, newStatus) => {
    setMeetups((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    showToast(`Meetup proposal ${newStatus}!`, 'success');
  };

  const filtered = meetups.filter((m) => {
    if (activeTab === 'pending') return m.status === 'pending';
    if (activeTab === 'accepted') return m.status === 'accepted';
    return true;
  });

  return (
    <div className="meetups-screen-container animate-fade-in">
      {/* Header */}
      <div className="meetups-header-banner">
        <div className="meetups-badge">
          <Coffee size={14} /> Scheduled Dates & Meetups
        </div>
        <h2>Your Meetup Proposals</h2>
        <p>Manage in-person date invitations, coffee meetups, and real-life connections.</p>
      </div>

      {/* Tabs */}
      <div className="meetup-tabs">
        <button
          type="button"
          className={`meetup-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({meetups.length})
        </button>
        <button
          type="button"
          className={`meetup-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({meetups.filter((m) => m.status === 'pending').length})
        </button>
        <button
          type="button"
          className={`meetup-tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Confirmed ({meetups.filter((m) => m.status === 'accepted').length})
        </button>
      </div>

      {/* Meetups List */}
      <div className="meetups-list">
        {filtered.map((item) => (
          <div key={item.id} className="meetup-card">
            <div className="meetup-card-left">
              <img src={item.partnerPhoto} alt={item.partnerName} className="meetup-partner-avatar" />
              <div className="meetup-details">
                <h4>{item.partnerName}</h4>
                <div className="meetup-detail-row">
                  <MapPin size={14} color="var(--primary)" />
                  <span>{item.location}</span>
                </div>
                <div className="meetup-detail-row">
                  <Calendar size={14} color="var(--primary)" />
                  <span>{item.dateTime}</span>
                </div>
                {item.note && (
                  <div className="meetup-note-box">
                    <MessageSquare size={12} />
                    <span>"{item.note}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="meetup-card-right">
              <span className={`meetup-status-badge ${item.status}`}>
                {item.status.toUpperCase()}
              </span>

              {item.status === 'pending' && !item.isSender && (
                <div className="meetup-actions-row">
                  <button
                    type="button"
                    className="btn-primary-sm"
                    onClick={() => handleUpdateStatus(item.id, 'accepted')}
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    type="button"
                    className="btn-ghost-sm"
                    onClick={() => handleUpdateStatus(item.id, 'rejected')}
                  >
                    <X size={14} /> Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
