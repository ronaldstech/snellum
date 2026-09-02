import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Gift,
  Coffee,
  Image,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Calendar,
  MapPin,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import GiftSelectorModal from './GiftSelectorModal';
import MeetupProposalModal from './MeetupProposalModal';
import '../../styles/chat.css';

export default function ChatWindow({
  chat,
  currentUser,
  userProfile,
  onBack,
  onStartVideoCall,
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const messagesEndRef = useRef(null);

  const partner =
    Object.values(chat.participantDetails || {}).find((p) => p.name !== 'You') || {
      name: 'Match',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };

  // Listen to messages
  useEffect(() => {
    if (!chat.id) return;
    const unsub = chatService.streamMessages(chat.id, (msgs) => {
      setMessages(msgs);
    });
    chatService.markAsRead(chat.id, currentUser.uid);
    return () => unsub();
  }, [chat.id, currentUser.uid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    await chatService.sendMessage(chat.id, {
      senderId: currentUser.uid,
      text,
      type: 'text',
    });
  };

  const handleSendGift = async (gift) => {
    setShowGiftModal(false);
    await chatService.sendMessage(chat.id, {
      senderId: currentUser.uid,
      text: `Sent ${gift.name} ${gift.icon}`,
      type: 'gift',
      giftData: gift,
    });
  };

  const handleSendMeetup = async (meetup) => {
    setShowMeetupModal(false);
    await chatService.sendMessage(chat.id, {
      senderId: currentUser.uid,
      text: `Proposed a date at ${meetup.location}`,
      type: 'meetup',
      meetupData: meetup,
    });
  };

  return (
    <div className="chat-window-container animate-fade-in">
      {/* Chat Top Bar */}
      <div className="chat-window-header">
        <div className="chat-header-left">
          <button type="button" className="btn-icon" onClick={onBack} title="Back to messages">
            <ArrowLeft size={18} />
          </button>
          <div className="chat-header-user">
            <img src={partner.avatar} alt={partner.name} />
            <div>
              <h3 className="partner-title">{partner.name}</h3>
              <span className="partner-status">Active now</span>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className="btn-icon header-action-btn"
            onClick={() => onStartVideoCall && onStartVideoCall(partner)}
            title="Start Video Call"
          >
            <Video size={18} />
          </button>
          <button
            type="button"
            className="btn-icon header-action-btn"
            onClick={() => setShowMeetupModal(true)}
            title="Propose Meetup"
          >
            <Coffee size={18} />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="messages-stream">
        <div className="chat-start-notice">
          <img src={partner.avatar} alt={partner.name} />
          <p>You matched with <strong>{partner.name}</strong>!</p>
          <span>Send a cheerful message or propose a coffee date.</span>
        </div>

        {messages.map((msg, index) => {
          const isMine = msg.senderId === currentUser.uid;

          if (msg.type === 'gift') {
            return (
              <div key={msg.id || index} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                <div className="message-bubble gift-bubble">
                  <div className="gift-bubble-icon">{msg.giftData?.icon || '🎁'}</div>
                  <div className="gift-bubble-details">
                    <strong>{isMine ? 'You sent a gift' : 'Sent you a gift'}</strong>
                    <span>{msg.giftData?.name || 'Gift'}</span>
                  </div>
                </div>
              </div>
            );
          }

          if (msg.type === 'meetup') {
            return (
              <div key={msg.id || index} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                <div className="message-bubble meetup-bubble">
                  <div className="meetup-bubble-header">
                    <Coffee size={18} color="var(--primary)" />
                    <strong>Date Proposal</strong>
                  </div>
                  <p className="meetup-bubble-loc">
                    <MapPin size={14} /> {msg.meetupData?.location || 'Coffee Spot'}
                  </p>
                  <p className="meetup-bubble-time">
                    <Calendar size={14} /> {msg.meetupData?.dateTime || 'This Weekend'}
                  </p>
                  {msg.meetupData?.senderNote && (
                    <p className="meetup-bubble-note">"{msg.meetupData?.senderNote}"</p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id || index} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
              <div className="message-bubble text-bubble">
                <p>{msg.text}</p>
                <div className="message-meta">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMine && <CheckCheck size={12} className="check-icon" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form className="chat-composer-bar" onSubmit={handleSend}>
        <div className="composer-actions-left">
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
            onClick={() => setShowMeetupModal(true)}
            title="Schedule Meetup"
          >
            <Coffee size={18} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="composer-input"
        />

        <button type="submit" className="composer-send-btn" disabled={!inputText.trim()}>
          <Send size={16} />
        </button>
      </form>

      {/* Modals */}
      {showGiftModal && (
        <GiftSelectorModal
          onSelect={handleSendGift}
          onClose={() => setShowGiftModal(false)}
        />
      )}

      {showMeetupModal && (
        <MeetupProposalModal
          partner={partner}
          onSubmit={handleSendMeetup}
          onClose={() => setShowMeetupModal(false)}
        />
      )}
    </div>
  );
}
