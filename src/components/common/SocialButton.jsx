import React from 'react';

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
