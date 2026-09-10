"""
Converts the manually-filled CSV templates (cities_current.csv, cities_hourly.csv,
cities_daily.csv) into the same JSON schema used earlier in this project
(schema.md / cities.json). Run this AFTER you've typed real values you read off
the MAUSAM app/website into the three CSVs.

Usage:
    python3 csv_to_json.py

Leave any cell blank if you don't have that value yet -- it'll just come through
as null in the JSON rather than breaking the script, so you can convert early
and re-run as you fill in more cities.
"""

import csv
import json
import os

IN_DIR = "."
OUT_DIR = "output"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(os.path.join(OUT_DIR, "cities"), exist_ok=True)


def read_csv(path):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def blank_to_none(v):
    v = (v or "").strip()
    return v if v != "" else None


def to_float(v):
    v = blank_to_none(v)
    try:
        return float(v) if v is not None else None
    except ValueError:
        return None


def to_int(v):
    v = blank_to_none(v)
    try:
        return int(float(v)) if v is not None else None
    except ValueError:
        return None


def aqi_category(v):
    if v is None:
        return None
    if v <= 50: return "Good"
    if v <= 100: return "Satisfactory"
    if v <= 200: return "Moderate"
    if v <= 300: return "Poor"
    if v <= 400: return "Very Poor"
    return "Severe"


def uv_category(v):
    if v is None:
        return None
    if v <= 2: return "Low"
    if v <= 5: return "Moderate"
    if v <= 7: return "High"
    if v <= 10: return "Very High"
    return "Extreme"


def icon_for(condition):
    if not condition:
        return None
    c = condition.lower()
    if "thunder" in c: return "thunderstorm"
    if "rain" in c: return "rain"
    if "mist" in c or "haze" in c or "fog" in c: return "mist"
    if "partly" in c: return "partly-cloudy"
    if "cloud" in c: return "cloudy"
    return "clear-sky"


current_rows = read_csv(os.path.join(IN_DIR, "cities_current.csv"))
hourly_rows = read_csv(os.path.join(IN_DIR, "cities_hourly.csv"))
daily_rows = read_csv(os.path.join(IN_DIR, "cities_daily.csv"))

all_cities = []

for row in current_rows:
    city_id = row["cityId"]
    aqi_val = to_int(row.get("aqi"))
    uv_val = to_int(row.get("uvIndex"))
    condition = blank_to_none(row.get("condition"))

    alerts = []
    alert_type = blank_to_none(row.get("alertType"))
    if alert_type:
        alerts.append({
            "type": alert_type,
            "severity": blank_to_none(row.get("alertSeverity")) or "amber",
            "message": blank_to_none(row.get("alertMessage")) or ""
        })

    hourly = []
    for h in hourly_rows:
        if h["cityId"] != city_id:
            continue
        hourly.append({
            "time": h["slotTime"],
            "temperature": to_float(h.get("temperature")),
            "condition": blank_to_none(h.get("condition")),
            "conditionIcon": icon_for(h.get("condition")),
            "rainProbability": to_int(h.get("rainProbability")),
            "humidity": to_int(h.get("humidity"))
        })

    daily = []
    for d in daily_rows:
        if d["cityId"] != city_id:
            continue
        daily.append({
            "date": d["date"],
            "day": d["day"],
            "condition": blank_to_none(d.get("condition")),
            "conditionIcon": icon_for(d.get("condition")),
            "minTemp": to_float(d.get("minTemp")),
            "maxTemp": to_float(d.get("maxTemp")),
            "rainProbability": to_int(d.get("rainProbability"))
        })

    city_json = {
        "cityId": city_id,
        "cityName": row["cityName"],
        "state": row["state"],
        "coordinates": {"lat": to_float(row["lat"]), "lon": to_float(row["lon"])},
        "current": {
            "temperature": to_float(row.get("temperature")),
            "feelsLike": to_float(row.get("feelsLike")),
            "minTemp": to_float(row.get("minTemp")),
            "maxTemp": to_float(row.get("maxTemp")),
            "humidity": to_int(row.get("humidity")),
            "condition": condition,
            "conditionIcon": icon_for(condition),
            "wind": {
                "speedKmh": to_float(row.get("windSpeedKmh")),
                "direction": blank_to_none(row.get("windDirection"))
            },
            "rain": {
                "probability": to_int(row.get("rainProbability")),
                "amountMm": to_float(row.get("rainAmountMm"))
            },
            "airQuality": {
                "aqi": aqi_val,
                "category": aqi_category(aqi_val)
            },
            "pollen": {
                "level": blank_to_none(row.get("pollenLevel"))
            },
            "uvIndex": {
                "value": uv_val,
                "category": uv_category(uv_val)
            }
        },
        "sun": {
            "sunrise": blank_to_none(row.get("sunrise")),
            "sunset": blank_to_none(row.get("sunset"))
        },
        "moon": {
            "moonrise": blank_to_none(row.get("moonrise")),
            "moonset": blank_to_none(row.get("moonset"))
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

print(f"Converted {len(all_cities)} cities -> output/cities.json and output/cities/*.json")
