import { PresetRoute } from "@/app/fixtures/preset-routes";

export interface RoutePoint {
    latitude: number;
    longitude: number;
}

export interface RouteResponse {
    route_geometry: string;
    route_instructions: Array<any>;
    route_summary: {
        total_distance: number;
        total_time: number;
    };
}

export interface CustomRoute {
    points: RoutePoint[];
    distance: number;
    geometry: string;
    instructions: Array<any>;
    summary: {
        total_distance: number;
        total_time: number;
    };
}

export interface RouteSuggestions {
    startPoint?: RoutePoint;
    routes?: CustomRoute[];
    presetRoutes?: PresetRoute[];
}

export interface FormValues {
    goal_event: string;
    goal_target: string;
    goal_date: string;
    start_date: string;
    days_per_week: number;
    current_weekly_km: number;
    fitness_level: string;
    use_calendar: boolean;
    calendar_events_summary?: string;
    address?: string;
    country: string;
    routeSuggestions?: RouteSuggestions;
}