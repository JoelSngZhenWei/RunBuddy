// lib/calendar-utils.ts

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  date: string
  duration: number // in minutes
  isAllDay: boolean
}

export interface CalendarEventsByDate {
  [date: string]: CalendarEvent[]
}

export interface BusyTimeSlot {
  date: string
  startTime: string
  endTime: string
  duration: number
  eventTitle: string
}

/**
 * Fetches calendar events from the API for a given date range
 */
export async function fetchCalendarEvents(
  startDate: string,
  endDate: string
): Promise<{ events: CalendarEvent[]; eventsByDate: CalendarEventsByDate } | null> {
  try {
    const url = new URL("/api/google/events", window.location.origin)
    url.searchParams.set("start_date", startDate)
    url.searchParams.set("end_date", endDate)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log("Not authenticated with Google Calendar")
        return null
      }
      throw new Error("Failed to fetch calendar events")
    }

    const data = await response.json()
    return {
      events: data.events || [],
      eventsByDate: data.eventsByDate || {},
    }
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return null
  }
}

/**
 * Analyzes calendar events and identifies busy time slots
 */
export function analyzeBusyTimeSlots(events: CalendarEvent[]): BusyTimeSlot[] {
  return events.map((event) => ({
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    duration: event.duration,
    eventTitle: event.title,
  }))
}

/**
 * Calculates available training time per day based on calendar events
 */
export function calculateAvailableTime(
  eventsByDate: CalendarEventsByDate,
  dateRange: { start: string; end: string }
): Record<string, number> {
  const availableMinutes: Record<string, number> = {}
  
  const startDate = new Date(dateRange.start)
  const endDate = new Date(dateRange.end)
  
  // Assume 16 hours (960 minutes) of waking time per day
  const WAKING_HOURS_PER_DAY = 16 * 60

  // Iterate through each day in the range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    const dayEvents = eventsByDate[dateStr] || []
    
    // Calculate total busy time for the day (excluding all-day events)
    const busyMinutes = dayEvents
      .filter((event) => !event.isAllDay)
      .reduce((sum, event) => sum + event.duration, 0)
    
    availableMinutes[dateStr] = Math.max(0, WAKING_HOURS_PER_DAY - busyMinutes)
  }
  
  return availableMinutes
}

/**
 * Formats calendar events into a human-readable summary for AI training plan generation
 */
export function formatEventsForTrainingPlan(
  eventsByDate: CalendarEventsByDate,
  dateRange: { start: string; end: string }
): string {
  const availableTime = calculateAvailableTime(eventsByDate, dateRange)
  
  let summary = "User's Calendar Commitments:\n\n"
  
  const startDate = new Date(dateRange.start)
  const endDate = new Date(dateRange.end)
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    const dayEvents = eventsByDate[dateStr] || []
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" })
    const availableHours = Math.round(availableTime[dateStr] / 60 * 10) / 10
    
    summary += `${dateStr} (${dayName}):\n`
    
    if (dayEvents.length === 0) {
      summary += `  - No scheduled events\n`
      summary += `  - Available time: ~${availableHours} hours\n`
    } else {
      summary += `  - ${dayEvents.length} event(s) scheduled:\n`
      dayEvents.forEach((event) => {
        const startTime = new Date(event.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
        const endTime = new Date(event.endTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
        if (event.isAllDay) {
          summary += `    • ${event.title} (All day)\n`
        } else {
          summary += `    • ${event.title} (${startTime} - ${endTime})\n`
        }
      })
      summary += `  - Available time: ~${availableHours} hours\n`
    }
    summary += "\n"
  }
  
  return summary
}

/**
 * Identifies days with limited availability (less than 4 hours)
 */
export function identifyRestrictedDays(
  eventsByDate: CalendarEventsByDate,
  dateRange: { start: string; end: string },
  minimumHours: number = 4
): string[] {
  const availableTime = calculateAvailableTime(eventsByDate, dateRange)
  const restrictedDays: string[] = []
  
  Object.entries(availableTime).forEach(([date, minutes]) => {
    if (minutes < minimumHours * 60) {
      restrictedDays.push(date)
    }
  })
  
  return restrictedDays
}

/**
 * Generates training recommendations based on calendar availability
 */
export function generateCalendarBasedRecommendations(
  eventsByDate: CalendarEventsByDate,
  dateRange: { start: string; end: string }
): string {
  const restrictedDays = identifyRestrictedDays(eventsByDate, dateRange)
  const availableTime = calculateAvailableTime(eventsByDate, dateRange)
  
  let recommendations = "Calendar-Based Training Recommendations:\n\n"
  
  if (restrictedDays.length === 0) {
    recommendations += "✓ Your schedule looks flexible with good availability throughout the training period.\n"
  } else {
    recommendations += `⚠ ${restrictedDays.length} day(s) have limited availability (< 4 hours):\n`
    restrictedDays.forEach((date) => {
      const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
      const hours = Math.round(availableTime[date] / 60 * 10) / 10
      recommendations += `  - ${dayName}: ~${hours} hours available\n`
    })
    recommendations += "\nConsider scheduling rest days or lighter workouts on these dates.\n"
  }
  
  return recommendations
}

