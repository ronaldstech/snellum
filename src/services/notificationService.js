import {
  collection,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const notificationService = {
  // Matches the Flutter app's top-level `notifications` collection.
  streamNotifications(myUid, callback, onError = () => {}) {
    if (!db || !myUid) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', myUid)
    );

    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })).sort((a, b) => {
          const aTime = a.timestamp?.toMillis?.() || 0;
          const bTime = b.timestamp?.toMillis?.() || 0;
          return bTime - aTime;
        });
        callback(list);
      },
      (err) => {
        console.warn('Notifications stream error:', err);
        callback([]);
        onError(err);
      }
    );
  },

  // Send a notification using the shared Flutter/Web schema.
  async sendNotification(recipientId, { senderId, senderName, type, message = null }) {
    if (!db || !recipientId || recipientId === senderId) return;
    const notifCol = collection(db, 'notifications');
    await addDoc(notifCol, {
      recipientId,
      senderId,
      senderName,
      type,
      message,
      isRead: false,
      timestamp: serverTimestamp(),
    });
  },

  // Mark one notification as read
  async markAsRead(notifId) {
    if (!db || !notifId) return;
    const docRef = doc(db, 'notifications', notifId);
    await updateDoc(docRef, { isRead: true }).catch(() => {});
  },

  async markAllAsRead(notifications) {
    if (!db) return;

    const unreadNotifications = notifications.filter((notification) => !notification.isRead);
    if (!unreadNotifications.length) return;

    const batch = writeBatch(db);
    unreadNotifications.forEach((notification) => {
      batch.update(doc(db, 'notifications', notification.id), { isRead: true });
    });
    await batch.commit();
  },
};
