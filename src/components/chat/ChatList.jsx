import { useState, useEffect } from 'react';
import { MessageCircle, Search, Clock, CheckCheck, Flame, Trash2, ShieldAlert } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { profileService } from '../../services/authService';
import { formatChatTime, toDate } from '../../models/chatModel';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../services/firebase';
import '../../styles/chat.css';

const DEMO_MATCHES = [
  { uid: 'demo_match_1', firstName: 'Chikondi', photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'] },
  { uid: 'demo_match_2', firstName: 'Zikomo', photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'] },
  { uid: 'demo_match_3', firstName: 'Thandi', photos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&auto=format&fit=crop&q=80'] },
];

function isOnlineFresh(profile) {
  if (!profile) return false;
  if (profile.lastSeen || profile.isOnline !== undefined) {
    const lastSeen = toDate(profile.lastSeen);
    if (lastSeen && Date.now() - lastSeen.getTime() > 120000) return false;
  }
  return profile.isOnline === true;
}

export default function ChatList({ currentUserId, selectedChatId, onSelectChat, onNavigateToDiscover, onStartMatch }) {
  const [conversations, setConversations] = useState([]);
  const [matches, setMatches] = useState(() =>
    isFirebaseConfigured && db ? [] : DEMO_MATCHES
  );
  const [partnerProfiles, setPartnerProfiles] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Stream conversations
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = chatService.streamConversations(currentUserId, (chats) => {
      setConversations(chats);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  // Stream new matches (mutual likes) strip
  useEffect(() => {
    if (!currentUserId || !db || !isFirebaseConfigured) return;
    const q = query(
      collection(db, 'matches'),
      where('uids', 'array-contains', currentUserId)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const ids = snap.docs
          .map((d) => {
            const uids = d.data().uids || [];
            return uids.find((u) => u !== currentUserId) || '';
          })
          .filter(Boolean);
        setMatches(ids);
      },
      (err) => {
        console.warn('Matches listener error:', err);
        setMatches([]);
      }
    );
    return () => unsub();
  }, [currentUserId]);

  // Resolve partner profiles for each conversation (name, avatar, online status)
  useEffect(() => {
    const otherUids = conversations.map((c) => c.otherUid).filter(Boolean);
    if (!otherUids.length || !db || !isFirebaseConfigured) return;

    let cancelled = false;
    Promise.all(
      otherUids.map(async (uid) => {
        try {
          const profile = await profileService.getUserProfile(uid);
          return [uid, profile];
        } catch {
          return [uid, null];
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      const map = {};
      entries.forEach(([uid, profile]) => {
        map[uid] = profile || {
          firstName:
            conversations.find((c) => c.otherUid === uid)?.participantDetails?.[uid]?.name || 'Member',
          avatar:
            conversations.find((c) => c.otherUid === uid)?.participantDetails?.[uid]?.avatar || '',
        };
      });
      setPartnerProfiles((prev) => ({ ...prev, ...map }));
    });

    return () => {
      cancelled = true;
    };
  }, [conversations]);

  const filtered = conversations.filter((c) => {
    const profile = partnerProfiles[c.otherUid];
    const name = profile?.firstName || profile?.displayName || c.participantDetails?.[c.otherUid]?.name || 'Match';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDeleteChat = async (chat) => {
    try {
      await chatService.deleteChatForUser(chat.id, currentUserId);
    } catch (e) {
      console.warn('Delete chat failed:', e);
    }
    setPendingDelete(null);
  };

  const handleOpenMatch = (match) => {
    if (onStartMatch) {
      onStartMatch(match);
    } else if (onSelectChat) {
      onSelectChat({
        id: `demo_${match.uid}`,
        participantDetails: {
          [currentUserId]: { name: 'You' },
          [match.uid]: { name: match.firstName, avatar: match.photos?.[0] },
        },
      });
    }
  };

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

      {/* New Matches Strip */}
      {matches.length > 0 && (
        <div className="new-matches-section">
          <div className="new-matches-title">
            <span>New Matches</span>
            <span className="new-matches-count">{matches.length}</span>
          </div>
          <div className="new-matches-scroll">
            {matches.map((match) => {
              const isDemo = typeof match === 'object';
              const m = isDemo ? match : null;
              const uid = isDemo ? m.uid : match;
              const name = isDemo ? m.firstName : 'Member';
              const photo = isDemo ? m.photos?.[0] : '';
              const onClick = () =>
                handleOpenMatch({ uid, firstName: name, photos: [photo], avatar: photo });
              return (
                <div key={uid} className="new-match-item" onClick={onClick} title={`Start chat with ${name}`}>
                  <div className="new-match-avatar-wrap">
                    <img
                      src={photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={name}
                    />
                    <span className="new-match-plus">+</span>
                  </div>
                  <span className="new-match-name">{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="chat-items-scroll">
        {loading ? (
          <div className="chat-empty-state">
            <div className="pulse-loader" />
            <p>Loading messages...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((chat) => {
            const partner = partnerProfiles[chat.otherUid] || chat.participantDetails?.[chat.otherUid] || {};
            const name = partner?.firstName || partner?.displayName || partner?.name || 'Snellum Member';
            const avatar = partner?.avatar || partner?.photos?.[0] || '';
            const unread = chat.unreadCount || 0;
            const sentByMe = chat.lastMessageSenderId === currentUserId;
            const preview = chat.lastMessage || 'Say hi! 👋';

            const isSelected = selectedChatId && selectedChatId === chat.id;

            return (
              <div
                key={chat.id}
                className={`chat-list-item ${isSelected ? 'active' : ''} ${unread > 0 ? 'has-unread' : ''} ${chat.isSuperRequest ? 'super-chat' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="chat-avatar-wrapper">
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={name}
                  />
                  {isOnlineFresh(partner) && <div className="online-badge" />}
                  {chat.isSuperRequest && (
                    <span className="super-glow-badge" title="Super Request">
                      <Flame size={10} />
                    </span>
                  )}
                </div>

                <div className="chat-info-col">
                  <div className="chat-info-row">
                    <span className="chat-partner-name">
                      {name}
                      {chat.isSuperRequest && <span className="super-tag">SUPER</span>}
                    </span>
                    <span className="chat-time">
                      <Clock size={12} /> {formatChatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <div className="chat-preview-row">
                    <span className={`chat-last-msg ${sentByMe ? 'sent-by-me' : ''}`}>
                      {sentByMe ? <CheckCheck size={12} /> : null} {preview}
                    </span>
                    {unread > 0 && <span className="chat-unread-badge">{unread > 99 ? '99+' : unread}</span>}
                  </div>
                </div>

                <button
                  type="button"
                  className="chat-delete-btn"
                  title="Delete conversation"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(chat);
                  }}
                >
                  <Trash2 size={14} />
                </button>
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

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div className="modal-backdrop-fixed animate-fade-in" onClick={() => setPendingDelete(null)}>
          <div className="gift-modal-card delete-chat-card" onClick={(e) => e.stopPropagation()}>
            <div className="delete-chat-header">
              <div className="delete-chat-icon">
                <ShieldAlert size={22} />
              </div>
              <h3>Delete conversation?</h3>
            </div>
            <p>This conversation will be removed from your inbox. The other person can still see it.</p>
            <div className="delete-chat-actions">
              <button type="button" className="btn-secondary" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => handleDeleteChat(pendingDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}