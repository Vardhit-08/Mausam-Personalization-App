# Mausam Personalization Prototype — Data Package

This package is **mock/sample data**, generated to look realistic per city and season (early September, IST), for use as the local JSON dataset described in the main design prompt's "DATA LOGIC CONCEPT" section. It is not live IMD/CPCB data — for a hackathon prototype that's expected and fine; the pipeline (city → JSON → persona scoring → recommendation) is what's being demonstrated, not real-time accuracy.

## What's in this package

- `cities.json` — all 15 cities in one array, useful if the app loads everything at once.
- `city-list.json` — just id/name/state for populating the city picker (Screen 05) without loading full weather payloads.
- `cities/<cityId>.json` — one file per city, matching the "LOAD MATCHING CITY JSON" step in the pipeline (load only the selected city on demand).
- `generate_data.py` — the script that produced all of the above. Edit the `CITIES` dict (temperature/humidity/AQI/UV/wind ranges per city) and rerun to regenerate, add a city, or reroll different sample values.

## Cities included (15)

Nanded, Mumbai, Pune, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, Lucknow, Bhopal, Nagpur, Srinagar, Guwahati.

I dropped Latur and Parbhani from your original 17-city list since they're climatically near-identical to Nanded (all three are in Marathwada) and wouldn't add distinct scoring behavior for a demo — Nanded already represents that region. Swap in a different city easily by adding an entry to the `CITIES` dict in the script.

## Field reference

| Field | Meaning | Notes |
|---|---|---|
| `current.temperature` | Current air temp (°C) | |
| `current.feelsLike` | Perceived temp (°C) | Nudged above actual temp when humidity is high |
| `current.minTemp` / `maxTemp` | Today's range (°C) | |
| `current.humidity` | Relative humidity (%) | |
| `current.condition` / `conditionIcon` | Text + icon key | icon keys: `clear-sky`, `partly-cloudy`, `cloudy`, `rain`, `thunderstorm`, `mist` |
| `current.wind.speedKmh` / `direction` | Wind speed + compass direction | Matches the compass widget in Screen 06 |
| `current.rain.probability` / `amountMm` | Rain chance (%) and expected mm | |
| `current.airQuality.aqi` / `category` / `dominantPollutant` | AQI value + CPCB category band | Bands: Good ≤50, Satisfactory ≤100, Moderate ≤200, Poor ≤300, Very Poor ≤400, Severe >400 |
| `current.pollen.level` / `index` | Low/Moderate/High/Very High + 0–10 index | |
| `current.uvIndex.value` / `category` | 0–11+ scale + Low/Moderate/High/Very High/Extreme | |
| `sun.sunrise` / `sunset` | IST clock times | Adjusted per city's longitude relative to Nanded (your reference screenshot) |
| `moon.moonrise` / `moonset` / `phase` | IST clock times + phase name | Same relative-offset approach as sun times |
| `alerts[]` | Zero or more active alerts | `type` ∈ Heavy Rain Alert / Heat Alert / Air Quality Alert; `severity` ∈ blue/amber/red |
| `hourlyForecast[]` | 3 slots (11:30, 14:30, 17:30 next day) | Matches your "3-Hourly" screenshot exactly |
| `dailyForecast[]` | 7 days, Today → +6 | Matches your 7-day list screenshot |

## Fields you asked for, and where they live

AQI → `current.airQuality` · Wind → `current.wind` · Temperature → `current.temperature` · Humidity → `current.humidity` · Rain → `current.rain` and `dailyForecast[].rainProbability` · Sun rise/set → `sun` · Moon rise/set → `moon` · Feels like → `current.feelsLike` · Min/Max → `current.minTemp`/`maxTemp` · Pollen count → `current.pollen` · UV Index → `current.uvIndex` · Heat alerts → `alerts[]` with `type: "Heat Alert"`.

## One thing this package deliberately does NOT include

**Persona scoring logic.** This data package is raw input only — the "PASS RAW DATA TO PERSONA SCORING FUNCTION → CALCULATE SCORE → DETERMINE STATUS" steps from the pipeline still need to be written as code (in Antigravity or wherever you build it). That's a formula, not a data file, since it has to run against whichever city/persona combination the user picks. A minimal starting point per persona, so whoever builds it isn't guessing at weights:

- **Outdoor Fitness score** — weight temperature/heat-index comfort (penalize >32°C or high humidity combos), wind (mild penalty above ~25 km/h), UV (penalize 8+), rain probability (heavy penalty above ~50%). Best/worst hours = whichever of the 3 forecast slots scores highest/lowest on the same formula.
- **Health & Wellness score** — weight AQI most heavily, then pollen index, then UV, then humidity. AQI >150 or pollen "High"+ should cap the score at "Moderate" or below regardless of other factors.
- **Travel score** — weight destination rain probability + active alerts most heavily (an active alert should always push status to at least "Caution"), then temperature swing between min/max (packing relevance), then wind.

These are starting weights for the prototype, not a validated model — reasonable to tune once you see how the numbers look across your 15 cities.

## If you want real data later (post-hackathon)

Not needed for the prototype, but for reference: IMD's own APIs cover temperature/humidity/wind/rain/sun; AQI would typically come from CPCB's CAQMS/SAFAR network; UV index from IMD or a service like OpenWeatherMap's One Call API; pollen count is the hardest to source in India specifically — most apps proxy it from global providers like Ambee or Breezometer since dedicated Indian pollen-monitoring coverage is limited.
