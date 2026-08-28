import React from 'react';
import { Heart, Sparkles, ShieldCheck, MapPin, Flame } from 'lucide-react';

const FEATURED_PROFILES = [
  {
    name: 'Tamara, 23',
    location: 'Lilongwe, MW',
    match: '98% Match',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    tags: ['Photography', 'Coffee Lover', 'Music'],
  },
  {
    name: 'Chikondi, 25',
    location: 'Blantyre, MW',
    match: '95% Match',
    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
    tags: ['Travel', 'Fashion', 'Art'],
  },
  {
    name: 'Kondwani, 26',
    location: 'Mzuzu, MW',
    match: '92% Match',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    tags: ['Tech', 'Fitness', 'Foodie'],
  },
];

export default function AuthHeroVisual() {
  return (
    <div className="auth-showcase-panel">
      {/* Top Brand Tag */}
      <div className="showcase-header">
        <div className="brand-badge">
          <Sparkles size={14} /> Snellum Premium Dating
        </div>
      </div>

      {/* Middle Pitch & Interactive Floating Cards */}
      <div className="showcase-center">
        <h2 className="showcase-heading">
          Where Authentic <br /> Sparks Happen.
        </h2>
        <p className="showcase-subtitle">
          Experience meaningful dating designed around safety, verified profiles, and authentic connections across Malawi and beyond.
        </p>

        <div className="match-cards-deck">
          {FEATURED_PROFILES.map((profile, idx) => (
            <div key={idx} className={`floating-profile-card card-${idx + 1} animate-float`}>
              <div className="card-image-wrap">
                <img src={profile.img} alt={profile.name} />
                <div className="card-badge-match">
                  <Flame size={13} /> {profile.match}
                </div>
              </div>
              <div className="card-info">
                <div className="card-info-header">
                  <span className="card-name">
                    {profile.name} <ShieldCheck size={15} color="#10B981" />
                  </span>
                  <Heart size={16} color="var(--primary)" fill="var(--primary)" />
                </div>
                <div className="card-loc">
                  <MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  {profile.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Social Proof */}
      <div className="showcase-footer">
        <div className="active-members-count">
          <div className="avatar-stack">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80" alt="Member" />
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80" alt="Member" />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80" alt="Member" />
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80" alt="Member" />
          </div>
          <div className="members-text">
            <strong>24,000+ Verified Singles</strong>
            <div>Finding love & romance daily</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>100% Encrypted & Safe</span>
        </div>
      </div>
    </div>
  );
}
