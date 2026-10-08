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
  Crown,
  CheckCircle2,
  Gift,
  Share2,
  CreditCard,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import DatingEventsSection from '../events/DatingEventsSection';
import DatingTipsSection from '../blog/DatingTipsSection';
import PublicProfileModal from '../profile/PublicProfileModal';
import StripeCheckoutModal from '../premium/StripeCheckoutModal';
import ShareModal from '../common/ShareModal';
import { PUBLIC_PROFILES } from '../../data/publicProfilesData';
import { paymentService } from '../../services/paymentService';
import { shareService } from '../../services/shareService';
import '../../styles/landing.css';

export default function LandingPage() {
  const { setCurrentScreen, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileIndex, setProfileIndex] = useState(0);

  // Modals for deep linking and interactions
  const [selectedPublicProfile, setSelectedPublicProfile] = useState(null);
  const [selectedStripePlan, setSelectedStripePlan] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const activeHeroProfile = PUBLIC_PROFILES[profileIndex] || PUBLIC_PROFILES[0];
  const subscriptionPlans = paymentService.getSubscriptionPlans();
  const referralLink = shareService.getReferralLink(user);

  const handleNextHeroProfile = () => {
    setProfileIndex((prev) => (prev + 1) % PUBLIC_PROFILES.length);
  };

  const handleNavigate = (screen = 'signup') => {
    setMobileMenuOpen(false);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareReferral = async () => {
    const res = await shareService.shareContent({
      title: 'Join me on Snellum Dating',
      text: 'Join me on Snellum - The modern dating platform for meaningful connections. Claim 100 free Sparks on sign up:',
      url: referralLink,
    });
    if (!res.success || res.method === 'clipboard') {
      setShareModalOpen(true);
    }
  };

  return (
    <div className="landing-page-root">
      {/* 1. Header Navigation */}
      <header className="landing-header">
        <div className="landing-container">
          <nav className="landing-nav">
            <div
              className="landing-brand"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="brand-icon-wrap">
                <img
                  src="/newlogo.png"
                  alt="Snellum Logo"
                  onError={(e) => {
                    e.target.src = '/logo.png';
                  }}
                />
              </div>
              <span className="brand-name">Snellum</span>
            </div>

            <ul className="landing-nav-links">
              <li><a href="#about">About</a></li>
              <li><a href="#profiles">Singles</a></li>
              <li><a href="#events">Singles Events</a></li>
              <li><a href="#blog">Dating Tips</a></li>
              <li><a href="#pricing">VIP Pricing</a></li>
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
            <a href="#profiles" onClick={() => setMobileMenuOpen(false)}>Singles</a>
            <a href="#events" onClick={() => setMobileMenuOpen(false)}>Singles Events</a>
            <a href="#blog" onClick={() => setMobileMenuOpen(false)}>Dating Tips</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>VIP Pricing</a>
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
                <span>Meaningful Dating in Malawi</span>
              </div>

              <h1 className="hero-title">
                Find people who <span className="hero-title-highlight">actually match</span> your vibe.
              </h1>

              <p className="hero-subtitle">
                Snellum is built for people who want genuine relationships, verified profiles,
                curated speed dating mixers, and direct conversations without the noise.
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
                  <span className="stat-number">Save 30%</span>
                  <span className="stat-label">Direct Web Rates</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">Singles Mixers</span>
                  <span className="stat-label">Real-World Events</span>
                </div>
              </div>
            </div>

            {/* Profile Card Preview */}
            <div className="hero-card-container">
              <div
                className="clean-dating-card"
                onClick={() => setSelectedPublicProfile(activeHeroProfile)}
                title="Click to view full public profile"
              >
                <div className="card-image-box">
                  <img src={activeHeroProfile.photos[0]} alt={activeHeroProfile.name} />
                  <div className="card-overlay-gradient" />

                  <div className="card-verified-badge">
                    <ShieldCheck size={14} color="#3B82F6" />
                    <span>Verified Profile</span>
                  </div>

                  <div className="card-details-content">
                    <div className="card-title-line">
                      {activeHeroProfile.name}, {activeHeroProfile.age}
                    </div>
                    <div className="card-sub-line">
                      <MapPin size={14} />
                      <span>{activeHeroProfile.location}</span>
                    </div>
                    <div className="card-interests-tags">
                      {activeHeroProfile.tags.map((tag, idx) => (
                        <span key={idx} className="interest-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-buttons-bar">
                  <button
                    type="button"
                    className="action-btn-circle btn-pass"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextHeroProfile();
                    }}
                    title="Next Profile"
                  >
                    <X size={20} />
                  </button>
                  <button
                    type="button"
                    className="action-btn-circle btn-superlike"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPublicProfile(activeHeroProfile);
                    }}
                    title="View Profile Details"
                  >
                    <Star size={18} />
                  </button>
                  <button
                    type="button"
                    className="action-btn-circle btn-like"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate('signup');
                    }}
                    title="Connect Free"
                  >
                    <Heart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Discoverable Public Profiles Section */}
      <section className="landing-section" id="profiles">
        <div className="landing-container">
          <div className="section-head">
            <span className="section-tag">Public Profiles</span>
            <h2 className="section-heading">Meet Verified Singles in Malawi</h2>
            <p className="section-subtext">
              Real people, genuine ambitions, and verified selfies. Browse public preview profiles or
              create your own in under 2 minutes.
            </p>
          </div>

          <div className="public-profiles-grid">
            {PUBLIC_PROFILES.map((p) => (
              <div
                key={p.slug}
                className="public-single-card"
                onClick={() => setSelectedPublicProfile(p)}
              >
                <div className="public-single-thumb">
                  <img src={p.photos[0]} alt={p.name} loading="lazy" />
                  <div className="public-thumb-overlay">
                    <span className="location-pill">
                      <MapPin size={11} /> {p.city}
                    </span>
                  </div>
                </div>
                <div className="public-single-info">
                  <div className="public-single-header">
                    <h4>{p.name}, {p.age}</h4>
                    <ShieldCheck size={16} color="#FF4D85" />
                  </div>
                  <span className="occupation-text">{p.occupation}</span>
                  <p className="bio-snippet">{p.bio}</p>
                  <div className="public-tags-row">
                    {p.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="small-tag">{t}</span>
                    ))}
                  </div>
                  <div className="public-card-action">
                    <button type="button" className="btn-view-profile">
                      View Profile & Connect <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Search-Indexed Singles Events & Mixers */}
      <DatingEventsSection onNavigateAuth={handleNavigate} />

      {/* 5. Dating Tips & Advice Blog */}
      <DatingTipsSection onNavigateAuth={handleNavigate} />

      {/* 6. Direct Web Pricing Section (Stripe 30% Savings) */}
      <section className="landing-section" id="pricing">
        <div className="landing-container">
          <div className="section-head">
            <div className="section-kicker">
              <CreditCard size={14} color="#10B981" />
              <span>Direct Web Monetization • Stripe Integration</span>
            </div>
            <h2 className="section-heading">Direct Web VIP Rates (Save 30%)</h2>
            <p className="section-subtext">
              By purchasing your VIP membership directly on our secure web platform, you bypass the
              30% Apple & Google in-app fees. Enjoy instant activation, Apple Pay, Google Pay, and cards!
            </p>
          </div>

          <div className="landing-pricing-grid">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`landing-pricing-card ${plan.popular ? 'popular' : ''}`}
              >
                {plan.popular && <span className="popular-badge">Most Popular</span>}
                <div className="pricing-header">
                  <h3>{plan.name}</h3>
                  <div className="pricing-rates">
                    <strong className="rate-amount">{plan.usdMonthlyPrice}</strong>
                    <span className="rate-period">/month</span>
                  </div>
                  <div className="mwk-sub-rate">
                    <span>{plan.monthlyPrice}</span>
                    <span className="save-badge">Save 30% on Web</span>
                  </div>
                  <div className="app-store-comparison">
                    <span>App Store Price: <s>{plan.appStoreMonthlyPrice}</s></span>
                  </div>
                </div>

                <ul className="pricing-features">
                  {plan.features.map((feat, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={14} color="#10B981" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`btn-pricing-cta ${plan.popular ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setSelectedStripePlan(plan)}
                >
                  <CreditCard size={15} />
                  <span>Subscribe via Stripe</span>
                </button>
              </div>
            ))}
          </div>

          <div className="payment-security-callout">
            <div className="security-badges">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span> Apple Pay Ready</span>
              <span>GPay Google Pay</span>
              <span>💳 Visa / Mastercard / Amex</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Referral Rewards Banner */}
      <section className="landing-referral-banner">
        <div className="landing-container">
          <div className="referral-box-content">
            <div className="referral-text-col">
              <div className="referral-pill">
                <Gift size={14} color="#F59E0B" />
                <span>Referral Program</span>
              </div>
              <h2>Give 100 Sparks, Get 100 Sparks</h2>
              <p>
                Love Snellum? Share your unique referral link with friends. Whenever a friend joins
                and verifies their profile, both of you receive 100 free Sparks instantly!
              </p>
            </div>
            <div className="referral-action-col">
              <button
                type="button"
                className="btn-share-referral"
                onClick={handleShareReferral}
              >
                <Share2 size={16} />
                <span>Share Invite Link</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action */}
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

      {/* 9. Clean Minimal Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top">
            <div
              className="landing-brand"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="brand-icon-wrap">
                <img
                  src="/newlogo.png"
                  alt="Snellum Logo"
                  onError={(e) => {
                    e.target.src = '/logo.png';
                  }}
                />
              </div>
              <span className="brand-name">Snellum</span>
            </div>

            <nav className="footer-nav">
              <a href="#about">About</a>
              <a href="#profiles">Singles</a>
              <a href="#events">Singles Events</a>
              <a href="#blog">Dating Tips</a>
              <a href="#pricing">VIP Pricing</a>
              <a onClick={() => handleNavigate('signin')}>Sign In</a>
              <a onClick={() => handleNavigate('signup')}>Create Account</a>
            </nav>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Snellum Dating Malawi. All rights reserved.</span>
            <span>Direct Web Payments Powered by Stripe. Bypassing in-app store commissions.</span>
          </div>
        </div>
      </footer>

      {/* Public Profile Modal */}
      <PublicProfileModal
        isOpen={!!selectedPublicProfile}
        onClose={() => setSelectedPublicProfile(null)}
        profile={selectedPublicProfile}
        onJoinAction={handleNavigate}
        isAuthenticated={!!user}
      />

      {/* Stripe Direct Web Checkout Modal */}
      <StripeCheckoutModal
        isOpen={!!selectedStripePlan}
        onClose={() => setSelectedStripePlan(null)}
        itemType="subscription"
        itemData={selectedStripePlan}
        billingCycle="monthly"
      />

      {/* Social & Referral Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Invite Friends to Snellum"
        text="Join me on Snellum - The modern dating platform for meaningful connections. Claim 100 free Sparks on sign up:"
        url={referralLink}
        isReferral={true}
        referralCode={shareService.getUserReferralCode(user)}
      />
    </div>
  );
}
