import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function InputField({
  label,
  type = 'text',
  icon: Icon,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  id,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: 'var(--primary)' }}>*</span>}
        </label>
      )}
      <div className={`input-container ${error ? 'error' : ''}`}>
        {Icon && (
          <div className="input-icon">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-field"
          autoComplete={autoComplete}
        />
        {isPassword && (
          <button
            type="button"
            className="input-action-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
