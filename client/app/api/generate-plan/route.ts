// app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json()
    
    console.log("=== PLAN GENERATION REQUEST ===")
    console.log("Goal:", formData.goal_event)
    console.log("Target:", formData.goal_target)
    console.log("Dates:", formData.start_date, "to", formData.goal_date)
    console.log("Calendar enabled:", formData.use_calendar)
    
    if (formData.use_calendar && formData.calendar_events_summary) {
      console.log("\n=== USER CALENDAR DATA ===")
      console.log(formData.calendar_events_summary)
    }
    
    // Build the prompt for OpenAI
    const prompt = buildPromptForLLM(formData)
    
    // Call OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      console.error("❌ OPENAI_API_KEY not found in environment variables")
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file." },
        { status: 500 }
      )
    }
    
    console.log("🤖 Calling OpenAI API...")
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1', // or 'gpt-3.5-turbo' for faster/cheaper
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert running coach with years of experience creating personalized training plans. You understand periodization, injury prevention, and how to adapt plans to real-world schedules.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    })
    
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error("OpenAI API Error:", errorData)
      throw new Error(errorData.error?.message || "Failed to generate plan with OpenAI")
    }
    
    const openaiData = await openaiResponse.json()
    const generatedPlan = openaiData.choices[0].message.content
    
    console.log("✅ Plan generated successfully!")
    
    return NextResponse.json({
      success: true,
      plan: generatedPlan,
      metadata: {
        generatedAt: new Date().toISOString(),
        calendarIntegration: formData.use_calendar || false,
        model: 'gpt-4-turbo-preview',
        tokensUsed: openaiData.usage,
      }
    })
    
  } catch (error: any) {
    console.error("Plan generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate plan" },
      { status: 500 }
    )
  }
}

// Helper: Calculate number of weeks
function calculateWeeks(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 7)
}

// Helper: Build LLM prompt
function buildPromptForLLM(formData: any): string {
  const hasRoutes = formData.routeSuggestions && 
                   formData.routeSuggestions.routes && 
                   formData.routeSuggestions.routes.length > 0;
                   
  const baseDistance = hasRoutes ? 
    formData.routeSuggestions.routes[0].distance.toFixed(2) : 
    (formData.current_weekly_km / formData.days_per_week).toFixed(2);

  return `
You are an expert running coach. Create a personalized training plan.

ATHLETE DETAILS:
- Goal Event: ${formData.goal_event}
- Target: ${formData.goal_target}
- Current Weekly Distance: ${formData.current_weekly_km} km
- Fitness Level: ${formData.fitness_level}
- Training Days per Week: ${formData.days_per_week}
- Location: ${formData.country}
- Training Period: ${formData.start_date} to ${formData.goal_date}
${formData.address ? `- Starting/Ending Location: ${formData.address}` : ''}

${hasRoutes ? `
🗺️ SUGGESTED RUNNING ROUTE:
I have identified a running route from the specified location:

ROUTE DETAILS:
- Starting Point: ${formData.address}
- Distance: ${formData.routeSuggestions.routes[0].distance.toFixed(2)} km
- Type: Out-and-back route
${formData.routeSuggestions.routes[0].summary ? `- Estimated Duration: ${Math.round(formData.routeSuggestions.routes[0].summary.total_time / 60)} minutes` : ''}

STEP-BY-STEP DIRECTIONS:
${formData.routeSuggestions.routes[0].directions.map((step: string, index: number) => 
  `${index + 1}. ${step}`
).join('\n')}

When creating the training plan, incorporate this route as follows:
1. Include these exact directions in each workout that uses this route
2. For longer runs, specify which sections to repeat or extend
3. For shorter runs, indicate the turning point in the directions
4. Note any landmarks or significant points for safety and navigation
5. Consider the route's characteristics when planning workout intensity

Remember to advise the runner to:
- Study the route before the first run
- Run the route in daylight first to familiarize
- Save the directions on their phone
- Be aware of their surroundings while running
` : ''}

${formData.use_calendar && formData.calendar_events_summary ? `
⚠️ IMPORTANT - CALENDAR CONSTRAINTS:
The athlete has shared their calendar schedule. Please create a training plan
that works around their existing commitments:

${formData.calendar_events_summary}

Requirements:
1. Avoid scheduling long runs or intense workouts on days with < 4 hours available
2. Consider rest days or easy workouts on the busiest days
3. Be specific about which dates are best for harder workouts
4. Acknowledge the schedule constraints in your recommendations
` : ''}

Please provide a detailed training plan with the following format:

WEEKLY SCHEDULE FORMAT:
Week [Number] ([Date Range]):
[Day]: [Workout Type]
- Distance: [X] km
- Target Pace: [X:XX/km]
- Route Instructions:
  ${formData.routeSuggestions?.presetRoutes ? 
    `* Suggested Route: ${formData.routeSuggestions.presetRoutes[0].name}
     * Location: ${formData.routeSuggestions.presetRoutes[0].location}
     * Distance: ${formData.routeSuggestions.presetRoutes[0].distance} km
     * Surface Type: ${formData.routeSuggestions.presetRoutes[0].surfaceType}
     * Key Features: ${formData.routeSuggestions.presetRoutes[0].highlights.join(', ')}
     * For longer runs: Run multiple segments or extend the route as needed
     * For shorter runs: Run a partial segment and turn back` 
    : formData.address && formData.routeSuggestions?.routes ? 
    `* Start: ${formData.address}
     * [Include the step-by-step directions provided above]
     * For longer runs: [Specify which sections to repeat]
     * For shorter runs: [Specify where to turn back]` 
    : '* No specific route suggested. Choose any convenient route.'}
- Workout Details: [Include specific intervals, tempo sections, etc.]
- Recovery: [Specify recovery times between intervals if applicable]

Please include:
1. Detailed weekly schedules as per the format above
2. Each running session must have:
   - Clear route directions copied from the suggested route
   - Specific modifications for different distances
   - Key landmarks or checkpoints
3. Rest and recovery days clearly marked
4. Race day strategy
5. Safety tips for running in ${formData.country}

For route modifications:
- Shorter runs (< ${baseDistance} km): Specify exact turning point
- Longer runs (> ${baseDistance} km): Detail how many times to repeat specific sections
- Include clear markers or landmarks for turn-around points

Important: Every running session must include the complete step-by-step directions with any necessary modifications for that specific workout.
`.trim()
}

/* 
NEXT STEPS FOR IMPLEMENTATION:

1. OPTION A - Use OpenAI:
   
   const response = await fetch('https://api.openai.com/v1/chat/completions', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
     },
     body: JSON.stringify({
       model: 'gpt-4-turbo-preview',
       messages: [
         { role: 'system', content: 'You are an expert running coach.' },
         { role: 'user', content: prompt }
       ],
     }),
   })
   const data = await response.json()
   return NextResponse.json({ plan: data.choices[0].message.content })

2. OPTION B - Use Anthropic Claude:
   
   const response = await fetch('https://api.anthropic.com/v1/messages', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'x-api-key': process.env.ANTHROPIC_API_KEY,
       'anthropic-version': '2023-06-01',
     },
     body: JSON.stringify({
       model: 'claude-3-sonnet-20240229',
       max_tokens: 2000,
       messages: [{ role: 'user', content: prompt }],
     }),
   })
   const data = await response.json()
   return NextResponse.json({ plan: data.content[0].text })

3. OPTION C - Call your existing backend/model
   
   const response = await fetch('http://your-backend/generate-plan', {
     method: 'POST',
     body: JSON.stringify(formData),
   })
   return NextResponse.json(await response.json())
*/

