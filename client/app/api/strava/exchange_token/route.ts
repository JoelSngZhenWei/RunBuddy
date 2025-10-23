// app/api/strava/exchange_token/route.ts
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 })

  try {
    const resp = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID!,
        client_secret: process.env.STRAVA_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await resp.json()
    if (!resp.ok) {
      return NextResponse.json({ error: tokenData?.message || "Token exchange failed" }, { status: resp.status })
    }

    (await
      // set cookie (overwrites if exists)
      cookies()).set("strava_access_token", tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })

    // fetch athlete details (minimal)
    const athleteResp = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    if (athleteResp.ok) {
      const athlete = await athleteResp.json()
        ; (await cookies()).set("id", athlete.id || "", {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
        ; (await cookies()).set("strava_athlete_username", athlete.username || "", {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
        ; (await cookies()).set("strava_athlete_profile_medium", athlete.profile_medium || "", {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
    }

    // redirect back to your app
    const redirectTo = new URL("/", req.url) // change to /dashboard if you want
    return NextResponse.redirect(redirectTo)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
