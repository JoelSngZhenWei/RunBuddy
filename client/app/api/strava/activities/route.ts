// app/api/strava/activities/route.ts
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import {
  getCachedActivities,
  fetchAndCacheActivitiesNow,
} from "@/lib/strava-cache"

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("strava_access_token")?.value
  const athleteId = cookieStore.get("id")?.value

  if (!token || !athleteId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = searchParams.get("page") ?? "1"
  const per_page = searchParams.get("per_page") ?? "200"
  const refresh = searchParams.get("refresh") === "1"

  try {
    if (!refresh) {
      const cached = await getCachedActivities(athleteId, page, per_page)
      if (cached?.data) {
        return NextResponse.json({
          cached: true,
          at: cached.at,
          data: cached.data,
        })
      }
    }

    const fresh = await fetchAndCacheActivitiesNow(token, athleteId, page, per_page)
    return NextResponse.json({
      cached: false,
      at: Date.now(),
      data: fresh,
    })
  } catch (e: any) {
    // If Strava fails but we have any cache, return it as a degraded experience
    const fallback = await getCachedActivities(athleteId, page, per_page)
    if (fallback?.data) {
      return NextResponse.json(
        { cached: true, at: fallback.at, data: fallback.data, degraded: true, error: String(e?.message || e) },
        { status: 200 }
      )
    }
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
