import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, AUTH_STATES } from './AuthContext';
import SplashLoader from '../components/SplashLoader';

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
