import { searchAddress, suggestRoutes } from "@/lib/onemap-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { address, distance } = await req.json();

        if (!address || !distance) {
            return NextResponse.json(
                { error: "Address and distance are required" },
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