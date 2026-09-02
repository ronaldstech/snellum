import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Gift,
  Heart,
  MessageCircle,
  Sparkles,
  Camera,
} from 'lucide-react';
import GiftSelectorModal from '../chat/GiftSelectorModal';
import '../../styles/live.css';

export default function VideoCallModal({ partner, currentUser, userProfile, onEndCall }) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [activeGiftOverlay, setActiveGiftOverlay] = useState(null);

  const localVideoRef = useRef(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web camera stream initialization
  useEffect(() => {
    let stream = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable in this environment:', err);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const sendHeartReaction = () => {
    const newHeart = { id: Date.now(), x: Math.random() * 80 + 10 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const handleSendGift = (gift) => {
    setShowGiftModal(false);
    setActiveGiftOverlay(gift);
    setTimeout(() => setActiveGiftOverlay(null), 3500);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="video-call-fullscreen animate-fade-in">
      {/* Remote Video / Partner View */}
      <div
        className="remote-video-container"
        style={{ backgroundImage: `url(${partner.photo})` }}
      >
        <div className="video-gradient-overlay" />

        {/* Top Information Bar */}
        <div className="call-top-bar">
          <div className="call-partner-badge">
            <img src={partner.photo} alt={partner.name} />
            <div>
              <h4>{partner.name}</h4>
              <span>{partner.location}</span>
            </div>
          </div>

          <div className="call-timer-pill">
            <span className="pulsing-red-dot" />
            <span>{formatTime(callDuration)}</span>
          </div>
        </div>

        {/* Floating Heart Reactions */}
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="floating-heart"
            style={{ left: `${h.x}%` }}
          >
            ❤️
          </div>
        ))}

        {/* Gift Animation Overlay */}
        {activeGiftOverlay && (
          <div className="gift-received-splash animate-pop-in">
            <div className="gift-big-icon">{activeGiftOverlay.icon}</div>
            <h3>Sent {activeGiftOverlay.name}!</h3>
          </div>
        )}

        {/* Local Camera (PiP / Picture in Picture) */}
        <div className="local-pip-video">
          {videoEnabled ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="pip-stream" />
          ) : (
            <div className="pip-placeholder">
              <img src={userProfile?.avatar} alt="You" />
            </div>
          )}
          <span className="pip-label">You</span>
        </div>

        {/* Call Controls Bar */}
        <div className="call-controls-bar">
          <button
            type="button"
            className={`call-btn ${micEnabled ? '' : 'muted'}`}
            onClick={() => setMicEnabled(!micEnabled)}
            title="Mute / Unmute"
          >
            {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            type="button"
            className={`call-btn ${videoEnabled ? '' : 'muted'}`}
            onClick={() => setVideoEnabled(!videoEnabled)}
            title="Camera On / Off"
          >
            {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            type="button"
            className="call-btn btn-heart-react"
            onClick={sendHeartReaction}
            title="Send Heart"
          >
            <Heart size={20} fill="#EF4444" color="#EF4444" />
          </button>

          <button
            type="button"
            className="call-btn btn-gift-react"
            onClick={() => setShowGiftModal(true)}
            title="Send Gift"
          >
            <Gift size={20} color="#F59E0B" />
          </button>

          <button
            type="button"
            className="call-btn btn-end-call"
            onClick={onEndCall}
            title="End Video Date"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>

      {showGiftModal && (
        <GiftSelectorModal
          onSelect={handleSendGift}
          onClose={() => setShowGiftModal(false)}
        />
      )}
    </div>
  );
}
