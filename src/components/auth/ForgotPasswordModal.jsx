import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InputField from '../common/InputField';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const { sendPasswordReset, showToast } = useAuth();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setIsSent(true);
    } catch (err) {
      showToast(err.message || 'Could not send reset email', 'error');
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetState = () => {
    setIsSent(false);
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 999,
      }}
      onClick={handleResetState}
    >
      <div
        className="auth-card animate-fade-in"
        style={{ maxWidth: '380px', padding: '1.75rem 1.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleResetState}
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

        {!isSent ? (
          <>
            <div className="auth-card-header" style={{ marginBottom: '1.25rem' }}>
              <div className="app-logo-wrap" style={{ width: '46px', height: '46px' }}>
                <Mail size={22} color="var(--primary)" />
              </div>
              <h2 className="auth-card-title" style={{ fontSize: '1.25rem' }}>
                Reset Password
              </h2>
              <p className="auth-card-subtitle" style={{ fontSize: '12.5px' }}>
                Enter your email address to receive password reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <InputField
                id="reset-email"
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                error={error}
                required
              />

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={26} />
            </div>
            <h2 className="auth-card-title" style={{ fontSize: '1.2rem' }}>
              Check your inbox
            </h2>
            <p className="auth-card-subtitle" style={{ marginTop: '0.35rem', marginBottom: '1.5rem', fontSize: '12.5px' }}>
              We sent a reset link to <strong style={{ color: 'var(--text-main)' }}>{email}</strong>.
            </p>

            <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={handleResetState}>
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
