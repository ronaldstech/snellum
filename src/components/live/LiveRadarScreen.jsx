import React, { useState, useEffect } from 'react';
import {
  Video,
  Radio,
  Globe,
  Users,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import VideoCallModal from './VideoCallModal';
import '../../styles/live.css';

const MOCK_LIVE_CANDIDATES = [
  {
    uid: 'live-1',
    name: 'Vanessa',
    age: 24,
    location: 'Lilongwe, MW',
    interests: 'Music & Travel',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
  },
  {
    uid: 'live-2',
    name: 'Tamandani',
    age: 22,
    location: 'Blantyre, MW',
    interests: 'Coffee & Books',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  },
  {
    uid: 'live-3',
    name: 'Kondwani',
    age: 26,
    location: 'Zomba, MW',
    interests: 'Fitness & Tech',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  },
];

export default function LiveRadarScreen({ currentUser, userProfile }) {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('Malawi');
  const [activeCallPartner, setActiveCallPartner] = useState(null);
  const [foundMatch, setFoundMatch] = useState(null);

  const startRadarMatch = () => {
    setIsSearching(true);
    setFoundMatch(null);

    // Simulate search radar timer matching Flutter video_matchmaking_screen
    setTimeout(() => {
      const randomCandidate =
        MOCK_LIVE_CANDIDATES[Math.floor(Math.random() * MOCK_LIVE_CANDIDATES.length)];
      setFoundMatch(randomCandidate);
      setIsSearching(false);
    }, 3500);
  };

  return (
    <div className="live-radar-container animate-fade-in">
      {/* Radar Section */}
      <div className="radar-hero">
        <div className="radar-status-badge">
          <span className="pulsing-dot" />
          <span>142 Singles Live Online</span>
        </div>
        <h2>Speed Video Dating Radar</h2>
        <p>Connect face-to-face with live singles nearby through instant 3-minute video dates.</p>
      </div>

      {/* Radar Visual */}
      <div className="radar-visual-stage">
        <div className={`radar-scanner-circle ${isSearching ? 'active-pulse' : ''}`}>
          <div className="radar-ripple r1" />
          <div className="radar-ripple r2" />
          <div className="radar-ripple r3" />
          <div className="radar-sweep-beam" />

          <div className="radar-center-avatar">
            <img
              src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="You"
            />
          </div>

          {/* Floating radar blips */}
          <div className="radar-blip blip-1">
            <img src={MOCK_LIVE_CANDIDATES[0].photo} alt="candidate" />
          </div>
          <div className="radar-blip blip-2">
            <img src={MOCK_LIVE_CANDIDATES[1].photo} alt="candidate" />
          </div>
          <div className="radar-blip blip-3">
            <img src={MOCK_LIVE_CANDIDATES[2].photo} alt="candidate" />
          </div>
        </div>

        {/* Action Button */}
        {!isSearching && !foundMatch && (
          <button type="button" className="btn-start-radar" onClick={startRadarMatch}>
            <Zap size={20} />
            <span>Start Live Matchmaking</span>
          </button>
        )}

        {isSearching && (
          <div className="radar-searching-banner">
            <div className="pulse-spinner" />
            <span>Scanning for live video partners...</span>
          </div>
        )}

        {/* Found match preview card */}
        {foundMatch && !isSearching && (
          <div className="found-match-card animate-pop-in">
            <img src={foundMatch.photo} alt={foundMatch.name} />
            <div className="found-match-info">
              <span className="live-pill">Live Now</span>
              <h4>{foundMatch.name}, {foundMatch.age}</h4>
              <p>{foundMatch.location}</p>
              <div className="found-match-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setActiveCallPartner(foundMatch)}
                >
                  <Video size={16} /> Accept Video Call
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={startRadarMatch}
                  title="Next"
                >
                  <RotateCcw size={16} /> Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Radar Filters Bar */}
      <div className="radar-filters-bar">
        <div className="filter-group">
          <label>
            <Users size={14} /> Looking for:
          </label>
          <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
            <option value="All">Everyone</option>
            <option value="Women">Women</option>
            <option value="Men">Men</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <Globe size={14} /> Region:
          </label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
            <option value="Malawi">Malawi (Local)</option>
            <option value="Global">Worldwide (Global)</option>
          </select>
        </div>
      </div>

      {/* Active Call Modal */}
      {activeCallPartner && (
        <VideoCallModal
          partner={activeCallPartner}
          currentUser={currentUser}
          userProfile={userProfile}
          onEndCall={() => {
            setActiveCallPartner(null);
            setFoundMatch(null);
          }}
        />
      )}
    </div>
  );
}
