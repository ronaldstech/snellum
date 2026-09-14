import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Send,
  Gift,
  CheckCheck,
  Check,
  Smile,
  Flame,
  X,
  Reply,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { giftService } from '../../services/giftService';
import { useAuth } from '../../context/AuthContext';
import GiftSelectorModal from './GiftSelectorModal';
import {
  formatClockTime,
  formatDateDivider,
  toDate,
} from '../../models/chatModel';
import '../../styles/chat.css';

const EMOJI_LIST = [
  '😀', '😂', '😍', '😘', '🥰', '😊', '😉', '😎',
  '🤗', '😜', '❤️', '💕', '😅', '😳', '🥺', '😢',
  '🔥', '✨', '👀', '👍', '👏', '🙏', '💋', '💞',
  '🌹', '💐', '🎁', '🍕', '☕', '🍷', '🎉', '😴',
];

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

export default function ChatWindow({ chat, currentUser, onBack, onUpgrade }) {
  const { userProfile, spendSparks, showToast } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatMeta, setChatMeta] = useState(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingMessage, setReplyingMessage] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSuperConfirm, setShowSuperConfirm] = useState(false);
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [sending, setSending] = useState(false);
  const [realChatId, setRealChatId] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const markedReadRef = useRef(new Set());
  const signedOfflineRef = useRef(false);

  const myUid = currentUser?.uid;
  const partner =
    Object.values(chat?.participantDetails || {}).find(
      (p) => p?.name !== 'You'
    ) || { name: 'Match', avatar: DEFAULT_AVATAR };
  const partnerUid =
    chat?.otherUid ||
    Object.keys(chat?.participantDetails || {}).find((k) => k !== myUid) || '';
  const partnerName = partner?.name || chat?.partnerName || 'Match';
  const partnerAvatar = partner?.avatar || DEFAULT_AVATAR;

  // ── Ensure the deterministic chat exists, then stream everything ─────
  useEffect(() => {
    let active = true;
    (async () => {
      if (!myUid || !partnerUid) return;
      try {
        const id = await chatService.getOrCreateChat(myUid, {
          uid: partnerUid,
          displayName: partnerName,
          avatar: partnerAvatar,
        });
        if (active && id) setRealChatId(id);
      } catch (e) {
        console.warn('getOrCreateChat failed:', e);
        if (active) setRealChatId(chat?.id || null);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myUid, partnerUid]);

  const chatId = realChatId || chat?.id;

  // Set own online status + subscribe to partner online status
  useEffect(() => {
    if (!myUid) return;
    chatService.setUserOnline(myUid, true);
    return () => {
      chatService.setUserOnline(myUid, false);
      signedOfflineRef.current = true;
    };
  }, [myUid]);

  useEffect(() => {
    if (!partnerUid) return;
    const unsub = chatService.streamUserOnline(partnerUid, setPartnerOnline);
    return () => unsub();
  }, [partnerUid]);

  // Stream chat meta (request status, typing, super flag)
  useEffect(() => {
    if (!chatId || !myUid) return;
    const unsub = chatService.streamChat(chatId, myUid, (meta) => {
      setChatMeta(meta);
    });
    return () => unsub();
  }, [chatId, myUid]);

  // Stream messages
  useEffect(() => {
    if (!chatId) return;
    const unsub = chatService.streamMessages(chatId, (msgs) => {
      setMessages(msgs);
    });
    chatService.markAsRead(chatId, myUid);
    return () => unsub();
  }, [chatId, myUid]);

  // Stream partner typing status
  useEffect(() => {
    if (!chatId || !partnerUid) return;
    const unsub = chatService.streamTypingStatus(chatId, partnerUid, setPartnerTyping);
    return () => unsub();
  }, [chatId, partnerUid]);

  // Mark inbound messages as read once rendered
  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.isRead && msg.senderId !== myUid && !markedReadRef.current.has(msg.id)) {
        markedReadRef.current.add(msg.id);
        chatService.markMessageAsRead(chatId, msg.id);
      }
    });
  }, [messages, chatId, myUid]);

  // Gate composer on request status (derived, not state)
  const isRestricted =
    chatMeta && chatMeta.requestStatus !== 'accepted'
      ? chatMeta.requestStatus === 'declined' || chatMeta.requestStatus === 'pending'
      : false;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping, scrollToBottom]);

  // ── Credits gating (parity with Flutter: 10 sparks/message, free for premium)
  const consumeMessageCredits = async () => {
    if (userProfile?.isPremium) return true;
    const balance = Number(userProfile?.sparks ?? userProfile?.credits ?? 0);
    if (balance >= 10) {
      spendSparks(10);
      try {
        await chatService.chargeSparks(myUid, 10);
      } catch (e) {
        console.warn('Charge sparks failed:', e);
      }
      return true;
    }
    showToast('You need 10 sparks to send a message. Get more in the Sparks & VIP Store!', 'error');
    onUpgrade?.();
    return false;
  };

  const updateTypingStatus = (value) => {
    clearTimeout(typingTimerRef.current);
    if (value) {
      chatService.setTypingStatus(chatId, myUid, true);
      typingTimerRef.current = setTimeout(() => {
        chatService.setTypingStatus(chatId, myUid, false);
      }, 3000);
    } else {
      chatService.setTypingStatus(chatId, myUid, false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!chatId || !myUid || sending) return;

    if (editingMessage) {
      const text = inputText.trim();
      if (!text) return;
      setSending(true);
      await chatService.editMessage(chatId, editingMessage.id, text);
      setEditingMessage(null);
      setInputText('');
      setSending(false);
      scrollToBottom();
      return;
    }

    const text = inputText.trim();
    if (!text) return;
    if (isRestricted) return;
    if (!(await consumeMessageCredits())) return;

    setSending(true);
    const reply = replyingMessage;
    setInputText('');
    setShowEmojiPicker(false);
    setReplyingMessage(null);
    updateTypingStatus(false);

    try {
      await chatService.sendMessage(chatId, {
        senderId: myUid,
        receiverId: partnerUid || undefined,
        text,
        type: 'text',
        replyToId: reply?.id || null,
        replyToText: reply?.text || null,
        replyToSenderName: reply?.senderId === myUid ? 'You' : partnerName,
      });
    } catch (e) {
      showToast('Failed to send message: ' + e?.message, 'error');
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const handleSendSuper = async () => {
    if (!chatId || !myUid) return;
    const balance = Number(userProfile?.sparks ?? userProfile?.credits ?? 0);
    if (balance < 20) {
      showToast('You need 20 sparks to send a Super Request.', 'error');
      onUpgrade?.();
      setShowSuperConfirm(false);
      return;
    }
    const charged = await chatService.chargeSparks(myUid, 20);
    if (!charged) {
      showToast('Not enough sparks for a Super Request.', 'error');
      setShowSuperConfirm(false);
      return;
    }
    spendSparks(20);
    const text = inputText.trim() || 'Sent a Super Request! 🔥';
    setShowSuperConfirm(false);
    setInputText('');
    await chatService.sendSuperRequest({
      chatId,
      senderId: myUid,
      receiverId: partnerUid || undefined,
      text,
    });
    scrollToBottom();
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !chatId) return;
    (async () => {
      if (!(await consumeMessageCredits())) return;
      setSending(true);
      try {
        const mediaUrl = await chatService.uploadFile({
          file,
          fileType: 'images',
          chatId,
          userId: myUid,
        });
        await chatService.sendMessage(chatId, {
          senderId: myUid,
          receiverId: partnerUid || undefined,
          text: '',
          type: 'image',
          messageType: 'image',
          mediaUrl,
        });
        scrollToBottom();
      } catch (err) {
        showToast('Image upload failed: ' + (err?.message || err), 'error');
      } finally {
        setSending(false);
      }
    })();
  };

  const handleSendGift = async (gift) => {
    setShowGiftModal(false);
    if (!myUid || !partnerUid) return;
    const balance = Number(userProfile?.sparks ?? userProfile?.credits ?? 0);
    if (balance < gift.cost) {
      showToast(`You need ${gift.cost} sparks to send ${gift.name}.`, 'error');
      onUpgrade?.();
      return;
    }
    try {
      await giftService.sendGift({
        senderId: myUid,
        senderName: userProfile?.displayName || 'Member',
        recipient: { uid: partnerUid, name: partnerName, avatar: partnerAvatar },
        gift,
      });
      spendSparks(gift.cost);
      showToast(`Sent ${gift.icon} ${gift.name}!`, 'success');
      scrollToBottom();
    } catch (err) {
      showToast('Failed to send gift: ' + (err?.message || err), 'error');
    }
  };

  const renderReplyContext = (msg) => {
    if (!msg.replyToId) return null;
    return (
      <div className="message-reply-context">
        <div className="reply-context-bar" />
        <div className="reply-context-body">
          <span>{msg.replyToSenderName || 'Member'}</span>
          <p>{msg.replyToText || '…'}</p>
        </div>
      </div>
    );
  };

  const renderBubble = (msg, isMe) => {
    if (msg.isDeleted) {
      return (
        <div className={`message-bubble deleted-bubble ${isMe ? 'mine-bubble' : 'their-bubble'}`}>
          <Info size={13} />
          <span className="deleted-label">This message was deleted</span>
        </div>
      );
    }

    if (msg.messageType === 'gift') {
      const giftIcon = msg.giftData?.icon || '🎁';
      return (
        <div className={`message-bubble gift-bubble ${isMe ? 'mine-bubble' : 'their-bubble'}`}>
          <div className="gift-bubble-icon">{giftIcon}</div>
          <div className="gift-bubble-details">
            <strong>{isMe ? 'You sent a gift' : 'Sent you a gift'}</strong>
            <span>{msg.giftData?.name || msg.giftType || 'Gift'}</span>
            {msg.giftValue ? <em>{msg.giftValue} ⚡</em> : null}
          </div>
        </div>
      );
    }

    if (msg.messageType === 'image' && msg.mediaUrl) {
      return (
        <div className={`message-bubble image-bubble ${isMe ? 'mine-bubble' : 'their-bubble'}`}>
          <img src={msg.mediaUrl} alt="Shared" />
          {msg.text ? <p>{msg.text}</p> : null}
        </div>
      );
    }

    const isSuper = msg.isSuperRequest;
    return (
      <div
        className={`message-bubble text-bubble ${isMe ? 'mine-bubble' : 'their-bubble'} ${isSuper ? 'super-request-bubble' : ''}`}
      >
        {renderReplyContext(msg)}
        <div className="bubble-text-row">
          {isSuper && (
            <span className="super-inline-tag">
              <Flame size={10} /> SUPER
            </span>
          )}
          <span className="bubble-text-content">
            {msg.text}
            {msg.isEdited ? <span className="edited-badge"> · edited</span> : null}
          </span>
        </div>
      </div>
    );
  };

  const renderActionsMenu = (msg, isMe) => {
    if (menuMsgId !== msg.id) return null;
    return (
      <div className="message-action-menu animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => {
            setReplyingMessage(msg);
            setEditingMessage(null);
            setMenuMsgId(null);
          }}
        >
          <Reply size={13} /> Reply
        </button>
        {isMe && msg.messageType === 'text' && !msg.isDeleted && (
          <button
            type="button"
            onClick={() => {
              setEditingMessage(msg);
              setInputText(msg.text);
              setMenuMsgId(null);
            }}
          >
            <Pencil size={13} /> Edit
          </button>
        )}
        {isMe && !msg.isDeleted && (
          <button
            type="button"
            className="danger"
            onClick={() => {
              chatService.deleteMessage(chatId, msg.id);
              setMenuMsgId(null);
            }}
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
    );
  };

  const renderRequestCard = () => {
    const isSender = chatMeta?.requestSenderId === myUid;
    if (chatMeta?.requestStatus === 'declined') {
      return (
        <div className="chat-request-banner declined">
          <ShieldAlert size={16} />
          <span>Request declined by {partnerName}.</span>
        </div>
      );
    }
    if (chatMeta?.requestStatus === 'pending' && isSender) {
      return (
        <div className="chat-request-banner waiting">
          <Info size={16} />
          <span>Waiting for {partnerName} to reply…</span>
        </div>
      );
    }
    if (chatMeta?.requestStatus === 'pending' && !isSender) {
      return (
        <div className="chat-request-card">
          <div className="request-card-icon">
            <MessageCircleIcon />
          </div>
          <strong>{partnerName} wants to start chatting</strong>
          <p>Accept to start a conversation together.</p>
          <div className="request-card-actions">
            <button
              type="button"
              className="btn-ghost-danger"
              onClick={() => chatService.declineRequest(chatId)}
            >
              Decline
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => chatService.acceptRequest(chatId)}
            >
              Accept
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show loading state until chat id is resolved
  if (!chatId) {
    return (
      <div className="chat-window-container animate-fade-in chat-window-loading">
        <div className="pulse-loader" />
        <p>Opening conversation…</p>
      </div>
    );
  }

  return (
    <div className="chat-window-container animate-fade-in">
      {/* Chat Top Bar */}
      <div className="chat-window-header">
        <div className="chat-header-left">
          <button type="button" className="btn-icon" onClick={onBack} title="Back to messages">
            <ArrowLeft size={18} />
          </button>
          <div className="chat-header-user">
            <img src={partnerAvatar} alt={partnerName} />
            <div>
              <h3 className="partner-title">{partnerName}</h3>
              <span className={`partner-status ${partnerOnline ? 'online' : 'offline'}`}>
                {partnerTyping ? (
                  <span className="typing-label">
                    Typing… <span className="typing-dots"><i /><i /><i /></span>
                  </span>
                ) : partnerOnline ? (
                  'Active now'
                ) : (
                  'Offline'
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="chat-header-actions">
          <button type="button" className="btn-icon header-emoji-btn" onClick={() => setShowSuperConfirm(true)} title="Send Super Request">
            <Flame size={18} color="#F59E0B" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="messages-stream" onClick={() => menuMsgId && setMenuMsgId(null)}>
        <div className="chat-start-notice">
          <img src={partnerAvatar} alt={partnerName} />
          <p>You matched with <strong>{partnerName}</strong>!</p>
          <span>Send a cheerful message to break the ice.</span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId === myUid;
          const prev = messages[index - 1];
          const showDivider =
            !prev ||
            toDate(msg.timestamp)?.toDateString() !== toDate(prev.timestamp)?.toDateString();

          return (
            <React.Fragment key={msg.id || index}>
              {showDivider && (
                <div className="message-date-divider">
                  <span>{formatDateDivider(msg.timestamp)}</span>
                </div>
              )}
              <div className={`message-row ${isMe ? 'mine' : 'theirs'} ${msg.isSuperRequest ? 'super-row' : ''}`}>
                {!isMe && (
                  <img src={partnerAvatar} alt={partnerName} className="message-avatar" />
                )}
                <div className="message-bubble-wrap" onClick={(e) => e.stopPropagation()}>
                  {renderBubble(msg, isMe)}
                  {renderActionsMenu(msg, isMe)}
                  <div className="message-meta">
                    <span>{formatClockTime(msg.timestamp)}</span>
                    {isMe && (
                      <span className="message-ticks">
                        <CheckCheck size={12} className={msg.isRead ? 'read' : ''} />
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="message-actions-btn"
                    title="Message actions"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuMsgId(menuMsgId === msg.id ? null : msg.id);
                    }}
                  >
                    <span>⋯</span>
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {partnerTyping && (
          <div className="message-row theirs">
            <img src={partnerAvatar} alt={partnerName} className="message-avatar typing-avatar" />
            <div className="typing-bubble">
              <span className="typing-dots"><i /><i /><i /></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recovery / Request / Reply / Emoji / Composer */}
      {renderRequestCard()}

      {replyingMessage && (
        <div className="reply-preview-bar">
          <div className="reply-preview-accent" />
          <div className="reply-preview-body">
            <span>Replying to {replyingMessage.senderId === myUid ? 'yourself' : partnerName}</span>
            <p>{replyingMessage.text}</p>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setReplyingMessage(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="reply-preview-bar editing">
          <div className="reply-preview-body">
            <span>Editing message</span>
            <p>{editingMessage.text}</p>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={() => {
              setEditingMessage(null);
              setInputText('');
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="emoji-picker">
          {EMOJI_LIST.map((em) => (
            <button
              key={em}
              type="button"
              className="emoji-item"
              onClick={() => setInputText((t) => t + em)}
            >
              {em}
            </button>
          ))}
        </div>
      )}

      <form className="chat-composer-bar" onSubmit={handleSend}>
        <div className="composer-actions-left">
          {!isRestricted && (
            <>
              <button
                type="button"
                className="composer-action-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Send image" disabled={sending}
              >
                <ImageIcon size={18} />
              </button>
              <button
                type="button"
                className="composer-action-btn"
                onClick={() => setShowGiftModal(true)}
                title="Send Gift"
              >
                <Gift size={18} />
              </button>
              <button
                type="button"
                className="composer-action-btn"
                onClick={() => setShowEmojiPicker((v) => !v)}
                title="Emoji"
              >
                <Smile size={18} />
              </button>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePickImage}
        />

        <input
          type="text"
          placeholder={
            isRestricted
              ? chatMeta?.requestStatus === 'pending'
                ? 'Waiting for your match…'
                : 'Conversation request declined'
              : editingMessage
                ? 'Edit message…'
                : 'Type a message…'
          }
          value={inputText}
          disabled={isRestricted}
          onChange={(e) => {
            setInputText(e.target.value);
            updateTypingStatus(e.target.value.trim().length > 0);
          }}
          className="composer-input"
        />

        {!isRestricted && (
          <button
            type="button"
            className="composer-super-btn"
            title="Super Request (20 sparks)"
            onClick={() => setShowSuperConfirm(true)}
          >
            <Flame size={16} />
          </button>
        )}

        <button
          type="submit"
          className="composer-send-btn"
          disabled={!inputText.trim() || sending || isRestricted}
        >
          {editingMessage ? <Check size={16} /> : <Send size={16} />}
        </button>
      </form>

      {/* Modals */}
      {showGiftModal && (
        <GiftSelectorModal
          balance={Number(userProfile?.sparks ?? userProfile?.credits ?? 0)}
          onSelect={handleSendGift}
          onClose={() => setShowGiftModal(false)}
        />
      )}

      {showSuperConfirm && (
        <div className="modal-backdrop-fixed animate-fade-in" onClick={() => setShowSuperConfirm(false)}>
          <div className="gift-modal-card super-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="super-confirm-icon">
              <Flame size={28} />
            </div>
            <h3>Send Super Request</h3>
            <p>
              Move your message to the top of {partnerName}'s inbox with a glowing highlight.
            </p>
            <div className="super-cost-row">
              <span>Cost: 20 ⚡</span>
              <span>Balance: {userProfile?.sparks ?? userProfile?.credits ?? 0} ⚡</span>
            </div>
            <div className="delete-chat-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowSuperConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="btn-super" onClick={handleSendSuper}>
                Send Super 🔥
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageCircleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}