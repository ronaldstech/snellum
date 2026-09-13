import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { notificationService } from './notificationService';
import { chatService } from './chatService';

export const GIFT_CATALOG = [
  { id: 'rose', icon: '🌹', name: 'Rose', cost: 50, color: '#EF4444' },
  { id: 'heart', icon: '❤️', name: 'Heart', cost: 100, color: '#EC4899' },
  { id: 'chocolate', icon: '🍫', name: 'Chocolate', cost: 250, color: '#92400E' },
  { id: 'teddy', icon: '🧸', name: 'Teddy Bear', cost: 500, color: '#F97316' },
  { id: 'champagne', icon: '🥂', name: 'Champagne', cost: 1000, color: '#D97706' },
  { id: 'ring', icon: '💍', name: 'Diamond Ring', cost: 5000, color: '#06B6D4' },
];

export const giftService = {
  async sendGift({ senderId, senderName, recipient, gift }) {
    if (!senderId || !recipient?.uid || !gift) throw new Error('Gift details are incomplete.');

    if (db) {
      const senderRef = doc(db, 'users', senderId);
      const recipientRef = doc(db, 'users', recipient.uid);
      const transactionRef = doc(collection(db, 'gift_transactions'));

      await runTransaction(db, async (transaction) => {
        const sender = await transaction.get(senderRef);
        const receiver = await transaction.get(recipientRef);
        if (!sender.exists() || !receiver.exists()) throw new Error('This profile is no longer available.');

        const senderBalance = Number(sender.data().credits ?? sender.data().sparks ?? 0);
        if (senderBalance < gift.cost) throw new Error(`You need ${gift.cost - senderBalance} more sparks.`);
        const receiverBalance = Number(receiver.data().credits ?? receiver.data().sparks ?? 0);

        transaction.update(senderRef, { credits: senderBalance - gift.cost, sparks: senderBalance - gift.cost });
        transaction.update(recipientRef, { credits: receiverBalance + gift.cost, sparks: receiverBalance + gift.cost });
        transaction.set(transactionRef, {
          senderId,
          receiverId: recipient.uid,
          giftId: gift.id,
          giftName: gift.name,
          giftIcon: gift.icon,
          cost: gift.cost,
          timestamp: serverTimestamp(),
        });
      });

      await Promise.all([
        notificationService.sendNotification(recipient.uid, {
          senderId,
          senderName,
          type: 'gift',
          message: `${gift.icon} sent you a ${gift.name} (${gift.cost} sparks)`,
        }),
        (async () => {
          const chatId = await chatService.getOrCreateChat(senderId, recipient);
          if (chatId) await chatService.sendMessage(chatId, {
            senderId,
            text: `sent you a ${gift.icon} ${gift.name}!`,
            type: 'gift',
            giftData: gift,
          });
        })(),
      ]);
    }
    return true;
  },
};
