// app/api/strava/activities/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  getCachedActivities,
  fetchAndCacheActivitiesNow,
} from "@/lib/strava-cache";
import { getValidStravaToken } from "@/lib/strava-auth";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const athleteId = cookieStore.get("id")?.value;

  if (!athleteId) {
    return NextResponse.json(
      { error: "Not authenticated - missing athlete ID" },
      { status: 401 }
    );
  }

  // Get valid token (will auto-refresh if expired)
  const token = await getValidStravaToken();

  if (!token) {
    return NextResponse.json(
      {
        error: "Not authenticated - please log in to Strava again",
        needsAuth: true,
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? "200";
  const refresh = searchParams.get("refresh") === "1";

  try {
    // Try to get cached data (will be null if Redis not configured)
    if (!refresh) {
      try {
        const cached = await getCachedActivities(athleteId, page, per_page);
        if (cached?.data) {
          console.log("✓ Returning cached activities");
          return NextResponse.json({
            cached: true,
            at: cached.at,
            data: cached.data,
          });
        }
      } catch (cacheError) {
        console.warn("Cache read failed (non-fatal):", cacheError);
        // Continue to fetch fresh data
      }
    }

    // Fetch fresh data from Strava
    console.log("Fetching fresh activities from Strava API...");
    const fresh = await fetchAndCacheActivitiesNow(
      token,
      athleteId,
      page,
      per_page
    );
    console.log(`✓ Fetched ${fresh?.length || 0} activities`);

    return NextResponse.json({
      cached: false,
      at: Date.now(),
      data: fresh,
    });
  } catch (e: any) {
    const message = String(e?.message || e);
    console.error("Error fetching activities:", message, e);

    // Try degraded cache first
    try {
      const fallback = await getCachedActivities(athleteId, page, per_page);
      if (fallback?.data) {
        console.log("Using fallback cached data");
        return NextResponse.json(
          {
            cached: true,
            at: fallback.at,
            data: fallback.data,
            degraded: true,
            error: message,
          },
          { status: 200 }
        );
      }
    } catch (fallbackError) {
      console.warn("Fallback cache also failed:", fallbackError);
    }

    // Hard error but still keep data: []
    console.error("Returning error response with empty data");
    return NextResponse.json({ error: message, data: [] }, { status: 500 });
  }
}
