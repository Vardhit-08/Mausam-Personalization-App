
import {
  calculateSweatRisk,
  calculateExerciseComfort,
  calculateOutdoorComfort,
  calculateTravelComfort,
  calculateCommuteRisk,
  calculateAgriConditions,
} from './src/services/indicesCalculator.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('====================================================');
console.log('MAUSAM SIH26076 — ALGORITHMIC INDICES TEST SUITE (PART 7)');
console.log('====================================================\n');

console.log('TEST GROUP 1: Sweat Risk Index');

const srNormal = calculateSweatRisk({ temperature: 28, humidity: 55, uvIndex: 5, windSpeed: 12, rainProbability: 10 });
assert(srNormal.score >= 0 && srNormal.score <= 100, `Normal score in 0-100 range: got ${srNormal.score}`);
assert(typeof srNormal.category === 'string', `Category returned: ${srNormal.category}`);
assert(typeof srNormal.formula === 'string' && srNormal.formula.includes('Sweat Risk'), 'Formula explanation included');
assert(Array.isArray(srNormal.breakdown) && srNormal.breakdown.length === 4, 'Breakdown factors array present');
assert(typeof srNormal.disclaimer === 'string' && srNormal.disclaimer.includes('decision-support'), 'Medical disclaimer present');

const srExtreme = calculateSweatRisk({ temperature: 46, humidity: 85, uvIndex: 11, windSpeed: 2, rainProbability: 20 });
assert(srExtreme.score >= 80, `Extreme heatwave yields EXTREME category: score ${srExtreme.score}`);
assert(srExtreme.category === 'EXTREME', 'Category is EXTREME');

const srCold = calculateSweatRisk({ temperature: -5, humidity: 30, uvIndex: 1, windSpeed: 25, rainProbability: 0 });
assert(srCold.score <= 20, `Freezing conditions yield low sweat risk: score ${srCold.score}`);
assert(srCold.category === 'LOW', 'Category is LOW');

const srZeroWind = calculateSweatRisk({ temperature: 32, humidity: 60, uvIndex: 6, windSpeed: 0, rainProbability: 0 });
assert(srZeroWind.score >= 0 && srZeroWind.score <= 100, `Zero wind handled without NaN: score ${srZeroWind.score}`);

const srMaxHumidity = calculateSweatRisk({ temperature: 35, humidity: 100, uvIndex: 8, windSpeed: 5, rainProbability: 80 });
assert(srMaxHumidity.score <= 100, `100% humidity score does not exceed 100: score ${srMaxHumidity.score}`);

console.log('\nTEST GROUP 2: Exercise Comfort Index');

const ecIdeal = calculateExerciseComfort({ temperature: 16, humidity: 45, uvIndex: 2, windSpeed: 8, rainProbability: 0 });
assert(ecIdeal.score >= 85, `Ideal conditions yield high comfort score: got ${ecIdeal.score}`);
assert(ecIdeal.status === 'OPTIMAL', `Status is OPTIMAL: got ${ecIdeal.status}`);
assert(typeof ecIdeal.bestWindow === 'string', `Best window suggested: ${ecIdeal.bestWindow}`);

const ecAdverse = calculateExerciseComfort({ temperature: 40, humidity: 85, uvIndex: 10, windSpeed: 25, rainProbability: 80 });
assert(ecAdverse.score < 50, `Severe conditions yield UNFAVORABLE comfort: score ${ecAdverse.score}`);
assert(ecAdverse.status === 'UNFAVORABLE', `Status is UNFAVORABLE: got ${ecAdverse.status}`);

const ecFreezing = calculateExerciseComfort({ temperature: -10, humidity: 40, uvIndex: 1, windSpeed: 10, rainProbability: 0 });
assert(ecFreezing.score >= 5 && ecFreezing.score <= 100, `Freezing temperature correctly penalizes comfort without crash: score ${ecFreezing.score}`);

console.log('\nTEST GROUP 3: Outdoor Environmental Comfort Index');

const ocPristine = calculateOutdoorComfort({
  airQuality: { aqi: 35, category: 'Good' },
  pollen: { index: 2, level: 'Low' },
  uvIndex: 3,
  temperature: 24,
  humidity: 45,
});
assert(ocPristine.score >= 80, `Clean air yields GOOD comfort score: ${ocPristine.score}`);
assert(ocPristine.status === 'GOOD', `Status is GOOD: got ${ocPristine.status}`);

const ocSmog = calculateOutdoorComfort({
  airQuality: { aqi: 420, category: 'Hazardous' },
  pollen: { index: 8, level: 'High' },
  uvIndex: 8,
  temperature: 36,
  humidity: 75,
});
assert(ocSmog.score < 45, `Severe smog penalizes comfort to POOR: score ${ocSmog.score}`);
assert(ocSmog.status === 'POOR', `Status is POOR: got ${ocSmog.status}`);
assert(ocSmog.summary.includes('N95'), 'Advises protective mask');

