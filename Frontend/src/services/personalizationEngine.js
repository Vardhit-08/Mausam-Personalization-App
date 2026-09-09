/**
 * personalizationEngine.js
 * 
 * Deterministic and explainable personalization layer for SIH26076 Mausam.
 * 
 * Core Concept:
 * RAW WEATHER DATA -> USER PERSONA -> CONTEXT -> PERSONALIZATION ENGINE -> CONTENT RANKING -> PERSONALIZED DASHBOARD
 */

import {
  calculateSweatRisk,
  calculateExerciseComfort,
  calculateOutdoorComfort,
  calculateTravelComfort,
  calculateCommuteRisk,
  calculateAgriConditions,
} from './indicesCalculator.js';

/**
 * Persona definition registry
 */
export const PERSONAS = {
  fitness: {
    id: 'fitness',
    name: 'Outdoor Fitness',
    icon: '🏃',
    shortDesc: 'Best workout hours, heat, UV, sweat risk & wind',
    primaryColor: '#0284c7', // Sky Blue
  },
  traveler: {
    id: 'traveler',
    name: 'Traveler',
    icon: '✈️',
    shortDesc: 'Destination alerts, packing guidance & flight weather',
    primaryColor: '#8b5cf6', // Purple/Violet
  },
  health: {
    id: 'health',
    name: 'Health & Wellness',
    icon: '🌿',
    shortDesc: 'Air quality (AQI), pollen, UV & respiratory advisories',
    primaryColor: '#10b981', // Emerald
  },
  commuter: {
    id: 'commuter',
    name: 'Commuter',
    icon: '🚗',
    shortDesc: 'Visibility, rain probability, fog, road travel hazards',
    primaryColor: '#f59e0b', // Amber
  },
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture & Farming',
    icon: '🌾',
    shortDesc: 'Soil moisture, spray windows & agromet advisories',
    primaryColor: '#059669', // Forest Green
  },
};

/**
 * Main Personalization Engine pipeline
 * Computes indices, plain-English advice, and dynamic card ordering.
 */
