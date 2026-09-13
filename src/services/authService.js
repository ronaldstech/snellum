import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import { UserProfile } from '../models/userProfile';

/**
 * Authentication Service
 */
export const authService = {
  // Listen to Auth State
  onAuthChange(callback) {
    if (!auth) {
      // Fallback if not configured yet
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  // Email Sign In
  async signInWithEmail(email, password) {
    if (!auth) throw new Error('Firebase is not configured. Please add your credentials in .env');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Email Sign Up
  async signUpWithEmail({ fullName, email, password, phone }) {
    if (!auth || !db) throw new Error('Firebase is not configured. Please add your credentials in .env');
    
    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send verification email
    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.warn('Could not send email verification automatically:', e);
    }

    // Initialize user in Firestore collection 'users' matching Flutter ProfileService
    const profile = new UserProfile({
      uid: user.uid,
      firstName: fullName,
      email: email,
      phoneNumber: phone,
      isEmailVerified: false,
      isVerified: true,
      verificationStatus: 'verified',
      sparks: 100, // 100 signup bonus sparks matching Flutter app
    });

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      ...profile.toMap(),
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });

    return user;
  },

  // Google Sign In
  async signInWithGoogle() {
    if (!auth || !db) throw new Error('Firebase is not configured. Please add your credentials in .env');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      const profile = new UserProfile({
        uid: user.uid,
        firstName: user.displayName || 'Snellum Member',
        email: user.email,
        photos: user.photoURL ? [user.photoURL] : [],
        isEmailVerified: user.emailVerified,
        isVerified: true,
        verificationStatus: 'verified',
        sparks: 100,
      });

      await setDoc(userDocRef, {
        ...profile.toMap(),
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
    }

    return user;
  },

  // Send Password Reset
  async sendPasswordReset(email) {
    if (!auth) throw new Error('Firebase is not configured.');
    await sendPasswordResetEmail(auth, email);
  },

  // Sign Out
  async signOut() {
    if (auth) {
      await fbSignOut(auth);
    }
  },
};

/**
 * Profile & Firestore Discovery Service
 */
export const profileService = {
  // Fetch current user's profile document
  async getUserProfile(uid) {
    if (!db || !uid) return null;
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return UserProfile.fromFirestore(snap);
    }
    return null;
  },

  // Fetch real users from Firestore collection 'users' for Discovery Match
  async getDiscoveryUsers(currentUserId, count = 20, category) {
    if (!db) return [];
    try {
      const usersRef = collection(db, 'users');
      const q = category
        ? query(usersRef, where('lookingFor', 'array-contains', category), limit(count))
        : query(usersRef, limit(count));
      const querySnapshot = await getDocs(q);

      const users = [];
      querySnapshot.forEach((doc) => {
        // Exclude current user from feed
        if (doc.id !== currentUserId) {
          users.push(UserProfile.fromFirestore(doc));
        }
      });
      return users;
    } catch (error) {
      console.error('Error fetching discovery users from Firestore:', error);
      return [];
    }
  },
};
