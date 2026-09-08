import json
import random
import os

random.seed(42)  # deterministic output so re-running gives the same "sample" dataset

OUT_DIR = "/mnt/user-data/outputs/mausam-data"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(os.path.join(OUT_DIR, "cities"), exist_ok=True)

BASE_DATE = "2026-09-06"  # matches the reference screenshots ("06 September 2026")
DAY_NAMES = ["Today", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
DAY_DATES = ["06/09", "07/09", "08/09", "09/09", "10/09", "11/09", "12/09"]

WIND_DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

CONDITIONS_WET = ["Light Rain", "Moderate Rain", "Thunderstorm", "Generally Cloudy", "Partly Cloudy"]
CONDITIONS_DRY = ["Clear Sky", "Partly Cloudy", "Haze", "Generally Cloudy"]
CONDITIONS_HILL = ["Clear Sky", "Partly Cloudy", "Mist", "Light Rain"]

# city_id: (Display Name, State, lat, lon, climate profile)
CITIES = {
    "nanded":    ("Nanded", "Maharashtra", 19.15, 77.32,
                  dict(temp=(23.6, 34.0), hum=(55, 72), aqi=(95, 135), uv=(7, 9),
                       wind=(6, 16), rainChance=(35, 65), pollen="wet")),
    "mumbai":    ("Mumbai", "Maharashtra", 19.08, 72.88,
                  dict(temp=(24.5, 32.0), hum=(75, 90), aqi=(90, 130), uv=(6, 8),
                       wind=(12, 24), rainChance=(55, 85), pollen="wet")),
    "pune":      ("Pune", "Maharashtra", 18.52, 73.86,
                  dict(temp=(21.0, 29.0), hum=(65, 82), aqi=(75, 110), uv=(6, 8),
                       wind=(8, 18), rainChance=(45, 70), pollen="wet")),
    "delhi":     ("Delhi", "Delhi", 28.61, 77.10,
                  dict(temp=(26.0, 35.5), hum=(58, 80), aqi=(140, 220), uv=(8, 10),
                       wind=(5, 14), rainChance=(20, 45), pollen="dry")),
    "bengaluru": ("Bengaluru", "Karnataka", 12.97, 77.59,
                  dict(temp=(19.0, 27.5), hum=(70, 86), aqi=(55, 90), uv=(6, 8),
                       wind=(9, 18), rainChance=(45, 70), pollen="hill")),
    "hyderabad": ("Hyderabad", "Telangana", 17.38, 78.49,
                  dict(temp=(22.0, 30.5), hum=(62, 80), aqi=(85, 120), uv=(7, 9),
                       wind=(7, 16), rainChance=(35, 60), pollen="dry")),
    "chennai":   ("Chennai", "Tamil Nadu", 13.08, 80.27,
                  dict(temp=(26.5, 33.5), hum=(68, 85), aqi=(70, 110), uv=(8, 10),
                       wind=(14, 26), rainChance=(25, 50), pollen="wet")),
    "kolkata":   ("Kolkata", "West Bengal", 22.57, 88.36,
                  dict(temp=(27.0, 33.5), hum=(78, 92), aqi=(100, 150), uv=(6, 8),
                       wind=(6, 15), rainChance=(50, 80), pollen="wet")),
    "ahmedabad": ("Ahmedabad", "Gujarat", 23.02, 72.57,
                  dict(temp=(27.0, 36.0), hum=(52, 74), aqi=(110, 160), uv=(8, 10),
                       wind=(6, 15), rainChance=(25, 50), pollen="dry")),
    "jaipur":    ("Jaipur", "Rajasthan", 26.91, 75.79,
                  dict(temp=(26.0, 36.5), hum=(42, 63), aqi=(110, 165), uv=(8, 10),
                       wind=(7, 17), rainChance=(15, 40), pollen="dry")),
    "lucknow":   ("Lucknow", "Uttar Pradesh", 26.85, 80.95,
                  dict(temp=(26.0, 34.0), hum=(58, 78), aqi=(120, 175), uv=(7, 9),
                       wind=(5, 13), rainChance=(25, 50), pollen="dry")),
    "bhopal":    ("Bhopal", "Madhya Pradesh", 23.26, 77.41,
                  dict(temp=(23.0, 31.5), hum=(58, 76), aqi=(85, 130), uv=(7, 9),
                       wind=(7, 16), rainChance=(35, 60), pollen="dry")),
    "nagpur":    ("Nagpur", "Maharashtra", 21.15, 79.09,
                  dict(temp=(24.0, 33.5), hum=(52, 70), aqi=(95, 140), uv=(8, 10),
                       wind=(7, 16), rainChance=(30, 55), pollen="dry")),
    "srinagar":  ("Srinagar", "Jammu and Kashmir", 34.08, 74.80,
                  dict(temp=(12.0, 24.5), hum=(45, 65), aqi=(35, 70), uv=(5, 7),
                       wind=(4, 11), rainChance=(15, 35), pollen="hill")),
    "guwahati":  ("Guwahati", "Assam", 26.15, 91.75,
                  dict(temp=(25.0, 31.5), hum=(80, 93), aqi=(55, 95), uv=(6, 8),
                       wind=(6, 14), rainChance=(55, 85), pollen="wet")),
}

# --- helpers -----------------------------------------------------------

def offset_minutes(lon, base_lon=77.32):
    return round((base_lon - lon) * 4)

def fmt_time(total_minutes):
    total_minutes %= 24 * 60
    h, m = divmod(total_minutes, 60)
    return f"{h:02d}:{m:02d}"

def aqi_category(v):
    if v <= 50: return "Good"
    if v <= 100: return "Satisfactory"
    if v <= 200: return "Moderate"
    if v <= 300: return "Poor"
    if v <= 400: return "Very Poor"
    return "Severe"

def uv_category(v):
    if v <= 2: return "Low"
    if v <= 5: return "Moderate"
    if v <= 7: return "High"
    if v <= 10: return "Very High"
    return "Extreme"

def pollen_pick(kind):
    if kind == "wet":
        return random.choice([("Moderate", 4), ("High", 7), ("Moderate", 5)])
    if kind == "dry":
        return random.choice([("High", 7), ("Very High", 9), ("Moderate", 6)])
    return random.choice([("Low", 2), ("Moderate", 4), ("Low", 3)])  # hill

def condition_pool(kind):
    return {"wet": CONDITIONS_WET, "dry": CONDITIONS_DRY, "hill": CONDITIONS_HILL}[kind]

def icon_for(condition):
    c = condition.lower()
    if "thunder" in c: return "thunderstorm"
    if "rain" in c: return "rain"
    if "mist" in c or "haze" in c or "fog" in c: return "mist"
    if "partly" in c: return "partly-cloudy"
    if "cloud" in c: return "cloudy"
    return "clear-sky"

# --- generation ----------------------------------------------------------

all_cities = []

for city_id, (name, state, lat, lon, p) in CITIES.items():
    off = offset_minutes(lon)
    sunrise = fmt_time(367 + off)   # 367 min = 06:07
    sunset = fmt_time(1112 + off)   # 1112 min = 18:32
    moonrise = fmt_time(53 + off)   # 00:53
    moonset = fmt_time(889 + off)   # 14:49

    temp_min, temp_max = p["temp"]
    current_temp = round(random.uniform(temp_min + 1, temp_max - 2), 1)
    humidity = random.randint(*p["hum"])
    feels_like = round(current_temp + (1.5 if humidity > 75 else 0.3 if humidity > 60 else -0.4), 1)
    wind_speed = round(random.uniform(*p["wind"]), 1)
    wind_dir = random.choice(WIND_DIRS)
    aqi_val = random.randint(*p["aqi"])
    uv_val = random.randint(*p["uv"])
    pollen_level, pollen_index = pollen_pick(p["pollen"])
    rain_prob_now = random.randint(*p["rainChance"])
    pool = condition_pool(p["pollen"])
    current_condition = random.choice(pool)

    alerts = []
    if p["rainChance"][1] >= 75 and random.random() < 0.6:
        alerts.append({
            "type": "Heavy Rain Alert",
            "severity": "amber",
            "message": f"Heavy rainfall is expected in and around {name} over the next 24 hours.",
            "issuedBy": "IMD Regional Meteorological Centre"
        })
    if temp_max >= 35.5 and random.random() < 0.6:
        alerts.append({
            "type": "Heat Alert",
            "severity": "amber",
            "message": f"Daytime temperatures in {name} are expected to remain significantly above normal.",
            "issuedBy": "IMD Regional Meteorological Centre"
        })
    if aqi_val >= 150 and random.random() < 0.6:
        alerts.append({
            "type": "Air Quality Alert",
            "severity": "amber" if aqi_val < 250 else "red",
            "message": f"Air quality in {name} is in the '{aqi_category(aqi_val)}' category. Sensitive groups should limit prolonged outdoor exertion.",
            "issuedBy": "CPCB / IMD Air Quality Bulletin"
        })

    # 3-hourly forecast (3 slots, matching the reference screenshot pattern)
    hourly = []
    hour_slots = ["11:30", "14:30", "17:30"]
    for i, slot in enumerate(hour_slots):
        t = round(current_temp + random.uniform(-1.5, 3.0) - (i * 0.6), 1)
        cond = random.choice(pool)
        hourly.append({
            "date": "07 September",
            "time": slot,
            "temperature": t,
            "condition": cond,
            "conditionIcon": icon_for(cond),
            "rainProbability": max(0, min(100, random.randint(*p["rainChance"]) - 10 + i * 5)),
            "humidity": max(20, min(100, humidity + random.randint(-10, 10)))
        })

    # 7-day forecast
    daily = []
    for i in range(7):
        d_min = round(temp_min + random.uniform(-1, 1), 1)
        d_max = round(temp_max + random.uniform(-1.5, 1.5), 1)
        cond = random.choice(pool)
        daily.append({
            "date": DAY_DATES[i],
            "day": DAY_NAMES[i],
            "condition": cond,
            "conditionIcon": icon_for(cond),
            "minTemp": d_min,
            "maxTemp": d_max,
            "rainProbability": max(0, min(100, random.randint(*p["rainChance"])))
        })

    city_json = {
        "cityId": city_id,
        "cityName": name,
        "state": state,
        "coordinates": {"lat": lat, "lon": lon},
        "lastUpdated": f"{BASE_DATE}T21:30:00+05:30",
        "current": {
            "temperature": current_temp,
            "feelsLike": feels_like,
            "minTemp": temp_min,
            "maxTemp": temp_max,
            "humidity": humidity,
            "condition": current_condition,
            "conditionIcon": icon_for(current_condition),
            "wind": {
                "speedKmh": wind_speed,
                "direction": wind_dir
            },
            "rain": {
                "probability": rain_prob_now,
                "amountMm": round(rain_prob_now / 100 * random.uniform(2, 12), 1)
            },
            "airQuality": {
                "aqi": aqi_val,
                "category": aqi_category(aqi_val),
                "dominantPollutant": "PM2.5" if aqi_val > 100 else "PM10"
            },
            "pollen": {
                "level": pollen_level,
                "index": pollen_index
            },
            "uvIndex": {
                "value": uv_val,
                "category": uv_category(uv_val)
            }
        },
        "sun": {
            "sunrise": sunrise,
            "sunset": sunset
        },
        "moon": {
            "moonrise": moonrise,
            "moonset": moonset,
            "phase": "Waning Gibbous"
        },
        "alerts": alerts,
        "hourlyForecast": hourly,
        "dailyForecast": daily
    }

    all_cities.append(city_json)

    with open(os.path.join(OUT_DIR, "cities", f"{city_id}.json"), "w") as f:
        json.dump(city_json, f, indent=2)

with open(os.path.join(OUT_DIR, "cities.json"), "w") as f:
    json.dump({"cities": all_cities}, f, indent=2)

with open(os.path.join(OUT_DIR, "city-list.json"), "w") as f:
    json.dump([{"cityId": c["cityId"], "cityName": c["cityName"], "state": c["state"]} for c in all_cities], f, indent=2)

print(f"Generated {len(all_cities)} city files.")
