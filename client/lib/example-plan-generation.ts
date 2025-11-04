/**
 * EXAMPLE: How to use calendar data in training plan generation
 * 
 * This file demonstrates how to integrate the calendar data
 * when generating training plans with an LLM or custom logic.
 * 
 * You can adapt this to your specific implementation.
 */

import { z } from "zod"
import { trainingPlanSchema } from "./schemas/TrainingPlanSchema"

type FormValues = z.infer<typeof trainingPlanSchema>

/**
 * Example 1: Generate training plan with OpenAI or Claude
 */
export async function generateTrainingPlanWithLLM(formData: FormValues) {
  // Build the prompt for your LLM
  const systemPrompt = `You are an expert running coach. Generate personalized training plans 
  that consider the user's fitness level, goals, and schedule constraints.`

  const userPrompt = `
Create a detailed training plan with these requirements:

**Goal Event:** ${formData.goal_event}
**Target:** ${formData.goal_target}
**Training Days per Week:** ${formData.days_per_week}
**Current Weekly Distance:** ${formData.current_weekly_km} km
**Fitness Level:** ${formData.fitness_level}
**Location:** ${formData.country}
**Training Period:** ${formData.start_date} to ${formData.goal_date}

${formData.use_calendar && formData.calendar_events_summary ? `
⚠️ IMPORTANT: The user has shared their calendar schedule. 
Please create a training plan that accommodates their existing commitments.

${formData.calendar_events_summary}

Requirements:
1. Avoid scheduling long runs or intense workouts on days with limited availability (< 4 hours free)
2. Consider rest days on the busiest days
3. Be flexible with workout timing on days with scattered events
4. Mention specific dates when referring to scheduled workouts
5. Acknowledge the user's schedule constraints in your recommendations

` : ''}

Please provide:
1. Week-by-week training schedule with specific workouts
2. Daily training details (distance, pace, type)
3. Rest days and recovery recommendations
4. Race day strategy
5. Safety and hydration tips specific to ${formData.country}
`

  // Example: Call OpenAI API
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4-turbo-preview',
  //     messages: [
  //       { role: 'system', content: systemPrompt },
  //       { role: 'user', content: userPrompt }
  //     ],
  //     temperature: 0.7,
  //     max_tokens: 2000,
  //   }),
  // })
  // const data = await response.json()
  // return data.choices[0].message.content

  // For now, return the prompt for inspection
  return { systemPrompt, userPrompt }
}

/**
 * Example 2: Custom logic-based plan generation using calendar data
 */
export async function generateCustomTrainingPlan(formData: FormValues) {
  // Parse calendar data to extract busy days
  const busyDays = extractBusyDaysFromSummary(formData.calendar_events_summary || "")
  
  // Calculate training duration
  const startDate = new Date(formData.start_date)
  const endDate = new Date(formData.goal_date)
  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
  
  // Generate week-by-week plan
  const weeklyPlan = []
  
  for (let week = 1; week <= totalWeeks; week++) {
    const weekStart = new Date(startDate)
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7)
    
    const weekDays = []
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(weekStart)
      currentDate.setDate(currentDate.getDate() + day)
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
      
      // Check if this day is busy
      const isBusy = busyDays.includes(dateStr)
      
      // Assign workout based on day and busyness
      let workout = ""
      if (isBusy) {
        workout = "Rest or light recovery jog (20-30 min)"
      } else if (day === 0) {
        workout = `Long run (${calculateLongRunDistance(week, totalWeeks, formData.current_weekly_km)} km)`
      } else if (day === 3) {
        workout = `Tempo run (${calculateTempoDistance(week, formData.fitness_level)} km at goal pace)`
      } else if (day === 5 || day === 6) {
        workout = "Rest"
      } else {
        workout = `Easy run (${calculateEasyRunDistance(week, formData.fitness_level)} km)`
      }
      
      weekDays.push({
        date: dateStr,
        dayName,
        workout,
        isBusy,
      })
    }
    
    weeklyPlan.push({
      weekNumber: week,
      days: weekDays,
    })
  }
  
  return {
    plan: weeklyPlan,
    summary: `${totalWeeks}-week plan for ${formData.goal_event}`,
    totalWeeks,
    busyDays: busyDays.length,
  }
}

