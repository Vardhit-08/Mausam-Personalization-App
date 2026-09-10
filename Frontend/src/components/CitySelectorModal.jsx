import React, { useState, useEffect, useMemo } from 'react';
import { CITIES_DATA } from '../data/citiesData';
import {
  Search,
  MapPin,
  X,
  Check,
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
} from 'lucide-react';

const REGION_TABS = [
  { id: 'all', label: 'All Stations' },
  { id: 'metro', label: 'Metros' },
  { id: 'west', label: 'Western' },
  { id: 'north', label: 'Northern' },
  { id: 'south-east', label: 'Southern & Eastern' },
];

const METRO_CITY_IDS = ['delhi', 'mumbai', 'bengaluru', 'chennai', 'kolkata', 'hyderabad'];
const WEST_CITY_IDS = ['mumbai', 'pune', 'nanded', 'nagpur', 'ahmedabad', 'bhopal'];
const NORTH_CITY_IDS = ['delhi', 'jaipur', 'lucknow', 'srinagar'];
const SOUTH_EAST_CITY_IDS = ['bengaluru', 'chennai', 'hyderabad', 'kolkata', 'guwahati'];

export default function CitySelectorModal({ isOpen, onClose, selectedCityId, onSelectCity }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCities = useMemo(() => {
    return CITIES_DATA.filter((city) => {
      if (activeTab === 'metro' && !METRO_CITY_IDS.includes(city.cityId)) return false;
      if (activeTab === 'west' && !WEST_CITY_IDS.includes(city.cityId)) return false;
      if (activeTab === 'north' && !NORTH_CITY_IDS.includes(city.cityId)) return false;
      if (activeTab === 'south-east' && !SOUTH_EAST_CITY_IDS.includes(city.cityId)) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        city.cityName.toLowerCase().includes(query) ||
        city.state.toLowerCase().includes(query) ||
        city.cityId.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, activeTab]);

  if (!isOpen) return null;

  const handlePickCity = (city) => {
    onSelectCity(city);
    onClose();
  };

  const getWeatherIcon = (condition = '') => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain')) return <CloudRain size={16} className="text-blue" />;
    if (cond.includes('cloud')) return <Cloud size={16} className="text-muted" />;
    if (cond.includes('clear') || cond.includes('sun')) return <Sun size={16} className="text-amber" />;
    return <CloudSun size={16} className="text-teal" />;
  };

  return (
    <div className="modal-backdrop city-modal-backdrop" onClick={onClose}>
      <div
        className="modal-card city-selector-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-selector-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h3 id="city-selector-title" className="modal-title">Select Weather Station</h3>
            <span className="modal-subtitle">Official IMD Meteorological Stations Across India</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close City Selector"
            id="city-selector-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body city-selector-body">
          <div className="search-bar-group">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by city or state (e.g. Pune, Delhi, Assam)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              id="city-search-input"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear Search"
                id="city-clear-search-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="city-region-tabs" role="tablist">
            {REGION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`city-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                id={`city-tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="city-filter-meta">
            <span className="stations-count-label">
              Showing <strong>{filteredCities.length}</strong> of {CITIES_DATA.length} IMD Stations
            </span>
            {searchQuery && (
              <span className="matching-query-pill">
                Filtered by "{searchQuery}"
              </span>
            )}
          </div>

          <div className="cities-scroll-list" role="listbox" id="cities-station-list">
            {filteredCities.length === 0 ? (
              <div className="city-empty-state">
                <MapPin size={32} className="empty-pin-icon" />
                <p>No IMD stations matching "{searchQuery}".</p>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredCities.map((city) => {
                const isSelected = selectedCityId === city.cityId;
                return (
                  <div
                    key={city.cityId}
                    className={`city-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePickCity(city)}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    id={`city-item-${city.cityId}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePickCity(city);
                      }
                    }}
                  >
                    <div className="city-info-group">
                      <div className={`city-icon-box ${isSelected ? 'selected-box' : ''}`}>
                        <MapPin size={16} />
                      </div>
                      <div className="city-names">
                        <div className="city-primary-row">
                          <h4 className="city-name-text">{city.cityName}</h4>
                          <span className="city-state-badge">{city.state}</span>
                        </div>
                        <div className="city-sub-meta">
                          <span>Lat: {city.coordinates.lat}°N, Lon: {city.coordinates.lon}°E</span>
                          <span className="meta-separator">•</span>
                          <span className="city-condition-inline">
                            {getWeatherIcon(city.current?.condition)}
                            <span>{city.current?.condition}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="city-meta-right">
                      <div className="city-temp-group">
                        <span className="city-temp-quick">
                          {city.current?.temperature?.toFixed(1) || '--'}°C
                        </span>
                        <span className="city-aqi-quick">
                          AQI {city.current?.airQuality?.aqi || '--'}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="city-selected-check" title="Currently Selected Station">
                          <Check size={18} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="city-unselected-radio" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer city-selector-footer">
          <span className="imd-station-disclaimer">
            Data sourced directly from official IMD regional meteorological bulletins.
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
