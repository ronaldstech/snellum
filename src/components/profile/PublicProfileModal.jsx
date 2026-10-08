import React, { useState, useEffect } from 'react';
import {
  X,
  BadgeCheck,
  MapPin,
  Briefcase,
  Heart,
  Share2,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Quote,
} from 'lucide-react';
import { shareService } from '../../services/shareService';
import { updateSeoMeta } from '../../utils/seo';
import ShareModal from '../common/ShareModal';
import '../../styles/publicProfile.css';

export default function PublicProfileModal({
  isOpen,
  onClose,
  profile,
  onJoinAction,
  isAuthenticated = false,
  onLikeAction,
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      updateSeoMeta({
        title: `${profile.name}, ${profile.age} in ${profile.city} - Snellum Public Profile`,
        description: `${profile.bio.substring(0, 150)}... Meet verified singles on Snellum.`,
        image: profile.photos[0],
        type: 'profile',
        url: shareService.getProfileShareLink(profile.slug),
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profile.name,
          jobTitle: profile.occupation,
          address: {
            '@type': 'PostalAddress',
            addressLocality: profile.city,
            addressCountry: 'MW',
          },
          image: profile.photos[0],
          description: profile.bio,
        },
      });
    }
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const profileShareLink = shareService.getProfileShareLink(profile.slug);

  const handleShare = async () => {
    const res = await shareService.shareContent({
      title: `${profile.name} on Snellum Dating`,
      text: `Check out ${profile.name}'s profile on Snellum! 🔥 Meet verified singles in Malawi:`,
      url: profileShareLink,
    });
    if (!res.success || res.method === 'clipboard') {
      setShareOpen(true);
    }
  };

  return (
    <>
      <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
        <div className="public-profile-card" onClick={(e) => e.stopPropagation()}>
          {/* Top Actions Floating */}
          <div className="profile-floating-actions">
            <button
              type="button"
              className="btn-profile-share-icon"
              onClick={handleShare}
              title="Share Profile"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
            <button
              type="button"
              className="btn-icon profile-close"
              onClick={onClose}
              aria-label="Close Profile"
            >
              <X size={18} />
            </button>
          </div>

          {/* Photo Gallery with Indicator Dots */}
          <div className="profile-gallery-container">
            <img
              src={profile.photos[activePhotoIdx] || profile.photos[0]}
              alt={profile.name}
              className="gallery-main-photo"
            />
            {profile.photos.length > 1 && (
              <div className="gallery-dots">
                {profile.photos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`gallery-dot ${activePhotoIdx === idx ? 'active' : ''}`}
                    onClick={() => setActivePhotoIdx(idx)}
                    aria-label={`Photo ${idx + 1}`}
                  />
                ))}
              </div>
            )}
            <div className="gallery-overlay-badge">
              <span className="spark-cost-tag">
                <Sparkles size={11} color="#F59E0B" /> Verified Public Profile
              </span>
            </div>
          </div>

          {/* Profile Details Body */}
          <div className="profile-details-body">
            <div className="profile-header-meta">
              <div className="name-age-row">
                <h2>
                  {profile.name}, {profile.age}
                </h2>
                {profile.verified && (
                  <BadgeCheck size={20} color="#FF4D85" className="verified-badge" />
                )}
              </div>
              <div className="location-job-row">
                <div className="meta-item">
                  <MapPin size={13} color="var(--primary)" />
                  <span>{profile.location}</span>
                </div>
                <div className="meta-item">
                  <Briefcase size={13} color="var(--text-muted)" />
                  <span>{profile.occupation}</span>
                </div>
              </div>
            </div>

            {/* Quote / Hook */}
            {profile.quote && (
              <div className="profile-quote-card">
                <Quote size={16} color="var(--primary)" />
                <p>{profile.quote}</p>
              </div>
            )}

            {/* About / Bio */}
            <div className="profile-section">
              <h4>About Me</h4>
              <p className="profile-bio-text">{profile.bio}</p>
            </div>

            {/* Tags / Passions */}
            <div className="profile-section">
              <h4>Passions & Lifestyle</h4>
              <div className="tags-container">
                {profile.tags?.map((t, idx) => (
                  <span key={idx} className="profile-pill-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* What I'm Looking For */}
            {profile.lookingFor && (
              <div className="profile-section looking-for-box">
                <h4>Looking For</h4>
                <p>{profile.lookingFor}</p>
              </div>
            )}

            {/* Bottom Call to Action */}
            <div className="public-profile-footer">
              {isAuthenticated ? (
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => {
                    onClose();
                    if (onLikeAction) onLikeAction(profile);
                  }}
                >
                  <Heart size={16} />
                  <span>Send {profile.name} a Like</span>
                </button>
              ) : (
                <div className="public-cta-group">
                  <div className="cta-prompt-text">
                    <strong>Want to chat with {profile.name.split(' ')[0]}?</strong>
                    <span>Create a free verified profile in under 1 minute</span>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      onClose();
                      if (onJoinAction) onJoinAction('signup');
                    }}
                  >
                    <span>Join Free & Connect</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${profile.name}'s Profile`}
        text={`Check out ${profile.name}'s profile on Snellum Dating:`}
        url={profileShareLink}
      />
    </>
  );
}
