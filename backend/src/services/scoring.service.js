import { calculateHeatIndex } from '../utils/helpers.js';

export class ScoringService {
  /**
   * Universal Comfort Index based on temperature and relative humidity
   */
  static computeComfortIndex(tempC, humidity) {
    const heatIndexC = calculateHeatIndex(tempC, humidity);

    let comfortScore = 100;
    if (heatIndexC > 24) comfortScore -= (heatIndexC - 24) * 4;
    else if (heatIndexC < 18) comfortScore -= (18 - heatIndexC) * 5;

    if (humidity > 65) comfortScore -= (humidity - 65) * 0.6;
    else if (humidity < 30) comfortScore -= (30 - humidity) * 0.5;

    comfortScore = Math.round(Math.min(Math.max(comfortScore, 10), 100));

    let category = 'Comfortable';
    if (comfortScore >= 75) category = 'Optimal';
    else if (comfortScore >= 55) category = 'Pleasant';
    else if (comfortScore >= 35) category = 'Uncomfortable';
    else category = 'Very Uncomfortable';

    return {
      comfort_score: comfortScore,
      category,
      heat_index_c: heatIndexC,
      temperature_c: tempC,
      humidity_percent: humidity,
    };
  }

  /**
   * FARMER: Evaluates soil moisture, rainfall, soil temperature, and agricultural conditions
   */
  static scoreFarmer(normalized) {
    const { soilMoisture, soilTemperature, rainfall, windSpeed, temperature } = normalized;

    let moistureStatus = 'Optimal';
    let irrigationRecommendation = 'Soil moisture is in the healthy zone. Follow regular watering schedule.';

    if (soilMoisture < 0.18) {
      moistureStatus = 'Dry';
      irrigationRecommendation = 'Low topsoil moisture. Morning or evening irrigation recommended.';
    } else if (soilMoisture > 0.35 || rainfall > 15) {
      moistureStatus = 'Saturated / Wet';
      irrigationRecommendation = 'High soil saturation due to precipitation. Withhold irrigation to prevent root rot.';
    }

    let fieldWorkScore = 85;
    if (rainfall > 10) fieldWorkScore -= 35;
    if (windSpeed > 25) fieldWorkScore -= 20;
    if (temperature > 38 || temperature < 8) fieldWorkScore -= 25;
    fieldWorkScore = Math.max(15, Math.min(100, fieldWorkScore));

    return {
      farming_suitability_score: fieldWorkScore,
      soil_moisture_m3: soilMoisture,
      soil_moisture_status: moistureStatus,
      soil_temperature_c: soilTemperature,
      irrigation_recommendation: irrigationRecommendation,
      rainfall_mm: rainfall,
      frost_risk: soilTemperature < 4,
      heat_stress: temperature > 38,
    };
  }

  /**
   * TOURIST: Evaluates outdoor sightseeing feasibility, rain impact, comfort, and UV
   */
  static scoreTourist(normalized) {
    const { temperature, humidity, rainfall, visibility, uvIndex } = normalized;
    const comfort = this.computeComfortIndex(temperature, humidity);

    let sightseeingScore = comfort.comfort_score;
    if (rainfall > 5) sightseeingScore -= 30;
    if (rainfall > 20) sightseeingScore -= 50;
    if (visibility < 3) sightseeingScore -= 20;
    if (uvIndex > 8) sightseeingScore -= 15;
    sightseeingScore = Math.max(10, Math.min(100, sightseeingScore));

    let travelAdvice = 'Great day for outdoor sightseeing and landmark visits.';
    if (rainfall > 15) {
      travelAdvice = 'Heavy rain expected. Prioritize indoor museums, galleries, and cultural centers.';
    } else if (comfort.comfort_score < 40) {
      travelAdvice = 'Extreme thermal discomfort. Schedule excursions during cooler early morning or late evening hours.';
    }

    return {
      sightseeing_score: sightseeingScore,
      comfort_category: comfort.category,
      rainfall_mm: rainfall,
      uv_index: uvIndex,
      visibility_km: visibility,
      travel_advice: travelAdvice,
      carry_umbrella: rainfall > 2,
      sun_protection_needed: uvIndex >= 6,
    };
  }

  /**
   * STUDENT: Evaluates commute ease, rain gear requirement, outdoor sports/study conditions
   */
  static scoreStudent(normalized) {
    const { rainfall, visibility, temperature, aqi, weatherCondition } = normalized;

    let commuteEaseScore = 90;
    if (rainfall > 5) commuteEaseScore -= 25;
    if (rainfall > 20) commuteEaseScore -= 45;
    if (visibility < 2) commuteEaseScore -= 20;
    if (aqi > 150) commuteEaseScore -= 15;
    commuteEaseScore = Math.max(15, Math.min(100, commuteEaseScore));

    let rainProtection = 'None required';
    if (rainfall > 15) rainProtection = 'Heavy rain gear: Waterproof jacket and umbrella essential';
    else if (rainfall > 2) rainProtection = 'Carry a compact umbrella';

    let studyActivityAdvice = 'Ideal day for classes and campus activities.';
    if (commuteEaseScore < 50) {
      studyActivityAdvice = 'Transit disruptions likely. Plan for extra travel time to campus.';
    } else if (aqi > 200) {
      studyActivityAdvice = 'High pollution levels. Avoid outdoor sports; wear an N95 mask during commute.';
    }

    return {
      commute_ease_score: commuteEaseScore,
      weather_condition: weatherCondition,
      rain_protection_required: rainProtection,
      outdoor_sports_safe: aqi <= 150 && rainfall <= 2,
      study_activity_advice: studyActivityAdvice,
      aqi,
    };
  }

  /**
   * PARENT: Evaluates child outdoor safety, school commute hazards, respiratory/AQI caution
   */
  static scoreParent(normalized) {
    const { temperature, rainfall, aqi, visibility, windSpeed } = normalized;

    let childSafetyScore = 95;
    if (rainfall > 10) childSafetyScore -= 30;
    if (aqi > 150) childSafetyScore -= 25;
    if (aqi > 250) childSafetyScore -= 45;
    if (temperature > 38 || temperature < 8) childSafetyScore -= 20;
    if (visibility < 1.5) childSafetyScore -= 15;
    childSafetyScore = Math.max(10, Math.min(100, childSafetyScore));

    let schoolCommuteStatus = 'Normal & Safe';
    if (rainfall > 20 || visibility < 1.0) schoolCommuteStatus = 'Caution: Expect school bus delays & wet roads';
    else if (rainfall > 5) schoolCommuteStatus = 'Moderate: Wet walkways; rain gear needed';

    let healthNotice = 'Safe environmental conditions for children.';
    if (aqi > 200) {
      healthNotice = `Severe AQI (${aqi}): High respiratory risk for children. Restrict outdoor play.`;
    } else if (temperature > 38) {
      healthNotice = 'High heat index: Ensure children drink plenty of fluids and stay in shaded areas.';
    }

    return {
      child_safety_score: childSafetyScore,
      school_commute_status: schoolCommuteStatus,
      health_notice: healthNotice,
      aqi_level: aqi,
      carry_child_rainwear: rainfall > 2,
      extreme_weather_flag: childSafetyScore < 50,
    };
  }
}
