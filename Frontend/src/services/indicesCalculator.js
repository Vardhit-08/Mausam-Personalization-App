const ENVIRONMENTAL_DISCLAIMER = 'Environmental decision-support indicator, not a medical or clinical diagnosis.';

export function calculateSweatRisk({ temperature, humidity, uvIndex, windSpeed, rainProbability = 0 }) {
  const temp = !isNaN(Number(temperature)) ? Number(temperature) : 28;
  const rh = !isNaN(Number(humidity)) ? Number(humidity) : 50;
  const uv = Number(uvIndex?.value !== undefined ? uvIndex.value : uvIndex) || 5;
  const wind = !isNaN(Number(windSpeed)) ? Number(windSpeed) : 10;
  const rain = Number(rainProbability) || 0;
  const tempFactor = Math.max(0, Math.min(100, (temp - 18) * 4.5));
  const rhFactor = Math.max(0, Math.min(100, (rh - 40) * 1.5));
  const uvFactor = Math.max(0, Math.min(100, uv * 8.5));
  const windDiscount = Math.max(0, Math.min(25, wind * 1.2));
  const rainFactor = Math.max(0, Math.min(15, rain * 0.18));
  let rawScore = (tempFactor * 0.45) + (rhFactor * 0.35) + (uvFactor * 0.15) + rainFactor - windDiscount;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  let category = 'LOW';
  let categoryColor = 'text-emerald';
  let recommendation = 'Normal perspiration expected. Standard fluid replenishment is sufficient.';

  if (score >= 80) {
    category = 'EXTREME';
    categoryColor = 'text-rose';
    recommendation = 'Rapid fluid and electrolyte loss. Restrict strenuous workouts to early morning (before 7:30 AM) and hydrate with 500ml water every 30 mins.';
  } else if (score >= 65) {
    category = 'HIGH';
    categoryColor = 'text-amber';
    recommendation = 'High sweat rate due to warm temperatures and humidity. Prefer early morning or post-sunset exercise.';
  } else if (score >= 40) {
    category = 'MODERATE';
    categoryColor = 'text-sky';
    recommendation = 'Moderate sweat rate. Ensure steady hydration during outdoor physical activities.';
  }

  const breakdown = [
    { label: 'Thermal Load', impact: temp >= 35 ? 'High heat stress' : temp < 20 ? 'Mild' : 'Moderate', value: `${temp}°C` },
    { label: 'Humidity Evaporation', impact: rh >= 70 ? 'Impaired sweat cooling' : rh < 40 ? 'Rapid drying' : 'Normal', value: `${rh}%` },
    { label: 'Radiant Solar Heat', impact: uv >= 8 ? 'Very high radiation' : 'Moderate', value: `UV ${uv}` },
    { label: 'Convective Wind Cooling', impact: wind >= 15 ? 'Active cooling' : 'Stagnant air', value: `${wind} km/h` },
  ];

  return {
    score,
    category,
    categoryColor,
    recommendation,
    formula: 'Sweat Risk = (Temp Factor × 0.45) + (RH Factor × 0.35) + (UV Factor × 0.15) + Rain Factor − Wind Discount',
    breakdown,
    disclaimer: ENVIRONMENTAL_DISCLAIMER,
    inputs: { temp, rh, uv, wind, rain },
  };
}

