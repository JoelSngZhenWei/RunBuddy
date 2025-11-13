import { NextRequest, NextResponse } from "next/server";
import {
  getCachedActivities,
  fetchAndCacheActivitiesNow,
} from "@/lib/server/strava-cache";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const athleteId = url.searchParams.get("athlete_id");
  const page = url.searchParams.get("page") ?? "1";
  const perPage = url.searchParams.get("per") ?? "200";

  // Expect "Authorization: Bearer <strava_access_token>"
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!athleteId || !token) {
    return NextResponse.json(
      { error: "Missing athlete_id or Authorization bearer token" },
      { status: 400 }
    );
  }

  // 1) Try cache
  const cached = await getCachedActivities(athleteId, page, perPage);
  if (cached?.data) {
    return NextResponse.json(cached.data, { status: 200 });
  }

  // 2) Cache miss → fetch & cache now
  const data = await fetchAndCacheActivitiesNow(token, athleteId, page, perPage);
  return NextResponse.json(data, { status: 200 });
}
