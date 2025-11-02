import { searchAddress, suggestRoutes } from "@/lib/onemap-utils";
import { NextRequest, NextResponse } from "next/server";
import { singaporeRoutes } from "@/app/fixtures/preset-routes";

export async function POST(req: NextRequest) {
    try {
        const { address, distance, country } = await req.json();

        // If no address is provided and country is Singapore, return preset routes filtered by distance
        if (!address && country?.toLowerCase() === 'singapore') {
            const filteredRoutes = singaporeRoutes
                .filter(route => Math.abs(route.distance - distance) <= 5) // Routes within 5km of target distance
                .sort((a, b) => Math.abs(a.distance - distance) - Math.abs(b.distance - distance))
                .slice(0, 3); // Return top 3 closest matches

            if (filteredRoutes.length === 0) {
                // If no routes match the distance criteria, return all routes sorted by distance
                const allRoutesSorted = [...singaporeRoutes]
                    .sort((a, b) => Math.abs(a.distance - distance) - Math.abs(b.distance - distance))
                    .slice(0, 3);

                return NextResponse.json({
                    presetRoutes: allRoutesSorted
                });
            }

            return NextResponse.json({
                presetRoutes: filteredRoutes
            });
        }

        // If no address is provided and country is not Singapore, return empty response
        if (!address) {
            return NextResponse.json({});
        }

        if (!distance) {
            return NextResponse.json(
                { error: "Distance is required" },
                { status: 400 }
            );
        }

        // Search for the address coordinates
        const startPoint = await searchAddress(address);
        if (!startPoint) {
            return NextResponse.json(
                { error: "Could not find coordinates for the given address" },
                { status: 400 }
            );
        }

        // Generate route suggestions with actual routing data
        const routes = await suggestRoutes(startPoint, distance);

        // Filter out any routes that failed to generate
        const validRoutes = routes.filter(route => route.routeData);

        return NextResponse.json({
            startPoint,
            routes: validRoutes.map(route => ({
                points: route.points,
                distance: route.distance,
                geometry: route.routeData?.route_geometry,
                instructions: route.routeData?.route_instructions,
                summary: route.routeData?.route_summary
            }))
        });
    } catch (error) {
        console.error("Error generating routes:", error);
        return NextResponse.json(
            { error: "Failed to generate routes" },
            { status: 500 }
        );
    }
}