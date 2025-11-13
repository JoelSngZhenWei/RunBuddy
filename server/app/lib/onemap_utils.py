"""
OneMap API utilities for Singapore route planning.
Provides functions to search addresses, get coordinates, and fetch route information.
"""

import os
import requests
from typing import Optional, Dict, Any, List, Tuple
from app.core.config import settings


class RoutePoint:
    def __init__(self, latitude: float, longitude: float):
        self.latitude = latitude
        self.longitude = longitude


def search_address(search_query: str) -> Optional[RoutePoint]:
    """
    Search for a Singapore address using OneMap API and return coordinates.
    
    Args:
        search_query: Address string to search for
        
    Returns:
        RoutePoint with latitude/longitude, or None if not found
    """
    try:
        token = settings.NEXT_PUBLIC_ONEMAP_TOKEN
        
        if not token:
            print("⚠️ OneMap API token not configured")
            return None
        
        url = "https://www.onemap.gov.sg/api/common/elastic/search"
        params = {
            "searchVal": search_query,
            "returnGeom": "Y",
            "getAddrDetails": "Y",
            "pageNum": 1
        }
        headers = {"Authorization": token} if token else {}
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("found", 0) > 0 and data.get("results"):
            first_result = data["results"][0]
            return RoutePoint(
                latitude=float(first_result["LATITUDE"]),
                longitude=float(first_result["LONGITUDE"])
            )
        
        print(f"⚠️ No results found for address: {search_query}")
        return None
        
    except Exception as e:
        print(f"❌ Error searching address: {e}")
        return None


def get_route(start: RoutePoint, end: RoutePoint) -> Optional[Dict[str, Any]]:
    """
    Get route from start to end point using OneMap routing API.
    
    Args:
        start: Starting point coordinates
        end: Ending point coordinates
        
    Returns:
        Route data dictionary with distance, instructions, etc.
    """
    try:
        token = settings.NEXT_PUBLIC_ONEMAP_TOKEN
        
        url = "https://www.onemap.gov.sg/api/public/routingsvc/route"
        params = {
            "start": f"{start.latitude},{start.longitude}",
            "end": f"{end.latitude},{end.longitude}",
            "routeType": "walk"
        }
        headers = {"Authorization": token} if token else {}
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        return response.json()
        
    except Exception as e:
        print(f"❌ Error getting route: {e}")
        return None


def calculate_offset(distance_km: float, direction: str = "north") -> Tuple[float, float]:
    """
    Calculate lat/lng offset for a given distance and direction.
    
    Args:
        distance_km: Target distance in kilometers
        direction: Direction for the route (north, south, east, west, northeast, etc.)
        
    Returns:
        Tuple of (lat_offset, lng_offset)
    """
    # Rough approximations for Singapore (1 degree ≈ 111km for latitude)
    # For circular route, we go half the distance out and back
    half_distance = distance_km / 2
    
    direction_vectors = {
        "north": (0.009 * half_distance, 0),
        "south": (-0.009 * half_distance, 0),
        "east": (0, 0.009 * half_distance),
        "west": (0, -0.009 * half_distance),
        "northeast": (0.006 * half_distance, 0.006 * half_distance),
        "northwest": (0.006 * half_distance, -0.006 * half_distance),
        "southeast": (-0.006 * half_distance, 0.006 * half_distance),
        "southwest": (-0.006 * half_distance, -0.006 * half_distance),
    }
    
    return direction_vectors.get(direction, (0.009 * half_distance, 0))


def suggest_route(
    start_point: RoutePoint, 
    target_distance_km: float,
    direction: str = "north"
) -> Optional[Dict[str, Any]]:
    """
    Suggest a circular route starting and ending at the same point.
    
    Args:
        start_point: Starting/ending point
        target_distance_km: Desired distance in km
        direction: Direction to head initially
        
    Returns:
        Dictionary with route information including distance and directions
    """
    try:
        # Calculate endpoint
        lat_offset, lng_offset = calculate_offset(target_distance_km, direction)
        
        end_point = RoutePoint(
            latitude=start_point.latitude + lat_offset,
            longitude=start_point.longitude + lng_offset
        )
        
        # Get route data
        route_data = get_route(start_point, end_point)
        
        if not route_data:
            return None
        
        # Extract route information
        route_summary = route_data.get("route_summary", {})
        route_instructions = route_data.get("route_instructions", [])
        
        # Format directions with better descriptions
        formatted_directions = []
        for idx, instruction in enumerate(route_instructions):
            if isinstance(instruction, list) and len(instruction) >= 3:
                street_name = instruction[0] if instruction[0] else "unnamed road"
                direction_text = instruction[1] if len(instruction) > 1 else "Continue"
                distance_m = int(instruction[2]) if len(instruction) > 2 else 0
                
                if distance_m > 0:
                    # Format distance for readability
                    if distance_m >= 1000:
                        distance_str = f"{distance_m/1000:.1f}km"
                    else:
                        distance_str = f"{distance_m}m"
                    
                    # Create more descriptive instruction
                    # Remove generic direction words and use the street name as landmark
                    if street_name and street_name != "unnamed road":
                        if "head" in direction_text.lower():
                            instruction_text = f"Start heading along {street_name} for {distance_str}"
                        elif "left" in direction_text.lower():
                            instruction_text = f"Turn left onto {street_name} and continue for {distance_str}"
                        elif "right" in direction_text.lower():
                            instruction_text = f"Turn right onto {street_name} and continue for {distance_str}"
                        elif "continue" in direction_text.lower() or "straight" in direction_text.lower():
                            instruction_text = f"Continue straight on {street_name} for {distance_str}"
                        else:
                            instruction_text = f"{direction_text} on {street_name} for {distance_str}"
                    else:
                        instruction_text = f"{direction_text} for {distance_str}"
                    
                    formatted_directions.append(instruction_text)
        
        total_distance_km = route_summary.get("total_distance", 0) / 1000
        
        return {
            "distance_km": round(total_distance_km, 2),
            "directions": formatted_directions,
            "start_address": f"{start_point.latitude},{start_point.longitude}",
            "route_type": "circular",
            "direction": direction
        }
        
    except Exception as e:
        print(f"❌ Error suggesting route: {e}")
        return None


def suggest_routes_for_distance(
    address: str,
    target_distance_km: float,
    num_suggestions: int = 1
) -> List[Dict[str, Any]]:
    """
    Generate multiple route suggestions for a given distance.
    
    Args:
        address: Starting address
        target_distance_km: Target distance in km
        num_suggestions: Number of different routes to suggest
        
    Returns:
        List of route suggestions
    """
    # First, geocode the address
    start_point = search_address(address)
    
    if not start_point:
        print(f"⚠️ Could not find coordinates for address: {address}")
        return []
    
    # print(f"📍 Found coordinates: {start_point.latitude}, {start_point.longitude}")
    
    # Generate routes in different directions
    directions = ["north", "northeast", "east", "southeast"][:num_suggestions]
    routes = []
    
    for direction in directions:
        route = suggest_route(start_point, target_distance_km, direction)
        if route:
            routes.append(route)
    
    return routes
