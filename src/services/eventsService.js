import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const eventsService = {
  async submitFreeApplication({ event, user, userProfile }) {
    if (!db) throw new Error('Event registration is unavailable right now.');
    if (!user?.uid) throw new Error('Sign in to RSVP for this event.');

    const name = userProfile?.displayName || userProfile?.firstName || user.displayName || 'Snellum Member';
    await setDoc(doc(db, 'eventApplications', `${event.id}_${user.uid}`), {
      eventId: event.id,
      eventTitle: event.title,
      userId: user.uid,
      name,
      email: user.email || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  },
};
