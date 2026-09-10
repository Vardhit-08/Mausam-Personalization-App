import React, { useState } from 'react';
import imdLogo from '../assets/branding/imd-logo.png';
import govLogo from '../assets/branding/gov-logo.png';
import { Shield, Info, HelpCircle, Eye, Mail, X } from 'lucide-react';

export default function Footer({ onOpenTour }) {
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'privacy' | 'accessibility' | 'contact' | null

  return (
    <>
      <footer className="official-imd-footer" role="contentinfo" aria-label="Official IMD Footer">
        <div className="footer-main-container">
          <div className="footer-identity-group">
            <div className="footer-logos">
              <img src={govLogo} alt="Government of India" className="footer-gov-logo" />
              <img src={imdLogo} alt="India Meteorological Department" className="footer-imd-logo" />
            </div>
            <div className="footer-identity-text">
              <span className="footer-dept-name">India Meteorological Department</span>
              <span className="footer-ministry-name">Ministry of Earth Sciences • Government of India</span>
              <p className="footer-tagline">Mausam Personalization Engine — National Public Service Weather Platform</p>
            </div>
          </div>

          <div className="footer-links-group">
            <button
              type="button"
              className="footer-nav-link"
              onClick={() => setActiveModal('about')}
              title="About Mausam Personalization"
            >
              <Info size={13} className="inline-icon" />
              <span>About</span>
            </button>
            <button
              type="button"
              className="footer-nav-link"
              onClick={() => setActiveModal('accessibility')}
              title="Accessibility Statement"
            >
              <Eye size={13} className="inline-icon" />
              <span>Accessibility</span>
            </button>
            <button
              type="button"
              className="footer-nav-link"
              onClick={() => setActiveModal('privacy')}
              title="Privacy Policy"
            >
              <Shield size={13} className="inline-icon" />
              <span>Privacy</span>
            </button>
            {onOpenTour && (
              <button
                type="button"
                className="footer-nav-link"
                onClick={onOpenTour}
                title="Launch Guided Tour"
              >
                <HelpCircle size={13} className="inline-icon" />
                <span>Help / Tour</span>
              </button>
            )}
            <button
              type="button"
              className="footer-nav-link"
              onClick={() => setActiveModal('contact')}
              title="Official Support & Feedback"
            >
              <Mail size={13} className="inline-icon" />
              <span>Contact</span>
            </button>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© {new Date().getFullYear()} India Meteorological Department. All public service information is provided for citizen welfare and safety.</span>
          <span>Designed with high-contrast accessibility and deterministic meteorological models.</span>
        </div>
      </footer>

      {/* Institutional Information Dialog Modal */}
      {activeModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="footer-modal-title">
          <div className="modal-card footer-info-modal">
            <div className="modal-header">
              <h3 id="footer-modal-title" className="modal-title">
                {activeModal === 'about' && 'About Mausam Personalization'}
                {activeModal === 'accessibility' && 'Accessibility Commitment'}
                {activeModal === 'privacy' && 'Data Privacy Notice'}
                {activeModal === 'contact' && 'Official Contact Information'}
              </h3>
              <button
                type="button"
                className="btn-ghost modal-close-btn"
                onClick={() => setActiveModal(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body footer-modal-body">
              {activeModal === 'about' && (
                <div className="footer-modal-content">
                  <p>
                    The <strong>Mausam Weather Personalization Engine</strong> is an official public-service initiative
                    under the <strong>India Meteorological Department (IMD)</strong>, Ministry of Earth Sciences.
                  </p>
                  <p>
                    It bridges scientific meteorological models (synoptic forecasts, automatic weather stations, Doppler radar)
                    with user-centric operational guidance. By synthesizing real-time atmospheric variables into deterministic
                    composite scores for specific citizen personas (Outdoor Fitness, Commuters, Travelers, Health & Wellness, Agriculture),
                    Mausam provides plain-English, actionable safety and planning recommendations.
                  </p>
                </div>
              )}

              {activeModal === 'accessibility' && (
                <div className="footer-modal-content">
                  <p>
                    This platform adheres to Web Content Accessibility Guidelines (WCAG 2.1 AA) and government digital accessibility standards:
                  </p>
                  <ul className="footer-modal-list">
                    <li><strong>Color Contrast:</strong> Minimum 4.5:1 text-to-background contrast in both Dark and Light modes.</li>
                    <li><strong>Keyboard Navigation:</strong> Full focus ring visibility with logical tab indexing.</li>
                    <li><strong>Screen Readers:</strong> Semantic HTML5 landmarks, ARIA dialog roles, and descriptive labels.</li>
                    <li><strong>Reduced Motion:</strong> Respects the system <code>prefers-reduced-motion</code> setting.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="footer-modal-content">
                  <p>
                    <strong>Privacy by Design:</strong> Mausam does not track citizen location across the web or sell personal data.
                  </p>
                  <ul className="footer-modal-list">
                    <li>Authentication identity is secured through official Firebase Authentication.</li>
                    <li>City and station selections, persona preferences, and theme choices are stored locally on your device.</li>
                    <li>No third-party advertising cookies or trackers are utilized.</li>
                  </ul>
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="footer-modal-content">
                  <p>
                    For meteorological queries, national weather bulletins, and official public alerts:
                  </p>
                  <div className="footer-contact-block">
                    <strong>India Meteorological Department (IMD)</strong>
                    <span>Ministry of Earth Sciences, Government of India</span>
                    <span>Mausam Bhavan, Lodhi Road, New Delhi — 110003</span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
