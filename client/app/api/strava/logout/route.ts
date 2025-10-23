import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
    const cookieStore = cookies()

        // Delete Strava tokens if they exist
        ; (await cookieStore).delete("strava_access_token")
        ; (await cookieStore).delete("strava_refresh_token")
        ; (await cookieStore).delete("strava_expires_at")
        ; (await cookieStore).delete("strava_athlete_profile_medium")
        ; (await cookieStore).delete("strava_athlete_username")
        ; (await cookieStore).delete("id")

    // Redirect user back to home (or login page)
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"))
}
