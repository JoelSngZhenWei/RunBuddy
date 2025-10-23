import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
    const c = await cookies()
    const username = c.get("strava_athlete_username")?.value || ""
    const avatar = c.get("strava_athlete_profile_medium")?.value || ""
    const id = c.get("strava_athlete_id")?.value || "" // optional if you set this

    return NextResponse.json({ username, avatar, id })
}