export function calculateExerciseComfort({ temperature, humidity, uvIndex, windSpeed, rainProbability = 0 }) {
  const temp = !isNaN(Number(temperature)) ? Number(temperature) : 28;
  const rh = !isNaN(Number(humidity)) ? Number(humidity) : 50;
  const uv = Number(uvIndex?.value !== undefined ? uvIndex.value : uvIndex) || 5;
  const wind = !isNaN(Number(windSpeed)) ? Number(windSpeed) : 10;
  const rain = Number(rainProbability) || 0;

  let tempPenalty = 0;
  if (temp < 12) {
    tempPenalty = (12 - temp) * 2.5;
  } else if (temp > 20) {
    tempPenalty = (temp - 20) * 3.5;
  }

  const rhPenalty = rh > 60 ? (rh - 60) * 0.8 : 0;

  const rainPenalty = rain * 0.5;

  const windPenalty = wind > 20 ? (wind - 20) * 1.5 : 0;

  const uvPenalty = uv > 6 ? (uv - 6) * 4 : 0;

  const deductions = tempPenalty + rhPenalty + rainPenalty + windPenalty + uvPenalty;
  const score = Math.max(5, Math.min(100, Math.round(100 - deductions)));

  let status = 'OPTIMAL';
  let statusColor = 'text-emerald';
  let message = 'Conditions are very favorable for running, cycling, or outdoor fitness.';

  if (score < 45) {
    status = 'UNFAVORABLE';
    statusColor = 'text-rose';
    message = 'Adverse thermal or rain conditions. Consider indoor cross-training or treadmill.';
  } else if (score < 70) {
    status = 'MODERATE';
    statusColor = 'text-amber';
    message = 'Acceptable for moderate exercise. Hydrate frequently and pace yourself.';
  }

  let bestWindow = '6:00 AM – 8:00 AM';
  let worstWindow = '12:30 PM – 4:00 PM';
  if (temp > 35) {
    bestWindow = '5:30 AM – 7:00 AM';
    worstWindow = '11:00 AM – 4:30 PM';
  } else if (temp < 10) {
    bestWindow = '11:00 AM – 2:30 PM';
    worstWindow = '5:00 AM – 7:30 AM';
  }

  const breakdown = [
    { label: 'Thermal Offset', impact: tempPenalty > 30 ? 'Severe heat/cold deduction' : tempPenalty > 10 ? 'Moderate' : 'Optimal', deduction: `-${Math.round(tempPenalty)} pts` },
    { label: 'Humidity Drag', impact: rhPenalty > 15 ? 'High vapor pressure' : 'Normal', deduction: `-${Math.round(rhPenalty)} pts` },
    { label: 'Rain Likelihood', impact: rain > 50 ? 'Wet surface hazard' : 'Dry', deduction: `-${Math.round(rainPenalty)} pts` },
    { label: 'Solar & Wind Stress', impact: (windPenalty + uvPenalty) > 15 ? 'Elevated exposure' : 'Calm', deduction: `-${Math.round(windPenalty + uvPenalty)} pts` },
  ];

  return {
    score,
    status,
    statusColor,
    message,
    bestWindow,
    worstWindow,
    formula: 'Exercise Comfort = 100 − (Thermal Deviation + RH Penalty + Rain Penalty + Wind Penalty + UV Penalty)',
    breakdown,
    disclaimer: ENVIRONMENTAL_DISCLAIMER,
    inputs: { temp, rh, uv, wind, rain },
  };
}

export function calculateOutdoorComfort({ airQuality, pollen, uvIndex, temperature, humidity }) {
  const aqi = Number(airQuality?.aqi !== undefined ? airQuality.aqi : airQuality) || 80;
  const pollenVal = Number(pollen?.index !== undefined ? pollen.index : (pollen === 'High' ? 8 : pollen === 'Moderate' ? 4 : 2)) || 4;
  const uv = Number(uvIndex?.value !== undefined ? uvIndex.value : uvIndex) || 5;
  const temp = !isNaN(Number(temperature)) ? Number(temperature) : 28;
  const rh = !isNaN(Number(humidity)) ? Number(humidity) : 50;

  let aqiDeduction = 0;
  if (aqi > 200) {
    aqiDeduction = 35 + (aqi - 200) * 0.35;
  } else if (aqi > 100) {
    aqiDeduction = (aqi - 100) * 0.35;
  } else if (aqi > 50) {
    aqiDeduction = (aqi - 50) * 0.1;
  }

  const pollenDeduction = pollenVal > 4 ? (pollenVal - 4) * 6 : 0;
  const uvDeduction = uv > 6 ? (uv - 6) * 4.5 : 0;
  const thermalDeduction = (temp > 30 ? (temp - 30) * 2.8 : 0) + (rh > 70 ? (rh - 70) * 0.4 : 0);
  const totalDeductions = aqiDeduction + pollenDeduction + uvDeduction + thermalDeduction;
  const score = Math.max(5, Math.min(100, Math.round(100 - totalDeductions)));
  let status = 'GOOD';
  let summary = 'Clean air and comfortable environmental conditions for outdoor presence.';

  if (score < 45 || aqi > 200) {
    status = 'POOR';
    summary = 'Elevated air particulates or intense environmental strain. Sensitive groups should wear N95 and minimize exposure.';
  } else if (score < 70 || aqi > 100) {
    status = 'MODERATE';
    summary = 'Moderate air quality and ambient allergen levels. Generally acceptable with light precautions for respiratory conditions.';
  }

  const breakdown = [
    { label: 'Air Particulates (AQI)', impact: aqi > 200 ? 'Unhealthy / Hazardous' : aqi > 100 ? 'Moderate' : 'Good', value: `AQI ${aqi}` },
    { label: 'Pollen Allergen', impact: pollenVal > 6 ? 'High pollen count' : 'Low/Moderate', value: `Level ${pollenVal}` },
    { label: 'UV Radiation', impact: uv > 7 ? 'High UV' : 'Moderate', value: `UV ${uv}` },
    { label: 'Thermal Discomfort', impact: temp > 33 ? 'Heat strain' : 'Comfortable', value: `${temp}°C / ${rh}% RH` },
  ];

  return {
    score,
    status,
    summary,
    aqi,
    pollen: pollen?.level || (pollenVal > 6 ? 'High' : pollenVal > 3 ? 'Moderate' : 'Low'),
    uv,
    formula: 'Outdoor Health Comfort = 100 − (AQI Penalty + Pollen Penalty + Solar UV Penalty + Heat/Moisture Strain)',
    breakdown,
    disclaimer: ENVIRONMENTAL_DISCLAIMER,
    inputs: { aqi, pollenVal, uv, temp, rh },
  };
}

