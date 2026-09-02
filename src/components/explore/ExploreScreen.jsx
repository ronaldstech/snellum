import React, { useState } from 'react';
import {
  HeartHandshake,
  Heart,
  Flame,
  Coffee,
  Sparkles,
  Users,
  Compass,
  Smile,
  Globe,
  DollarSign,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import SwipeView from '../swipe/SwipeView';
import '../../styles/explore.css';

const EXPLORE_CATEGORIES = [
  {
    key: 'Marriage',
    title: 'Marriage & Serious',
    subtitle: 'Looking for a life partner and lasting love',
    icon: HeartHandshake,
    gradient: 'linear-gradient(135deg, #FF4B72, #FF8E53)',
    photo: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&auto=format&fit=crop&q=80',
  },
  {
    key: 'Long Term Relationship',
    title: 'Long Term Love',
    subtitle: 'Deep emotional connection and romantic journey',
    icon: Heart,
    gradient: 'linear-gradient(135deg, #FF2E93, #FF8A00)',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  },
  {
    key: 'Coffee',
    title: 'Coffee & Chill',
    subtitle: 'Casual conversations over warm drinks',
    icon: Coffee,
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    photo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80',
  },
  {
    key: 'Hookups',
    title: 'Spontaneous Fun',
    subtitle: 'No strings attached, exciting chemistry',
    icon: Flame,
    gradient: 'linear-gradient(135deg, #EF4444, #F43F5E)',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
  },
  {
    key: 'New Friends',
    title: 'New Friends',
    subtitle: 'Expand your circle, find activity buddies',
    icon: Users,
    gradient: 'linear-gradient(135deg, #3B82F6, #2DD4BF)',
    photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&auto=format&fit=crop&q=80',
  },
  {
    key: 'Sponsor',
    title: 'Generous & Pamper',
    subtitle: 'Exclusive mentorship, luxury, and gifting',
    icon: DollarSign,
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  },
  {
    key: 'Learn Cultures',
    title: 'Global & Culture',
    subtitle: 'Meet singles from around the world',
    icon: Globe,
    gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  },
  {
    key: 'Figuring Out',
    title: 'Still Figuring It Out',
    subtitle: 'Open to anything nice, no pressure',
    icon: HelpCircle,
    gradient: 'linear-gradient(135deg, #6B7280, #9CA3AF)',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
  },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory) {
    return (
      <div className="explore-filtered-view animate-fade-in">
        <div className="explore-category-header">
          <button
            type="button"
            className="btn-icon back-btn"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3>{selectedCategory.title}</h3>
            <span>Filtered discovery deck</span>
          </div>
        </div>
        <div className="explore-swipe-deck">
          <SwipeView categoryFilter={selectedCategory.key} />
        </div>
      </div>
    );
  }

  return (
    <div className="explore-container animate-fade-in">
      <div className="explore-hero">
        <div className="explore-badge">
          <Compass size={14} /> Discovery Hub
        </div>
        <h2>What are you looking for today?</h2>
        <p>Pick a vibe to discover members who share your exact dating intention.</p>
      </div>

      <div className="explore-grid">
        {EXPLORE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.key}
              className="explore-card"
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%), url(${cat.photo})`,
              }}
            >
              <div className="explore-card-pill" style={{ background: cat.gradient }}>
                <Icon size={14} />
                <span>{cat.key}</span>
              </div>

              <div className="explore-card-content">
                <h4>{cat.title}</h4>
                <p>{cat.subtitle}</p>
                <div className="explore-cta-link">
                  Explore <ArrowRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
