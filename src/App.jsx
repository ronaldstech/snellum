import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import LandingPage from './components/landing/LandingPage';
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';
import PhoneAuthForm from './components/auth/PhoneAuthForm';
import EmailVerificationView from './components/auth/EmailVerificationView';
import ForgotPasswordModal from './components/auth/ForgotPasswordModal';
import MatchDashboardPreview from './components/showcase/MatchDashboardPreview';
import ThemeToggle from './components/common/ThemeToggle';
import PublicProfileModal from './components/profile/PublicProfileModal';
import EventDetailsModal from './components/events/EventDetailsModal';
import ArticleModal from './components/blog/ArticleModal';
import { PUBLIC_PROFILES } from './data/publicProfilesData';
import { DATING_EVENTS } from './data/eventsData';
import { DATING_TIPS } from './data/datingTipsData';
import { CheckCircle2, AlertCircle, Info, ArrowLeft, Gift } from 'lucide-react';
import './styles/auth.css';

export default function App() {
  const { currentScreen, setCurrentScreen, toastMessage, showToast, user } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Deep linking modal targets
  const [deepLinkProfile, setDeepLinkProfile] = useState(null);
  const [deepLinkEvent, setDeepLinkEvent] = useState(null);
  const [deepLinkArticle, setDeepLinkArticle] = useState(null);
  const [referralBonusCode, setReferralBonusCode] = useState(null);

  // Parse Deep Linking & Referral Parameters on Mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);

      // 1. Referral Link (?ref=CODE)
      const refCode = params.get('ref');
      if (refCode) {
        localStorage.setItem('snellum_ref_code', refCode);
        setReferralBonusCode(refCode);
        showToast(`🎁 Referral Code "${refCode}" applied! Enjoy 100 Bonus Sparks on signup.`, 'success');
      }

      // 2. Deep Linked Public Profile (?profile=SLUG_OR_ID)
      const profileParam = params.get('profile');
      if (profileParam) {
        const foundProfile = PUBLIC_PROFILES.find(
          (p) =>
            p.slug.toLowerCase() === profileParam.toLowerCase() ||
            p.uid.toLowerCase() === profileParam.toLowerCase()
        );
        if (foundProfile) {
          setDeepLinkProfile(foundProfile);
        }
      }

      // 3. Deep Linked Event (?event=SLUG_OR_ID)
      const eventParam = params.get('event');
      if (eventParam) {
        const foundEvent = DATING_EVENTS.find(
          (e) =>
            e.slug.toLowerCase() === eventParam.toLowerCase() ||
            e.id.toLowerCase() === eventParam.toLowerCase()
        );
        if (foundEvent) {
          setDeepLinkEvent(foundEvent);
        }
      }

      // 4. Deep Linked Blog / Dating Tip Article (?article=SLUG)
      const articleParam = params.get('article');
      if (articleParam) {
        const foundArticle = DATING_TIPS.find(
          (a) => a.slug.toLowerCase() === articleParam.toLowerCase()
        );
        if (foundArticle) {
          setDeepLinkArticle(foundArticle);
        }
      }
    } catch (e) {
      console.warn('Deep link parsing note:', e);
    }
  }, []);

  return (
    <>
      {/* 1. Authenticated User Dashboard */}
      {currentScreen === 'authenticated' && (
        <div className="app-viewport">
          <MatchDashboardPreview />
          {toastMessage && <ToastNotification toast={toastMessage} />}
        </div>
      )}

      {/* 2. Landing Page (Default screen when opening website) */}
      {currentScreen === 'landing' && (
        <div className="app-viewport">
          <LandingPage />
          {toastMessage && <ToastNotification toast={toastMessage} />}
        </div>
      )}

      {/* 3. Auth Screens (Sign In, Sign Up, Phone Auth, Email Verification) */}
      {currentScreen !== 'authenticated' && currentScreen !== 'landing' && (
        <div className="app-viewport">
          {/* Background ambient glow */}
          <div className="bg-ambient-glow" />

          {/* Top Floating Control Bar with Home Link & Theme Toggle */}
          <div className="auth-top-nav">
            <button
              type="button"
              className="btn-back-home"
              onClick={() => setCurrentScreen('landing')}
              title="Return to Landing Page"
            >
              <span className="back-home-arrow">
                <ArrowLeft size={14} />
              </span>
              <span>Back to Home</span>
            </button>
          </div>

          <div className="top-action-bar">
            <ThemeToggle />
          </div>

          <div className="auth-layout-container">
            <div className="auth-form-panel">
              {currentScreen === 'signin' && (
                <SignInForm onOpenForgotPassword={() => setForgotPasswordOpen(true)} />
              )}

              {currentScreen === 'signup' && <SignUpForm />}

              {currentScreen === 'phone_auth' && <PhoneAuthForm />}

              {currentScreen === 'verify_email' && <EmailVerificationView />}
            </div>
          </div>

          {/* Forgot Password Modal */}
          <ForgotPasswordModal
            isOpen={forgotPasswordOpen}
            onClose={() => setForgotPasswordOpen(false)}
          />

          {/* Global Toast Alerts */}
          {toastMessage && <ToastNotification toast={toastMessage} />}
        </div>
      )}

      {/* Global Deep-Linked Modals */}
      <PublicProfileModal
        isOpen={!!deepLinkProfile}
        onClose={() => setDeepLinkProfile(null)}
        profile={deepLinkProfile}
        onJoinAction={(screen) => setCurrentScreen(screen || 'signup')}
        isAuthenticated={!!user}
      />

      <EventDetailsModal
        isOpen={!!deepLinkEvent}
        onClose={() => setDeepLinkEvent(null)}
        event={deepLinkEvent}
      />

      <ArticleModal
        isOpen={!!deepLinkArticle}
        onClose={() => setDeepLinkArticle(null)}
        article={deepLinkArticle}
        onJoinAction={() => setCurrentScreen('signup')}
      />
    </>
  );
}

function ToastNotification({ toast }) {
  const icons = {
    success: <CheckCircle2 size={16} color="#10B981" />,
    error: <AlertCircle size={16} color="#EF4444" />,
    info: <Info size={16} color="var(--primary)" />,
  };

  return (
    <div className={`toast-notification ${toast.type}`}>
      {icons[toast.type] || icons.info}
      <span>{toast.message}</span>
    </div>
  );
}
