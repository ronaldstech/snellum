import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Clock, CheckCheck, Flame } from 'lucide-react';
import { chatService } from '../../services/chatService';
import '../../styles/chat.css';

export default function ChatList({ currentUserId, onSelectChat, onNavigateToDiscover }) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const unsubscribe = chatService.streamConversations(currentUserId, (chats) => {
      setConversations(chats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const filtered = conversations.filter((c) => {
    const name = Object.values(c.participantDetails || {}).find(p => p.name !== 'You')?.name || 'Match';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="chat-list-container animate-fade-in">
      {/* Header */}
      <div className="chat-list-header">
        <h2>Messages</h2>
        <div className="chat-search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search matches & chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="chat-items-scroll">
        {loading ? (
          <div className="chat-empty-state">
            <div className="pulse-loader" />
            <p>Loading messages...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((chat) => {
            const partner = Object.values(chat.participantDetails || {}).find(p => p.name !== 'You') || {};
            const unread = chat.unreadCount?.[currentUserId] || 0;

            return (
              <div
                key={chat.id}
                className="chat-list-item"
                onClick={() => onSelectChat(chat)}
              >
                <div className="chat-avatar-wrapper">
                  <img
                    src={partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={partner.name || 'Member'}
                  />
                  <div className="online-badge" />
                </div>

                <div className="chat-info-col">
                  <div className="chat-info-row">
                    <span className="chat-partner-name">{partner.name || 'Snellum Member'}</span>
                    <span className="chat-time">
                      <Clock size={12} /> Just now
                    </span>
                  </div>
                  <div className="chat-preview-row">
                    <span className="chat-last-msg">{chat.lastMessage || 'Say hi! 👋'}</span>
                    {unread > 0 && <span className="chat-unread-badge">{unread}</span>}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="chat-empty-state">
            <div className="empty-icon-circle">
              <MessageCircle size={32} />
            </div>
            <h3>No conversations yet</h3>
            <p>Start swiping to find matches and strike up a chat!</p>
            <button
              type="button"
              className="btn-primary"
              onClick={onNavigateToDiscover}
              style={{ marginTop: '1rem' }}
            >
              <Flame size={16} /> Discover Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
