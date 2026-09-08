import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const notificationService = {
  // Listen to user's notifications
  streamNotifications(myUid, callback) {
    if (!db || !myUid) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'users', myUid, 'notifications'),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        callback(list);
      },
      (err) => {
        console.warn('Notifications stream error:', err);
        callback([]);
      }
    );
  },

  // Send a notification to another user
  async sendNotification(targetUid, { title, body, type, senderId, senderName, senderPhoto, data = {} }) {
    if (!db || !targetUid) return;
    const notifCol = collection(db, 'users', targetUid, 'notifications');
    await addDoc(notifCol, {
      title,
      body,
      type, // 'like', 'super_like', 'match', 'gift', or 'call'
      senderId,
      senderName,
      senderPhoto,
      isRead: false,
      data,
      timestamp: serverTimestamp(),
    });
  },

  // Mark all notifications as read
  async markAsRead(myUid, notifId) {
    if (!db || !myUid || !notifId) return;
    const docRef = doc(db, 'users', myUid, 'notifications', notifId);
    await updateDoc(docRef, { isRead: true }).catch(() => {});
  },
};
