import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowRight,
  Sparkles,
  Filter,
} from 'lucide-react';
import { DATING_EVENTS } from '../../data/eventsData';
import EventDetailsModal from './EventDetailsModal';
import '../../styles/events.css';

export default function DatingEventsSection({ onNavigateAuth }) {
  const [selectedCity, setSelectedCity] = useState('All');
  const [activeEvent, setActiveEvent] = useState(null);

  const cities = ['All', 'Lilongwe', 'Blantyre', 'Zomba', 'Cape Maclear'];

  const filteredEvents =
    selectedCity === 'All'
      ? DATING_EVENTS
      : DATING_EVENTS.filter((e) => e.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <section id="events" className="dating-events-section">
      <div className="events-container">
        {/* Section Header */}
        <div className="section-head-center">
          <div className="section-kicker">
            <Sparkles size={14} color="#F59E0B" />
            <span>Search-Indexed Singles Mixers & Meetups</span>
          </div>
          <h2 className="section-heading">Real-World Romance. Curated Events in Malawi.</h2>
          <p className="section-subtext">
            Skip the endless texting. Attend high-vibe mixers, speed dating sessions, and scenic
            outdoor adventures where singles connect face-to-face.
          </p>
        </div>

        {/* City Filter Tabs */}
        <div className="city-filter-bar">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              className={`city-pill ${selectedCity === city ? 'active' : ''}`}
              onClick={() => setSelectedCity(city)}
            >
              <MapPin size={12} />
              <span>{city}</span>
            </button>
          ))}
        </div>

        {/* Events Cards Grid */}
        <div className="events-cards-grid">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="event-preview-card"
              onClick={() => setActiveEvent(event)}
            >
              <div className="card-thumb-wrap">
                <img src={event.image} alt={event.title} loading="lazy" />
                <span className="card-category-tag">{event.category}</span>
                <span className="card-spots-pill">
                  <Users size={11} /> {event.spotsLeft} spots left
                </span>
              </div>

              <div className="card-content-wrap">
                <div className="card-date-line">
                  <Calendar size={13} color="var(--primary)" />
                  <span>{event.dateFormatted}</span>
                </div>

                <h3 className="card-event-title">{event.title}</h3>
                <p className="card-event-snippet">{event.subtitle}</p>

                <div className="card-venue-line">
                  <MapPin size={13} color="var(--text-muted)" />
                  <span>{event.venue}</span>
                </div>

                <div className="card-footer-row">
                  <div className="card-price-tag">
                    <strong>{event.price}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn-view-event"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEvent(event);
                    }}
                  >
                    <span>View & RSVP</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={!!activeEvent}
        onClose={() => setActiveEvent(null)}
        event={activeEvent}
      />
    </section>
  );
}
