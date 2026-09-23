import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';
import { UserProfile } from '../models/userProfile';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Current screen state: 'landing' | 'signin' | 'signup' | 'phone_auth' | 'verify_email' | 'authenticated'
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await profileService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            setUserProfile(
              new UserProfile({
                uid: firebaseUser.uid,
                firstName: firebaseUser.displayName || 'Snellum Member',
                email: firebaseUser.email,
                photos: firebaseUser.photoURL ? [firebaseUser.photoURL] : [],
                isEmailVerified: firebaseUser.emailVerified,
              })
            );
          }
          setCurrentScreen('authenticated');
        } catch (e) {
          console.error('Error fetching profile:', e);
          setCurrentScreen('authenticated');
        }
      } else {
        setUser(null);
        setUserProfile(null);
        // Only return to sign in if currently on dashboard
        setCurrentScreen((prev) => (prev === 'authenticated' ? 'signin' : prev));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    if (!isFirebaseConfigured) {
      // Fallback demo user if .env is not yet populated
      const mockProfile = new UserProfile({
        uid: 'demo_user_1',
        firstName: email.split('@')[0],
        email: email,
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'],
        isVerified: true,
        sparks: 150,
      });
      setUser({ uid: 'demo_user_1', email });
      setUserProfile(mockProfile);
      setCurrentScreen('authenticated');
      showToast(`Signed in as ${mockProfile.displayName} (Demo mode)`, 'info');
      return;
    }

    const fbUser = await authService.signInWithEmail(email, password);
    showToast('Signed in successfully!', 'success');
    return fbUser;
  };

  const signUpWithEmail = async ({ fullName, email, phone, password }) => {
    if (!isFirebaseConfigured) {
      const mockProfile = new UserProfile({
        uid: 'demo_user_' + Date.now(),
        firstName: fullName,
        email: email,
        phoneNumber: phone,
        isVerified: true,
        sparks: 100,
      });
      setUser({ uid: mockProfile.uid, email });
      setUserProfile(mockProfile);
      setCurrentScreen('verify_email');
      showToast('Account created! (Demo mode)', 'success');
      return;
    }

    const fbUser = await authService.signUpWithEmail({ fullName, email, phone, password });
    setCurrentScreen('verify_email');
    showToast('Account registered! Please check your email.', 'success');
    return fbUser;
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      const mockProfile = new UserProfile({
        uid: 'google_demo_1',
        firstName: 'Elena Vance',
        email: 'elena.vance@example.com',
        photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80'],
        isVerified: true,
        sparks: 200,
      });
      setUser({ uid: 'google_demo_1', email: 'elena.vance@example.com' });
      setUserProfile(mockProfile);
      setCurrentScreen('authenticated');
      showToast('Signed in with Google! (Demo mode)', 'info');
      return;
    }

    const fbUser = await authService.signInWithGoogle();
    showToast('Signed in with Google!', 'success');
    return fbUser;
  };

  const loginWithPhoneOtp = async (phone, otp) => {
    // Phone OTP flow
    const mockProfile = new UserProfile({
      uid: 'phone_' + Date.now(),
      firstName: 'Snellum Member',
      phoneNumber: phone,
      isVerified: true,
      sparks: 100,
    });
    setUser({ uid: mockProfile.uid, phoneNumber: phone });
    setUserProfile(mockProfile);
    setCurrentScreen('authenticated');
    showToast('Phone verified successfully!', 'success');
  };

  const sendPasswordReset = async (email) => {
    if (isFirebaseConfigured) {
      await authService.sendPasswordReset(email);
    }
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setUserProfile(null);
    setCurrentScreen('landing');
    showToast('You have been signed out.', 'info');
  };

  const spendSparks = (amount) => {
    setUserProfile((current) => {
      if (!current) return current;
      const balance = Number(current.sparks ?? current.credits ?? 0);
      return new UserProfile({ ...current, sparks: Math.max(0, balance - amount), credits: Math.max(0, balance - amount) });
    });
  };

  // Persist discovery filters locally + to Firestore, then refresh the profile object
  // so the swipe deck re-filters immediately (mirrors Flutter's _swipesVersion bump).
  const saveDiscoveryFilters = async (filters) => {
    setUserProfile((current) => (current ? new UserProfile({ ...current, ...filters }) : current));
    if (user?.uid && isFirebaseConfigured) {
      try {
        await profileService.updateDiscoveryFilters(user.uid, filters);
        return true;
      } catch (e) {
        console.error('Error saving discovery filters:', e);
        return false;
      }
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        user,
        userProfile,
        loading,
        isFirebaseConfigured,
        toastMessage,
        showToast,
        spendSparks,
        saveDiscoveryFilters,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        loginWithPhoneOtp,
        sendPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
