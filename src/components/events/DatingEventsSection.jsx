import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import EventDetailsModal from './EventDetailsModal';
import '../../styles/events.css';

export default function DatingEventsSection({ onNavigateAuth, pendingEventApplicationId, onPendingEventApplicationHandled }) {
  const [selectedCity, setSelectedCity] = useState('All');
  const [activeEvent, setActiveEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(Boolean(db));
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return undefined;
    }

    return onSnapshot(collection(db, 'events'), (snapshot) => {
      const publishedEvents = snapshot.docs
        .map((eventDoc) => ({ id: eventDoc.id, ...eventDoc.data() }))
        .filter((event) => (event.status || 'published') === 'published')
        .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
      setEvents(publishedEvents);
      const pendingEvent = pendingEventApplicationId && publishedEvents.find((event) => event.id === pendingEventApplicationId);
      if (pendingEvent) {
        setActiveEvent(formatEvent(pendingEvent));
        onPendingEventApplicationHandled?.();
      }
      setLoadError(false);
      setLoading(false);
    }, (error) => {
      console.error('Unable to load events:', error);
      setEvents([]);
      setLoadError(true);
      setLoading(false);
    });
  }, [pendingEventApplicationId, onPendingEventApplicationHandled]);

  const cities = useMemo(() => ['All', ...new Set(events.map((event) => event.city).filter(Boolean))], [events]);

  const filteredEvents =
    selectedCity === 'All'
      ? events
      : events.filter((event) => event.city?.toLowerCase() === selectedCity.toLowerCase());

  const formatEvent = (event) => {
    const date = event.date ? new Date(event.date) : null;
    const validDate = date && !Number.isNaN(date.getTime());
    const isFree = event.isFree === true || !event.price || String(event.price).trim().toLowerCase() === 'free';
    const price = isFree ? 'Free' : event.price;
    return {
      ...event,
      slug: event.slug || event.id,
      date: validDate ? date.toISOString().slice(0, 10) : '',
      dateFormatted: validDate ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date to be announced',
      dateDay: validDate ? date.toLocaleDateString(undefined, { day: '2-digit' }) : '—',
      dateMonth: validDate ? date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase() : 'DATE TBA',
      time: validDate ? date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : 'Time to be announced',
      subtitle: event.subtitle || event.description || 'Join the community for a Snellum event.',
      description: event.description || event.subtitle || 'More event details coming soon.',
      venue: event.venue || 'Venue to be announced',
      city: event.city || 'Location to be announced',
      category: event.category || 'Community event',
      price,
      isFree,
      cents: event.cents || (isFree ? 0 : 999),
      capacity: event.capacity || null,
      image: event.image || '',
      organizer: event.organizer || 'Snellum Events',
    };
  };

  return (
    <section id="events" className="dating-events-section">
      <div className="events-container">
        {/* Section Header */}
        <div className="section-head-center">
          <div className="section-kicker">
            <Sparkles size={14} color="#F59E0B" />
            <span>MEET IN REAL LIFE</span>
          </div>
          <h2 className="section-heading">Good people. Great plans.</h2>
          <p className="section-subtext">
            Find your next reason to get out, meet someone new, and make a story worth telling.
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
          {loading && <p className="events-empty-message">Loading events…</p>}
          {!loading && loadError && <p className="events-empty-message">Events are temporarily unavailable. Please try again later.</p>}
          {!loading && !loadError && filteredEvents.map((rawEvent) => {
            const event = formatEvent(rawEvent);
            return (
            <article
              key={event.id}
              className="event-preview-card"
              onClick={() => setActiveEvent(event)}
              onKeyDown={(e) => e.key === 'Enter' && setActiveEvent(event)}
              role="button"
              tabIndex={0}
              aria-label={`View ${event.title}`}
            >
              <div className="card-thumb-wrap">
                {event.image ? <img src={event.image} alt={event.title} loading="lazy" /> : <div className="event-image-placeholder"><Sparkles size={32} /></div>}
                <div className="card-image-shade" />
                <span className="card-category-tag"><Sparkles size={12} /> {event.category}</span>
                <span className="card-date-badge"><strong>{event.dateDay}</strong><small>{event.dateMonth}</small></span>
                {event.capacity && <span className="card-spots-pill"><Users size={12} /> {event.capacity} places</span>}
              </div>

              <div className="card-content-wrap">
                <h3 className="card-event-title">{event.title}</h3>
                <p className="card-event-snippet">{event.subtitle}</p>

                <div className="card-venue-line">
                  <MapPin size={13} color="var(--text-muted)" />
                  <span>{event.city}{event.venue && event.venue !== 'Venue to be announced' ? ` · ${event.venue}` : ''}</span>
                </div>

                <div className="card-footer-row">
                  <div className="card-price-tag">
                    <small>ENTRY</small><strong>{event.price}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn-view-event"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveEvent(event);
                    }}
                  >
                    <span>Event details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          );
          })}
          {!loading && !loadError && !filteredEvents.length && <p className="events-empty-message">There are no published events{selectedCity !== 'All' ? ` in ${selectedCity}` : ''} right now. Check back soon.</p>}
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={!!activeEvent}
        onClose={() => setActiveEvent(null)}
        event={activeEvent}
        onNavigateAuth={onNavigateAuth}
      />
    </section>
  );
}