export function generatePersonalizedDashboard({ persona = 'fitness', cityData, scenarioOverrides = {} }) {
  const current = { ...cityData?.current, ...scenarioOverrides?.current };
  const condition = scenarioOverrides?.condition || current.condition || 'Partly Cloudy';
  const rainProb = scenarioOverrides?.rainProbability ?? current.rain?.probability ?? 30;
  const temp = scenarioOverrides?.temperature ?? current.temperature ?? 30;
  const humidity = scenarioOverrides?.humidity ?? current.humidity ?? 60;
  const windSpeed = scenarioOverrides?.windSpeed ?? current.wind?.speedKmh ?? 12;
  const visibility = scenarioOverrides?.visibility ?? 5.5;

  const activePersona = PERSONAS[persona] ? persona : 'fitness';

  // 1. Calculate All Algorithmic Indices
  const sweatRisk = calculateSweatRisk({
    temperature: temp,
    humidity,
    uvIndex: current.uvIndex,
    windSpeed,
    rainProbability: rainProb,
  });

  const exerciseComfort = calculateExerciseComfort({
    temperature: temp,
    humidity,
    uvIndex: current.uvIndex,
    windSpeed,
    rainProbability: rainProb,
  });

  const outdoorComfort = calculateOutdoorComfort({
    airQuality: current.airQuality,
    pollen: current.pollen,
    uvIndex: current.uvIndex,
    temperature: temp,
    humidity,
  });

  const travelComfort = calculateTravelComfort({
    rainProbability: rainProb,
    windSpeed,
    visibility,
    severeAlerts: scenarioOverrides?.alerts || cityData?.alerts || [],
  });

  const commuteRisk = calculateCommuteRisk({
    rainProbability: rainProb,
    visibility,
    windSpeed,
    condition,
  });

  const agriConditions = calculateAgriConditions({
    windSpeed,
    rainProbability: rainProb,
    humidity,
    temperature: temp,
  });

  // 2. Primary Insight Card based on Persona
  let insightCard = {};

  if (activePersona === 'fitness') {
    insightCard = {
      title: 'Outdoor Workout & Running Conditions',
      scoreLabel: 'Exercise Comfort Score',
      score: (exerciseComfort.score / 10).toFixed(1),
      maxScore: '10',
      scorePercent: exerciseComfort.score,
      status: exerciseComfort.status,
      statusColor: exerciseComfort.statusColor,
      headline: exerciseComfort.message,
      bestWindow: exerciseComfort.bestWindow,
      avoidWindow: exerciseComfort.worstWindow,
      whyText: `Prioritized because of your Outdoor Fitness profile. Evaluated from current ambient temperature (${temp}°C), humidity (${humidity}%), and ${rainProb}% precipitation likelihood.`,
      formula: exerciseComfort.formula,
      breakdown: exerciseComfort.breakdown,
      disclaimer: exerciseComfort.disclaimer,
      metrics: [
        { label: 'Sweat Risk', val: `${sweatRisk.score} / 100`, sub: sweatRisk.category },
        { label: 'Running Window', val: '06:00 – 08:00 AM', sub: 'Optimal thermal state' },
        { label: 'UV Index', val: `${current.uvIndex?.value || 6}`, sub: current.uvIndex?.category || 'Moderate' },
        { label: 'Wind Velocity', val: `${windSpeed} km/h`, sub: 'Light headwind' },
      ],
    };
  } else if (activePersona === 'traveler') {
    const destination = scenarioOverrides?.destination || 'London';
    insightCard = {
      title: `Travel Intelligence • Destination: ${destination}`,
      scoreLabel: 'Travel Comfort Index',
      score: (travelComfort.score / 10).toFixed(1),
      maxScore: '10',
      scorePercent: travelComfort.score,
      status: travelComfort.status,
      statusColor: travelComfort.score > 70 ? 'text-emerald' : travelComfort.score > 45 ? 'text-amber' : 'text-rose',
      headline: travelComfort.packingTip,
      bestWindow: 'Departures before 11:00 AM',
      avoidWindow: 'Evening corridor flights',
      whyText: `Based on your saved destination (${destination}), current travel bulletins, and ${rainProb}% rain risk at arrival.`,
      formula: travelComfort.formula,
      breakdown: travelComfort.breakdown,
      disclaimer: travelComfort.disclaimer,
      metrics: [
        { label: 'Destination Rain', val: `${rainProb}%`, sub: rainProb > 50 ? 'High probability' : 'Low chance' },
        { label: 'Wind Stability', val: `${windSpeed} km/h`, sub: 'En-route stability' },
        { label: 'Visibility', val: `${visibility} km`, sub: 'Runway / Road clarity' },
        { label: 'Packing Tip', val: 'Waterproof Kit', sub: 'Jacket & Umbrella' },
      ],
    };
  } else if (activePersona === 'health') {
    insightCard = {
      title: "Today's Outdoor Environmental Health Risk",
      scoreLabel: 'Environmental Comfort',
      score: (outdoorComfort.score / 10).toFixed(1),
      maxScore: '10',
      scorePercent: outdoorComfort.score,
      status: outdoorComfort.status,
      statusColor: outdoorComfort.score > 70 ? 'text-emerald' : outdoorComfort.score > 45 ? 'text-amber' : 'text-rose',
      headline: outdoorComfort.summary,
      bestWindow: '6:00 AM – 8:00 AM (Lowest particulates)',
      avoidWindow: '12:00 PM – 3:30 PM (Peak UV & Ozone)',
      whyText: `Based on your Health & Wellness profile, real-time AQI (${outdoorComfort.aqi}), pollen levels, and UV index.`,
      formula: outdoorComfort.formula,
      breakdown: outdoorComfort.breakdown,
      disclaimer: outdoorComfort.disclaimer,
      metrics: [
        { label: 'AQI Level', val: `${outdoorComfort.aqi}`, sub: current.airQuality?.category || 'Moderate' },
        { label: 'Pollen Count', val: outdoorComfort.pollen, sub: 'Allergen pressure' },
        { label: 'UV Radiation', val: `${current.uvIndex?.value || 6}`, sub: current.uvIndex?.category || 'High' },
        { label: 'Thermal Strain', val: `${temp}°C`, sub: `Humidity ${humidity}%` },
      ],
    };
  } else if (activePersona === 'commuter') {
    insightCard = {
      title: 'Daily Commute & Highway Road Conditions',
      scoreLabel: 'Commute Hazard Level',
      score: commuteRisk.score.toFixed(1),
      maxScore: '10',
      scorePercent: Math.round(commuteRisk.score * 10),
      status: commuteRisk.riskLevel,
      statusColor: commuteRisk.riskColor,
      headline: commuteRisk.advisory,
      bestWindow: 'Depart before 7:45 AM or after 10:15 AM',
      avoidWindow: 'Peak transit hours: 8:30 AM – 9:45 AM',
      whyText: `Prioritized because of your Commuter profile, current road visibility (${visibility} km), and ${rainProb}% rain probability.`,
      formula: commuteRisk.formula,
      breakdown: commuteRisk.breakdown,
      disclaimer: commuteRisk.disclaimer,
      metrics: [
        { label: 'Road Visibility', val: `${visibility} km`, sub: visibility < 3 ? 'Dense mist/fog' : 'Clear sightline' },
        { label: 'Rain Likelihood', val: `${rainProb}%`, sub: 'Slick asphalt factor' },
        { label: 'Fog Risk', val: commuteRisk.fogRisk, sub: 'Moisture condensation' },
        { label: 'Traffic Delay', val: commuteRisk.riskLevel === 'HIGH' ? '+30 mins' : commuteRisk.riskLevel === 'MODERATE' ? '+15 mins' : 'Normal', sub: 'Corridor estimate' },
      ],
    };
  } else {
    // Agriculture fallback
    insightCard = {
      title: 'Agrometeorology & Crop Lifecycle Advisory',
      scoreLabel: 'Field Operations Score',
      score: agriConditions.isSpraySafe ? '8.4' : '4.2',
      maxScore: '10',
      scorePercent: agriConditions.isSpraySafe ? 84 : 42,
      status: agriConditions.isSpraySafe ? 'FAVORABLE' : 'RESTRICTED',
      statusColor: agriConditions.isSpraySafe ? 'text-emerald' : 'text-rose',
      headline: agriConditions.sprayAdvice,
      bestWindow: agriConditions.isSpraySafe ? 'Next 6 hours (Safe foliar window)' : 'Early morning after calm',
      avoidWindow: 'High wind or incoming rain windows',
      whyText: 'Based on your Agriculture persona, soil moisture estimations, wind drift velocity, and precipitation outlook.',
      formula: agriConditions.formula,
      breakdown: agriConditions.breakdown,
      disclaimer: agriConditions.disclaimer,
      metrics: [
        { label: 'Soil Moisture', val: agriConditions.soilMoisture, sub: 'Root zone saturation' },
        { label: 'Spray Window', val: agriConditions.sprayWindow, sub: `Wind: ${windSpeed} km/h` },
        { label: 'Precipitation', val: `${rainProb}%`, sub: 'Rain washoff risk' },
        { label: 'Evaporation (ET0)', val: agriConditions.evapotranspiration, sub: 'Daily evapotranspiration' },
      ],
    };
  }

  // Context parameters for card prioritization
  const weatherContext = {
    rainProb,
    temp,
    windSpeed,
    visibility,
    aqi: current.airQuality?.aqi || 80,
    condition,
    hasSevereAlerts: Boolean(scenarioOverrides?.alerts?.length || cityData?.alerts?.length),
  };

  // 3. Dynamic Card Prioritization (Deterministic Relevance Scoring)
  // Formula: Relevance = Persona_Relevance + Weather_Relevance + Severity + Context
  const cardConfigs = [
    {
      id: 'running-window',
      title: '🏃 Best Running & Exercise Hours',
      type: 'RUNNING_TIMELINE',
      content: {
        window: '6:00 AM – 8:00 AM',
        score: `${exerciseComfort.score} / 100`,
        status: exerciseComfort.status,
        advice: exerciseComfort.message,
      },
    },
    {
      id: 'sweat-risk',
      title: '💧 Sweat Risk & Hydration Target',
      type: 'SWEAT_RISK',
      content: {
        score: `${sweatRisk.score} / 100`,
        category: sweatRisk.category,
        advice: sweatRisk.recommendation,
      },
    },
    {
      id: 'travel-dest',
      title: '✈️ Destination Weather & Advisory',
      type: 'TRAVEL_DESTINATION',
      content: {
        destination: scenarioOverrides?.destination || 'London',
        forecast: `${rainProb}% rain probability tomorrow.`,
        packing: travelComfort.packingTip,
        advice: travelComfort.packingTip,
      },
    },
    {
      id: 'commute-cond',
      title: '🚗 Corridor Visibility & Commute Risk',
      type: 'COMMUTE_RISK',
      content: {
        visibility: `${visibility} km`,
        risk: commuteRisk.riskLevel,
        advisory: commuteRisk.primaryHazard,
        advice: commuteRisk.advisory,
      },
    },
    {
      id: 'aqi-pollen',
      title: '🌿 Air Quality & Pollen Allergen Index',
      type: 'AQI_POLLEN',
      content: {
        aqi: current.airQuality?.aqi || 109,
        category: current.airQuality?.category || 'Moderate',
        pollen: current.pollen?.level || 'Moderate',
        advice: outdoorComfort.summary,
      },
    },
    {
      id: 'uv-radiation',
      title: '☀️ Solar UV Exposure & Skin Safety',
      type: 'UV_INDEX',
      content: {
        uv: current.uvIndex?.value || 7,
        category: current.uvIndex?.category || 'High',
        burnTime: '20 minutes unshaded',
        advice: (current.uvIndex?.value || 7) >= 7
          ? 'High solar UV radiation. Apply broad-spectrum SPF 50+ and wear UV-blocking eyewear.'
          : 'Moderate UV index. Routine skin protection recommended during midday.',
      },
    },
    {
      id: 'rain-probability',
      title: '🌧️ Precipitation Likelihood & Amount',
      type: 'RAIN_PROBABILITY',
      content: {
        probability: `${rainProb}%`,
        amountMm: `${current.rain?.amountMm || 4.0} mm`,
        advice: rainProb >= 60
          ? 'Heavy precipitation expected. Carry waterproof outerwear and anticipate traffic delays.'
          : rainProb >= 30
            ? 'Scattered showers possible. Carry a compact umbrella for transit.'
            : 'Minimal precipitation risk. Clear skies for outdoor routines.',
      },
    },
    {
      id: 'agri-soil',
      title: '🌱 Soil Moisture & Root Saturation',
      type: 'AGRI_SOIL',
      content: {
        moisture: agriConditions.soilMoisture,
        depth: '15–30 cm Root Zone',
        status: rainProb > 50 ? 'Near Saturation' : 'Optimal Moisture',
        advice: rainProb > 50 ? 'Postpone scheduled irrigation; root zone sufficiently saturated.' : 'Adequate moisture present. Skip canal/drip irrigation for next 48 hours.',
      },
    },
    {
      id: 'agri-spray',
      title: '💨 Agrochemical Spraying Suitability',
      type: 'AGRI_SPRAY',
      content: {
        window: agriConditions.sprayWindow,
        wind: `${windSpeed} km/h`,
        driftRisk: agriConditions.driftRisk,
        advice: agriConditions.sprayAdvice,
      },
    },
  ];

  const cards = cardConfigs.map((cfg) => {
    const rel = calculateRelevance(cfg.id, activePersona, weatherContext);
    return {
      ...cfg,
      relevance: rel.score,
      why: rel.why,
    };
  });

  // Sort cards descending by computed relevance score
  const prioritizedCards = [...cards].sort((a, b) => b.relevance - a.relevance);

  return {
    persona: activePersona,
    insightCard,
    prioritizedCards,
    indices: {
      sweatRisk,
      exerciseComfort,
      outdoorComfort,
      travelComfort,
      commuteRisk,
      agriConditions,
    },
  };
}

