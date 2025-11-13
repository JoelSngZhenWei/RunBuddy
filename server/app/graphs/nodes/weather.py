
import inspect
from app.graphs.overall_state import OverallState
from app.core.coords import COUNTRY_COORDS
import requests

def weather_node(state: OverallState):
    print(f"[{inspect.currentframe().f_code.co_name}] Executing agent")
    country = state.country.strip()
    match = next(
        (c for c in COUNTRY_COORDS if c["country"].lower() == country.lower()), None
    )
    if not match:
        raise ValueError(f"No coordinates found for {country}")

    lat, lon = match["lat"], match["lon"]

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        "&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean"
        "&timezone=auto"
    )

    res = requests.get(url).json()
    daily = res.get("daily", {})
    temps_max = daily.get("temperature_2m_max", [])
    temps_min = daily.get("temperature_2m_min", [])
    humidity = daily.get("relative_humidity_2m_mean", [])

    if not temps_max or not temps_min or not humidity:
        raise ValueError(f"Incomplete weather data for {country}")

    avg_temp = sum((tmax + tmin) / 2 for tmax, tmin in zip(temps_max, temps_min)) / len(
        temps_max
    )
    avg_humidity = sum(humidity) / len(humidity)
    
    print(f"[{inspect.currentframe().f_code.co_name}] Weather forecast for location {country} of temp: {round(avg_temp,2)} and avg_humidity: {round(avg_humidity,1)}")
    return {
        "avg_temp": round(avg_temp, 2),
        "avg_humidity": round(avg_humidity, 1),
    }