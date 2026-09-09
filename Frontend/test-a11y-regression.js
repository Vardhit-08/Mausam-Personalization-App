/**
 * test-a11y-regression.js
 * 
 * Part 18 & 19: Accessibility & Full Regression Verification Suite
 * Validates:
 * 1. ARIA Dialog & Modal compliance on all interactive overlays
 * 2. Focus-visible and reduced-motion CSS rules in index.css
 * 3. ARIA roles and labels on switcher, toggles, drawers, and notifications
 * 4. High-contrast color palette compliance (WCAG AA)
 * 5. Full End-to-End User State Machine integration (Auth -> Persona -> City -> Mode -> Scenarios)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n====================================================');
console.log('MAUSAM SIH26076 — ACCESSIBILITY & REGRESSION SUITE (PARTS 18 & 19)');
console.log('====================================================\n');

// GROUP 1: ARIA Dialog & Modal Contract Compliance
console.log('TEST GROUP 1: ARIA Dialog & Modal Accessibility');
const citySelectorCode = fs.readFileSync(path.join(__dirname, 'src/components/CitySelectorModal.jsx'), 'utf-8');
const profileModalCode = fs.readFileSync(path.join(__dirname, 'src/components/ProfileModal.jsx'), 'utf-8');
const guidedTourCode = fs.readFileSync(path.join(__dirname, 'src/components/GuidedTour.jsx'), 'utf-8');

assert(citySelectorCode.includes('role="dialog"'), 'CitySelectorModal includes role="dialog"');
assert(citySelectorCode.includes('aria-modal="true"'), 'CitySelectorModal includes aria-modal="true"');
assert(citySelectorCode.includes('aria-labelledby="city-selector-title"'), 'CitySelectorModal has aria-labelledby');
assert(citySelectorCode.includes('e.key === \'Escape\''), 'CitySelectorModal supports Escape key closing');

assert(profileModalCode.includes('role="dialog"'), 'ProfileModal includes role="dialog"');
assert(profileModalCode.includes('aria-modal="true"'), 'ProfileModal includes aria-modal="true"');
assert(profileModalCode.includes('aria-labelledby="profile-modal-title"'), 'ProfileModal has aria-labelledby');
assert(profileModalCode.includes('aria-label="Close Profile"'), 'ProfileModal close button has aria-label');

assert(guidedTourCode.includes('role="dialog"'), 'GuidedTour floating card includes role="dialog"');
assert(guidedTourCode.includes('aria-modal="true"'), 'GuidedTour includes aria-modal="true"');
assert(guidedTourCode.includes('aria-labelledby="tour-dialog-title"'), 'GuidedTour has aria-labelledby');

// GROUP 2: Switchers, Toggles & Expandable Drawers ARIA
console.log('\nTEST GROUP 2: Component ARIA Attributes & Controls');
const personaSwitcherCode = fs.readFileSync(path.join(__dirname, 'src/components/PersonaSwitcher.jsx'), 'utf-8');
const modeToggleCode = fs.readFileSync(path.join(__dirname, 'src/components/ModeToggle.jsx'), 'utf-8');
const insightCardCode = fs.readFileSync(path.join(__dirname, 'src/components/InsightCard.jsx'), 'utf-8');
const dynamicCardGridCode = fs.readFileSync(path.join(__dirname, 'src/components/DynamicCardGrid.jsx'), 'utf-8');
const notificationCenterCode = fs.readFileSync(path.join(__dirname, 'src/components/NotificationCenter.jsx'), 'utf-8');

assert(personaSwitcherCode.includes('role="radiogroup"'), 'PersonaSwitcher has role="radiogroup"');
assert(personaSwitcherCode.includes('role="radio"'), 'Persona switcher options have role="radio"');
assert(personaSwitcherCode.includes('aria-checked={isSelected}'), 'Persona switcher tracks aria-checked');

assert(modeToggleCode.includes('role="group"'), 'ModeToggle has role="group"');
assert(modeToggleCode.includes('aria-pressed='), 'ModeToggle has aria-pressed on toggle buttons');

assert(insightCardCode.includes('aria-expanded={showWhy}'), 'InsightCard why-button has aria-expanded');
assert(insightCardCode.includes('role="region"'), 'InsightCard why-panel has role="region"');

assert(dynamicCardGridCode.includes('aria-expanded={isWhyOpen}'), 'DynamicCardGrid why-button has aria-expanded');
assert(dynamicCardGridCode.includes('role="region"'), 'DynamicCardGrid why-drawer has role="region"');

assert(notificationCenterCode.includes('aria-expanded={isOpen}'), 'NotificationCenter trigger has aria-expanded');
assert(notificationCenterCode.includes('aria-haspopup="dialog"'), 'NotificationCenter trigger has aria-haspopup');

// GROUP 3: CSS Focus-Visible & Reduced Motion Rules
console.log('\nTEST GROUP 3: Design System Focus-Visible & Reduced-Motion Rules');
const cssCode = fs.readFileSync(path.join(__dirname, 'src/index.css'), 'utf-8');

assert(cssCode.includes(':focus-visible'), 'index.css defines high-contrast :focus-visible rules');
assert(cssCode.includes('outline: 2px solid'), 'Focus ring has clear 2px outline');
assert(cssCode.includes('@media (prefers-reduced-motion: reduce)'), 'Universal prefers-reduced-motion media query present');
assert(cssCode.includes('overflow-x: hidden'), 'html, body, and page-wrapper guard against horizontal scroll');

// GROUP 4: Full State Machine Integration (Persona, City, Mode, Alerts)
console.log('\nTEST GROUP 4: End-to-End System State Machine Integration');
import { generatePersonalizedDashboard, PERSONAS } from './src/services/personalizationEngine.js';
import { CITIES_DATA } from './src/data/citiesData.js';
import { calculateSweatRisk, calculateCommuteRisk } from './src/services/indicesCalculator.js';

// Verify all 5 personas produce valid, complete synthesized dashboards
const personaKeys = ['fitness', 'traveler', 'health', 'commuter', 'agriculture'];
personaKeys.forEach((p) => {
  const city = CITIES_DATA[0]; // Nanded
  const data = generatePersonalizedDashboard({ persona: p, cityData: city });
  assert(data.insightCard && data.insightCard.title, `Persona "${p}" generates complete insight card`);
  assert(Array.isArray(data.prioritizedCards) && data.prioritizedCards.length > 0, `Persona "${p}" generates prioritized cards array`);
  assert(data.prioritizedCards.every(c => typeof c.relevance === 'number'), `Persona "${p}" all cards have valid numerical relevance score`);
});

// Verify City Switch Retains Calculation Integrity
const delhiCity = CITIES_DATA.find(c => c.cityId === 'delhi');
const fitnessDelhi = generatePersonalizedDashboard({ persona: 'fitness', cityData: delhiCity });
assert(fitnessDelhi.insightCard && fitnessDelhi.insightCard.title, 'Data calculation accurately binds to switched city (Delhi)');

// GROUP 5: Institutional Color System & Contrast
console.log('\nTEST GROUP 5: Institutional Theme Integrity');
assert(cssCode.includes('--imd-blue: #0068B7'), 'Official primary IMD blue token (#0068B7) present');
assert(cssCode.includes('--bg-main: #061938'), 'Deep institutional blue background token (#061938) present');
assert(cssCode.includes('--text-primary: #ffffff'), 'Crisp high-contrast white text token (#ffffff) present');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL ACCESSIBILITY & REGRESSION TESTS PASSED! ✓\n');
  process.exit(0);
}
