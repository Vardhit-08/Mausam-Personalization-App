import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AUTH_STATES,
  getAuthState,
  getCurrentUser,
  getActivePersona,
  setAuthenticatedUser,
  setPersona,
  clearSession,
} from './authStorage';
import { upsertUserProfile } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [authState, setAuthState] = useState(AUTH_STATES.LOGGED_OUT);
  const [currentUser, setCurrentUser] = useState({ name: '', email: '' });
  const [persona, setPersonaState] = useState(null);

  // Sync React state from localStorage
  const syncFromStorage = useCallback(() => {
    const currentAuthState = getAuthState();
    const user = getCurrentUser();
    const currentPersona = getActivePersona();

    setAuthState(currentAuthState);
    setCurrentUser(user);
    setPersonaState(currentPersona);
  }, []);

  // Initialization phase on app startup
  useEffect(() => {
    syncFromStorage();
    setIsInitializing(false);
  }, [syncFromStorage]);

  /**
   * Signup:
   * Saves isLoggedIn = "true", userName, userEmail.
   * Explicitly DOES NOT save activePersona.
   * Transitions to AUTHENTICATED_NO_PERSONA.
   */
  const signup = useCallback(({ name, email }) => {
    setAuthenticatedUser({ name, email });
    // Ensure activePersona is not set
    setPersona(null);
    syncFromStorage();
    return '/persona';
  }, [syncFromStorage]);

  /**
   * Login:
   * Saves isLoggedIn = "true", userEmail (and userName if not already set).
   * Preserves any existing activePersona.
   * If persona exists -> '/dashboard', else -> '/persona'.
   */
  const login = useCallback(({ email, name }) => {
    const existingUser = getCurrentUser();
    const displayName = name || existingUser.name || (email ? email.split('@')[0] : 'Demo User');
    setAuthenticatedUser({ name: displayName, email });

    syncFromStorage();

    const existingPersona = getActivePersona();
    if (existingPersona) {
      return '/dashboard';
    }
    return '/persona';
  }, [syncFromStorage]);

  /**
   * Select persona:
   * Sets activePersona to "health" or "agriculture".
   * Transitions to AUTHENTICATED.
   */
  const selectPersona = useCallback((chosenPersona) => {
    setPersona(chosenPersona);
    syncFromStorage();
    return '/dashboard';
  }, [syncFromStorage]);

  /**
   * Update Profile:
   * Validates display name (2 to 50 chars).
   * Updates localStorage user details and React state immediately.
   * Asynchronously synchronizes with Supabase profile table.
   */
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

    setAuthenticatedUser({ name: trimmed, email: currentUser?.email });
    syncFromStorage();

    try {
      const uid = currentUser?.email || 'demo-user-sih26076';
      await upsertUserProfile(uid, {
        name: trimmed,
        display_name: trimmed,
        persona: persona,
      });
    } catch (e) {
      console.warn('[AuthContext] Supabase profile sync warning:', e?.message || e);
    }

    return { success: true };
  }, [currentUser, persona, syncFromStorage]);

  /**
   * Logout:
   * Destroys ONLY the 4 auth keys from LocalStorage.
   * Transitions to LOGGED_OUT.
   */
  const logout = useCallback(() => {
    clearSession();
    syncFromStorage();
    return '/';
  }, [syncFromStorage]);

  const value = {
    isInitializing,
    authState,
    currentUser,
    persona,
    isLoggedIn: authState !== AUTH_STATES.LOGGED_OUT,
    hasPersona: authState === AUTH_STATES.AUTHENTICATED,
    signup,
    login,
    selectPersona,
    updateProfile,
    logout,
    refreshState: syncFromStorage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
