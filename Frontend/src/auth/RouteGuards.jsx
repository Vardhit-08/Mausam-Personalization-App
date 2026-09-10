import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AUTH_STATES } from './authStorage';
import SplashLoader from '../components/SplashLoader';

/**
 * RootRoute guards the "/" path:
 * - LOGGED_OUT -> Landing page (renders children)
 * - AUTHENTICATED_NO_PERSONA -> redirect to /persona
 * - AUTHENTICATED -> redirect to /dashboard
 */
export function RootRoute({ children }) {
  const { authState, isInitializing } = useAuth();

  if (isInitializing) {
    return <SplashLoader />;
  }

  if (authState === AUTH_STATES.AUTHENTICATED) {
    return <Navigate to="/dashboard" replace />;
  }

  if (authState === AUTH_STATES.AUTHENTICATED_NO_PERSONA) {
    return <Navigate to="/persona" replace />;
  }

  return children;
}

/**
 * PublicOnlyRoute guards public auth pages (/login, /signup, /forgot-password):
 * - LOGGED_OUT -> renders public form
 * - AUTHENTICATED_NO_PERSONA -> redirect to /persona
 * - AUTHENTICATED -> redirect to /dashboard
 */
export function PublicOnlyRoute({ children }) {
  const { authState, isInitializing } = useAuth();

  if (isInitializing) {
    return <SplashLoader />;
  }

  if (authState === AUTH_STATES.AUTHENTICATED) {
    return <Navigate to="/dashboard" replace />;
  }

  if (authState === AUTH_STATES.AUTHENTICATED_NO_PERSONA) {
    return <Navigate to="/persona" replace />;
  }

  return children;
}

/**
 * PersonaRoute guards the "/persona" onboarding path:
 * - LOGGED_OUT -> redirect to /
 * - AUTHENTICATED_NO_PERSONA -> renders Persona onboarding
 * - AUTHENTICATED -> redirect to /dashboard (onboarding already complete)
 */
export function PersonaRoute({ children }) {
  const { authState, isInitializing } = useAuth();

  if (isInitializing) {
    return <SplashLoader />;
  }

  if (authState === AUTH_STATES.LOGGED_OUT) {
    return <Navigate to="/" replace />;
  }

  if (authState === AUTH_STATES.AUTHENTICATED) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * ProtectedRoute guards "/dashboard" and other authenticated features:
 * - LOGGED_OUT -> redirect to /
 * - AUTHENTICATED_NO_PERSONA -> redirect to /persona
 * - AUTHENTICATED -> renders protected dashboard
 */
export function ProtectedRoute({ children }) {
  const { authState, isInitializing } = useAuth();

  if (isInitializing) {
    return <SplashLoader />;
  }

  if (authState === AUTH_STATES.LOGGED_OUT) {
    return <Navigate to="/" replace />;
  }

  if (authState === AUTH_STATES.AUTHENTICATED_NO_PERSONA) {
    return <Navigate to="/persona" replace />;
  }

  return children;
}
