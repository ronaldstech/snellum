import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { notificationService } from './notificationService';
import { toDate } from '../models/chatModel';

/**
 * Swipe / Likes Service
 *
 * Mirrors the Flutter app's ProfileService:
 *  - Swipes live in the `swipes` collection, doc id `${fromId}_${toId}`,
 *    with fields `fromId`, `toId`, `type` ('like' | 'dislike') and `timestamp`.
 *  - A mutual like creates a doc in `matches` (`uids: [a, b]`), which is what
 *    the chat list "New Matches" strip reads.
 *  - Received likes = swipes where `toId == me` and `type == 'like'`.
 */
export function getMatchId(uid1, uid2) {
  const sorted = [String(uid1), String(uid2)].sort();
  return `${sorted[0]}_${sorted[1]}`;
}

export const swipeService = {
  /**
   * Records a swipe. Returns:
   *  - `true`  for a 'like' that results in a brand-new match, or for a
   *    'dislike' where the other person had already liked you (missed match).
   *  - `false` otherwise.
   */
  async recordSwipe({ fromId, toId, type, senderName }) {
    if (!db || !isFirebaseConfigured || !fromId || !toId || fromId === toId) {
      return false;
    }
    try {
      let isNewMatch = false;
      const swipeRef = doc(db, 'swipes', `${fromId}_${toId}`);
      await setDoc(swipeRef, {
        fromId,
        toId,
        type,
        timestamp: serverTimestamp(),
      });

      if (type === 'like') {
        const reverseQ = query(
          collection(db, 'swipes'),
          where('fromId', '==', toId),
          where('toId', '==', fromId),
          where('type', '==', 'like'),
          limit(1)
        );
        const reverseSnap = await getDocs(reverseQ);

        if (!reverseSnap.empty) {
          const matchRef = doc(db, 'matches', getMatchId(fromId, toId));
          const matchSnap = await getDoc(matchRef);
          if (!matchSnap.exists()) {
            await setDoc(matchRef, {
              uids: [fromId, toId],
              timestamp: serverTimestamp(),
            });
            await notificationService.sendNotification(toId, {
              senderId: fromId,
              senderName: senderName || 'Someone',
              type: 'match',
            });
            isNewMatch = true;
          }
        } else {
          await notificationService.sendNotification(toId, {
            senderId: fromId,
            senderName: senderName || 'Someone',
            type: 'like',
          });
        }
      }

      if (type === 'dislike') {
        const reverseQ = query(
          collection(db, 'swipes'),
          where('fromId', '==', toId),
          where('toId', '==', fromId),
          where('type', '==', 'like'),
          limit(1)
        );
        const reverseSnap = await getDocs(reverseQ);
        if (!reverseSnap.empty) return true; // missed match
      }

      return isNewMatch;
    } catch (e) {
      console.warn('recordSwipe error:', e);
      return false;
    }
  },

  /**
   * Streams the swipes a user has received ('like' only), newest first.
   * Sorted in memory (Firestore `orderBy` would need a composite index).
   */
  streamLikesReceived(uid, callback) {
    if (!db || !isFirebaseConfigured || !uid) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'swipes'),
      where('toId', '==', uid),
      where('type', '==', 'like')
    );

    return onSnapshot(
      q,
      (snap) => {
        const likes = snap.docs
          .map((d) => ({
            id: d.id,
            fromId: d.data().fromId || '',
            toId: d.data().toId || '',
            type: d.data().type || 'like',
            timestamp: toDate(d.data().timestamp) || null,
          }))
          .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
        callback(likes);
      },
      (err) => {
        console.warn('Likes stream error:', err);
        callback([]);
      }
    );
  },
};