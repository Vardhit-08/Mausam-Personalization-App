import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  X,
  User,
  Mail,
  Shield,
  LogOut,
  HeartPulse,
  Wheat,
  Activity,
  Plane,
  Car,
  Check,
  AlertCircle,
  Loader2,
  Save,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const PERSONA_CONFIGS = {
  fitness: { label: 'Fitness', icon: Activity, pillClass: 'pill-fitness', desc: 'Workout windows & sweat risk' },
  traveler: { label: 'Traveler', icon: Plane, pillClass: 'pill-traveler', desc: 'Destination advisories & transit comfort' },
  health: { label: 'Health', icon: HeartPulse, pillClass: 'pill-health', desc: 'AQI, pollen & respiratory alerts' },
  commuter: { label: 'Commuter', icon: Car, pillClass: 'pill-commuter', desc: 'Corridor visibility & commute risk' },
  agriculture: { label: 'Agriculture', icon: Wheat, pillClass: 'pill-agri', desc: 'Soil moisture & spraying suitability' },
};

export default function ProfileModal({ isOpen, onClose, onLogout }) {
  const { currentUser, persona, selectPersona, updateProfile } = useAuth();

  // Local form editing state
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Preferences state
  const [unitPreference, setUnitPreference] = useState(() => {
    return localStorage.getItem('mausam_pref_unit') || 'celsius';
  });
  const [alertPreference, setAlertPreference] = useState(() => {
    return localStorage.getItem('mausam_pref_alert') || 'critical';
  });

  // Re-synchronize local form state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setNameInput(currentUser?.name || '');
      setNameError('');
      setSaveSuccess(false);
      setSaveError('');
      setUnitPreference(localStorage.getItem('mausam_pref_unit') || 'celsius');
      setAlertPreference(localStorage.getItem('mausam_pref_alert') || 'critical');
    }
  }, [isOpen, currentUser]);

  // Support Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeConfig = persona ? PERSONA_CONFIGS[persona.toLowerCase()] : null;
  const ActiveIcon = activeConfig ? activeConfig.icon : null;

  const handleNameChange = (e) => {
    setNameInput(e.target.value);
    if (nameError) setNameError('');
    if (saveSuccess) setSaveSuccess(false);
  };

  const validateName = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Display name cannot be empty.';
    }
    if (trimmed.length < 2) {
      return 'Display name must be at least 2 characters.';
    }
    if (trimmed.length > 50) {
      return 'Display name cannot exceed 50 characters.';
    }
    return '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errorMsg = validateName(nameInput);
    if (errorMsg) {
      setNameError(errorMsg);
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const res = await updateProfile({ name: nameInput.trim() });
      if (!res?.success) {
        setSaveError(res?.error || 'Failed to update profile.');
        setIsSaving(false);
        return;
      }

      // Persist preferences
      localStorage.setItem('mausam_pref_unit', unitPreference);
      localStorage.setItem('mausam_pref_alert', alertPreference);

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3500);
    } catch (err) {
      setSaveError(err?.message || 'Error occurred while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNameInput(currentUser?.name || '');
    setNameError('');
    setSaveSuccess(false);
    setSaveError('');
    setUnitPreference(localStorage.getItem('mausam_pref_unit') || 'celsius');
    setAlertPreference(localStorage.getItem('mausam_pref_alert') || 'critical');
  };

  const hasUnsavedChanges =
    nameInput.trim() !== (currentUser?.name || '').trim() ||
    unitPreference !== (localStorage.getItem('mausam_pref_unit') || 'celsius') ||
    alertPreference !== (localStorage.getItem('mausam_pref_alert') || 'critical');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card profile-settings-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h3 id="profile-modal-title" className="modal-title">Profile & Settings</h3>
            <span className="modal-subtitle">Canonical Session & Meteorological Persona Configuration</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close Profile"
            id="profile-close-button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body profile-modal-body">
          {/* User Identity Header Card */}
          <div className="profile-badge-row">
            <div className="profile-avatar-large">
              <User size={32} />
            </div>
            <div className="profile-avatar-info">
              <h4 className="profile-display-name" id="profile-current-display-name">
                {currentUser?.name || 'Demo User'}
              </h4>
              <p className="profile-display-email">{currentUser?.email || 'demo@example.com'}</p>
              <div className="profile-active-persona-indicator">
                {activeConfig ? (
                  <span className={`pill ${activeConfig.pillClass}`} id="profile-persona-value">
                    <ActiveIcon size={13} /> {activeConfig.label} Active
                  </span>
                ) : (
                  <span className="pill pill-none" id="profile-persona-value">None Selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Status Banners */}
          {saveSuccess && (
            <div className="profile-status-banner banner-success" role="status" id="profile-save-success">
              <CheckCircle2 size={16} />
              <span>Profile & preferences updated successfully.</span>
            </div>
          )}
          {saveError && (
            <div className="profile-status-banner banner-error" role="alert" id="profile-save-error">
              <AlertCircle size={16} />
              <span>{saveError}</span>
            </div>
          )}

          {/* Display Name Editing Field */}
          <div className="profile-form-section">
            <label htmlFor="profile-name-input" className="profile-section-label">
              <User size={15} />
              <span>Display Name</span>
            </label>
            <div className="profile-input-container">
              <input
                id="profile-name-input"
                type="text"
                className={`profile-text-input ${nameError ? 'input-has-error' : ''}`}
                value={nameInput}
                onChange={handleNameChange}
                placeholder="Enter your name"
                maxLength={50}
                autoComplete="name"
              />
            </div>
            {nameError && (
              <div className="profile-field-error" id="profile-name-error" role="alert">
                <AlertCircle size={14} />
                <span>{nameError}</span>
              </div>
            )}
            <span className="profile-field-hint">
              Used in greetings, personalized advisories, and weather bulletin headers.
            </span>
          </div>

          {/* Read-Only Firebase Identity Details */}
          <div className="profile-form-section">
            <div className="profile-section-label-row">
              <span className="profile-section-label">
                <Mail size={15} />
                <span>Authenticated Email & Identity</span>
              </span>
              <span className="badge-identity-verified">
                <Shield size={12} /> Firebase Verified
              </span>
            </div>
            <div className="profile-readonly-card">
              <div className="readonly-row">
                <span className="readonly-meta-label">Email:</span>
                <span className="readonly-meta-value" id="profile-email-value">
                  {currentUser?.email || 'demo@example.com'}
                </span>
              </div>
              <div className="readonly-row">
                <span className="readonly-meta-label">Auth UID:</span>
                <span className="readonly-meta-value readonly-code-value" id="profile-uid-value">
                  {currentUser?.email ? `usr_fb_${btoa(currentUser.email).replace(/=/g, '').slice(0, 14).toLowerCase()}` : 'demo-user-sih26076'}
                </span>
              </div>
              <span className="readonly-explainer">
                Identity credentials and session ownership are managed securely by Firebase Authentication (Read-Only).
              </span>
            </div>
          </div>

          {/* Active Persona Switching */}
          <div className="profile-form-section">
            <div className="profile-section-label-row">
              <span className="profile-section-label">
                <Shield size={15} />
                <span>Current Persona</span>
              </span>
              <span className="profile-section-note">Instant recalculation • Preserves current city</span>
            </div>
            <div className="persona-quick-grid" role="radiogroup" aria-label="Select active persona">
              {Object.entries(PERSONA_CONFIGS).map(([key, cfg]) => {
                const BtnIcon = cfg.icon;
                const isActive = persona?.toLowerCase() === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={`btn-persona-tile ${isActive ? 'active' : ''}`}
                    onClick={() => selectPersona(key)}
                    id={`switch-persona-${key}`}
                    title={cfg.desc}
                  >
                    <div className="persona-tile-icon">
                      <BtnIcon size={18} />
                    </div>
                    <div className="persona-tile-info">
                      <span className="persona-tile-title">{cfg.label}</span>
                      <span className="persona-tile-desc">{cfg.desc}</span>
                    </div>
                    {isActive && (
                      <div className="persona-tile-active-badge">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Application Preferences */}
          <div className="profile-form-section">
            <span className="profile-section-label">
              <Shield size={15} />
              <span>Application Preferences</span>
            </span>
            <div className="preferences-cards-grid">
              <div className="pref-box">
                <span className="pref-box-title">Temperature Units</span>
                <div className="pref-btn-group" role="group" aria-label="Temperature Units">
                  <button
                    type="button"
                    className={`btn-pref-option ${unitPreference === 'celsius' ? 'active' : ''}`}
                    onClick={() => setUnitPreference('celsius')}
                    id="pref-unit-celsius"
                  >
                    °C Celsius
                  </button>
                  <button
                    type="button"
                    className={`btn-pref-option ${unitPreference === 'fahrenheit' ? 'active' : ''}`}
                    onClick={() => setUnitPreference('fahrenheit')}
                    id="pref-unit-fahrenheit"
                  >
                    °F Fahrenheit
                  </button>
                </div>
              </div>

              <div className="pref-box">
                <span className="pref-box-title">Advisory Alert Filter</span>
                <div className="pref-btn-group" role="group" aria-label="Advisory Alert Filter">
                  <button
                    type="button"
                    className={`btn-pref-option ${alertPreference === 'critical' ? 'active' : ''}`}
                    onClick={() => setAlertPreference('critical')}
                    id="pref-alert-critical"
                  >
                    Critical Only
                  </button>
                  <button
                    type="button"
                    className={`btn-pref-option ${alertPreference === 'all' ? 'active' : ''}`}
                    onClick={() => setAlertPreference('all')}
                    id="pref-alert-all"
                  >
                    All Bulletins
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="profile-form-actions">
            <button
              type="button"
              className="btn btn-secondary-outline"
              onClick={handleCancel}
              disabled={isSaving || !hasUnsavedChanges}
              id="profile-cancel-btn"
            >
              <RotateCcw size={14} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
              id="profile-save-btn"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="spinner" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="modal-footer">
          <span className="footer-session-note">Mausam SIH26076 • IMD Regional Centre</span>
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            id="modal-logout-button"
            onClick={onLogout}
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
