import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InputField from '../common/InputField';
import PhoneInputField from '../common/PhoneInputField';
import SocialButton from '../common/SocialButton';
import { COUNTRY_CODES } from '../../constants/countryCodes';

export default function SignUpForm() {
  const { signUpWithEmail, loginWithGoogle, setCurrentScreen, showToast } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!email) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!phone) {
      errs.phone = 'Phone number is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!agreeTerms) {
      errs.terms = 'You must agree to the terms';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry.dial_code} ${phone}`;
      await signUpWithEmail({
        fullName,
        email,
        phone: fullPhoneNumber,
        password,
      });
    } catch (err) {
      showToast(err.message || 'Failed to create account', 'error');
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
        <h1 className="auth-card-title">Create Account</h1>
        <p className="auth-card-subtitle">Join Snellum dating community</p>
      </div>

      <form onSubmit={handleSubmit}>
        <InputField
          id="signup-name"
          label="Full Name"
          type="text"
          icon={User}
          placeholder="e.g. Maya Mwale"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors({ ...errors, fullName: null });
          }}
          error={errors.fullName}
          required
        />

        <InputField
          id="signup-email"
          label="Email"
          type="email"
          icon={Mail}
          placeholder="maya@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: null });
          }}
          error={errors.email}
          required
        />

        <PhoneInputField
          label="Phone Number"
          value={phone}
          onChange={(val) => {
            setPhone(val);
            if (errors.phone) setErrors({ ...errors, phone: null });
          }}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          error={errors.phone}
          required
        />

        <div style={{ marginBottom: '0.4rem' }}>
          <InputField
            id="signup-password"
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={errors.password}
            required
          />

          {password && (
            <div style={{ marginTop: '-0.3rem', marginBottom: '0.75rem' }}>
              <div className="strength-bar-wrap">
                <div className={`strength-segment ${strength >= 1 ? (strength <= 1 ? 'active-weak' : strength <= 2 ? 'active-medium' : 'active-strong') : ''}`} />
                <div className={`strength-segment ${strength >= 2 ? (strength <= 2 ? 'active-medium' : 'active-strong') : ''}`} />
                <div className={`strength-segment ${strength >= 3 ? 'active-strong' : ''}`} />
                <div className={`strength-segment ${strength >= 4 ? 'active-strong' : ''}`} />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.terms) setErrors({ ...errors, terms: null });
              }}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span>
              I agree to <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms</span> & <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</span>
            </span>
          </label>
          {errors.terms && <span className="error-text">{errors.terms}</span>}
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
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
          onClick={loginWithGoogle}
          disabled={isLoading}
        />
      </div>

      <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setCurrentScreen('signin')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