export function calculateTravelComfort({ rainProbability, windSpeed, visibility = 6, severeAlerts = [] }) {
  const rain = Number(rainProbability) || 20;
  const wind = Number(windSpeed) || 12;
  const vis = Number(visibility) || 6;
  const hasSevere = Array.isArray(severeAlerts) ? severeAlerts.length > 0 : Boolean(severeAlerts);

  let deduction = (rain * 0.45) + (wind > 20 ? (wind - 20) * 1.5 : 0) + (vis < 4 ? (4 - vis) * 10 : 0);
  if (hasSevere) deduction += 30;

  const score = Math.max(10, Math.min(100, Math.round(100 - deduction)));

  let status = 'EXCELLENT';
  let packingTip = 'Standard light clothing and sunglasses recommended.';

  if (score < 50 || hasSevere) {
    status = 'DISRUPTED';
    packingTip = 'Carry a heavy rainproof jacket, waterproof luggage covers, and monitor airport departure bulletins.';
  } else if (score < 75) {
    status = 'MODERATE';
    packingTip = 'Carry a compact umbrella or light windcheater. Minor transit delays possible.';
  }

  const breakdown = [
    { label: 'Precipitation Risk', impact: rain > 60 ? 'Heavy rain risk' : rain > 30 ? 'Intermittent showers' : 'Dry', value: `${rain}%` },
    { label: 'Wind Turbulence', impact: wind > 30 ? 'Gale / Turbulence risk' : 'Calm', value: `${wind} km/h` },
    { label: 'Runway/Corridor Visibility', impact: vis < 2 ? 'Severely restricted' : vis < 4 ? 'Moderate haze' : 'Clear', value: `${vis} km` },
    { label: 'Active Alerts', impact: hasSevere ? 'Severe bulletin active' : 'None', value: hasSevere ? 'Active' : 'Clear' },
  ];

  return {
    score,
    status,
    packingTip,
    rainRisk: rain > 60 ? 'High' : rain > 30 ? 'Moderate' : 'Low',
    windKmh: wind,
    visibilityKm: vis,
    formula: 'Travel Comfort = 100 − (Rain Penalty × 0.45 + Wind Turbulence + Visibility Deficit + Severe Alert Penalty)',
    breakdown,
    disclaimer: ENVIRONMENTAL_DISCLAIMER,
    inputs: { rain, wind, vis, hasSevere },
  };
}

