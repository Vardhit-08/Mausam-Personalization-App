import { PERSONAS, ALERT_TYPES } from '../config/constants.js';

/**
 * Message Generation Layer
 * Formulates targeted, persona-specific notification messages based on:
 * Persona + Alert + Weather Context + User
 */
export class MessageService {
  /**
   * Generates a personalized notification message
   * @param {string} rawPersona - Target persona (FARMER, TOURIST, STUDENT, PARENT)
   * @param {Object} alert - Output from AlertService.detectAlert
   * @param {Object} weatherContext - NormalizedWeather or snapshot
   * @param {Object} user - Target user profile
   * @returns {Object} { title, body, action, severity, persona }
   */
  static generateMessage(rawPersona, alert, weatherContext = {}, user = {}) {
    const persona = (rawPersona || PERSONAS.STUDENT).toUpperCase();
    const primary = alert.primaryAlert || {};
    const alertType = primary.type || ALERT_TYPES.HEAVY_RAINFALL;
    const city = alert.location?.city || weatherContext.location?.city || 'your area';
    const metric = primary.metric || '';

    let title = primary.title || `Weather Alert for ${city}`;
    let body = '';
    let action = '';

    switch (alertType) {
      case ALERT_TYPES.HEAVY_RAINFALL:
        title = `🌧️ Heavy Rain Alert: ${city}`;
        if (persona === PERSONAS.FARMER) {
          body = `Heavy rainfall (${metric}) detected in ${city}. Hold off irrigation, ensure field drainage, and protect harvested crops.`;
          action = 'Review drainage & withhold irrigation';
        } else if (persona === PERSONAS.TOURIST) {
          body = `Heavy rain (${metric}) in ${city}. Outdoor sightseeing conditions will be severely affected. Consider visiting indoor museums today.`;
          action = 'Explore indoor attractions';
        } else if (persona === PERSONAS.STUDENT) {
          body = `Heavy rainfall expected in ${city}. Allow extra travel time for classes and make sure to carry rain protection.`;
          action = 'Carry umbrella / waterproof gear';
        } else if (persona === PERSONAS.PARENT) {
          body = `Heavy rain warning for ${city}. School commute and transit may be delayed. Take extra precautions for children travelling outdoors.`;
          action = 'Verify school transit & equip rainwear';
        }
        break;

      case ALERT_TYPES.SEVERE_WEATHER:
        title = `⛈️ Thunderstorm Warning: ${city}`;
        if (persona === PERSONAS.FARMER) {
          body = `Severe thunderstorms forecast in ${city}. Secure open farm equipment and move livestock into sheltered areas.`;
          action = 'Secure livestock and structures';
        } else if (persona === PERSONAS.TOURIST) {
          body = `Active severe convective storm over ${city}. Postpone outdoor excursions and remain inside until squalls subside.`;
          action = 'Stay indoors';
        } else if (persona === PERSONAS.STUDENT) {
          body = `Severe thunderstorm over ${city}. Public transport may be disrupted. Seek shelter and avoid flooded walkways.`;
          action = 'Avoid travel during peak squall';
        } else if (persona === PERSONAS.PARENT) {
          body = `Severe weather warning in ${city}. Keep children safely indoors and check school transport advisories.`;
          action = 'Keep children sheltered';
        }
        break;

      case ALERT_TYPES.HIGH_AQI:
        title = `😷 High AQI Alert: ${city}`;
        if (persona === PERSONAS.PARENT) {
          body = `Air Quality Index in ${city} has reached ${metric} (Unhealthy). Restrict children's outdoor play and ensure masks are worn.`;
          action = 'Limit child outdoor exposure';
        } else if (persona === PERSONAS.STUDENT) {
          body = `AQI spiked to ${metric} in ${city}. Avoid strenuous outdoor sports on campus and use a filtration mask during commute.`;
          action = 'Wear N95 mask for commute';
        } else if (persona === PERSONAS.FARMER) {
          body = `Elevated air pollution (${metric}) over ${city}. Take frequent rest intervals during outdoor field labor.`;
          action = 'Limit strenuous field hours';
        } else if (persona === PERSONAS.TOURIST) {
          body = `Haze and elevated AQI (${metric}) in ${city}. Scenic monument visibility is reduced; plan indoor visits.`;
          action = 'Plan indoor sightseeing';
        }
        break;

      case ALERT_TYPES.EXTREME_HEAT:
        title = `☀️ Heatwave Alert: ${city}`;
        if (persona === PERSONAS.FARMER) {
          body = `Extreme heat (${metric}) recorded in ${city}. Shift field work to early morning and increase seedling hydration.`;
          action = 'Irrigate early morning';
        } else if (persona === PERSONAS.TOURIST) {
          body = `Temperature reached ${metric} in ${city}. Risk of heat exhaustion. Stay hydrated and avoid midday outdoor walking tours.`;
          action = 'Stay hydrated & seek shade';
        } else if (persona === PERSONAS.PARENT) {
          body = `Intense heat (${metric}) in ${city}. Ensure school children have water bottles and avoid exposure to midday sun.`;
          action = 'Ensure child hydration';
        } else if (persona === PERSONAS.STUDENT) {
          body = `Heat alert (${metric}) for ${city}. Stay hydrated during campus transit and utilize shaded corridors.`;
          action = 'Keep hydrated on campus';
        }
        break;

      case ALERT_TYPES.DENSE_FOG:
        title = `🌫️ Dense Fog Warning: ${city}`;
        if (persona === PERSONAS.PARENT) {
          body = `Dense fog in ${city} has reduced visibility to ${metric}. Expect delays on morning school bus routes; drive with fog lights.`;
          action = 'Allow extra school transit time';
        } else if (persona === PERSONAS.STUDENT) {
          body = `Visibility dropped to ${metric} in ${city}. Campus shuttles and metro trains may be running with delays.`;
          action = 'Plan for commute delays';
        } else if (persona === PERSONAS.TOURIST) {
          body = `Dense fog in ${city} (${metric} visibility). Check flight and train schedules for morning departures.`;
          action = 'Check transit status';
        } else if (persona === PERSONAS.FARMER) {
          body = `Morning fog (${metric} visibility) over ${city}. Delay high-speed equipment transport on local roads.`;
          action = 'Exercise roadway caution';
        }
        break;

      default:
        body = `${primary.description || 'Significant weather condition detected in your area.'} Take appropriate precautions.`;
        action = 'Check weather dashboard';
        break;
    }

    return {
      title,
      body,
      action,
      severity: primary.severity || 'HIGH',
      persona,
      targetUser: user.fullName || user.uid,
      generatedAt: new Date().toISOString(),
    };
  }
}

