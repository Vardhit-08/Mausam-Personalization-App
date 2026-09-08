import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { X, User, Mail, Shield, LogOut, HeartPulse, Wheat } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, onLogout }) {
  const { currentUser, persona, selectPersona } = useAuth();

  if (!isOpen) return null;

  const formatPersona = (p) => {
    if (!p) return 'Not Selected';
    if (p.toLowerCase() === 'health') return 'Health';
    if (p.toLowerCase() === 'agriculture') return 'Agriculture';
    return p;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h3 id="profile-modal-title" className="modal-title">Profile & Settings</h3>
            <span className="modal-subtitle">Canonical Session & Persona Details</span>
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

        <div className="modal-body">
          <div className="profile-badge-row">
            <div className="profile-avatar-large">
              <User size={36} />
            </div>
            <div className="profile-avatar-info">
              <h4 className="profile-display-name">{currentUser.name || 'Demo User'}</h4>
              <p className="profile-display-email">{currentUser.email || 'demo@example.com'}</p>
            </div>
          </div>

          <div className="profile-details-list">
            <div className="profile-detail-item">
              <span className="detail-label">
                <User size={15} />
                <span>Name</span>
              </span>
              <span className="detail-value" id="profile-name-value">
                {currentUser.name || 'Demo User'}
              </span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">
                <Mail size={15} />
                <span>Email</span>
              </span>
              <span className="detail-value" id="profile-email-value">
                {currentUser.email || 'demo@example.com'}
              </span>
            </div>

            <div className="profile-detail-item">
              <span className="detail-label">
                <Shield size={15} />
                <span>Current Persona</span>
              </span>
              <div className="detail-persona-badge" id="profile-persona-value">
                {persona === 'health' ? (
                  <span className="pill pill-health">
                    <HeartPulse size={14} /> Health
                  </span>
                ) : persona === 'agriculture' ? (
                  <span className="pill pill-agri">
                    <Wheat size={14} /> Agriculture
                  </span>
                ) : (
                  <span className="pill pill-none">None Selected</span>
                )}
              </div>
            </div>
          </div>

          <div className="persona-quick-switch">
            <label className="switch-label">Switch Active Persona:</label>
            <div className="switch-buttons">
              <button
                type="button"
                className={`btn-switch ${persona === 'health' ? 'active' : ''}`}
                onClick={() => selectPersona('health')}
                id="switch-persona-health"
              >
                <HeartPulse size={15} />
                <span>Health</span>
              </button>
              <button
                type="button"
                className={`btn-switch ${persona === 'agriculture' ? 'active' : ''}`}
                onClick={() => selectPersona('agriculture')}
                id="switch-persona-agriculture"
              >
                <Wheat size={15} />
                <span>Agriculture</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-danger-outline"
            id="modal-logout-button"
            onClick={onLogout}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