/**
 * Deterministic card relevance calculation
 * Formula: Relevance = Persona_Relevance + Weather_Relevance + Severity + Context
 */
export function calculateRelevance(cardId, persona, ctx = {}) {
  const rainProb = Number(ctx.rainProb) || 0;
  const temp = Number(ctx.temp) || 28;
  const windSpeed = Number(ctx.windSpeed) || 10;
  const visibility = Number(ctx.visibility) || 5;
  const aqi = Number(ctx.aqi) || 80;
  const hasSevereAlerts = Boolean(ctx.hasSevereAlerts);

  let personaScore = 50;
  let weatherScore = 0;
  let severityScore = 0;
  let reason = '';

  // 1. Persona Base Alignment
  if (persona === 'fitness') {
    if (cardId === 'running-window') { personaScore = 90; reason = 'Primary fitness schedule anchor'; }
    else if (cardId === 'sweat-risk') { personaScore = 84; reason = 'Key thermoregulatory hydration indicator'; }
    else if (cardId === 'uv-radiation') { personaScore = 78; reason = 'Solar skin safety for outdoor runs'; }
    else if (cardId === 'rain-probability') { personaScore = 72; reason = 'Track surface moisture factor'; }
    else if (cardId === 'aqi-pollen') { personaScore = 65; reason = 'Respiratory air quality for cardio'; }
    else if (cardId === 'commute-cond') { personaScore = 40; reason = 'Secondary transit condition'; }
    else if (cardId === 'travel-dest') { personaScore = 30; reason = 'Non-fitness travel alert'; }
    else { personaScore = 20; reason = 'Non-fitness agricultural metric'; }
  } else if (persona === 'traveler') {
    if (cardId === 'travel-dest') { personaScore = 94; reason = 'Primary itinerary destination briefing'; }
    else if (cardId === 'rain-probability') { personaScore = 82; reason = 'Precipitation luggage & umbrella planning'; }
    else if (cardId === 'commute-cond') { personaScore = 76; reason = 'Airport / highway transfer corridor'; }
    else if (cardId === 'uv-radiation') { personaScore = 60; reason = 'Sightseeing sun protection'; }
    else if (cardId === 'aqi-pollen') { personaScore = 55; reason = 'Destination ambient air quality'; }
    else if (cardId === 'running-window') { personaScore = 32; reason = 'Non-travel fitness schedule'; }
    else if (cardId === 'sweat-risk') { personaScore = 30; reason = 'Secondary thermal indicator'; }
    else { personaScore = 20; reason = 'Non-travel agricultural metric'; }
  } else if (persona === 'health') {
    if (cardId === 'aqi-pollen') { personaScore = 94; reason = 'Primary allergen & particulate health monitor'; }
    else if (cardId === 'uv-radiation') { personaScore = 86; reason = 'Cellular solar radiation index'; }
    else if (cardId === 'sweat-risk') { personaScore = 76; reason = 'Dehydration & heat strain warning'; }
    else if (cardId === 'rain-probability') { personaScore = 60; reason = 'Dampness & humidity trigger'; }
    else if (cardId === 'running-window') { personaScore = 48; reason = 'Gentle outdoor wellness window'; }
    else if (cardId === 'commute-cond') { personaScore = 35; reason = 'Transit corridor advisory'; }
    else if (cardId === 'travel-dest') { personaScore = 30; reason = 'Travel destination briefing'; }
    else { personaScore = 20; reason = 'Non-health agricultural metric'; }
  } else if (persona === 'commuter') {
    if (cardId === 'commute-cond') { personaScore = 95; reason = 'Primary road corridor & visibility monitor'; }
    else if (cardId === 'rain-probability') { personaScore = 84; reason = 'Slick asphalt & waterlogging risk'; }
    else if (cardId === 'travel-dest') { personaScore = 65; reason = 'Intercity transit corridor advisory'; }
    else if (cardId === 'aqi-pollen') { personaScore = 52; reason = 'Vehicle cabin filtration advice'; }
    else if (cardId === 'uv-radiation') { personaScore = 45; reason = 'Windshield glare index'; }
    else if (cardId === 'sweat-risk') { personaScore = 35; reason = 'Cabin climate setting'; }
    else if (cardId === 'running-window') { personaScore = 25; reason = 'Non-commute workout metric'; }
    else { personaScore = 20; reason = 'Non-commute agricultural metric'; }
  } else if (persona === 'agriculture') {
    if (cardId === 'agri-soil') { personaScore = 94; reason = 'Primary root zone moisture & irrigation guide'; }
    else if (cardId === 'agri-spray') { personaScore = 92; reason = 'Foliar agrochemical spraying window'; }
    else if (cardId === 'rain-probability') { personaScore = 85; reason = 'Rainfall accumulation & washoff hazard'; }
    else if (cardId === 'uv-radiation') { personaScore = 65; reason = 'Crop evapotranspiration rate'; }
    else if (cardId === 'aqi-pollen') { personaScore = 50; reason = 'Airborne spores & pollination health'; }
    else if (cardId === 'commute-cond') { personaScore = 35; reason = 'Mandi transport logistics'; }
    else if (cardId === 'travel-dest') { personaScore = 25; reason = 'Non-agricultural travel metric'; }
    else { personaScore = 20; reason = 'Non-agricultural fitness metric'; }
  }

  // 2. Weather Severity Amplification (Severe Weather Promotion)
  if (rainProb >= 70 && (cardId === 'rain-probability' || cardId === 'commute-cond')) {
    weatherScore += 18;
    reason += ' + Heavy downpour boost (+18)';
  } else if (rainProb >= 40 && (cardId === 'rain-probability' || cardId === 'commute-cond')) {
    weatherScore += 8;
  }

  if (temp >= 35 && (cardId === 'sweat-risk' || cardId === 'uv-radiation')) {
    weatherScore += 16;
    reason += ' + Heatwave thermal strain (+16)';
  }

  if (aqi >= 200 && cardId === 'aqi-pollen') {
    weatherScore += 20;
    reason += ' + Severe air pollution hazard (+20)';
  }

  if (windSpeed >= 20 && (cardId === 'agri-spray' || cardId === 'commute-cond')) {
    weatherScore += 14;
    reason += ' + High wind drift hazard (+14)';
  }

  // 3. Severe Weather Warning Promotion
  if (hasSevereAlerts) {
    if (cardId === 'commute-cond' || cardId === 'rain-probability' || cardId === 'travel-dest') {
      severityScore += 25;
      reason += ' + Active severe weather bulletin (+25)';
    }
  }

  // 4. Low visibility alert
  if (visibility < 2.0 && cardId === 'commute-cond') {
    severityScore += 22;
    reason += ' + Dense fog sightline loss (+22)';
  }

  // 5. Total calculation and clamping (5 - 99)
  const total = Math.max(5, Math.min(99, Math.round(personaScore + weatherScore + severityScore)));

  return {
    score: total,
    why: `Priority ${total}/100: ${reason}.`,
  };
}
