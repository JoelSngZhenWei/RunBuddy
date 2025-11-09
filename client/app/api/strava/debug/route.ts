// app/api/strava/debug/route.ts
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("strava_access_token")?.value
  const refreshToken = cookieStore.get("strava_refresh_token")?.value
  const expiresAt = cookieStore.get("strava_token_expires_at")?.value
  const athleteId = cookieStore.get("id")?.value
  const username = cookieStore.get("strava_athlete_username")?.value

  const now = Math.floor(Date.now() / 1000)
  const expiresAtNum = expiresAt ? parseInt(expiresAt) : 0
  const isExpired = expiresAtNum > 0 && expiresAtNum < now
  const expiresIn = expiresAtNum > 0 ? expiresAtNum - now : 0

  return NextResponse.json({
    authenticated: !!token && !!athleteId,
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasAthleteId: !!athleteId,
    athleteId: athleteId || null,
    username: username || null,
    tokenPreview: token ? `${token.substring(0, 10)}...` : null,
    tokenExpired: isExpired,
    expiresAt: expiresAtNum > 0 ? new Date(expiresAtNum * 1000).toISOString() : null,
    expiresInSeconds: expiresIn,
    expiresInMinutes: Math.floor(expiresIn / 60),
    timestamp: new Date().toISOString(),
  })
}
