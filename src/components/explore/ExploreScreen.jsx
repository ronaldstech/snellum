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
  Calendar,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import SwipeView from '../swipe/SwipeView';
import '../../styles/explore.css';

const EXPLORE_CATEGORIES = [
  {
    key: 'Marriage',
    title: 'Marriage',
    subtitle: 'Lifelong commitment',
    icon: HeartHandshake,
    gradient: 'linear-gradient(135deg, #D4AF37, #E7C967)',
    photo: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80',
  },
  {
    key: 'Long Term Relationship',
    title: 'Long Term',
    subtitle: 'Serious partner',
    icon: Heart,
    gradient: 'linear-gradient(135deg, #FF4D85, #FF88AB)',
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80',
  },
  {
    key: 'Short Term Relationship',
    title: 'Short Term Relationship',
    subtitle: 'Something in between',
    icon: Calendar,
    gradient: 'linear-gradient(135deg, #FF9A8B, #FFB5AA)',
    photo: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=600&q=80',
  },
  {
    key: 'Hookups',
    title: 'Casual',
    subtitle: 'Casual & fun',
    icon: Flame,
    gradient: 'linear-gradient(135deg, #8E2DE2, #B968F3)',
    photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80',
  },
  {
    key: 'Short Term Fun',
    title: 'Short Term Fun',
    subtitle: 'No strings attached',
    icon: Smile,
    gradient: 'linear-gradient(135deg, #F2994A, #F6B979)',
    photo: 'https://images.unsplash.com/photo-1536697246787-1f7ae568d89a?w=600&q=80',
  },
  {
    key: 'New Friends',
    title: 'New Friends',
    subtitle: 'Platonic only',
    icon: Users,
    gradient: 'linear-gradient(135deg, #56CCF2, #8BDAF5)',
    photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  },
  {
    key: 'Coffee',
    title: 'Coffee Date',
    subtitle: 'Relaxed vibes',
    icon: Coffee,
    gradient: 'linear-gradient(135deg, #7B4F2E, #AA7956)',
    photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  },
  {
    key: 'Learn Cultures',
    title: 'Learn Cultures',
    subtitle: 'Explore the world',
    icon: Globe,
    gradient: 'linear-gradient(135deg, #EB5757, #F38585)',
    photo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  },
  {
    key: 'Sponsor',
    title: 'Travel the world',
    subtitle: "Let's explore together",
    icon: DollarSign,
    gradient: 'linear-gradient(135deg, #DAA520, #E7C65F)',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
  },
  {
    key: 'Figuring Out',
    title: 'Figuring Out',
    subtitle: 'Seeing where it goes',
    icon: HelpCircle,
    gradient: 'linear-gradient(135deg, #607D8B, #8EA1A9)',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
  },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <>
      {/* Desktop keeps filters and the discovery deck visible together. */}
      <div className="explore-desktop-workspace animate-fade-in">
        <aside className="explore-category-sidebar" aria-label="Discovery categories">
          <div className="explore-sidebar-intro">
            <div className="explore-badge">
              <Compass size={14} /> Discovery Hub
            </div>
            <h2>Find your vibe</h2>
            <p>Choose an intention to filter the members in your discovery deck.</p>
          </div>

          <div className="explore-category-list">
            {EXPLORE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory?.key === cat.key;

              return (
                <button
                  key={cat.key}
                  type="button"
                  className={`explore-category-option ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={isSelected}
                >
                  <span className="explore-category-option-icon" style={{ background: cat.gradient }}>
                    <Icon size={16} />
                  </span>
                  <span>
                    <strong>{cat.title}</strong>
                    <small>{cat.subtitle}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="explore-deck-panel" aria-live="polite">
          <div className="explore-deck-heading">
            <div>
              <span>Discover</span>
              <h3>{selectedCategory?.title || 'All members'}</h3>
            </div>
            {selectedCategory && (
              <button
                type="button"
                className="explore-clear-filter"
                onClick={() => setSelectedCategory(null)}
              >
                Show all
              </button>
            )}
          </div>
          <div className="explore-swipe-deck">
            <SwipeView categoryFilter={selectedCategory?.key} />
          </div>
        </section>
      </div>

      {/* Retain the compact category-first flow on phones. */}
      <div className="explore-mobile-view">
        {renderMobileExplore(selectedCategory, setSelectedCategory)}
      </div>
    </>
  );
}

function renderMobileExplore(selectedCategory, setSelectedCategory) {
  if (selectedCategory) {
    return (
      <div className="explore-filtered-view animate-fade-in">
        <div className="explore-category-header">
          <button
            type="button"
            className="explore-back-button"
            onClick={() => setSelectedCategory(null)}
            aria-label="Back to categories"
          >
            <ArrowLeft size={17} />
            <span>Categories</span>
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
