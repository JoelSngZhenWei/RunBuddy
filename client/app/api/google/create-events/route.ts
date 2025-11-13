// app/api/google/create-events/route.ts
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

interface WorkoutEvent {
  summary: string
  description: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return null
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    const data = await response.json()
    if (response.ok && data.access_token) {
      return data.access_token
    }
    return null
  } catch (err) {
    console.error("Token refresh error:", err)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { events, startDate, timeZone = "Asia/Singapore" } = body

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "Events array is required" }, { status: 400 })
    }

    if (!startDate) {
      return NextResponse.json({ error: "startDate is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    let accessToken = cookieStore.get("google_access_token")?.value
    const refreshToken = cookieStore.get("google_refresh_token")?.value

    if (!accessToken) {
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken)
        if (newAccessToken) {
          accessToken = newAccessToken
          cookieStore.set("google_access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 3600,
          })
        } else {
          return NextResponse.json({ error: "Not authenticated with Google Calendar" }, { status: 401 })
        }
      } else {
        return NextResponse.json({ error: "Not authenticated with Google Calendar" }, { status: 401 })
      }
    }

    // Create events in Google Calendar
    const createdEvents = []
    const errors = []

    for (const event of events) {
      try {
        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: event.summary,
            description: event.description,
            start: {
              dateTime: event.start.dateTime,
              timeZone: event.start.timeZone || timeZone,
            },
            end: {
              dateTime: event.end.dateTime,
              timeZone: event.end.timeZone || timeZone,
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: "popup", minutes: 30 }, // 30 minutes before
              ],
            },
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          errors.push({
            event: event.summary,
            error: errorData?.error?.message || "Failed to create event",
          })
        } else {
          const createdEvent = await response.json()
          createdEvents.push({
            id: createdEvent.id,
            summary: createdEvent.summary,
            htmlLink: createdEvent.htmlLink,
          })
        }
      } catch (err: any) {
        errors.push({
          event: event.summary,
          error: err.message || "Failed to create event",
        })
      }
    }

    return NextResponse.json({
      success: createdEvents.length > 0,
      created: createdEvents.length,
      failed: errors.length,
      events: createdEvents,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error("Create calendar events error:", err)
    return NextResponse.json({ error: err.message || "Failed to create calendar events" }, { status: 500 })
  }
}


