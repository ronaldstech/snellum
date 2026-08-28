import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { COUNTRY_CODES } from '../../constants/countryCodes';

export default function PhoneInputField({
  value,
  onChange,
  selectedCountry,
  onCountryChange,
  error,
  label = 'Phone Number',
  required = false,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const currentCountry = selectedCountry || COUNTRY_CODES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dial_code.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-group" ref={dropdownRef}>
      {label && (
        <label className="form-label">
          {label} {required && <span style={{ color: 'var(--primary)' }}>*</span>}
        </label>
      )}
      <div className={`input-container ${error ? 'error' : ''}`} style={{ paddingLeft: '0.35rem' }}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            padding: '0.35rem 0.45rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          <span style={{ fontSize: '1rem' }}>{currentCountry.flag}</span>
          <span style={{ color: 'var(--text-muted)' }}>{currentCountry.dial_code}</span>
          <ChevronDown size={13} style={{ color: 'var(--text-subtle)' }} />
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-light)', margin: '0 2px' }} />

        <input
          type="tel"
          value={value}
          onChange={(e) => {
            const cleanVal = e.target.value.replace(/[^\d\s-]/g, '');
            onChange(cleanVal);
          }}
          placeholder="888 123 456"
          className="input-field"
          style={{ paddingLeft: '0.5rem' }}
        />
      </div>

      {dropdownOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            maxHeight: '220px',
            overflowY: 'auto',
            borderRadius: 'var(--radius-md)',
            zIndex: 50,
            marginTop: '4px',
            padding: '0.4rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <input
            type="text"
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontSize: '12.5px',
              marginBottom: '0.35rem',
              outline: 'none',
            }}
            autoFocus
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {filteredCountries.map((c) => {
              const isSelected = c.code === currentCountry.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onCountryChange(c);
                    setDropdownOpen(false);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--bg-input-focus)' : 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>{c.flag}</span>
                    <span>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
                      {c.dial_code}
                    </span>
                    {isSelected && <Check size={14} color="var(--primary)" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
