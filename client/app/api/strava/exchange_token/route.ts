// app/api/strava/exchange_token/route.ts
import { fetchAndCacheActivitiesNow } from "@/lib/strava-cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code)
    return NextResponse.json({ error: "Missing code" }, { status: 400 });

  // Check if Strava OAuth is configured
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      "[Strava] STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET is not set"
    );
    return NextResponse.json(
      {
        error:
          "Strava OAuth is not configured. Please set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in your environment variables.",
        hint: "See SETUP_GUIDE.md for instructions on setting up Strava OAuth.",
      },
      { status: 500 }
    );
  }

  try {
    const resp = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await resp.json();
    if (!resp.ok) {
      return NextResponse.json(
        { error: tokenData?.message || "Token exchange failed" },
        { status: resp.status }
      );
    }

    const cookieStore = await cookies();

    // Store access token
    cookieStore.set("strava_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Store refresh token (important for renewing access tokens!)
    if (tokenData.refresh_token) {
      cookieStore.set("strava_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Store token expiration time
    if (tokenData.expires_at) {
      cookieStore.set("strava_token_expires_at", String(tokenData.expires_at), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    // fetch athlete details (minimal)
    const athleteResp = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (athleteResp.ok) {
      const athlete = await athleteResp.json();
      cookieStore.set("id", String(athlete.id || ""), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      cookieStore.set("strava_athlete_username", athlete.username || "", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      cookieStore.set(
        "strava_athlete_profile_medium",
        athlete.profile_medium || "",
        { path: "/", maxAge: 60 * 60 * 24 * 7 }
      );
      (async () => {
        try {
          await fetchAndCacheActivitiesNow(
            tokenData.access_token,
            athlete.id,
            "1",
            "200"
          );
        } catch (e) {
          console.error("Prefetch cache failed:", e);
        }
      })();
    }

    // redirect back to your app
    const redirectTo = new URL("/", req.url); // change to /dashboard if you want
    return NextResponse.redirect(redirectTo);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
