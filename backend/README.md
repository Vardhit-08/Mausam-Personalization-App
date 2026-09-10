# Mausam Persona-Driven Weather Aggregator & Decision Gateway

> **SIH Problem Statement ID: 26076**  
> *Ministry of Earth Sciences – Indian Meteorological Department (IMD)*  
> **Development of personalized homepage for 'Mausam' application**

---

## 📖 Overview

The standard Mausam application publishes multiple domain-siloed data feeds (current weather, city forecast, nowcast, bulletins, AQI, agromet advisories). This backend serves as the **Decision Layer & Backend-for-Frontend (BFF)** that stitches together relevant endpoints per persona into an actionable, composite-scored homepage payload.

### Core Capabilities
- **Persona Data Fusion Engine:** Concurrently fetches base weather and specialized environmental feeds (Air Quality, Marine swell, Soil moisture, Extended forecasts).
- **Composite Scoring Layer:** Computes rule-based, explainable metrics:
  - *Allergy & Respiratory Risk Index* (PM2.5, PM10, Dust, Pollen, Humidity)
  - *Thermal Comfort Index* (Steadman / Rothfusz Heat Index regression)
  - *Best Running & Outdoor Workout Hours* (Hourly temperature, UV radiation, humidity)
  - *Coastal / Marine Safety Advisory* (Wave height, period, current velocity)
  - *Agromet Soil Guidance* (Soil temperature, topsoil moisture saturation)
  - *Commute & Highway Nowcast Risk* (Fog, visibility, wet road hazards)
  - *Traveler Smart Packing Engine* (Rule-based checklist generator based on forecast)
- **Multi-Tier Caching:** Redis caching with seamless in-memory `NodeCache` fallback (15-min TTL default).
- **Zero-Downtime Offline Datasets:** Static JSON snapshots guarantee resilient stage demos even if government endpoints or third-party connections fail.
- **Firebase Authentication & Firestore Persistence:** Full support for Firebase Admin SDK token verification, user profiles, saved locations, and FCM push notifications with simulated fallback in local development.
- **OpenAPI 3.0 / Swagger Integration:** Interactive API documentation hosted at `/api-docs`.

---

## 📂 Professional Project Structure

```
sih/
├── .env                                  # Environment variables (fill your keys here)
├── .env.example                          # Sample environment configuration template
├── docs/                                 # Official SIH problem statement and architecture docs
├── package.json                          # Dependencies, scripts, and module settings
├── index.js                              # Root entry point forwarding to src/server.js
├── README.md                             # Project documentation
├── weather_persona_system_architecture.md# System Architecture & Flowcharts
└── src/
    ├── app.js                            # Express app (security, middleware, routes, errors)
    ├── server.js                         # Server bootstrapper & graceful shutdown handler
    ├── config/
    │   ├── constants.js                  # Personas, card types, cache keys, thresholds
    │   ├── env.js                        # Validated environment loader
    │   ├── cache.js                      # Redis / NodeCache dual-driver cache manager
    │   └── firebase.js                   # Firebase Admin SDK & dev mock storage
    ├── controllers/
    │   ├── weather.controller.js         # /dashboard & /personalized-home
    │   ├── user.controller.js            # Profiles, saved locations, preferences
    │   ├── packing.controller.js         # Smart travel packing checklists
    │   ├── alerts.controller.js          # Weather threshold alerts & FCM triggers
    │   └── stations.controller.js        # IMD station lookup & nearest station matching
    ├── data/
    │   ├── static_stations.json          # Pre-mapped IMD weather stations across India
    │   └── mock_weather.json             # Fallback snapshots for offline demos
    ├── docs/
    │   └── swagger.json                  # OpenAPI 3.0 specification
    ├── middlewares/
    │   ├── auth.middleware.js            # Firebase Bearer token verification + dev bypass
    │   ├── error.middleware.js           # Centralized error handler & ApiError class
    │   └── validator.middleware.js       # Request query/body validation helpers
    ├── models/
    │   ├── user.model.js                 # Firestore 'users' collection model
    │   ├── location.model.js             # Firestore 'saved_locations' collection model
    │   ├── preference.model.js           # Firestore 'persona_preferences' collection model
    │   ├── alert.model.js                # Firestore 'alerts_log' collection model
    │   └── packing.model.js              # Firestore 'packing_checklists' collection model
    ├── routes/
    │   ├── index.js                      # Main router mounting /api/v1
    │   ├── weather.routes.js             # Weather & personalized home routes
    │   ├── user.routes.js                # User profile & saved locations
    │   ├── packing.routes.js             # Packing checklist generator
    │   ├── alerts.routes.js              # Alerts & notifications
    │   ├── stations.routes.js            # IMD station search & geo lookup
    │   └── docs.routes.js                # Swagger UI router
    ├── services/
    │   ├── aggregator.service.js         # Core Persona Data Fusion Engine
    │   ├── weather.service.js            # External Open-Meteo & IMD API client
    │   ├── scoring.service.js            # Composite indices (Comfort, Running, Allergy)
    │   ├── packing.service.js            # Travel forecast packing rules engine
    │   ├── notification.service.js       # FCM push notification dispatcher
    │   └── cron.service.js               # Background 10-minute threshold monitor
    └── utils/
        ├── apiResponse.js                # Consistent JSON response wrapper
        ├── helpers.js                    # Haversine distance, heat index, normalization
        └── logger.js                     # Structured timestamped logger
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **NPM**: v9+

### 2. Environment Configuration
Open `.env` in the root directory and populate your keys when ready:
```ini
PORT=5000
NODE_ENV=development

