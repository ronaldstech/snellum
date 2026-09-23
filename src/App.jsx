import React, { useState } from 'react';
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
import { CheckCircle2, AlertCircle, Info, ArrowLeft } from 'lucide-react';
import './styles/auth.css';

export default function App() {
  const { currentScreen, setCurrentScreen, toastMessage } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // 1. Authenticated User Dashboard
  if (currentScreen === 'authenticated') {
    return (
      <div className="app-viewport">
        <MatchDashboardPreview />
        {toastMessage && <ToastNotification toast={toastMessage} />}
      </div>
    );
  }

  // 2. Landing Page (Default screen when opening website)
  if (currentScreen === 'landing') {
    return (
      <div className="app-viewport">
        <LandingPage />
        {toastMessage && <ToastNotification toast={toastMessage} />}
      </div>
    );
  }

  // 3. Auth Screens (Sign In, Sign Up, Phone Auth, Email Verification)
  return (
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
