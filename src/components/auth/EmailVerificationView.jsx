import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EmailVerificationView() {
  const { user, setCurrentScreen, showToast } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      showToast('Verification email resent!', 'success');
    }, 800);
  };

  return (
    <div className="auth-card animate-fade-in" style={{ textAlign: 'center' }}>
      <div
        className="app-logo-wrap"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          margin: '0 auto 1rem',
        }}
      >
        <Mail size={26} color="var(--primary)" />
      </div>

      <h1 className="auth-card-title">Verify Email</h1>
      <p className="auth-card-subtitle" style={{ marginTop: '0.25rem', marginBottom: '1.25rem' }}>
        We sent a link to <strong style={{ color: 'var(--text-main)' }}>{user?.email || 'your email'}</strong>.
      </p>

      <div
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
          fontSize: '12.5px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', alignItems: 'center' }}>
          <CheckCircle2 size={15} color="#10B981" />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Next steps:</span>
        </div>
        <ol style={{ paddingLeft: '1.25rem', lineHeight: '1.6' }}>
          <li>Check your email inbox</li>
          <li>Click the verification link</li>
        </ol>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            showToast('Email verified!', 'success');
            setCurrentScreen('authenticated');
          }}
        >
          I've Verified <ArrowRight size={15} />
        </button>

        <button
          type="button"
          className="btn-ghost"
          onClick={handleResend}
          disabled={isResending}
        >
          <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
          {isResending ? 'Sending...' : 'Resend Email'}
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('signin')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-subtle)',
            fontSize: '12.5px',
            cursor: 'pointer',
            marginTop: '0.25rem',
          }}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
