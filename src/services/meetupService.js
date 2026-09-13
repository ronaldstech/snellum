import { collection, doc, getDocs, limit, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { notificationService } from './notificationService';
import { chatService } from './chatService';

export const meetupService = {
  async hasPending(senderId, receiverId) {
    if (!db) return false;
    const snapshot = await getDocs(query(collection(db, 'meetups'), where('senderId', '==', senderId), where('receiverId', '==', receiverId), where('status', '==', 'pending'), limit(1)));
    return !snapshot.empty;
  },
  async request({ senderId, senderName, recipient, dateTime, note }) {
    if (!senderId || !recipient?.uid) throw new Error('Meetup details are incomplete.');
    if (db) {
      const senderRef = doc(db, 'users', senderId); const meetupRef = doc(collection(db, 'meetups'));
      await runTransaction(db, async (tx) => {
        const sender = await tx.get(senderRef); if (!sender.exists()) throw new Error('Your profile is unavailable.');
        const balance = Number(sender.data().credits ?? sender.data().sparks ?? 0);
        if (balance < 100) throw new Error('You need 100 sparks to send a meetup request.');
        tx.update(senderRef, { credits: balance - 100, sparks: balance - 100 });
        tx.set(meetupRef, { senderId, receiverId: recipient.uid, senderName, receiverName: recipient.displayName, dateTime, senderNote: note || null, location: recipient.meetupLocation || null, rate: recipient.meetupRate || null, note: recipient.meetupNotes || null, status: 'pending', cost: 100, timestamp: serverTimestamp() });
      });
      await Promise.all([notificationService.sendNotification(recipient.uid, { senderId, senderName, type: 'meetup', message: `Would like to meet on ${new Date(dateTime).toLocaleString()}` }), (async () => { const id = await chatService.getOrCreateChat(senderId, recipient); if (id) await chatService.sendMessage(id, { senderId, text: `I'd like to meet on ${new Date(dateTime).toLocaleString()}`, type: 'meetup' }); })()]);
    }
  },
};
