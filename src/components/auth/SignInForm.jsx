import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InputField from '../common/InputField';
import SocialButton from '../common/SocialButton';

export default function SignInForm({ onOpenForgotPassword }) {
  const { loginWithEmail, loginWithGoogle, setCurrentScreen, showToast } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      showToast(err.message || 'Failed to sign in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      showToast('Google sign-in cancelled or failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card animate-fade-in">
      <div className="auth-card-header">
        <div className="app-logo-wrap">
          <img src="/newlogo.png" alt="Snellum Logo" onError={(e) => { e.target.src = '/logo.png'; }} />
        </div>
        <h1 className="auth-card-title">Sign In</h1>
        <p className="auth-card-subtitle">Welcome back to Snellum</p>
      </div>

      <form onSubmit={handleSubmit}>
        <InputField
          id="signin-email"
          label="Email"
          type="email"
          icon={Mail}
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: null });
          }}
          error={errors.email}
          required
        />

        <InputField
          id="signin-password"
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: null });
          }}
          error={errors.password}
          required
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            fontSize: '12.5px',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            Remember me
          </label>

          <button
            type="button"
            onClick={onOpenForgotPassword}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '12.5px',
            }}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-divider">
        <div className="line" />
        <span className="text">or</span>
        <div className="line" />
      </div>

      <div className="social-auth-group">
        <SocialButton
          text="Continue with Google"
          imageSrc="/google_logo.png"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        />
        <SocialButton
          text="Continue with Phone"
          onClick={() => setCurrentScreen('phone_auth')}
          disabled={isLoading}
        />
      </div>

      <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => setCurrentScreen('signup')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