export function calculateCommuteRisk({ rainProbability, visibility = 5, windSpeed, condition = '' }) {
  const rain = Number(rainProbability) || 20;
  const vis = Number(visibility) || 5;
  const wind = Number(windSpeed) || 10;
  const cond = String(condition || '');
  const isStormy = /thunder|storm|heavy rain|downpour/i.test(cond);
  const isFoggy = /fog|mist|haze|dense/i.test(cond) || vis < 3.0;

  let riskLevel = 'LOW';
  let riskColor = 'text-emerald';
  let primaryHazard = 'Clear road conditions and good travel visibility.';
  let advisory = 'Normal commute times expected across highway and city corridors.';
  let delayMinutes = 0;

  if (isStormy || vis < 1.5 || rain >= 75) {
    riskLevel = 'HIGH';
    riskColor = 'text-rose';
    primaryHazard = isStormy
      ? 'Thunderstorms with heavy precipitation and reduced visibility.'
      : 'Heavy rain causing waterlogging and slick asphalt.';
    advisory = 'Expect significant delays on major routes. Use low-beam headlamps and allow 25–35 mins extra travel time.';
    delayMinutes = 30;
  } else if (isFoggy || vis < 3.5 || rain >= 40 || wind > 25) {
    riskLevel = 'MODERATE';
    riskColor = 'text-amber';
    primaryHazard = isFoggy
      ? `Reduced visibility (${vis} km) due to morning fog/haze.`
      : 'Wet asphalt and gusty crosswinds.';
    advisory = 'Drive with caution and maintain safe braking distances. Allow 10–15 mins extra travel time.';
    delayMinutes = 15;
  }

  const numericScore = riskLevel === 'HIGH' ? 8.8 : riskLevel === 'MODERATE' ? 5.4 : 2.1;

  const breakdown = [
    { label: 'Sightline Clarity', impact: vis < 2 ? 'Dangerous dense fog' : vis < 4 ? 'Moderate haze' : 'Optimal', value: `${vis} km` },
    { label: 'Road Surface Friction', impact: rain > 60 ? 'Hydroplaning risk' : rain > 30 ? 'Damp roads' : 'Dry asphalt', value: `${rain}% rain` },
    { label: 'Convective Hazards', impact: isStormy ? 'Severe thunderstorms' : 'Stable', value: cond || 'Clear' },
  ];

  return {
    riskLevel,
    riskColor,
    score: numericScore,
    primaryHazard,
    advisory,
    visibilityKm: vis,
    rainRiskPercent: rain,
    fogRisk: isFoggy ? 'High' : vis < 4 ? 'Medium' : 'Low',
    delayMinutes,
    formula: 'Commute Risk = Convective Severe Trigger + Sightline Loss Deficit + Road Hydroplaning Factor',
    breakdown,
    disclaimer: ENVIRONMENTAL_DISCLAIMER,
    inputs: { rain, vis, wind, condition: cond },
  };
}

export function calculateAgriConditions({ windSpeed, rainProbability = 0, humidity = 60, temperature = 28 }) {
  const wind = Number(windSpeed) || 10;
  const rain = Number(rainProbability) || 0;
  const rh = Number(humidity) || 60;
  const temp = Number(temperature) || 28;

  let isSpraySafe = true;
  let sprayWindow = 'Favorable (Next 6h)';
  let driftRisk = 'Low Spray Drift';
  let sprayAdvice = 'Calm winds and minimal rain likelihood. Safe for foliar nutrient and pest application.';

  if (wind > 15 || rain > 40 || temp > 34) {
    isSpraySafe = false;
    sprayWindow = 'Restricted / Closed';
    driftRisk = wind > 15 ? 'High Wind Drift' : 'Washoff Risk';
    sprayAdvice = wind > 15
      ? 'Avoid spraying. Gusty winds exceed 15 km/h, risking off-target chemical drift.'
      : 'Avoid spraying due to imminent precipitation washoff.';
  } else if (wind < 4) {
    driftRisk = 'Temperature Inversion Risk';
    sprayAdvice = 'Light wind inversion risk. Ensure ground droplet size is calibrated.';
  }

  const et0 = Math.max(1.5, Math.min(9.5, ((temp * 0.15) + ((100 - rh) * 0.04))).toFixed(1));

  const soilMoistureEstimate = rain > 60 ? '85% (Near Saturation)' : rain > 25 ? '72% (Field Capacity)' : '58% (Moderate)';

  const breakdown = [
    { label: 'Wind Drift Factor', impact: wind > 15 ? 'Excessive (>15 km/h)' : 'Safe zone', value: `${wind} km/h` },
    { label: 'Rain Washoff Risk', impact: rain > 30 ? 'Elevated washoff' : 'Safe', value: `${rain}%` },
    { label: 'Evaporation Rate (ET0)', impact: `${et0} mm/day`, value: `${temp}°C, ${rh}% RH` },
    { label: 'Spray Window Status', impact: isSpraySafe ? 'Open' : 'Closed', value: sprayWindow },
  ];

  return {
    isSpraySafe,
    sprayWindow,
    driftRisk,
    sprayAdvice,
    soilMoisture: soilMoistureEstimate,
    evapotranspiration: `${et0} mm/day`,
    formula: 'Agri Spray Suitability = Wind Stability Window (5–14 km/h) ∩ Rain Washoff Immunity (<25%) ∩ Thermal Volatilization Boundary (<32°C)',
    breakdown,
    disclaimer: ENVIRONMENTAL_DISCLAIMER,
    inputs: { wind, rain, rh, temp },
  };
}
