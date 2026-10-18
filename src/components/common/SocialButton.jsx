import React from 'react';

export function AppleMark({ size = 19 }) {
  return (
    <svg className="apple-auth-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M17.1 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.7-1.7-3.3-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.6 0-3.1.9-3.9 2.3-1.7 2.9-.4 7.1 1.2 9.4.8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.3 0 2.1-1.1 2.9-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-4.2ZM14.8 6.3c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.3-.6.7-1.1 1.8-1 2.8 1 .1 2-.5 2.7-1.2Z" />
    </svg>
  );
}

export default function SocialButton({ text, icon: Icon, imageSrc, onClick, disabled }) {
  return (
    <button
      type="button"
      className="btn-social"
      onClick={onClick}
      disabled={disabled}
    >
      {imageSrc && <img src={imageSrc} alt="" />}
      {Icon && <Icon size={19} color="var(--primary)" />}
      <span>{text}</span>
    </button>
  );
}
