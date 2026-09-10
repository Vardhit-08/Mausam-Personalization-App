import { PERSONAS, ALERT_TYPES } from '../config/constants.js';

/**
 * Persona Relevance Engine
 * Determines which of the 4 supported personas (FARMER, TOURIST, STUDENT, PARENT)
 * are affected by a detected alert and assesses relevance levels.
 */
export class PersonaService {
  /**
   * Rule matrix defining persona sensitivity to each alert type
   */
  static RELEVANCE_MATRIX = {
    [ALERT_TYPES.HEAVY_RAINFALL]: {
      [PERSONAS.FARMER]: { relevance: 'HIGH', impact: 'Field waterlogging, irrigation adjustment, harvest protection' },
      [PERSONAS.TOURIST]: { relevance: 'HIGH', impact: 'Sightseeing disruption, outdoor transit delays' },
      [PERSONAS.PARENT]: { relevance: 'HIGH', impact: 'School commute delays, child rain protection' },
      [PERSONAS.STUDENT]: { relevance: 'MEDIUM', impact: 'Campus travel inconvenience, need for rain gear' },
    },

    [ALERT_TYPES.SEVERE_WEATHER]: {
      [PERSONAS.FARMER]: { relevance: 'HIGH', impact: 'Crop lodging risk, livestock safety, high winds' },
      [PERSONAS.TOURIST]: { relevance: 'HIGH', impact: 'Flight/transit delays, unsafe outdoor sightseeing' },
      [PERSONAS.PARENT]: { relevance: 'HIGH', impact: 'School closure or delayed transport, child safety' },
      [PERSONAS.STUDENT]: { relevance: 'HIGH', impact: 'Commute danger, campus transit shutdown' },
    },

    [ALERT_TYPES.HIGH_AQI]: {
      [PERSONAS.PARENT]: { relevance: 'HIGH', impact: 'Severe child respiratory risk, restrict outdoor play' },
      [PERSONAS.STUDENT]: { relevance: 'HIGH', impact: 'Outdoor sports safety, commute particulate exposure' },
      [PERSONAS.FARMER]: { relevance: 'MEDIUM', impact: 'Heavy outdoor physical exertion in polluted air' },
      [PERSONAS.TOURIST]: { relevance: 'MEDIUM', impact: 'Reduced monument visibility and outdoor comfort' },
    },

    [ALERT_TYPES.EXTREME_HEAT]: {
      [PERSONAS.FARMER]: { relevance: 'HIGH', impact: 'Crop heat stress, adjust manual labor hours' },
      [PERSONAS.PARENT]: { relevance: 'HIGH', impact: 'Child dehydration and heat exhaustion during school commute' },
      [PERSONAS.TOURIST]: { relevance: 'HIGH', impact: 'Exhaustion during walking tours, shift excursions to evening' },
      [PERSONAS.STUDENT]: { relevance: 'MEDIUM', impact: 'Hot afternoon transit home from campus' },
    },

    [ALERT_TYPES.COLDWAVE]: {
      [PERSONAS.FARMER]: { relevance: 'HIGH', impact: 'Ground frost hazard, vegetable crop damage' },
      [PERSONAS.PARENT]: { relevance: 'HIGH', impact: 'Early morning school bus chill, heavy thermal wear required' },
      [PERSONAS.STUDENT]: { relevance: 'MEDIUM', impact: 'Morning class travel in freezing temperature' },
      [PERSONAS.TOURIST]: { relevance: 'MEDIUM', impact: 'Pack additional thermal layers for outdoor sightseeing' },
    },

    [ALERT_TYPES.DENSE_FOG]: {
      [PERSONAS.PARENT]: { relevance: 'HIGH', impact: 'Morning school bus delays, poor road visibility' },
      [PERSONAS.STUDENT]: { relevance: 'HIGH', impact: 'Transit and train delays to classes' },
      [PERSONAS.TOURIST]: { relevance: 'HIGH', impact: 'Airport/train cancellations, monument obscuration' },
      [PERSONAS.FARMER]: { relevance: 'LOW', impact: 'Delayed morning farm tasks' },
    },

    [ALERT_TYPES.STRONG_WIND]: {
      [PERSONAS.FARMER]: { relevance: 'HIGH', impact: 'Tree branch damage, spray drift hazard' },
      [PERSONAS.TOURIST]: { relevance: 'MEDIUM', impact: 'Unpleasant outdoor walking tours' },
      [PERSONAS.PARENT]: { relevance: 'MEDIUM', impact: 'Flying debris caution for children' },
      [PERSONAS.STUDENT]: { relevance: 'LOW', impact: 'Two-wheeler commute instability' },
    },
  };

  /**
   * Evaluates an alert and returns list of affected personas with relevance details
   * @param {Object} alert - Output from AlertService.detectAlert
   * @returns {Array<Object>} List of affected personas
   */
  static getRelevantPersonas(alert) {
    if (!alert || !alert.isSignificant) {
      return [];
    }

    const alertType = alert.primaryAlert.type;
    const sensitivities = this.RELEVANCE_MATRIX[alertType] || {};

    const affected = [];
    for (const persona of Object.values(PERSONAS)) {
      const match = sensitivities[persona];
      if (match && match.relevance !== 'NONE') {
        affected.push({
          persona,
          relevance: match.relevance,
          impact: match.impact,
        });
      }
    }

    // Sort by relevance (HIGH > MEDIUM > LOW)
    const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return affected.sort((a, b) => (order[b.relevance] || 0) - (order[a.relevance] || 0));
  }

  /**
   * Checks if a specific persona is affected by the alert
   */
  static isPersonaAffected(persona, alert) {
    const relevant = this.getRelevantPersonas(alert);
    return relevant.some((p) => p.persona.toUpperCase() === persona.toUpperCase());
  }
}

