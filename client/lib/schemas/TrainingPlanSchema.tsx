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

    available_days: z
        .array(
            z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
        )
        .min(1, { message: "You must select at least one day." })
        .max(7, { message: "You can’t select more than 7 days." }),

    current_weekly_km: z
        .number()
        .min(0)
        .max(200),

    fitness_level: z
        .enum(["Beginner", "Intermediate", "Advanced"]),

    country: z.string().min(5, {
        message: "Should be a valid country name"
    }),

    injury: z
        .string()
        .optional(),

    start_date: z.string().date("Invalid start date"),
    goal_date: z.string().date("Invalid goal date"),

    use_calendar: z.boolean().default(false).optional(),
    calendar_events_summary: z.string().optional(),

    use_wearable: z.boolean().default(false).optional(),
    wearable_data: activitySummarySchema.optional(),
    activity_level: activityLevelSchema.optional(),

    address: z.string().optional(),
})
