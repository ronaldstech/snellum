import React, { useState } from 'react';
import { X, Sparkles, Camera, MapPin, Briefcase, Heart, User, Check } from 'lucide-react';
import InputField from '../common/InputField';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-Binary', 'Other'];
const INTERESTED_OPTIONS = ['Women', 'Men', 'Everyone'];
const HOBBIES_LIST = ['Travel', 'Music', 'Fitness', 'Cooking', 'Art & Design', 'Photography', 'Cinema', 'Tech', 'Hiking', 'Coffee'];

export default function EditProfileModal({ isOpen, onClose, userProfile, onSave }) {
  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [occupation, setOccupation] = useState(userProfile?.occupation || '');
  const [location, setLocation] = useState(userProfile?.location || 'Lilongwe, Malawi');
  const [gender, setGender] = useState(userProfile?.gender || 'Female');
  const [interestedIn, setInterestedIn] = useState(userProfile?.interestedIn || 'Men');
  const [photoUrl, setPhotoUrl] = useState(userProfile?.avatar || '');
  const [hobbies, setHobbies] = useState(userProfile?.hobbies || ['Travel', 'Coffee', 'Music']);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleHobby = (hobby) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter((h) => h !== hobby));
    } else {
      setHobbies([...hobbies, hobby]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedData = {
      firstName,
      bio,
      occupation,
      location,
      gender,
      interestedIn,
      photos: photoUrl ? [photoUrl] : (userProfile?.photos || []),
      hobbies,
    };

    try {
      await onSave(updatedData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-modal-header">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Edit Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="edit-modal-body">
          {/* Avatar URL input with preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <img
              src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt="Avatar preview"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary)',
              }}
            />
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ fontSize: '12px' }}>Photo Image URL</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="input-field"
                style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  padding: '0.45rem 0.65rem',
                  fontSize: '12px',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <InputField
            label="First Name"
            type="text"
            icon={User}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Your name"
            required
          />

          <div className="form-group">
            <label className="form-label">About Me (Bio)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              className="input-field"
              style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                padding: '0.65rem 0.75rem',
                fontSize: '13px',
                resize: 'none',
              }}
            />
          </div>

          <InputField
            label="Occupation"
            type="text"
            icon={Briefcase}
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Designer, Software Engineer"
          />

          <InputField
            label="Location"
            type="text"
            icon={MapPin}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lilongwe, Malawi"
          />

          {/* Gender Selector */}
          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="chips-wrap">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`chip-btn ${gender === g ? 'selected' : ''}`}
                  onClick={() => setGender(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Interested In */}
          <div className="form-group">
            <label className="form-label">Interested In</label>
            <div className="chips-wrap">
              {INTERESTED_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`chip-btn ${interestedIn === opt ? 'selected' : ''}`}
                  onClick={() => setInterestedIn(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Hobbies / Interests */}
          <div className="form-group">
            <label className="form-label">Interests & Hobbies</label>
            <div className="chips-wrap">
              {HOBBIES_LIST.map((h) => {
                const isSelected = hobbies.includes(h);
                return (
                  <button
                    key={h}
                    type="button"
                    className={`chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleHobby(h)}
                  >
                    {isSelected && <Check size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-ghost"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
