import { useState } from 'react';
import {
  Heart,
  Flame,
  ShieldCheck,
  Star,
  ArrowRight,
  Menu,
  X,
  MapPin,
  Calendar,
  Lock,
  Compass,
  MessageCircle,
  Sparkles,
  Video,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import '../../styles/landing.css';

const DEMO_PROFILES = [
  {
    name: 'Tamara Banda',
    age: 24,
    location: 'Lilongwe, Area 43',
    occupation: 'Creative Designer',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80',
    tags: ['Art Lover', 'Coffee Walks', 'Photography'],
    bio: 'Looking for real conversations, good music, and spontaneous weekend coffee walks.',
  },
  {
    name: 'Chisomo Phiri',
    age: 26,
    location: 'Blantyre, Mandala',
    occupation: 'Architect & Tennis Enthusiast',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700&auto=format&fit=crop&q=80',
    tags: ['Fitness', 'Architecture', 'Cooking'],
    bio: 'Fan of live jazz sessions, exploring new places, and ambitious people.',
  },
  {
    name: 'Kondwani Moyo',
    age: 27,
    location: 'Zomba, Plateau View',
    occupation: 'Software Developer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&auto=format&fit=crop&q=80',
    tags: ['Hiking', 'Books', 'Technology'],
    bio: 'Up for weekend hikes, relaxed dinners, and sharing great conversations.',
  },
];

export default function LandingPage() {
  const { setCurrentScreen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileIndex, setProfileIndex] = useState(0);

  const activeProfile = DEMO_PROFILES[profileIndex];

  const handleNextProfile = () => {
    setProfileIndex((prev) => (prev + 1) % DEMO_PROFILES.length);
  };

  const handleNavigate = (screen = 'signup') => {
    setMobileMenuOpen(false);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-page-root">
      {/* 1. Header Navigation */}
      <header className="landing-header">
        <div className="landing-container">
          <nav className="landing-nav">
            <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="brand-icon-wrap">
                <img src="/newlogo.png" alt="Snellum Logo" onError={(e) => { e.target.src = '/logo.png'; }} />
              </div>
              <span className="brand-name">Snellum</span>
            </div>

            <ul className="landing-nav-links">
              <li><a href="#about">About</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#community">Community</a></li>
            </ul>

            <div className="landing-nav-actions">
              <ThemeToggle />
              <button
                type="button"
                className="btn-header-join"
                onClick={() => handleNavigate('signup')}
              >
                Get Started
              </button>
              <button
                type="button"
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-links">
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#community" onClick={() => setMobileMenuOpen(false)}>Community</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => handleNavigate('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => handleNavigate('signup')}
            >
              Create Free Account
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="landing-hero" id="about">
        <div className="landing-container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge-pill">
                <Sparkles size={14} />
                <span>Meaningful Dating Platform</span>
              </div>

              <h1 className="hero-title">
                Find people who <span className="hero-title-highlight">actually match</span> your vibe.
              </h1>

              <p className="hero-subtitle">
                Snellum is built for people who want genuine relationships, verified profiles,
                and simple conversations without the noise.
              </p>

              <div className="hero-cta-group">
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={() => handleNavigate('signup')}
                >
                  <Flame size={18} />
                  Get Started Free
                </button>
                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => handleNavigate('signin')}
                >
                  Sign In
                </button>
              </div>

              <div className="hero-stats-row">
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Verified Members</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">Safe & Private</span>
                  <span className="stat-label">Protected Profiles</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">Real People</span>
                  <span className="stat-label">Zero Bot Tolerance</span>
                </div>
              </div>
            </div>

            {/* Profile Card Preview */}
            <div className="hero-card-container">
              <div className="clean-dating-card">
                <div className="card-image-box">
                  <img src={activeProfile.image} alt={activeProfile.name} />
                  <div className="card-overlay-gradient" />

                  <div className="card-verified-badge">
                    <ShieldCheck size={14} color="#3B82F6" />
                    <span>Verified Profile</span>
                  </div>

                  <div className="card-details-content">
                    <div className="card-title-line">
                      {activeProfile.name}, {activeProfile.age}
                    </div>
                    <div className="card-sub-line">
                      <MapPin size={14} />
                      <span>{activeProfile.location}</span>
                    </div>
                    <div className="card-interests-tags">
                      {activeProfile.tags.map((tag, idx) => (
                        <span key={idx} className="interest-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-buttons-bar">
                  <button
                    type="button"
                    className="action-btn-circle btn-pass"
                    onClick={handleNextProfile}
                    title="Pass"
                  >
                    <X size={20} />
                  </button>
                  <button
                    type="button"
                    className="action-btn-circle btn-superlike"
                    onClick={handleNextProfile}
                    title="Super Like"
                  >
                    <Star size={18} />
                  </button>
                  <button
                    type="button"
                    className="action-btn-circle btn-like"
                    onClick={handleNextProfile}
                    title="Like"
                  >
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="section-head">
            <span className="section-tag">Features</span>
            <h2 className="section-heading">Designed for Genuine Connections</h2>
            <p className="section-subtext">
              Simple, reliable tools to help you meet people nearby safely and comfortably.
            </p>
          </div>

          <div className="features-grid">
            <div className="clean-feature-card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={22} />
              </div>
              <h3 className="feature-title">Verified Profiles</h3>
              <p className="feature-body">
                Photo verification helps ensure the person you are chatting with is real and authentic.
              </p>
            </div>

            <div className="clean-feature-card">
              <div className="feature-icon-wrapper">
                <Compass size={22} />
              </div>
              <h3 className="feature-title">Smart Proximity Discovery</h3>
              <p className="feature-body">
                Discover singles in your city or area with shared interests, hobbies, and lifestyles.
              </p>
            </div>

            <div className="clean-feature-card">
              <div className="feature-icon-wrapper">
                <MessageCircle size={22} />
              </div>
              <h3 className="feature-title">Real-Time Messaging</h3>
              <p className="feature-body">
                Connect instantly with matches through clean chat, photo sharing, and smooth voice messages.
              </p>
            </div>

            <div className="clean-feature-card">
              <div className="feature-icon-wrapper">
                <Video size={22} />
              </div>
              <h3 className="feature-title">Video & Audio Calls</h3>
              <p className="feature-body">
                Take conversations further with crystal-clear voice notes and face-to-face video calls, right inside the app.
              </p>
            </div>

            <div className="clean-feature-card">
              <div className="feature-icon-wrapper">
                <Calendar size={22} />
              </div>
              <h3 className="feature-title">Meetup Planner</h3>
              <p className="feature-body">
                Coordinate real-world public coffee dates and meetups directly with your matches.
              </p>
            </div>

            <div className="clean-feature-card">
              <div className="feature-icon-wrapper">
                <Lock size={22} />
              </div>
              <h3 className="feature-title">Privacy & Safety First</h3>
              <p className="feature-body">
                Your data is protected. You have full control over your profile visibility and active status.
              </p>
            </div>

            <div className="clean-feature-card">
              <div className="feature-icon-wrapper">
                <Sparkles size={22} />
              </div>
              <h3 className="feature-title">Intuitive Experience</h3>
              <p className="feature-body">
                Fast, responsive interface that feels natural on both mobile phones and desktops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="landing-section" id="how-it-works">
        <div className="landing-container">
          <div className="section-head">
            <span className="section-tag">How It Works</span>
            <h2 className="section-heading">Getting Started Is Simple</h2>
            <p className="section-subtext">
              Three straightforward steps to finding meaningful connections.
            </p>
          </div>

          <div className="steps-row">
            <div className="clean-step-card">
              <span className="step-badge">Step 1</span>
              <h3 className="step-title">Create Your Profile</h3>
              <p className="step-desc">
                Add your favorite photos, write a quick bio, and select your interests.
              </p>
            </div>

            <div className="clean-step-card">
              <span className="step-badge">Step 2</span>
              <h3 className="step-title">Discover Matches</h3>
              <p className="step-desc">
                Browse nearby members, like profiles that catch your interest, and see who likes you back.
              </p>
            </div>

            <div className="clean-step-card">
              <span className="step-badge">Step 3</span>
              <h3 className="step-title">Start the Conversation</h3>
              <p className="step-desc">
                Break the ice in chat and arrange a safe public coffee date when you're ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Community Stories */}
      <section className="landing-section" id="community">
        <div className="landing-container">
          <div className="section-head">
            <span className="section-tag">Community</span>
            <h2 className="section-heading">Real Stories From Members</h2>
            <p className="section-subtext">
              People who met someone special through Snellum.
            </p>
          </div>

          <div className="stories-grid">
            <div className="story-card">
              <p className="story-text">
                "What I appreciated most was how clear and straightforward the app is. No confusing gimmicks. We matched, started talking about music, and had our first coffee two days later."
              </p>
              <div className="story-author-bar">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                  alt="Brian & Maya"
                  className="story-avatar"
                />
                <div>
                  <div className="story-name">Brian & Maya</div>
                  <div className="story-loc">Lilongwe</div>
                </div>
              </div>
            </div>

            <div className="story-card">
              <p className="story-text">
                "Profile verification gave me peace of mind. Knowing that you're talking to a verified individual makes meeting up in person so much more comfortable."
              </p>
              <div className="story-author-bar">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Tadala M."
                  className="story-avatar"
                />
                <div>
                  <div className="story-name">Tadala M.</div>
                  <div className="story-loc">Blantyre</div>
                </div>
              </div>
            </div>

            <div className="story-card">
              <p className="story-text">
                "Clean design, quick load times, and easy chat. It simply works the way a modern dating application should work."
              </p>
              <div className="story-author-bar">
                <img
                  src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80"
                  alt="Alinafe P."
                  className="story-avatar"
                />
                <div>
                  <div className="story-name">Alinafe P.</div>
                  <div className="story-loc">Mzuzu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="cta-inner-box">
            <h2 className="cta-heading">Ready to Start Meeting People?</h2>
            <p className="cta-text">
              Create your account in under two minutes and discover genuine matches in your area.
            </p>
            <button
              type="button"
              className="btn-cta-submit"
              onClick={() => handleNavigate('signup')}
            >
              Join Snellum Free <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Clean Minimal Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top">
            <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="brand-icon-wrap">
                <img src="/newlogo.png" alt="Snellum Logo" onError={(e) => { e.target.src = '/logo.png'; }} />
              </div>
              <span className="brand-name">Snellum</span>
            </div>

            <nav className="footer-nav">
              <a href="#about">About</a>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#community">Community</a>
              <a onClick={() => handleNavigate('signin')}>Sign In</a>
              <a onClick={() => handleNavigate('signup')}>Create Account</a>
            </nav>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Snellum. All rights reserved.</span>
            <span>Crafted for genuine human connections.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
