// app/api/simulate_login/route.ts
import { NextResponse } from "next/server"
import { setCachedActivities } from "@/lib/strava-cache"
import { activities } from "@/app/fixtures/activities"

export async function POST() {
  const res = NextResponse.json({ ok: true })

  // Fake identity — mirrors what your real OAuth sets
  const fake = {
    id: 999, // athlete id
    strava_access_token: "fake_strava_token", // not used for cached reads
    strava_athlete_username: "joel_sng",
    strava_athlete_profile_medium:
      "https://dgalywyr863hv.cloudfront.net/pictures/athletes/70856688/33152082/1/medium.jpg",
  }

  // For local testing, non-httpOnly lets client JS read them if you want
  res.cookies.set("id", String(fake.id), { path: "/", maxAge: 60 * 60 * 24 * 7 })
  res.cookies.set("strava_access_token", fake.strava_access_token, {
    httpOnly: true, // match your real flow; UI doesn’t need to read this
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  res.cookies.set("strava_athlete_username", fake.strava_athlete_username, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  res.cookies.set("strava_athlete_profile_medium", fake.strava_athlete_profile_medium, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  // Seed Redis cache so /api/strava/activities can serve instantly
  try {
    await setCachedActivities(fake.id, "1", "200", activities as any[])
  } catch (e) {
    console.error("Failed to seed Redis with fixture:", e)
    return NextResponse.json({ ok: false, error: "Redis seed failed" }, { status: 500 })
  }

  return res
}
