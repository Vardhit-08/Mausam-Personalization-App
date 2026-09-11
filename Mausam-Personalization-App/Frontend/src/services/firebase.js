/**
 * firebase.js
 * 
 * Centralized Firebase configuration and Authentication service for SIH26076 Mausam.
 * Firebase Authentication is the SOLE source of truth for user authentication and identity.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

// Standard Firebase Client Config (supports .env or fallback demo config for robust offline/hackathon staging)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyMausamSIH26076Production1',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mausam-sih26076.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mausam-sih26076',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mausam-sih26076.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '102938475610',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:102938475610:web:8a9b0c1d2e3f4a5b',
};

// Initialize or reuse Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Enable local persistence so authenticated sessions survive browser refresh
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[Firebase Auth] Persistence set warning:', err);
});

/**
 * Sign up a new user with Email, Password, and Display Name
 */
export async function registerWithEmail(email, password, displayName) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && credential.user) {
      await updateProfile(credential.user, { displayName });
    }
    return { user: credential.user, error: null };
  } catch (error) {
    // If network or offline demo configuration is triggered, provide friendly fallback
    console.error('[Firebase Auth] Sign up error:', error);
    return { user: null, error: formatAuthError(error) };
  }
}

/**
 * Sign in an existing user with Email and Password
 */
export async function loginWithEmail(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { user: credential.user, error: null };
  } catch (error) {
    console.error('[Firebase Auth] Sign in error:', error);
    return { user: null, error: formatAuthError(error) };
  }
}

/**
 * Sign out the currently authenticated user
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    console.error('[Firebase Auth] Sign out error:', error);
    return { success: false, error: formatAuthError(error) };
  }
}

/**
 * Subscribe to Firebase authentication state changes
 */
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * Helper to produce clean, human-readable error messages for UI
 */
function formatAuthError(error) {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in.';
    case 'auth/invalid-email':
      return 'The email address provided is not formatted correctly.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes before trying again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export default auth;
