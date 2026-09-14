import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { mapMessage, mapChat, toDate } from '../models/chatModel';

const UPLOAD_ENDPOINT = 'https://unimarket-mw.com/snellum/api/upload2.php';

/**
 * Deterministic Chat ID matching Flutter ChatService (sorted UIDs joined by "_")
 */
export function getChatId(uid1, uid2) {
  const sorted = [String(uid1), String(uid2)].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

function isDemo() {
  return !isFirebaseConfigured || !db;
}

/* ─── Demo mode in-memory store (when Firebase is not configured) ─────── */
const demoStore = {
  chats: {},
  ensureChat(chatId) {
    if (!demoStore.chats[chatId]) {
      demoStore.chats[chatId] = {
        messages: [],
        lastMessage: '',
        lastMessageTime: null,
        lastMessageSenderId: '',
        unreadCount: {},
        isSuperRequest: false,
        participants: [],
        requestStatus: 'accepted',
        participantDetails: {},
      };
    }
    return demoStore.chats[chatId];
  },
  seedChats(myUid) {
    const now = Date.now();
    const defs = [
      {
        id: 'demo_amara',
        otherUid: 'demo_amara',
        name: 'Amara',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        lastMessage: 'Hey! I loved your profile 🔥',
        minutesAgo: 5,
        senderIsMe: false,
        unread: 2,
      },
      {
        id: 'demo_tadala',
        otherUid: 'demo_tadala',
        name: 'Tadala',
        avatar:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
        lastMessage: 'Let’s grab a coffee this weekend!',
        minutesAgo: 12,
        senderIsMe: true,
        unread: 0,
        super: true,
      },
    ];
    for (const def of defs) {
      if (demoStore.chats[def.id]) continue;
      const chat = demoStore.ensureChat(def.id);
      chat.participants = [myUid, def.otherUid];
      chat.lastMessage =
        (def.super ? '🔥 Super Request: ' : '') + def.lastMessage;
      chat.lastMessageTime = new Date(now - def.minutesAgo * 60000);
      chat.lastMessageSenderId = def.senderIsMe ? myUid : def.otherUid;
      chat.unreadCount = { [myUid]: def.unread, [def.otherUid]: 0 };
      chat.isSuperRequest = Boolean(def.super);
      chat.requestStatus = 'accepted';
      chat.participantDetails = {
        [myUid]: { name: 'You' },
        [def.otherUid]: { name: def.name, avatar: def.avatar },
      };
    }
  },
};

export const chatService = {
  getChatId,

  /* ── Match status (parity with Flutter checkMatchStatus) ────────────── */
  async checkMatchStatus(myUid, otherUid) {
    if (isDemo()) return true;
    try {
      const matchId = getChatId(myUid, otherUid);
      const snap = await getDoc(doc(db, 'matches', matchId));
      return snap.exists();
    } catch (e) {
      console.warn('checkMatchStatus error:', e);
      return false;
    }
  },

  /* ── Get or create conversation document in 'chats' collection ──────── */
  async getOrCreateChat(myUid, otherUser) {
    if (!myUid || !otherUser?.uid) return null;
    const chatId = getChatId(myUid, otherUser.uid);

    if (isDemo()) {
      const chat = demoStore.ensureChat(chatId);
      chat.participants = [myUid, otherUser.uid];
      demoStore.chats[chatId] = chat;
      return chatId;
    }

    const chatDocRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatDocRef);

    const isMatched = await chatService.checkMatchStatus(myUid, otherUser.uid);

    if (!snap.exists()) {
      const data = {
        participants: [myUid, otherUser.uid],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: '',
        unreadCount: { [myUid]: 0, [otherUser.uid]: 0 },
        participantDetails: {
          [myUid]: { name: 'You' },
          [otherUser.uid]: {
            name: otherUser.displayName || otherUser.firstName || 'Member',
            avatar: otherUser.avatar || otherUser.photos?.[0] || otherUser.photo || '',
          },
        },
        createdAt: serverTimestamp(),
        requestStatus: isMatched ? 'accepted' : 'pending',
        requestSenderId: isMatched ? null : myUid,
      };
      await setDoc(chatDocRef, data);
    } else if (snap.exists()) {
      const existing = snap.data();
      if (!isMatched && existing.requestStatus == null) {
        await updateDoc(chatDocRef, {
          requestStatus: 'pending',
          requestSenderId: myUid,
        });
      }
    }
    return chatId;
  },

  /* ── Send a text/reply message + update chat meta + unread count ────── */
  async sendMessage(
    chatId,
    {
      senderId,
      receiverId,
      text,
      type = 'text',
      mediaUrl = null,
      giftData = null,
      messageType,
      replyToId = null,
      replyToText = null,
      replyToSenderName = null,
    }
  ) {
    const trimmed = (text || '').trim();
    const msgType = messageType || type || 'text';

    if (isDemo()) {
      const chat = demoStore.ensureChat(chatId);
      const msg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        senderId,
        text: trimmed,
        timestamp: new Date(),
        isRead: false,
        messageType: msgType,
        mediaUrl,
        giftData,
        replyToId,
        replyToText,
        replyToSenderName,
      };
      chat.messages = [...(chat.messages || []), msg];
      chat.lastMessage =
        msgType === 'gift'
          ? `🎁 Sent a gift: ${giftData?.name || 'Gift'}`
          : trimmed;
      chat.lastMessageTime = new Date();
      chat.lastMessageSenderId = senderId;
      chat.unreadCount = { ...(chat.unreadCount || {}), [senderId]: 0 };
      return;
    }

    // Daily free-message counter for non-premium senders (Flutter parity)
    try {
      const senderRef = doc(db, 'users', senderId);
      const senderDoc = await getDoc(senderRef);
      if (senderDoc.exists) {
        const d = senderDoc.data();
        if (d?.isPremium !== true) {
          const today = new Date().toISOString().split('T')[0];
          const lastReset = d?.lastMessageResetDate?.toString();
          let dailyCount = Number(d?.dailyMessageCount) || 0;
          if (lastReset !== today) dailyCount = 0;
          await updateDoc(senderRef, {
            dailyMessageCount: dailyCount + 1,
            lastMessageResetDate: today,
          });
        }
      }
    } catch (e) {
      console.warn('Daily message counter error:', e);
    }

    const messagesCol = collection(db, 'chats', chatId, 'messages');
    const newMsg = {
      senderId,
      text: trimmed,
      messageType: msgType,
      mediaUrl,
      giftData,
      timestamp: serverTimestamp(),
      isRead: false,
      isDelivered: true,
      replyToId,
      replyToText,
      replyToSenderName,
    };

    const msgRef = await addDoc(messagesCol, newMsg);

    // Update parent chat document + increment receiver unread count
    const chatDocRef = doc(db, 'chats', chatId);
    const displayText =
      msgType === 'image'
        ? '📷 Image'
        : msgType === 'voice'
          ? '🎤 Voice message'
          : msgType === 'gif'
            ? '🎬 GIF'
            : msgType === 'gift'
              ? `🎁 Sent a gift: ${giftData?.name || 'Gift'}`
              : trimmed;

    const patch = {
      lastMessage: displayText,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: senderId,
    };
    if (receiverId) {
      patch[`unreadCount.${receiverId}`] = increment(1);
    }
    await updateDoc(chatDocRef, patch).catch((e) =>
      console.warn('Failed updating chat meta:', e)
    );

    return msgRef.id;
  },

  /* ── Send a gift (deduct/add sparks via transaction, never calls this twice) ── */
  async sendGift({ chatId, senderId, receiverId, giftType, giftValue }) {
    if (isDemo()) {
      const chat = demoStore.ensureChat(chatId);
      const msg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        senderId,
        text: `sent you a ${giftType}!`,
        timestamp: new Date(),
        isRead: false,
        messageType: 'gift',
        giftType,
        giftValue,
      };
      chat.messages = [...(chat.messages || []), msg];
      chat.lastMessage = `🎁 ${giftType}`;
      chat.lastMessageTime = new Date();
      chat.lastMessageSenderId = senderId;
      return;
    }

    const chatDocRef = doc(db, 'chats', chatId);
    const msgRef = await addDoc(collection(chatDocRef, 'messages'), {
      senderId,
      text: `sent you a ${giftType}!`,
      timestamp: serverTimestamp(),
      isRead: false,
      isDelivered: true,
      messageType: 'gift',
      giftType,
      giftValue,
    });
    await updateDoc(chatDocRef, {
      lastMessage: `🎁 ${giftType}`,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: senderId,
      [`unreadCount.${receiverId}`]: increment(1),
    }).catch(() => {});
    return msgRef.id;
  },

  /* ── Super Request (boost chat to top with glow, costs credits client-side) ── */
  async sendSuperRequest({ chatId, senderId, receiverId, text }) {
    if (isDemo()) {
      const chat = demoStore.ensureChat(chatId);
      const msg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        senderId,
        text: text || 'Sent a Super Request! 🔥',
        timestamp: new Date(),
        isRead: false,
        messageType: 'text',
        isSuperRequest: true,
      };
      chat.messages = [...(chat.messages || []), msg];
      chat.lastMessage = `🔥 Super Request: ${text || 'Sent a Super Request! 🔥'}`;
      chat.lastMessageTime = new Date();
      chat.lastMessageSenderId = senderId;
      chat.isSuperRequest = true;
      return;
    }

    const chatDocRef = doc(db, 'chats', chatId);
    const messagesCol = collection(chatDocRef, 'messages');
    const displayText = text
      ? text
      : 'Sent a Super Request! 🔥';

    await addDoc(messagesCol, {
      senderId,
      text: displayText,
      timestamp: serverTimestamp(),
      isRead: false,
      isDelivered: true,
      messageType: 'text',
      isSuperRequest: true,
    });

    await updateDoc(chatDocRef, {
      isSuperRequest: true,
      lastMessage: `🔥 Super Request: ${displayText}`,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: senderId,
      [`unreadCount.${receiverId}`]: increment(1),
    }).catch(() => {});
  },

  /* ── Stream active conversations (super requests first, then time) ──── */
  streamConversations(myUid, callback) {
    if (isDemo()) {
      demoStore.seedChats(myUid);
      const chats = Object.entries(demoStore.chats)
        .filter(([, c]) => c.participants?.includes(myUid))
        .map(([id, c]) => mapChat({ id, ...c }, myUid));
      chats.sort((a, b) => {
        if (a.isSuperRequest && !b.isSuperRequest) return -1;
        if (!a.isSuperRequest && b.isSuperRequest) return 1;
        return (b.lastMessageTime || 0) - (a.lastMessageTime || 0);
      });
      callback(chats);
      return () => {};
    }
    if (!db || !myUid) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', myUid)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const chats = snapshot.docs
          .map((d) => mapChat(d, myUid))
          .filter((c) => !c.deletedBy.includes(myUid));
        chats.sort((a, b) => {
          if (a.isSuperRequest && !b.isSuperRequest) return -1;
          if (!a.isSuperRequest && b.isSuperRequest) return 1;
          return (
            (b.lastMessageTime?.getTime() || 0) -
            (a.lastMessageTime?.getTime() || 0)
          );
        });
        callback(chats);
      },
      (err) => {
        console.warn('Chats listener fallback:', err);
        callback([]);
      }
    );
  },

  /* ── Stream a single chat document ──────────────────────────────────── */
  streamChat(chatId, myUid, callback) {
    if (isDemo()) {
      const chat = demoStore.ensureChat(chatId);
      const mapped = mapChat({ id: chatId, ...chat }, myUid);
      callback(mapped);
      return () => {};
    }
    if (!db || !chatId) {
      callback(null);
      return () => {};
    }
    return onSnapshot(
      doc(db, 'chats', chatId),
      (snap) => {
        callback(snap.exists() ? mapChat(snap, myUid) : null);
      },
      () => callback(null)
    );
  },

  /* ── Stream messages in a specific chat (ascending) ─────────────────── */
  streamMessages(chatId, callback) {
    if (isDemo()) {
      const chat = demoStore.ensureChat(chatId);
      callback(
        [...(chat.messages || [])].sort(
          (a, b) => toDate(a.timestamp) - toDate(b.timestamp)
        )
      );
      return () => {};
    }
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
        callback(snapshot.docs.map(mapMessage));
      },
      (err) => {
        console.warn('Messages listener error:', err);
        callback([]);
      }
    );
  },

  /* ── Mark chat as read when opened (unread + message flags) ──────────── */
  async markAsRead(chatId, myUid) {
    if (isDemo() || !db || !chatId || !myUid) return;
    const chatDocRef = doc(db, 'chats', chatId);
    try {
      await updateDoc(chatDocRef, {
        [`unreadCount.${myUid}`]: 0,
      }).catch(() => {});
    } catch (e) {
      console.warn('markAsRead error:', e);
    }
  },

  /* ── Mark a single inbound message as read (sets isRead) ─────────────── */
  async markMessageAsRead(chatId, messageId) {
    if (isDemo() || !db) return;
    try {
      await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
        isRead: true,
      }).catch(() => {});
    } catch (e) {
      console.warn('markMessageAsRead error:', e);
    }
  },

  /* ── Edit a message ─────────────────────────────────────────────────── */
  async editMessage(chatId, messageId, newText) {
    const trimmed = (newText || '').trim();
    if (!trimmed) return;
    if (isDemo()) {
      const chat = demoStore.ensureChat(chatId);
      chat.messages = (chat.messages || []).map((m) =>
        m.id === messageId ? { ...m, text: trimmed, isEdited: true } : m
      );
      return;
    }
    if (!db) return;
    try {
      await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
        text: trimmed,
        isEdited: true,
      });
    } catch (e) {
      console.warn('editMessage error:', e);
    }
  },

  /* ── Soft-delete a message ──────────────────────────────────────────── */
  async deleteMessage(chatId, messageId) {
    const replacement = 'This message was deleted';
    if (isDemo()) {
      const chat = demoStore.ensureChat(chatId);
      chat.messages = (chat.messages || []).map((m) =>
        m.id === messageId
          ? { ...m, text: replacement, isDeleted: true, mediaUrl: null }
          : m
      );
      if (chat.lastMessageSenderId && chat.lastMessage) {
        chat.lastMessage = replacement;
      }
      return;
    }
    if (!db) return;
    try {
      await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
        text: replacement,
        isDeleted: true,
        mediaUrl: null,
        voiceDuration: null,
      });
    } catch (e) {
      console.warn('deleteMessage error:', e);
    }
  },

  /* ── Soft-delete chat for current user (deletedBy) ──────────────────── */
  async deleteChatForUser(chatId, userId) {
    if (isDemo()) {
      const chat = demoStore.chats[chatId];
      if (chat) chat.deletedBy = [...(chat.deletedBy || []), userId];
      return;
    }
    if (!db) return;
    try {
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        deletedBy: arrayUnion(userId),
      });
    } catch (e) {
      console.warn('deleteChatForUser error:', e);
    }
  },

  /* ── Chat request accept / decline ──────────────────────────────────── */
  async acceptRequest(chatId) {
    if (isDemo() || !db) return;
    try {
      await updateDoc(doc(db, 'chats', chatId), { requestStatus: 'accepted' });
    } catch (e) {
      console.warn('acceptRequest error:', e);
    }
  },

  async declineRequest(chatId) {
    if (isDemo() || !db) return;
    try {
      await updateDoc(doc(db, 'chats', chatId), { requestStatus: 'declined' });
    } catch (e) {
      console.warn('declineRequest error:', e);
    }
  },

  /* ── Typing status ──────────────────────────────────────────────────── */
  async setTypingStatus(chatId, userId, isTyping) {
    if (isDemo() || !db || !chatId) return;
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        [`typingStatus.${userId}`]: isTyping,
      }).catch(() => {});
    } catch (e) {
      console.warn('setTypingStatus error:', e);
    }
  },

  streamTypingStatus(chatId, otherUid, callback) {
    if (isDemo()) {
      callback(false);
      return () => {};
    }
    if (!db || !chatId) {
      callback(false);
      return () => {};
    }
    return onSnapshot(
      doc(db, 'chats', chatId),
      (snap) => {
        const typingMap = snap.data()?.typingStatus;
        callback(Boolean(typingMap?.[otherUid]));
      },
      () => callback(false)
    );
  },

  /* ── Online status (2-minute freshness window, Flutter parity) ──────── */
  streamUserOnline(uid, callback) {
    if (isDemo()) {
      callback(false);
      return () => {};
    }
    if (!db || !uid) {
      callback(false);
      return () => {};
    }
    return onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (!snap.exists()) return callback(false);
        const d = snap.data();
        if (d?.isOnline !== true) return callback(false);
        if (d?.lastSeen) {
          const lastSeen = toDate(d.lastSeen);
          if (lastSeen && Date.now() - lastSeen.getTime() > 120000) {
            return callback(false);
          }
        }
        callback(true);
      },
      () => callback(false)
    );
  },

  /* ── Set online status for current user (call on ChatWindow mount) ──── */
  async setUserOnline(uid, isOnline) {
    if (isDemo() || !db || !uid) return;
    try {
      await updateDoc(doc(db, 'users', uid), {
        isOnline,
        lastSeen: serverTimestamp(),
      }).catch(() => {});
    } catch (e) {
      console.warn('setUserOnline error:', e);
    }
  },

  /* ── Charge sparks from a user's balance (server-side, used for messages) ── */
  async chargeSparks(uid, amount) {
    if (isDemo()) return true;
    if (!db || !uid || !amount) return false;
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;
      const data = snap.data();
      const balance = Number(data.credits ?? data.sparks ?? 0);
      if (balance < amount) return false;
      await updateDoc(ref, {
        credits: increment(-amount),
        sparks: increment(-amount),
      });
      return true;
    } catch (e) {
      console.warn('chargeSparks error:', e);
      return false;
    }
  },

  /* ── Image / media upload to the shared PHP upload endpoint ─────────── */
  async uploadFile({ file, fileType = 'images', chatId, userId }) {
    const body = new FormData();
    body.append('file', file);
    body.append('chatId', chatId || 'chat');
    body.append('userId', userId || 'user');
    body.append('fileType', fileType);

    const res = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.success !== true || !data?.file_url) {
      throw new Error(data?.error || `Upload failed (${res.status})`);
    }
    let url = data.file_url;
    if (url.includes('unimarket-mw.com/uploads/')) {
      url = url.replace('unimarket-mw.com/uploads/', 'unimarket-mw.com/snellum/api/uploads/');
    }
    return url;
  },
};