import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase';
import { upsertUserProfile } from '../services/supabase';

export const AUTH_STATES = {
  LOGGED_OUT: 'LOGGED_OUT',
  AUTHENTICATED_NO_PERSONA: 'AUTHENTICATED_NO_PERSONA',
  AUTHENTICATED: 'AUTHENTICATED',
};

const AuthContext = createContext(null);

export function formatAuthError(error) {
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
    case 'auth/popup-closed-by-user':
      return 'Sign in popup was closed before completing authentication.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [persona, setPersonaState] = useState(null);
  const [authState, setAuthState] = useState(AUTH_STATES.LOGGED_OUT);

  // Subscribe to Firebase onAuthStateChanged as the SINGLE source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Attach .name compatibility property matching .displayName
        firebaseUser.name = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User');
        
        // Retrieve persistent user persona from user profile storage
        const savedPersona = localStorage.getItem(`mausam_persona_${firebaseUser.uid}`) || localStorage.getItem('activePersona');
        
        setCurrentUser(firebaseUser);
        setPersonaState(savedPersona || null);
        
        if (savedPersona && savedPersona.trim() !== '') {
          setAuthState(AUTH_STATES.AUTHENTICATED);
        } else {
          setAuthState(AUTH_STATES.AUTHENTICATED_NO_PERSONA);
        }
      } else {
        setCurrentUser(null);
        setPersonaState(null);
        setAuthState(AUTH_STATES.LOGGED_OUT);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (name && name.trim()) {
        await firebaseUpdateProfile(user, { displayName: name.trim() });
        user.name = name.trim();
      }

      // Persona is unassigned for new user accounts
      localStorage.removeItem(`mausam_persona_${user.uid}`);
      localStorage.removeItem('activePersona');
      setPersonaState(null);
      setAuthState(AUTH_STATES.AUTHENTICATED_NO_PERSONA);
      setCurrentUser(user);

      return { success: true, targetRoute: '/persona' };
    } catch (error) {
      return { success: false, error: formatAuthError(error) };
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      user.name = user.displayName || (user.email ? user.email.split('@')[0] : 'User');

      const savedPersona = localStorage.getItem(`mausam_persona_${user.uid}`) || localStorage.getItem('activePersona');
      setPersonaState(savedPersona || null);
      setCurrentUser(user);

      const targetRoute = savedPersona ? '/dashboard' : '/persona';
      setAuthState(savedPersona ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.AUTHENTICATED_NO_PERSONA);

      return { success: true, targetRoute };
    } catch (error) {
      return { success: false, error: formatAuthError(error) };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      user.name = user.displayName || (user.email ? user.email.split('@')[0] : 'User');

      const savedPersona = localStorage.getItem(`mausam_persona_${user.uid}`) || localStorage.getItem('activePersona');
      setPersonaState(savedPersona || null);
      setCurrentUser(user);

      const targetRoute = savedPersona ? '/dashboard' : '/persona';
      setAuthState(savedPersona ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.AUTHENTICATED_NO_PERSONA);

      return { success: true, targetRoute };
    } catch (error) {
      return { success: false, error: formatAuthError(error) };
    }
  }, []);

  const selectPersona = useCallback(async (chosenPersona) => {
    setPersonaState(chosenPersona);
    if (auth.currentUser?.uid) {
      localStorage.setItem(`mausam_persona_${auth.currentUser.uid}`, chosenPersona);
    }
    localStorage.setItem('activePersona', chosenPersona);
    setAuthState(AUTH_STATES.AUTHENTICATED);

    if (auth.currentUser?.uid) {
      try {
        await upsertUserProfile(auth.currentUser.uid, {
          name: auth.currentUser.displayName || auth.currentUser.email,
          display_name: auth.currentUser.displayName,
          persona: chosenPersona,
        });
      } catch (e) {
        console.warn('[AuthContext] Supabase profile sync warning:', e?.message || e);
      }
    }

    return '/dashboard';
  }, []);

  const updateProfile = useCallback(async ({ name }) => {
    if (typeof name !== 'string') {
      return { success: false, error: 'Invalid name provided' };
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { success: false, error: 'Display name must be at least 2 characters' };
    }
    if (trimmed.length > 50) {
      return { success: false, error: 'Display name cannot exceed 50 characters' };
    }

    try {
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: trimmed });
        auth.currentUser.name = trimmed;
        setCurrentUser({ ...auth.currentUser, name: trimmed, displayName: trimmed });
      }

      if (auth.currentUser?.uid) {
        await upsertUserProfile(auth.currentUser.uid, {
          name: trimmed,
          display_name: trimmed,
          persona: persona,
        });
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  }, [persona]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[AuthContext] SignOut error:', err);
    }
    setCurrentUser(null);
    setPersonaState(null);
    setAuthState(AUTH_STATES.LOGGED_OUT);

    // Clean legacy session keys if present
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');

    return '/';
  }, []);

  const value = {
    authState,
    isInitializing,
    currentUser,
    user: currentUser, // alias for standard Firebase consumer code
    persona,
    signup,
    login,
    loginWithGoogle,
    selectPersona,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