/**
 * Helper: Extract busy days from calendar summary
 */
function extractBusyDaysFromSummary(summary: string): string[] {
  const busyDays: string[] = []
  
  // Look for lines like "  - Available time: ~3 hours" or less
  const lines = summary.split('\n')
  let currentDate = ""
  
  for (const line of lines) {
    // Match date lines like "2025-01-15 (Monday):"
    const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) {
      currentDate = dateMatch[1]
    }
    
    // Match availability lines and check if < 4 hours
    const availMatch = line.match(/Available time: ~([\d.]+) hours/)
    if (availMatch && currentDate) {
      const hours = parseFloat(availMatch[1])
      if (hours < 4) {
        busyDays.push(currentDate)
      }
    }
  }
  
  return busyDays
}

/**
 * Helper: Calculate long run distance based on progression
 */
function calculateLongRunDistance(week: number, totalWeeks: number, currentWeekly: number): number {
  const progressionFactor = Math.min(week / totalWeeks, 0.8) // Cap at 80% of plan
  const targetLongRun = currentWeekly * 0.4 // Long run is ~40% of weekly volume
  return Math.round(targetLongRun * (1 + progressionFactor))
}

/**
 * Helper: Calculate tempo run distance
 */
function calculateTempoDistance(week: number, fitnessLevel: string): number {
  const baseDistances = {
    Beginner: 5,
    Intermediate: 7,
    Advanced: 10,
  }
  
  const base = baseDistances[fitnessLevel as keyof typeof baseDistances] || 6
  return Math.round(base + week * 0.3)
}

/**
 * Helper: Calculate easy run distance
 */
function calculateEasyRunDistance(week: number, fitnessLevel: string): number {
  const baseDistances = {
    Beginner: 4,
    Intermediate: 6,
    Advanced: 8,
  }
  
  const base = baseDistances[fitnessLevel as keyof typeof baseDistances] || 5
  return Math.round(base + week * 0.2)
}

/**
 * Example 3: API route handler for plan generation
 * 
 * Create this file at: app/api/generate-plan/route.ts
 */
export const exampleApiRoute = `
import { NextRequest, NextResponse } from "next/server"
import { generateTrainingPlanWithLLM } from "@/lib/example-plan-generation"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json()
    
    // Validate the data (optional but recommended)
    // const validated = trainingPlanSchema.parse(formData)
    
    // Generate the plan
    const plan = await generateTrainingPlanWithLLM(formData)
    
    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (error: any) {
    console.error("Plan generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate plan" },
      { status: 500 }
    )
  }
}
`

/**
 * Example 4: Update the onSubmit handler in PlanInputForm.tsx
 */
export const exampleOnSubmitHandler = `
const onSubmit = async (values: FormValues) => {
  try {
    setIsSubmitting(true)
    
    // Log the calendar data (for debugging)
    if (values.use_calendar) {
      console.log("Including calendar data in plan generation:")
      console.log(values.calendar_events_summary)
    }
    
    // Send to your API
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    
    if (!response.ok) {
      throw new Error('Plan generation failed')
    }
    
    const data = await response.json()
    
    // Display the generated plan
    console.log("Generated plan:", data.plan)
    
    // You could store this in state and display in PlanOutput component
    // setGeneratedPlan(data.plan)
    
  } catch (error) {
    console.error("Error:", error)
    alert("Failed to generate plan. Please try again.")
  } finally {
    setIsSubmitting(false)
  }
}
`

/**
 * Example 5: Format plan for display
 */
export function formatPlanForDisplay(plan: any) {
  // This is a simple example - adapt to your needs
  let formatted = `# ${plan.summary}\n\n`
  
  plan.plan.forEach((week: any) => {
    formatted += `## Week ${week.weekNumber}\n\n`
    
    week.days.forEach((day: any) => {
      formatted += `**${day.dayName} (${day.date})**${day.isBusy ? ' ⚠️ Busy Day' : ''}\n`
      formatted += `- ${day.workout}\n\n`
    })
  })
  
  return formatted
}

// Export everything for use in your application
export default {
  generateTrainingPlanWithLLM,
  generateCustomTrainingPlan,
  extractBusyDaysFromSummary,
  formatPlanForDisplay,
}

