import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_SETTINGS = {
  showAge: true,
  showDistance: true,
  hideProfile: false,
  allowMessages: true,
};

export const settingsService = {
  async getSettings(uid) {
    if (!db || !uid) return DEFAULT_SETTINGS;

    const snapshot = await getDoc(doc(db, 'users', uid, 'settings', 'preferences'));
    return {
      ...DEFAULT_SETTINGS,
      ...(snapshot.exists() ? snapshot.data() : {}),
    };
  },

  async saveSettings(uid, settings) {
    if (!db || !uid) return;

    await setDoc(
      doc(db, 'users', uid, 'settings', 'preferences'),
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },
};
