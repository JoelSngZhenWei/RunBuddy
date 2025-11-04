import axios from 'axios';

interface OneMapSearchResult {
    found: number;
    totalNumPages: number;
    pageNum: number;
    results: Array<{
        SEARCHVAL: string;
        BLK_NO: string;
        ROAD_NAME: string;
        BUILDING: string;
        ADDRESS: string;
        POSTAL: string;
        X: string;
        Y: string;
        LATITUDE: string;
        LONGITUDE: string;
        LONGTITUDE: string; // Note: API returns both LONGITUDE and LONGTITUDE
    }>;
}

interface RoutePoint {
    latitude: number;
    longitude: number;
}

export async function searchAddress(searchQuery: string): Promise<RoutePoint | null> {
    try {
        const API_TOKEN = process.env.NEXT_PUBLIC_ONEMAP_TOKEN;
        if (!API_TOKEN) {
            throw new Error('OneMap API token is not configured');
        }

        const response = await axios.get<OneMapSearchResult>(
            `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
                searchQuery
            )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`,
            {
                headers: {
                    'Authorization': API_TOKEN
                }
            }
        );

        if (response.data.found > 0) {
            const firstResult = response.data.results[0];
            return {
                latitude: parseFloat(firstResult.LATITUDE),
                longitude: parseFloat(firstResult.LONGITUDE),
            };
        }
        return null;
    } catch (error) {
        console.error('Error searching address:', error);
        return null;
    }
}

function calculateBoundingBox(center: RoutePoint, radiusKm: number): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
} {
    // Rough approximation: 1 degree = 111km
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((center.latitude * Math.PI) / 180));

    return {
        minLat: center.latitude - latDelta,
        maxLat: center.latitude + latDelta,
        minLng: center.longitude - lngDelta,
        maxLng: center.longitude + lngDelta,
    };
}

interface RouteResponse {
    status: string;
    route_geometry: string;
    route_instructions: Array<any>;
    route_name: Array<string>;
    route_summary: {
        total_distance: number;
        total_time: number;
    };
    alternative_geometries?: string[];
    alternative_instructions?: Array<any>[];
    alternative_names?: Array<string>[];
    alternative_summaries?: Array<{
        total_distance: number;
        total_time: number;
    }>;
}

export async function getRoute(
    start: RoutePoint,
    end: RoutePoint
): Promise<RouteResponse | null> {
    try {
        const API_TOKEN = process.env.NEXT_PUBLIC_ONEMAP_TOKEN;
        if (!API_TOKEN) {
            throw new Error('OneMap API token is not configured');
        }

        const response = await axios.get<RouteResponse>(
            `https://www.onemap.gov.sg/api/public/routingsvc/route?` +
            `start=${start.latitude},${start.longitude}&` +
            `end=${end.latitude},${end.longitude}&` +
            `routeType=walk`,
            {
                headers: {
                    'Authorization': API_TOKEN
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error getting route:', error);
        return null;
    }
}

interface RouteResult {
    points: RoutePoint[];
    distance: number;
    directions: string[];
    routeData?: RouteResponse;
}

export async function suggestRoutes(
    startPoint: RoutePoint,
    targetDistanceKm: number
): Promise<RouteResult[]> {
    // Create a single endpoint in the north direction (can be adjusted based on local geography)
    const direction = { lat: 0.009, lng: 0 }; // North (roughly 1km)
    
    // Calculate endpoint to achieve approximately the target distance
    const scale = Math.sqrt(targetDistanceKm / 2); // Scale factor to achieve desired distance
    const endPoint: RoutePoint = {
        latitude: startPoint.latitude + (direction.lat * scale),
        longitude: startPoint.longitude + (direction.lng * scale)
    };

    // Get the actual route
    const routeData = await getRoute(startPoint, endPoint);
    
    if (routeData) {
        // Format route instructions into clear, human-readable steps
        const formattedInstructions = routeData.route_instructions?.map((instruction: any) => {
            // OneMap route instructions typically include: 
            // [streetName, direction, distance, time, position, etc.]
            const [streetName, direction, distance] = instruction;
            const distanceInMeters = Math.round(distance);
            
            return `${direction} onto ${streetName}${distanceInMeters > 0 ? ` for ${distanceInMeters} meters` : ''}`;
        }).filter(Boolean) || [];

        return [{
            points: [startPoint, endPoint],
            distance: routeData.route_summary.total_distance / 1000, // Convert to km
            directions: formattedInstructions,
            routeData
        }];
    }

    return [];
}