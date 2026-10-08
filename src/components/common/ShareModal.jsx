import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  MessageSquare,
  Send,
  Mail,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { shareService } from '../../services/shareService';
import '../../styles/share.css';

function XTwitterIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function ShareModal({
  isOpen,
  onClose,
  title = 'Share Snellum',
  text = 'Join me on Snellum - The modern dating platform for meaningful connections.',
  url = window.location.href,
  isReferral = false,
  referralCode = null,
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const socialLinks = shareService.getSocialShareUrls({ title, text, url });

  const handleCopy = async () => {
    const success = await shareService.copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const res = await shareService.shareContent({ title, text, url });
    if (res.success && res.method === 'native') {
      onClose();
    }
  };

  // Generate simple QR code URL via open quickchart / qr server
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    url
  )}&bgcolor=13131c&color=ff4d85&margin=1`;

  return (
    <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="share-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <div className="share-title-group">
            <div className="share-header-icon">
              <Share2 size={20} color="var(--primary)" />
            </div>
            <div>
              <h3>{title}</h3>
              <span>Share directly via social apps or copy your personal link</span>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close share dialog">
            <X size={18} />
          </button>
        </div>

        {/* Referral Bonus Banner if applicable */}
        {isReferral && (
          <div className="referral-highlight-box">
            <Sparkles size={18} color="#F59E0B" />
            <div>
              <strong>Double Sparks Referral Program</strong>
              <p>Your friends get 100 free Sparks when they sign up with your code, and you get 100 Sparks!</p>
              {referralCode && (
                <div className="referral-code-pill">
                  Your Code: <span>{referralCode}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Link Copy Box */}
        <div className="share-link-box">
          <input
            type="text"
            readOnly
            value={url}
            className="share-link-input"
            onClick={(e) => e.target.select()}
          />
          <button
            type="button"
            className={`btn-copy-link ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={16} /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} /> Copy
              </>
            )}
          </button>
        </div>

        {/* Native Web Share Button (if supported) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button type="button" className="btn-native-share" onClick={handleNativeShare}>
            <Share2 size={16} />
            <span>Open Native Device Share Sheet</span>
          </button>
        )}

        {/* Social Share Grid */}
        <div className="social-share-grid">
          <a
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="social-share-item whatsapp"
          >
            <div className="social-icon-wrapper">
              <MessageSquare size={18} />
            </div>
            <span>WhatsApp</span>
          </a>

          <a
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="social-share-item twitter"
          >
            <div className="social-icon-wrapper">
              <XTwitterIcon size={16} />
            </div>
            <span>X / Twitter</span>
          </a>

          <a
            href={socialLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="social-share-item telegram"
          >
            <div className="social-icon-wrapper">
              <Send size={18} />
            </div>
            <span>Telegram</span>
          </a>

          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="social-share-item facebook"
          >
            <div className="social-icon-wrapper">
              <FacebookIcon size={18} />
            </div>
            <span>Facebook</span>
          </a>

          <a
            href={socialLinks.email}
            target="_blank"
            rel="noopener noreferrer"
            className="social-share-item email"
          >
            <div className="social-icon-wrapper">
              <Mail size={18} />
            </div>
            <span>Email</span>
          </a>

          <button
            type="button"
            className={`social-share-item qr-btn ${showQr ? 'active' : ''}`}
            onClick={() => setShowQr(!showQr)}
          >
            <div className="social-icon-wrapper">
              <QrCode size={18} />
            </div>
            <span>{showQr ? 'Hide QR' : 'QR Code'}</span>
          </button>
        </div>

        {/* Optional QR Code Drawer */}
        {showQr && (
          <div className="qr-preview-container animate-fade-in">
            <img src={qrUrl} alt="Scan QR Code to Open" className="qr-image" />
            <p>Scan with your phone camera to open on mobile</p>
          </div>
        )}
      </div>
    </div>
  );
}