console.log('\nTEST GROUP 4: Travel Comfort Index');

const tcClear = calculateTravelComfort({ rainProbability: 5, windSpeed: 8, visibility: 9, severeAlerts: [] });
assert(tcClear.score >= 85, `Clear skies yield EXCELLENT travel index: score ${tcClear.score}`);
assert(tcClear.status === 'EXCELLENT', `Status is EXCELLENT: got ${tcClear.status}`);

const tcDisrupted = calculateTravelComfort({
  rainProbability: 85,
  windSpeed: 45,
  visibility: 1.5,
  severeAlerts: [{ id: 'storm-1', severity: 'Severe' }],
});
assert(tcDisrupted.score < 50, `Severe storm yields DISRUPTED travel index: score ${tcDisrupted.score}`);
assert(tcDisrupted.status === 'DISRUPTED', `Status is DISRUPTED: got ${tcDisrupted.status}`);
assert(tcDisrupted.packingTip.includes('waterproof') || tcDisrupted.packingTip.includes('rainproof'), 'Includes waterproof packing guidance');

console.log('\nTEST GROUP 5: Commute Risk Score');

const crClear = calculateCommuteRisk({ rainProbability: 10, visibility: 7.0, windSpeed: 8, condition: 'Sunny' });
assert(crClear.riskLevel === 'LOW', `Clear conditions yield LOW risk: got ${crClear.riskLevel}`);
assert(crClear.delayMinutes === 0, 'No extra delay estimated for clear commute');

const crDenseFog = calculateCommuteRisk({ rainProbability: 20, visibility: 0.8, windSpeed: 5, condition: 'Dense Fog' });
assert(crDenseFog.riskLevel === 'HIGH', `Dense fog yields HIGH risk: got ${crDenseFog.riskLevel}`);
assert(crDenseFog.fogRisk === 'High', 'Fog risk is flagged as High');
assert(crDenseFog.delayMinutes >= 25, `High risk adds delay buffer: ${crDenseFog.delayMinutes} mins`);

const crStorm = calculateCommuteRisk({ rainProbability: 90, visibility: 2.0, windSpeed: 30, condition: 'Severe Thunderstorm' });
assert(crStorm.riskLevel === 'HIGH', `Thunderstorm yields HIGH risk: got ${crStorm.riskLevel}`);
assert(crStorm.primaryHazard.includes('Thunderstorm') || crStorm.primaryHazard.includes('precipitation'), 'Identifies thunderstorm hazard');

console.log('\nTEST GROUP 6: Agricultural Operations Index');

const agriOptimal = calculateAgriConditions({ windSpeed: 9, rainProbability: 5, humidity: 55, temperature: 26 });
assert(agriOptimal.isSpraySafe === true, 'Spray is safe in optimal window');
assert(agriOptimal.sprayWindow.includes('Favorable'), `Spray window is favorable: ${agriOptimal.sprayWindow}`);
assert(agriOptimal.driftRisk === 'Low Spray Drift', `Drift risk is low: ${agriOptimal.driftRisk}`);

const agriWindy = calculateAgriConditions({ windSpeed: 22, rainProbability: 10, humidity: 50, temperature: 28 });
assert(agriWindy.isSpraySafe === false, 'Spray is restricted in high wind');
assert(agriWindy.sprayAdvice.includes('off-target chemical drift') || agriWindy.sprayAdvice.includes('15 km/h'), 'Advises against chemical drift');

const agriRain = calculateAgriConditions({ windSpeed: 8, rainProbability: 65, humidity: 85, temperature: 27 });
assert(agriRain.isSpraySafe === false, 'Spray is restricted under high rain probability');
assert(agriRain.soilMoisture.includes('Saturation'), `Soil moisture is near saturation: ${agriRain.soilMoisture}`);

console.log('\nTEST GROUP 7: Determinism & Non-Randomness Verification');

const inputs = { temperature: 31, humidity: 62, uvIndex: 7, windSpeed: 14, rainProbability: 35 };
const initialResult = calculateSweatRisk(inputs);
let isDeterministic = true;

for (let i = 0; i < 50; i++) {
  const result = calculateSweatRisk(inputs);
  if (result.score !== initialResult.score || result.category !== initialResult.category) {
    isDeterministic = false;
    break;
  }
}
assert(isDeterministic, 'Index calculation is strictly deterministic (50 identical runs produce identical output)');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL ALGORITHMIC INDICES TESTS PASSED SUCCESSFULLY! ✓\n');
  process.exit(0);
}
