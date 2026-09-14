/**
 * Chat message + chat meta helpers matching Flutter chat_model.dart
 */

export const MESSAGE_TYPE = {
  text: 'text',
  image: 'image',
  voice: 'voice',
  gif: 'gif',
  sticker: 'sticker',
  call: 'call',
  meetup: 'meetup',
  gift: 'gift',
};

/** Firestore Timestamp or Date or server string -> Date */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Map a raw message doc to a normalized message object */
export function mapMessage(doc) {
  const data = doc?.data ? doc.data() : doc;
  const rawText = data?.text || '';
  const isSuperRequest =
    (data?.isSuperRequest === true) ||
    rawText.startsWith('🔥 Super Request:') ||
    rawText.includes('Super Request');

  return {
    id: doc.id,
    senderId: data?.senderId || '',
    text: rawText,
    timestamp: toDate(data?.timestamp) || new Date(),
    isRead: data?.isRead === true,
    isDelivered: data?.isDelivered !== false,
    messageType: data?.messageType || data?.type || MESSAGE_TYPE.text,
    mediaUrl: data?.mediaUrl || null,
    voiceDuration: data?.voiceDuration ? Number(data.voiceDuration) : null,
    isEdited: data?.isEdited === true,
    isDeleted: data?.isDeleted === true,
    giftType: data?.giftType || data?.giftData?.name || null,
    giftValue: data?.giftValue ? Number(data.giftValue) : data?.giftData?.cost || null,
    giftData: data?.giftData || null,
    replyToId: data?.replyToId || null,
    replyToText: data?.replyToText || null,
    replyToSenderName: data?.replyToSenderName || null,
    isSuperRequest,
  };
}

/** Map a raw chat meta doc to a normalized chat object */
export function mapChat(doc, myUid) {
  const data = doc?.data ? doc.data() : doc;
  const participants = Array.isArray(data?.participants) ? data.participants : [];
  const unreadMap = data?.unreadCount || {};

  let unread = 0;
  if (typeof unreadMap === 'object') {
    const val = unreadMap[myUid];
    if (typeof val === 'number') unread = val;
    else if (typeof val === 'string') unread = Number(val) || 0;
  }

  return {
    id: doc.id,
    participants,
    otherUid: participants.find((p) => p !== myUid) || '',
    lastMessage: data?.lastMessage || '',
    lastMessageTime: toDate(data?.lastMessageTime),
    lastMessageSenderId: data?.lastMessageSenderId || '',
    unreadCount: unread,
    isSuperRequest: data?.isSuperRequest === true,
    requestStatus: data?.requestStatus || null,
    requestSenderId: data?.requestSenderId || null,
    deletedBy: Array.isArray(data?.deletedBy) ? data.deletedBy : [],
    participantDetails: data?.participantDetails || {},
    typingStatus: data?.typingStatus || {},
  };
}

/* ─── Date formatting helpers ───────────────────────────── */

export function formatClockTime(date) {
  const d = toDate(date) || new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatChatTime(date) {
  const d = toDate(date);
  if (!d) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const sameYesterday = d.toDateString() === yesterday.toDateString();

  if (sameDay) return formatClockTime(d);
  if (sameYesterday) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatDateDivider(date) {
  const d = toDate(date);
  if (!d) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const sameYesterday = d.toDateString() === yesterday.toDateString();

  if (sameDay) return 'Today';
  if (sameYesterday) return 'Yesterday';
  return d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}