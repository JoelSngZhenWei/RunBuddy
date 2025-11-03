import { z } from "zod"
import { activitySummarySchema } from "./WearableDataSchema"

export const activityLevelSchema = z.enum(["sedentary", "moderate", "high"])
export type ActivityLevel = z.infer<typeof activityLevelSchema>

export const trainingPlanSchema = z.object({
    goal_event: z.string().min(3, {
        message: "Goal event should be at least 3 characters (e.g. Half Marathon).",
    }),

    goal_target: z.string().min(5, {
        message: "Goal target should be at least 5 characters (e.g. Finish under 2 hours).",
    }),

    days_per_week: z
        .number()
        .min(1, { message: "You must train at least once a week." })
        .max(7, { message: "Maximum is 7 training days per week." }),

    current_weekly_km: z
        .number()
        .min(0)
        .max(200),

    fitness_level: z
        .enum(["Beginner", "Intermediate", "Advanced"]),

    country: z.string().min(5, {
        message: "Should be a valid country name"
    }),

    start_date: z.string().date("Invalid start date"),
    goal_date: z.string().date("Invalid goal date"),
    
    use_calendar: z.boolean().default(false).optional(),
    calendar_events_summary: z.string().optional(),
    
    use_wearable: z.boolean().default(false).optional(),
    wearable_data: activitySummarySchema.optional(),
    activity_level: activityLevelSchema.optional(),

    address: z.string().optional(),
})
