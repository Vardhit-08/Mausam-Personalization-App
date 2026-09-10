import app from './src/app.js';
import { WeatherService } from './src/services/weather.service.js';
import { NormalizationService } from './src/services/normalization.service.js';
import { AlertService } from './src/services/alert.service.js';
import { PersonaService } from './src/services/persona.service.js';
import { MessageService } from './src/services/message.service.js';
import { FcmService } from './src/services/fcm.service.js';
import { NotificationService } from './src/services/notification.service.js';
import { PERSONAS } from './src/config/constants.js';

async function runTests() {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`[Test Runner] Test server started on ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------------------
    // 1. Health Check
    // -------------------------------------------------------------------------
    console.log('1. Testing GET /health ...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    console.log(`   Status: ${healthRes.status}, Health: ${healthJson.status}, Cache: ${healthJson.cacheDriver}`);
    if (healthRes.status !== 200 || healthJson.status !== 'healthy') throw new Error('Health check failed');

    // -------------------------------------------------------------------------
    // 2. Weather Normalization Layer
    // -------------------------------------------------------------------------
    console.log('\n2. Testing Weather Normalization Layer & Abstraction ...');
    const rawMockSample = {
      city: 'Delhi Region',
      latitude: 28.61,
      longitude: 77.23,
      current: {
        temperature: 31.4,
        humidity: 76,
        precipitation_mm: 22.0,
        wind_speed_kmh: 18.5,
        weather_code: 65,
        condition: 'Heavy Rain',
        visibility_km: 2.1,
        aqi: 195,
        soil_moisture_m3: 0.36,
      },
    };
    const normalized = NormalizationService.normalize(rawMockSample);
    console.log(`   Normalized Structure verified: city=${normalized.location.city}, temp=${normalized.temperature}°C, rain=${normalized.rainfall}mm, aqi=${normalized.aqi}`);
    if (!normalized.location || normalized.rainfall !== 22.0 || normalized.aqi !== 195) {
      throw new Error('Normalization Layer failed to produce expected schema');
    }

    // Also verify WeatherService returns NormalizedWeather seamlessly
    const serviceWeather = await WeatherService.getNormalizedWeather(28.6139, 77.2090);
    console.log(`   WeatherService.getNormalizedWeather: city=${serviceWeather.location.city}, condition=${serviceWeather.weatherCondition}`);
    if (!serviceWeather.weatherCondition || serviceWeather.temperature === undefined) {
      throw new Error('WeatherService output is not properly normalized');
    }

    // -------------------------------------------------------------------------
    // 3. Testing ALL 4 Personas on Personalized Home (/api/v1/personalized-home)
    // -------------------------------------------------------------------------
    console.log('\n3. Testing All 4 Personas on GET /api/v1/personalized-home ...');
    const testPersonas = [PERSONAS.FARMER, PERSONAS.TOURIST, PERSONAS.STUDENT, PERSONAS.PARENT];

    for (const persona of testPersonas) {
      const res = await fetch(`${baseUrl}/api/v1/personalized-home?lat=28.6139&lon=77.2090&persona=${persona}`);
      const data = await res.json();
      console.log(`   [${persona}] Status: ${res.status}`);
      console.log(`     Summary: ${data.natural_language_summary}`);
      console.log(`     Cards: ${data.cards?.map((c) => c.card_type).join(', ')}`);

      if (res.status !== 200 || !data.cards || data.persona !== persona) {
        throw new Error(`Personalized home failed for persona: ${persona}`);
      }
    }

    // -------------------------------------------------------------------------
    // 4. Testing Weather Dashboard (/api/v1/weather/dashboard)
    // -------------------------------------------------------------------------
    console.log('\n4. Testing GET /api/v1/weather/dashboard ...');
    const dashRes = await fetch(`${baseUrl}/api/v1/weather/dashboard?lat=28.6139&lon=77.2090&persona=FARMER`);
    const dashJson = await dashRes.json();
    console.log(`   Status: ${dashRes.status}, Source: ${dashJson.source}, Temp: ${dashJson.data?.normalizedWeather?.temperature}°C`);
    if (dashRes.status !== 200 || !dashJson.data?.normalizedWeather) {
      throw new Error('Weather dashboard endpoint failed');
    }

    // -------------------------------------------------------------------------
    // 5. Testing Alert Detection Layer & Significance Check
    // -------------------------------------------------------------------------
    console.log('\n5. Testing Alert Detection Layer ...');

    // Case A: Significant Weather (Heavy Rainfall in Delhi)
    const significantWeather = await WeatherService.getNormalizedWeather(28.6139, 77.2090);
    const alertResultA = AlertService.detectAlert(significantWeather);
    console.log(`   Scenario A (Heavy Rain): isSignificant = ${alertResultA.isSignificant}`);
    console.log(`     Primary Alert: ${alertResultA.primaryAlert?.title} (${alertResultA.primaryAlert?.severity})`);
    if (!alertResultA.isSignificant || !alertResultA.primaryAlert) {
      throw new Error('Alert detection failed to identify significant heavy rainfall');
    }

    // Case B: Non-significant Weather (Bengaluru Clear Sky)
    const mildWeather = await WeatherService.getNormalizedWeather(12.9716, 77.5946);
    const alertResultB = AlertService.detectAlert(mildWeather);
    console.log(`   Scenario B (Mild Bengaluru Weather): isSignificant = ${alertResultB.isSignificant} -> Status: STOP`);
    if (alertResultB.isSignificant) {
      throw new Error('Alert detection erroneously marked mild weather as significant');
    }

    // -------------------------------------------------------------------------
    // 6. Testing Persona Relevance Engine
    // -------------------------------------------------------------------------
    console.log('\n6. Testing Persona Relevance Engine ...');
    const relevantPersonas = PersonaService.getRelevantPersonas(alertResultA);
    console.log(`   Relevant Personas for [${alertResultA.primaryAlert.type}]:`);
    for (const p of relevantPersonas) {
      console.log(`     - ${p.persona}: ${p.relevance} (${p.impact})`);
    }
    if (relevantPersonas.length === 0) {
      throw new Error('Persona relevance engine returned empty list for significant alert');
    }

    // -------------------------------------------------------------------------
    // 7. Testing Message Generation Layer
    // -------------------------------------------------------------------------
    console.log('\n7. Testing Persona Message Generation Layer ...');
    for (const p of testPersonas) {
      const msg = MessageService.generateMessage(p, alertResultA, significantWeather, { fullName: 'Test User' });
      console.log(`   [${p}] Title: "${msg.title}"`);
      console.log(`         Body:  "${msg.body}"`);
      console.log(`         Action: "${msg.action}"`);
      if (!msg.body || !msg.title) throw new Error(`Message generation empty for persona: ${p}`);
    }

    // -------------------------------------------------------------------------
    // 8. Testing End-to-End Redesigned Notification Pipeline (POST /api/v1/alerts/process)
    // -------------------------------------------------------------------------
    console.log('\n8. Testing End-to-End Notification Pipeline (POST /api/v1/alerts/process) ...');

    // Test with significant Delhi weather
    const pipeRes = await fetch(`${baseUrl}/api/v1/alerts/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 28.6139, lon: 77.2090 }),
    });
    const pipeJson = await pipeRes.json();
    console.log(`   Status: ${pipeRes.status}, Pipeline Result Status: ${pipeJson.data?.status}`);
    console.log(`   Alert: [${pipeJson.data?.alert?.severity}] ${pipeJson.data?.alert?.title}`);
    console.log(`   Affected Users Notified: ${pipeJson.data?.affectedUsersCount}`);
    console.log(`   Deliveries Generated: ${pipeJson.data?.deliveries?.length}`);

    if (pipeRes.status !== 200 || pipeJson.data?.status !== 'DELIVERED') {
      throw new Error('End-to-end alert notification pipeline failed');
    }

    // Test with mild Bengaluru weather (should stop early with STOPPED_NOT_SIGNIFICANT)
    const pipeMildRes = await fetch(`${baseUrl}/api/v1/alerts/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: 12.9716, lon: 77.5946 }),
    });
    const pipeMildJson = await pipeMildRes.json();
    console.log(`   Mild Weather Test Status: ${pipeMildJson.data?.status}`);
    if (pipeMildJson.data?.status !== 'STOPPED_NOT_SIGNIFICANT') {
      throw new Error('Mild weather pipeline did not stop as expected');
    }

    // -------------------------------------------------------------------------
    // 9. Station Search & Nearest Station Lookup
    // -------------------------------------------------------------------------
    console.log('\n9. Testing Stations Endpoint ...');
    const stationsRes = await fetch(`${baseUrl}/api/v1/stations?search=delhi`);
    const stationsJson = await stationsRes.json();
    console.log(`   Status: ${stationsRes.status}, Stations found: ${stationsJson.data?.length}`);

    const nearestRes = await fetch(`${baseUrl}/api/v1/stations/nearest?lat=28.6139&lon=77.2090`);
    const nearestJson = await nearestRes.json();
    console.log(`   Nearest: ${nearestJson.data?.station_name} (${nearestJson.data?.distanceKm} km)`);
    if (nearestRes.status !== 200) throw new Error('Stations test failed');

    console.log('\n=============================================================');
    console.log('>>> ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY! <<<');
    console.log('=============================================================');
  } catch (err) {
    console.error('\n[Test Runner Error]', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
