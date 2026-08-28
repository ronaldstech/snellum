import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PhoneInputField from '../common/PhoneInputField';
import { COUNTRY_CODES } from '../../constants/countryCodes';

export default function PhoneAuthForm() {
  const { setCurrentScreen, loginWithPhoneOtp, showToast } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (isOtpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, resendTimer]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsOtpSent(true);
      setResendTimer(60);
      showToast(`Verification code sent to ${selectedCountry.dial_code} ${phone}`, 'success');
    }, 800);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredCode = otp.join('');
    if (enteredCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const fullPhone = `${selectedCountry.dial_code} ${phone}`;
      await loginWithPhoneOtp(fullPhone, enteredCode);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card animate-fade-in">
      <button
        type="button"
        onClick={() => setCurrentScreen('signin')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: 'pointer',
          marginBottom: '1rem',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="auth-card-header">
        <div className="app-logo-wrap" style={{ width: '46px', height: '46px' }}>
          <Smartphone size={22} color="var(--primary)" />
        </div>
        <h1 className="auth-card-title">
          {isOtpSent ? 'Enter Code' : 'Phone Sign In'}
        </h1>
        <p className="auth-card-subtitle">
          {isOtpSent
            ? `Code sent to ${selectedCountry.dial_code} ${phone}`
            : 'We will send you an SMS verification code'}
        </p>
      </div>

      {!isOtpSent ? (
        <form onSubmit={handleSendOtp}>
          <PhoneInputField
            label="Phone Number"
            value={phone}
            onChange={(val) => {
              setPhone(val);
              setError('');
            }}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            error={error}
            required
          />

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isLoading}>
            {isLoading ? 'Sending code...' : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-box"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <p className="error-text" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              {error}
            </p>
          )}

          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              fontSize: '12px',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              Demo code: <strong style={{ color: 'var(--primary)' }}>123456</strong>
            </span>
            <button
              type="button"
              onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Fill Code
            </button>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12.5px',
            }}
          >
            <button
              type="button"
              onClick={() => setIsOtpSent(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Edit number
            </button>

            <span style={{ color: 'var(--text-subtle)' }}>
              {resendTimer > 0 ? (
                `Resend in ${resendTimer}s`
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setResendTimer(60);
                    showToast('New code sent!', 'info');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Resend code
                </button>
              )}
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