# Firebase Admin SDK (leave empty to use local mock mode)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_DATABASE_URL=

# Redis (leave empty to use in-memory NodeCache)
REDIS_URL=

# External APIs
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
AIR_QUALITY_BASE_URL=https://air-quality-api.open-meteo.com/v1
MARINE_BASE_URL=https://marine-api.open-meteo.com/v1
IMD_API_BASE_URL=
IMD_API_KEY=
CPCB_API_KEY=
AI_API_KEY=
```

> **Note:** Even with blank tokens/keys in `.env`, the server boots up seamlessly using safe dev fallbacks and in-memory caching!

### 3. Run the Server
```bash
# Start in production mode
npm start

# Or start in live reload development mode
npm run dev
```

Server will be running at `http://localhost:5000`.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| `GET` | `/health` | Service health, cache driver, uptime | None |
| `GET` | `/api-docs` | Interactive Swagger UI documentation | None |
| `GET` | `/api/v1/weather/dashboard` | Aggregated raw weather + specialized metrics | `lat`, `lon`, `persona` |
| `GET` | `/api/v1/personalized-home` | Decision-layer composite cards & plain-language summary | `lat`, `lon`, `persona` |
| `GET` | `/api/v1/stations` | Search pre-mapped IMD weather stations | `search` (optional) |
| `GET` | `/api/v1/stations/nearest` | Find nearest IMD station by coordinates | `lat`, `lon` |
| `POST` | `/api/v1/packing/generate` | Generate smart packing checklist from forecast | `{ destination, startDate, endDate }` |
| `GET` | `/api/v1/packing/checklists` | List saved packing checklists | None (Bearer token or guest) |
| `GET` | `/api/v1/alerts` | List threshold breaches and weather warnings | None |
| `POST` | `/api/v1/alerts/test` | Trigger manual test alert | `{ persona, severity, message }` |

---

## 🎭 Supported Personas

1. **`HEALTH_CONSCIOUS` / `health_conscious`**:
   - Focus: AQI, PM2.5, PM10, Dust, Pollen, Humidity.
   - Cards: `ALLERGY_RISK_WIDGET`, `COMFORT_INDEX_CARD`.
2. **`FITNESS` / `fitness`**:
   - Focus: Best running hours, UV index, heat index, wind.
   - Cards: `BEST_HOURS_TIMELINE`, `COMFORT_INDEX_CARD`.
3. **`BEACHGOER` / `surfer`**:
   - Focus: Wave height, wave period, ocean currents, swell warning.
   - Cards: `MARINE_SURF_REPORT`, `COMFORT_INDEX_CARD`.
4. **`FARMER` / `gardener`**:
   - Focus: Soil moisture (0–1cm), soil temperature, irrigation recommendation.
   - Cards: `AGROMET_FARM_ADVISORY`, `COMFORT_INDEX_CARD`.
5. **`COMMUTER` / `parent`**:
   - Focus: Highway visibility, fog warnings, precipitation risk.
   - Cards: `COMMUTE_WEATHER_ALERT`, `COMFORT_INDEX_CARD`.
6. **`TRAVELER` / `event_planner`**:
   - Focus: Extended multi-day forecasts, comfort index, dynamic packing assistant.
   - Cards: `PACKING_CHECKLIST_PREVIEW`, `COMFORT_INDEX_CARD`.

---

## 🛡️ License
ISC

