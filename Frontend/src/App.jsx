import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import {
  RootRoute,
  PublicOnlyRoute,
  PersonaRoute,
  ProtectedRoute,
} from './auth/RouteGuards';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PersonaPage from './pages/PersonaPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root route:
              - Logged Out -> LandingPage
              - Logged In + No Persona -> /persona
              - Logged In + Persona -> /dashboard */}
          <Route
            path="/"
            element={
              <RootRoute>
                <LandingPage />
              </RootRoute>
            }
          />

          {/* Public Auth routes:
              - Logged Out -> Form
              - Logged In + No Persona -> /persona
              - Logged In + Persona -> /dashboard */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            }
          />

          {/* Persona onboarding route:
              - Logged Out -> /
              - Logged In + No Persona -> PersonaPage
              - Logged In + Persona -> /dashboard */}
          <Route
            path="/persona"
            element={
              <PersonaRoute>
                <PersonaPage />
              </PersonaRoute>
            }
          />

          {/* Protected dashboard route:
              - Logged Out -> /
              - Logged In + No Persona -> /persona
              - Logged In + Persona -> DashboardPage */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
