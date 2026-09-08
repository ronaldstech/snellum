import {
  collection,
  doc,
  getDoc,
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

/**
 * Deterministic Chat ID matching Flutter ChatService
 */
export function getChatId(uid1, uid2) {
  const sorted = [uid1, uid2].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

export const chatService = {
  // Get or create conversation document in 'chats' collection
  async getOrCreateChat(myUid, otherUser) {
    if (!db || !myUid || !otherUser?.uid) return null;
    const chatId = getChatId(myUid, otherUser.uid);
    const chatDocRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatDocRef);

    if (!snap.exists()) {
      await setDoc(chatDocRef, {
        participants: [myUid, otherUser.uid],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: '',
        unreadCount: { [myUid]: 0, [otherUser.uid]: 0 },
        participantDetails: {
          [myUid]: { name: 'You' },
          [otherUser.uid]: {
            name: otherUser.displayName || otherUser.firstName || 'Member',
            avatar: otherUser.avatar || otherUser.photos?.[0] || '',
          },
        },
        createdAt: serverTimestamp(),
        requestStatus: 'accepted',
      });
    }
    return chatId;
  },

  // Stream active conversations for the current user
  streamConversations(myUid, callback) {
    if (!db || !myUid) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', myUid),
      orderBy('lastMessageTime', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          otherUid: d.data().participants?.find((p) => p !== myUid),
        }));
        callback(chats);
      },
      (err) => {
        console.warn('Chats listener fallback:', err);
        callback([]);
      }
    );
  },

  // Stream messages in a specific chat
  streamMessages(chatId, callback) {
    if (!db || !chatId) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        callback(messages);
      },
      (err) => {
        console.warn('Messages listener error:', err);
        callback([]);
      }
    );
  },

  // Send a message (text, gift, or image)
  async sendMessage(chatId, { senderId, text, type = 'text', mediaUrl = null, giftData = null }) {
    if (!db || !chatId) return;

    const messagesCol = collection(db, 'chats', chatId, 'messages');
    const newMsg = {
      senderId,
      text: text || '',
      type,
      mediaUrl,
      giftData,
      timestamp: serverTimestamp(),
      isRead: false,
    };

    await addDoc(messagesCol, newMsg);

    // Update parent chat document
    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
      lastMessage:
        type === 'gift'
          ? `🎁 Sent a gift: ${giftData?.name || 'Gift'}`
          : text,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: senderId,
    }).catch(() => {});
  },

  // Mark chat messages as read
  async markAsRead(chatId, myUid) {
    if (!db || !chatId) return;
    const chatDocRef = doc(db, 'chats', chatId);
    await updateDoc(chatDocRef, {
      [`unreadCount.${myUid}`]: 0,
    }).catch(() => {});
  },
};
