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

    const data = await resp.json()
    if (!resp.ok) {
      return NextResponse.json({ error: data?.message || "Token exchange failed" }, { status: resp.status })
    }

    // set cookie (overwrites if exists)
    cookies().set("strava_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // redirect back to your app
    const redirectTo = new URL("/", req.url) // change to /dashboard if you want
    return NextResponse.redirect(redirectTo)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
