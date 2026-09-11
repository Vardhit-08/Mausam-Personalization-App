/**
 * NotificationCenter.jsx
 * 
 * Context-Aware Notification Center for SIH26076 Mausam (Part 12).
 * 
 * Features:
 * - Unread count badge on bell icon.
 * - Categorized weather alerts with severity color coding (Severe / Warning / Info).
 * - Timestamps and read/unread visual distinction.
 * - Dismiss and Mark-all-as-read actions.
 * - Detail view expansion for deep advisory inspection.
 * - Contextual navigation: smooth scrolling to relevant dashboard anchor.
 * - Alert fatigue cooldown indicator.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  X,
  AlertTriangle,
  ShieldAlert,
  CloudRain,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import {
  getStoredNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
} from '../services/notificationAdapter';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => getStoredNotifications());
  const [expandedId, setExpandedId] = useState(null);
  const panelRef = useRef(null);

  // Sync notifications from storage periodically
  const refreshNotifications = () => {
    setNotifications(getStoredNotifications());
  };

  useEffect(() => {
    const interval = setInterval(refreshNotifications, 6000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length;
  const activeNotifications = notifications.filter((n) => !n.dismissed);

  const handleMarkAllRead = () => {
    const updated = markAllAsRead();
    setNotifications(updated);
  };

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    const updated = dismissNotification(id);
    setNotifications(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const handleItemToggle = (id) => {
    const updated = markAsRead(id);
    setNotifications(updated);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContextualNav = (alert, e) => {
    e.stopPropagation();
    markAsRead(alert.id);
    setIsOpen(false);

    const anchor = alert.targetAnchor || '#tour-insight-card';
    const targetElement = document.querySelector(anchor);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('nav-highlight-pulse');
      setTimeout(() => {
        targetElement.classList.remove('nav-highlight-pulse');
      }, 1800);
    }
  };

  return (
    <div className="notification-center-wrapper" ref={panelRef} id="tour-notification-center">
      <button
        type="button"
        className={`btn-notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Weather Notifications: ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        id="notification-bell-btn"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="notification-badge" id="notification-unread-count">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-panel" role="region" aria-label="Notifications panel">
          <div className="notification-panel-header">
            <div className="header-title-row">
              <h4>Proactive Weather Alerts</h4>
              <span className="active-count-tag">{activeNotifications.length} Active</span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-mark-all"
                onClick={handleMarkAllRead}
                title="Mark all as read"
                id="btn-mark-all-read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="notification-list">
            {activeNotifications.length === 0 ? (
              <div className="notification-empty-state">
                <CloudRain size={32} className="empty-icon text-muted" />
                <p>No active weather advisories for your area.</p>
              </div>
            ) : (
              activeNotifications.map((alert) => {
                const isExpanded = expandedId === alert.id;
                return (
                  <div
                    key={alert.id}
                    className={`notification-item ${alert.read ? 'read' : 'unread'} severity-${(alert.severity || 'info').toLowerCase()} ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => handleItemToggle(alert.id)}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleItemToggle(alert.id); }}
                  >
                    <div className="item-icon-box">
                      {alert.severity === 'SEVERE' ? (
                        <ShieldAlert size={18} className="text-rose" />
                      ) : alert.severity === 'WARNING' ? (
                        <AlertTriangle size={18} className="text-amber" />
                      ) : (
                        <Bell size={18} className="text-sky" />
                      )}
                    </div>

                    <div className="item-content">
                      <div className="item-title-row">
                        <h5 className="item-title">{alert.title}</h5>
                        <span className="item-time">{alert.timestamp}</span>
                      </div>
                      <p className="item-message">{alert.message}</p>

                      {/* Expandable Detail View */}
                      {isExpanded && (
                        <div className="notification-detail-box" style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#94a3b8' }}>Category:</span>
                            <strong style={{ color: alert.severity === 'SEVERE' ? '#fb7185' : alert.severity === 'WARNING' ? '#fbbf24' : '#38bdf8' }}>
                              {alert.category || alert.severity}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#94a3b8' }}>Status:</span>
                            <span>{alert.read ? 'Acknowledged' : 'Unread'}</span>
                          </div>
                          <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Target Anchor: {alert.targetAnchor || '#tour-insight-card'}
                          </div>
                        </div>
                      )}

                      <div className="item-action-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        {alert.actionLabel && (
                          <button
                            type="button"
                            className="item-action-link"
                            onClick={(e) => handleContextualNav(alert, e)}
                            title={`Navigate to ${alert.actionLabel}`}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>{alert.actionLabel}</span>
                            <ExternalLink size={12} />
                          </button>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          <span>{isExpanded ? 'Less' : 'Details'}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="item-dismiss-btn"
                      onClick={(e) => handleDismiss(alert.id, e)}
                      aria-label="Dismiss alert"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="notification-panel-footer">
            <Info size={12} className="inline-icon text-sky" />
            <span>Alert Fatigue Protection Active • 10m Cooldown</span>
          </div>
        </div>
      )}
    </div>
  );
}
