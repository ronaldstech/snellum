import React, { useState } from 'react';
import { X, Coffee, Calendar, MapPin, MessageSquare } from 'lucide-react';
import '../../styles/chat.css';

export default function MeetupProposalModal({ partner, onSubmit, onClose }) {
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim() || !dateTime.trim()) return;
    onSubmit({
      location,
      dateTime,
      senderNote: note,
    });
  };

  return (
    <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="meetup-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="gift-modal-header">
          <div className="gift-modal-title">
            <Coffee size={20} color="var(--primary)" />
            <h3>Propose a Date with {partner.name}</h3>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="meetup-form">
          <div className="input-field-group">
            <label>
              <MapPin size={14} /> Location / Venue
            </label>
            <input
              type="text"
              placeholder="e.g., Starbucks Downtown, Sky Lounge, Central Park"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="styled-text-input"
            />
          </div>

          <div className="input-field-group">
            <label>
              <Calendar size={14} /> Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="styled-text-input"
            />
          </div>

          <div className="input-field-group">
            <label>
              <MessageSquare size={14} /> Personal Note (Optional)
            </label>
            <textarea
              placeholder="e.g. Would love to grab some matcha and talk about your photography!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="styled-text-input"
              rows={3}
            />
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!location || !dateTime}>
              Send Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
