import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Share2,
  CheckCircle2,
  Sparkles,
  CalendarPlus,
  ArrowRight,
} from 'lucide-react';
import { shareService } from '../../services/shareService';
import { updateSeoMeta } from '../../utils/seo';
import StripeCheckoutModal from '../premium/StripeCheckoutModal';
import ShareModal from '../common/ShareModal';
import '../../styles/events.css';

export default function EventDetailsModal({ isOpen, onClose, event, onRsvpSuccess }) {
  const [stripeOpen, setStripeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [rsvpd, setRsvpd] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      // Dynamic SEO and JSON-LD structured data for Google Search Indexing
      updateSeoMeta({
        title: `${event.title} (${event.city}) - Snellum Singles Events`,
        description: `${event.description.substring(0, 155)}...`,
        image: event.image,
        type: 'event',
        url: shareService.getEventShareLink(event.slug),
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          startDate: `${event.date}T17:30:00+02:00`,
          endDate: `${event.date}T21:30:00+02:00`,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: event.venue,
            address: {
              '@type': 'PostalAddress',
              addressLocality: event.city,
              addressCountry: 'MW',
            },
          },
          image: [event.image],
          description: event.description,
          offers: {
            '@type': 'Offer',
            url: window.location.href,
            price: event.cents ? (event.cents / 100).toFixed(2) : '9.99',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            validFrom: '2026-01-01T00:00:00+02:00',
          },
          organizer: {
            '@type': 'Organization',
            name: event.organizer || 'Snellum Dating',
            url: 'https://snellum.web.app',
          },
        },
      });
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const eventLink = shareService.getEventShareLink(event.slug);

  const handleShare = async () => {
    const res = await shareService.shareContent({
      title: `${event.title} - Snellum Singles Mixer`,
      text: `Join me at the ${event.title} in ${event.city} on ${event.dateFormatted}! Reserve your spot now:`,
      url: eventLink,
    });
    if (!res.success || res.method === 'clipboard') {
      setShareOpen(true);
    }
  };

  const handleGoogleCalendar = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.description}\n\nVenue: ${event.venue}\nRSVP via Snellum: ${eventLink}`);
    const location = encodeURIComponent(`${event.venue}, ${event.city}, Malawi`);
    const dateClean = event.date.replace(/-/g, '');
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateClean}T153000Z/${dateClean}T193000Z`;
    window.open(gCalUrl, '_blank');
  };

  return (
    <>
      <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
        <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
          {/* Hero Banner with Badges */}
          <div className="event-modal-hero" style={{ backgroundImage: `url(${event.image})` }}>
            <div className="event-hero-gradient" />
            <button
              type="button"
              className="btn-event-close"
              onClick={onClose}
              aria-label="Close event"
            >
              <X size={18} />
            </button>
            <div className="event-hero-badges">
              <span className="event-category-badge">{event.category}</span>
              <span className="event-spots-badge">
                <Users size={12} /> {event.spotsLeft} spots remaining
              </span>
            </div>
            <div className="event-hero-content">
              <h2>{event.title}</h2>
              <p>{event.subtitle}</p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="event-modal-body">
            {/* Quick Meta Grid */}
            <div className="event-meta-grid">
              <div className="meta-card">
                <Calendar size={18} color="var(--primary)" />
                <div>
                  <strong>{event.dateFormatted}</strong>
                  <span>{event.time}</span>
                </div>
              </div>

              <div className="meta-card">
                <MapPin size={18} color="#F59E0B" />
                <div>
                  <strong>{event.venue}</strong>
                  <span>{event.city}, Malawi</span>
                </div>
              </div>

              <div className="meta-card">
                <Ticket size={18} color="#10B981" />
                <div>
                  <strong>{event.price}</strong>
                  <span>Direct Web Ticket Price</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="event-section-block">
              <h3>About This Mixer</h3>
              <p>{event.description}</p>
            </div>

            {/* Highlights */}
            {event.highlights && (
              <div className="event-section-block">
                <h3>What’s Included & Highlights</h3>
                <ul className="event-highlights-list">
                  {event.highlights.map((h, i) => (
                    <li key={i}>
                      <CheckCircle2 size={15} color="#10B981" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dress code & Organizer info */}
            <div className="event-details-bar">
              {event.dressCode && (
                <div className="detail-tag">
                  <span>Dress Code:</span> <strong>{event.dressCode}</strong>
                </div>
              )}
              <div className="detail-tag">
                <span>Hosted by:</span> <strong>{event.organizer}</strong>
              </div>
            </div>

            {/* Action Bar */}
            <div className="event-actions-bar">
              <div className="event-secondary-buttons">
                <button
                  type="button"
                  className="btn-event-secondary"
                  onClick={handleShare}
                  title="Share event link"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  className="btn-event-secondary"
                  onClick={handleGoogleCalendar}
                  title="Add to Google Calendar"
                >
                  <CalendarPlus size={16} />
                  <span>Add to Calendar</span>
                </button>
              </div>

              <button
                type="button"
                className="btn-rsvp-primary"
                onClick={() => setStripeOpen(true)}
              >
                <Ticket size={16} />
                <span>Reserve Ticket ({event.price})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Checkout for Event Ticket */}
      <StripeCheckoutModal
        isOpen={stripeOpen}
        onClose={() => setStripeOpen(false)}
        itemType="event"
        itemData={event}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={event.title}
        text={`Reserve your ticket for the ${event.title} in ${event.city} on ${event.dateFormatted}!`}
        url={eventLink}
      />
    </>
  );
}
