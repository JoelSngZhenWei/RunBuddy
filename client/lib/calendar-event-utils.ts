// lib/calendar-event-utils.ts
import type { TrainingPlan, Workout, WeeklyPlan } from "@/lib/types/runbuddy"

export interface CalendarEventInput {
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

/**
 * Maps day abbreviations to day of week (0 = Sunday, 1 = Monday, etc.)
 */
const DAY_TO_NUMBER: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/**
 * Estimates workout duration in minutes based on distance and focus
 */
function estimateWorkoutDuration(workout: Workout): number {
  if (workout.focus === "rest") {
    return 0
  }

  if (workout.distance_km && workout.distance_km > 0) {
    // Estimate pace based on focus type
    let pacePerKm = 6.0 // Default easy pace (min/km)

    if (workout.target_pace_min_per_km) {
      pacePerKm = workout.target_pace_min_per_km
    } else {
      // Estimate pace based on workout type
      switch (workout.focus) {
        case "easy":
        case "recovery":
          pacePerKm = 6.0
          break
        case "tempo":
          pacePerKm = 5.0
          break
        case "intervals":
          pacePerKm = 4.5
          break
        case "long_run":
          pacePerKm = 6.5
          break
      }
    }

    // Calculate duration: distance * pace + 10 minutes for warmup/cooldown
    const runningTime = workout.distance_km * pacePerKm
    return Math.round(runningTime + 10)
  }

  // Default durations for workouts without distance
  switch (workout.focus) {
    case "easy":
      return 30
    case "tempo":
      return 45
    case "intervals":
      return 40
    case "long_run":
      return 90
    case "recovery":
      return 20
    default:
      return 30
  }
}

/**
 * Gets the date for a specific day of week in a given week
 */
function getDateForDay(startDate: Date, weekNumber: number, dayAbbr: string): Date {
  const dayOfWeek = DAY_TO_NUMBER[dayAbbr]
  if (dayOfWeek === undefined) {
    throw new Error(`Invalid day abbreviation: ${dayAbbr}`)
  }

  // Calculate the start of the specified week (week 1 starts at startDate)
  const weekStart = new Date(startDate)
  weekStart.setDate(startDate.getDate() + (weekNumber - 1) * 7)

  // Find the target day in that week
  const currentDay = weekStart.getDay()
  const daysToAdd = (dayOfWeek - currentDay + 7) % 7
  const targetDate = new Date(weekStart)
  targetDate.setDate(weekStart.getDate() + daysToAdd)

  return targetDate
}

/**
 * Formats workout description for calendar event
 */
function formatWorkoutDescription(workout: Workout): string {
  const parts: string[] = []

  if (workout.distance_km && workout.distance_km > 0) {
    parts.push(`Distance: ${workout.distance_km} km`)
  }

  if (workout.target_pace_min_per_km) {
    const minutes = Math.floor(workout.target_pace_min_per_km)
    const seconds = Math.round((workout.target_pace_min_per_km - minutes) * 60)
    parts.push(`Target Pace: ${minutes}:${seconds.toString().padStart(2, "0")}/km`)
  }

  if (workout.description) {
    parts.push(`\n${workout.description}`)
  }

  if (workout.notes) {
    parts.push(`\nNotes: ${workout.notes}`)
  }

  return parts.join("\n")
}

/**
 * Converts a training plan to calendar events
 */
export function convertPlanToCalendarEvents(
  plan: TrainingPlan,
  startDate: string,
  defaultStartTime: string = "06:00",
  timeZone: string = "Asia/Singapore"
): CalendarEventInput[] {
  const events: CalendarEventInput[] = []
  const planStartDate = new Date(startDate)

  // Set default time to 6:00 AM if not provided
  const [defaultHour, defaultMinute] = defaultStartTime.split(":").map(Number)

  for (const weeklyPlan of plan.weekly_plans) {
    for (const workout of weeklyPlan.workouts) {
      // Skip rest days
      if (workout.focus === "rest") {
        continue
      }

      // Get the date for this workout
      const workoutDate = getDateForDay(planStartDate, weeklyPlan.week_number, workout.day)

      // Set start time
      const startDateTime = new Date(workoutDate)
      startDateTime.setHours(defaultHour, defaultMinute, 0, 0)

      // Calculate end time based on estimated duration
      const durationMinutes = estimateWorkoutDuration(workout)
      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes)

      // Format event title
      const focusEmoji: Record<string, string> = {
        easy: "🏃",
        long_run: "🏃‍♂️",
        intervals: "⚡",
        tempo: "🔥",
        recovery: "🧘",
      }

      const emoji = focusEmoji[workout.focus] || "🏃"
      const distanceText = workout.distance_km ? `${workout.distance_km}km ` : ""
      const summary = `${emoji} ${workout.focus.charAt(0).toUpperCase() + workout.focus.slice(1).replace("_", " ")}${distanceText ? ` - ${distanceText}` : ""}`

      // Format description
      const description = formatWorkoutDescription(workout)

      events.push({
        summary,
        description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone,
        },
      })
    }
  }

  return events
}

/**
 * Creates calendar events from a training plan
 */
export async function addPlanToGoogleCalendar(
  plan: TrainingPlan,
  startDate: string,
  defaultStartTime: string = "06:00",
  timeZone: string = "Asia/Singapore"
): Promise<{ success: boolean; created: number; failed: number; events?: any[]; errors?: any[] }> {
  const events = convertPlanToCalendarEvents(plan, startDate, defaultStartTime, timeZone)

  const response = await fetch("/api/google/create-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      events,
      startDate,
      timeZone,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to add plan to calendar")
  }

  return response.json()
}


