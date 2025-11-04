// app/api/google/callback/route.ts
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, req.url))
  }

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/google/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Google OAuth credentials not configured" }, { status: 500 })
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenData)
      return NextResponse.json({ error: tokenData?.error_description || "Token exchange failed" }, { status: tokenResponse.status })
    }

    // Store tokens in cookies
    const cookieStore = await cookies()
    cookieStore.set("google_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: tokenData.expires_in || 3600, // Usually 1 hour
    })

    if (tokenData.refresh_token) {
      cookieStore.set("google_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 180, // 180 days
      })
    }

    // Fetch user's calendar info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json()
      cookieStore.set("google_user_email", userInfo.email || "", { 
        path: "/", 
        maxAge: 60 * 60 * 24 * 7 
      })
      cookieStore.set("google_user_name", userInfo.name || "", { 
        path: "/", 
        maxAge: 60 * 60 * 24 * 7 
      })
      cookieStore.set("google_user_picture", userInfo.picture || "", { 
        path: "/", 
        maxAge: 60 * 60 * 24 * 7 
      })
    }

    // Redirect back to the plan page
    const redirectTo = new URL("/plan", req.url)
    return NextResponse.redirect(redirectTo)
  } catch (err: any) {
    console.error("Google OAuth callback error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

