// lib/strava-auth.ts
import { cookies } from "next/headers"

export interface StravaTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export async function getStravaTokens(): Promise<StravaTokens | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("strava_access_token")?.value
  const refreshToken = cookieStore.get("strava_refresh_token")?.value
  const expiresAt = cookieStore.get("strava_token_expires_at")?.value

  if (!accessToken || !refreshToken) {
    return null
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: expiresAt ? parseInt(expiresAt) : 0,
  }
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaTokens | null> {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error("[Strava] Missing OAuth credentials")
    return null
  }

  try {
    const resp = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!resp.ok) {
      console.error("[Strava] Token refresh failed:", resp.status)
      return null
    }

    const data = await resp.json()
    
    // Store new tokens in cookies
    const cookieStore = await cookies()
    
    cookieStore.set("strava_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    if (data.refresh_token) {
      cookieStore.set("strava_refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    if (data.expires_at) {
      cookieStore.set("strava_token_expires_at", String(data.expires_at), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    console.log("✓ Strava token refreshed successfully")

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: data.expires_at || 0,
    }
  } catch (err) {
    console.error("[Strava] Token refresh error:", err)
    return null
  }
}

export async function getValidStravaToken(): Promise<string | null> {
  const tokens = await getStravaTokens()
  
  if (!tokens) {
    console.warn("[Strava] No tokens found - user not authenticated")
    return null
  }

  // Check if token is expired (with 5 minute buffer)
  const now = Math.floor(Date.now() / 1000)
  const buffer = 5 * 60 // 5 minutes
  
  if (tokens.expiresAt && tokens.expiresAt < now + buffer) {
    console.log("[Strava] Token expired or expiring soon, refreshing...")
    const refreshed = await refreshStravaToken(tokens.refreshToken)
    
    if (!refreshed) {
      console.error("[Strava] Token refresh failed")
      return null
    }
    
    return refreshed.accessToken
  }

  return tokens.accessToken
}
