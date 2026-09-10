import React from 'react';
import { Calendar, CloudRain, Sun, Cloud, CloudLightning } from 'lucide-react';

export default function DailyForecastList({ dailyForecast = [] }) {
  const getConditionIcon = (iconName) => {
    switch (iconName) {
      case 'rain':
        return <CloudRain size={20} className="text-blue" />;
      case 'thunderstorm':
        return <CloudLightning size={20} className="text-amber" />;
      case 'clear':
        return <Sun size={20} className="text-amber" />;
      case 'cloudy':
      case 'partly-cloudy':
      default:
        return <Cloud size={20} className="text-sky" />;
    }
  };

  return (
    <div className="daily-forecast-section">
      <div className="daily-forecast-header">
        <div className="header-title-group">
          <Calendar size={18} className="text-sky" />
          <h4 className="forecast-title">7-Day IMD Forecast</h4>
        </div>
        <span className="forecast-station-tag">Synoptic Outlook</span>
      </div>

      <div className="forecast-list-rows" role="list">
        {dailyForecast.map((day, idx) => (
          <div key={idx} className="forecast-day-row" role="listitem">
            <div className="day-date-column">
              <strong className="day-name">{day.day}</strong>
              <span className="day-date-str">{day.date}</span>
            </div>

            <div className="day-condition-column">
              {getConditionIcon(day.conditionIcon)}
              <span className="condition-text">{day.condition}</span>
            </div>

            <div className="day-rain-column">
              <span className="rain-prob-pill">
                🌧 {day.rainProbability}%
              </span>
            </div>

            <div className="day-temp-column">
              <span className="min-temp">{Math.round(day.minTemp)}°</span>
              <div className="temp-range-track">
                <div
                  className="temp-range-fill"
                  style={{
                    left: `${Math.max(0, (day.minTemp - 15) * 4)}%`,
                    width: `${Math.max(20, (day.maxTemp - day.minTemp) * 7)}%`,
                  }}
                ></div>
              </div>
              <strong className="max-temp">{Math.round(day.maxTemp)}°</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
