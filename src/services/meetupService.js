import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const meetupService = {
  // Request a new meetup
  async createMeetupProposal({
    senderId,
    senderName,
    senderPhoto,
    receiverId,
    receiverName,
    receiverPhoto,
    dateTime,
    location,
    senderNote,
  }) {
    if (!db) return null;
    const meetupsCol = collection(db, 'meetups');
    const docRef = await addDoc(meetupsCol, {
      senderId,
      senderName,
      senderPhoto,
      receiverId,
      receiverName,
      receiverPhoto,
      dateTime: dateTime instanceof Date ? dateTime.toISOString() : dateTime,
      location: location || 'Coffee House',
      senderNote: senderNote || '',
      status: 'pending', // pending, accepted, rejected, cancelled
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Stream user's meetups (both sent and received)
  streamUserMeetups(myUid, callback) {
    if (!db || !myUid) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, 'meetups'),
      where('senderId', '==', myUid)
    );
    const q2 = query(
      collection(db, 'meetups'),
      where('receiverId', '==', myUid)
    );

    let sent = [];
    let received = [];

    const unsub1 = onSnapshot(q, (snap) => {
      sent = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback([...sent, ...received]);
    }, () => {});

    const unsub2 = onSnapshot(q2, (snap) => {
      received = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback([...sent, ...received]);
    }, () => {});

    return () => {
      unsub1();
      unsub2();
    };
  },

  // Update meetup status
  async updateStatus(meetupId, status) {
    if (!db || !meetupId) return;
    const docRef = doc(db, 'meetups', meetupId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  },
};
