// app/api/google/events/route.ts
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  status: string
}

interface ProcessedEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  date: string
  duration: number // in minutes
  isAllDay: boolean
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("start_date")
  const endDate = searchParams.get("end_date")

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "start_date and end_date are required" }, { status: 400 })
  }

  const cookieStore = await cookies()
  let accessToken = cookieStore.get("google_access_token")?.value
  const refreshToken = cookieStore.get("google_refresh_token")?.value

  if (!accessToken) {
    if (refreshToken) {
      // Try to refresh the token
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

  try {
    // Format dates for Google Calendar API (ISO 8601)
    const timeMin = new Date(startDate).toISOString()
    const timeMax = new Date(endDate).toISOString()

    // Fetch calendar events
    const calendarUrl = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events")
    calendarUrl.searchParams.set("timeMin", timeMin)
    calendarUrl.searchParams.set("timeMax", timeMax)
    calendarUrl.searchParams.set("singleEvents", "true")
    calendarUrl.searchParams.set("orderBy", "startTime")
    calendarUrl.searchParams.set("maxResults", "250")

    const response = await fetch(calendarUrl.toString(), {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Google Calendar API error:", errorData)
      return NextResponse.json({ error: errorData?.error?.message || "Failed to fetch calendar events" }, { status: response.status })
    }

    const data = await response.json()
    const events: CalendarEvent[] = data.items || []

    // Process and format events
    const processedEvents: ProcessedEvent[] = events
      .filter((event) => event.status === "confirmed")
      .map((event) => {
        const isAllDay = !!event.start.date
        const startDateTime = event.start.dateTime || event.start.date || ""
        const endDateTime = event.end.dateTime || event.end.date || ""
        
        const startDate = new Date(startDateTime)
        const endDate = new Date(endDateTime)
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))

        return {
          id: event.id,
          title: event.summary || "Untitled Event",
          description: event.description,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          date: startDate.toISOString().split("T")[0],
          duration,
          isAllDay,
        }
      })

    // Group events by date
    const eventsByDate: Record<string, ProcessedEvent[]> = {}
    processedEvents.forEach((event) => {
      if (!eventsByDate[event.date]) {
        eventsByDate[event.date] = []
      }
      eventsByDate[event.date].push(event)
    })

    return NextResponse.json({
      events: processedEvents,
      eventsByDate,
      totalEvents: processedEvents.length,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (err: any) {
    console.error("Calendar events fetch error:", err)
    return NextResponse.json({ error: err.message || "Failed to fetch calendar events" }, { status: 500 })
  }
}

