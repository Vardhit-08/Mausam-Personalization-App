import { generatePersonalizedDashboard } from './src/services/personalizationEngine.js';

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
console.log('MAUSAM SIH26076 — DYNAMIC CARD PRIORITIZATION TEST (PART 8)');
console.log('====================================================\n');

console.log('TEST GROUP 1: Persona Base Alignment');
const fitnessDash = generatePersonalizedDashboard({
  persona: 'fitness',
  cityData: { current: { temperature: 26, humidity: 50, rain: { probability: 10 } } },
});
const fCards = fitnessDash.prioritizedCards;
assert(fCards[0].id === 'running-window', `Fitness rank #1 is running-window (got ${fCards[0].id})`);
assert(fCards[1].id === 'sweat-risk', `Fitness rank #2 is sweat-risk (got ${fCards[1].id})`);
assert(fCards[0].relevance >= fCards[1].relevance, 'Cards are sorted descending by relevance');

const travelerDash = generatePersonalizedDashboard({
  persona: 'traveler',
  cityData: { current: { temperature: 24, humidity: 45, rain: { probability: 15 } } },
});
const tCards = travelerDash.prioritizedCards;
assert(tCards[0].id === 'travel-dest', `Traveler rank #1 is travel-dest (got ${tCards[0].id})`);
assert(tCards[1].id === 'rain-probability', `Traveler rank #2 is rain-probability (got ${tCards[1].id})`);

const healthDash = generatePersonalizedDashboard({
  persona: 'health',
  cityData: { current: { temperature: 27, humidity: 55, rain: { probability: 10 } } },
});
const hCards = healthDash.prioritizedCards;
assert(hCards[0].id === 'aqi-pollen', `Health rank #1 is aqi-pollen (got ${hCards[0].id})`);
assert(hCards[1].id === 'uv-radiation', `Health rank #2 is uv-radiation (got ${hCards[1].id})`);

const commuterDash = generatePersonalizedDashboard({
  persona: 'commuter',
  cityData: { current: { temperature: 28, humidity: 60, rain: { probability: 20 } } },
});
const cCards = commuterDash.prioritizedCards;
assert(cCards[0].id === 'commute-cond', `Commuter rank #1 is commute-cond (got ${cCards[0].id})`);
assert(cCards[1].id === 'rain-probability', `Commuter rank #2 is rain-probability (got ${cCards[1].id})`);

const agriDash = generatePersonalizedDashboard({
  persona: 'agriculture',
  cityData: { current: { temperature: 25, humidity: 50, rain: { probability: 5 } } },
});
const aCards = agriDash.prioritizedCards;
assert(aCards[0].id === 'agri-soil', `Agriculture rank #1 is agri-soil (got ${aCards[0].id})`);
assert(aCards[1].id === 'agri-spray', `Agriculture rank #2 is agri-spray (got ${aCards[1].id})`);

console.log('\nTEST GROUP 2: Severe Weather Hazard Promotion');
const rainStormDash = generatePersonalizedDashboard({
  persona: 'fitness',
  cityData: { current: { temperature: 24, humidity: 85, rain: { probability: 85 } } },
  scenarioOverrides: { rainProbability: 85, condition: 'Heavy Downpour' },
});
const stormCards = rainStormDash.prioritizedCards;
const rainCard = stormCards.find(c => c.id === 'rain-probability');
assert(rainCard.relevance >= 90, `Rain card receives heavy downpour boost: got ${rainCard.relevance}`);
assert(rainCard.why.includes('Heavy downpour boost'), 'Why explanation records heavy downpour boost');

const alertDash = generatePersonalizedDashboard({
  persona: 'fitness',
  cityData: { current: { temperature: 22, humidity: 70, rain: { probability: 40 } } },
  scenarioOverrides: {
    alerts: [{ id: 'cyclone-1', headline: 'Cyclone Alert', severity: 'Severe' }],
    rainProbability: 75,
  },
});
const alertCards = alertDash.prioritizedCards;
const alertCommute = alertCards.find(c => c.id === 'commute-cond');
assert(alertCommute.why.includes('severe weather bulletin'), 'Advises of active severe weather bulletin');

console.log('\nTEST GROUP 3: Monotonicity & Boundary Invariants');
let isMonotonic = true;
for (let i = 0; i < stormCards.length - 1; i++) {
  if (stormCards[i].relevance < stormCards[i + 1].relevance) {
    isMonotonic = false;
    break;
  }
}
assert(isMonotonic, 'Cards are strictly monotonic in descending order');

let allClamped = true;
for (const card of stormCards) {
  if (card.relevance < 5 || card.relevance > 99) {
    allClamped = false;
    break;
  }
}
assert(allClamped, 'All card relevance scores fall within [5, 99]');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL DYNAMIC CARD PRIORITIZATION TESTS PASSED! ✓\n');
  process.exit(0);
}
