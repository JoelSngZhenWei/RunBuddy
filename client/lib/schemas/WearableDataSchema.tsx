import { z } from "zod"

// Activity summary schema
export const activitySummarySchema = z.object({
    averageHeartRate: z.number(),
    averageHRV: z.number(),
    averageRespiratoryRate: z.number(),
    averageOxygenSaturation: z.number(),
    averageSleepDuration: z.number(),
    averageSteps: z.number(),
    averageActiveCalories: z.number(),
    averageDistance: z.number(),
    averageStandHours: z.number(),
    workoutFrequency: z.number(),
    sleepQuality: z.string(),
    recoveryStatus: z.string(),
    fitnessLevel: z.string()
})

export const activityLevelSchema = z.enum(["sedentary", "moderate", "high"])
export type ActivityLevel = z.infer<typeof activityLevelSchema>

// export const activitySummariesSchema = z.object({
//     sedentary: activitySummarySchema,
//     moderate: activitySummarySchema,
//     high: activitySummarySchema
// })

// // Common schemas for data points
// const timestampValueSchema = z.object({
//     timestamp: z.string(),
//     value: z.number(),
// })

// const sleepStagesSchema = z.object({
//     deep: z.number(),
//     rem: z.number(),
//     light: z.number(),
//     awake: z.number(),
// })

// // Specific metric schemas
// const heartRateDataSchema = z.object({
//     type: z.literal("HeartRate"),
//     unit: z.literal("count/min"),
//     data: z.array(timestampValueSchema),
// })

// const hrvDataSchema = z.object({
//     type: z.literal("HeartRateVariability"),
//     unit: z.literal("ms"),
//     data: z.array(timestampValueSchema),
// })

// const respiratoryRateDataSchema = z.object({
//     type: z.literal("RespiratoryRate"),
//     unit: z.literal("breaths/min"),
//     data: z.array(timestampValueSchema),
// })

// const oxygenSaturationDataSchema = z.object({
//     type: z.literal("OxygenSaturation"),
//     unit: z.literal("%"),
//     data: z.array(timestampValueSchema),
// })

// const sleepAnalysisDataSchema = z.object({
//     type: z.literal("SleepAnalysis"),
//     unit: z.literal("hours"),
//     data: z.array(z.object({
//         startDate: z.string(),
//         endDate: z.string(),
//         value: z.number(),
//         stages: sleepStagesSchema,
//     })),
// })

// const stepCountDataSchema = z.object({
//     type: z.literal("StepCount"),
//     unit: z.literal("steps"),
//     data: z.array(timestampValueSchema),
// })

// const activeEnergyDataSchema = z.object({
//     type: z.literal("ActiveEnergyBurned"),
//     unit: z.literal("kcal"),
//     data: z.array(timestampValueSchema),
// })

// const walkingRunningDistanceDataSchema = z.object({
//     type: z.literal("WalkingRunningDistance"),
//     unit: z.literal("km"),
//     data: z.array(timestampValueSchema),
// })

// const standHoursDataSchema = z.object({
//     type: z.literal("StandHours"),
//     unit: z.literal("hours"),
//     data: z.array(timestampValueSchema),
// })

// const workoutSessionSchema = z.object({
//     startDate: z.string(),
//     endDate: z.string(),
//     workoutType: z.string(),
//     duration: z.number(),
//     unit: z.literal("minutes"),
//     distance: z.number().optional(),
//     distanceUnit: z.string().optional(),
//     caloriesBurned: z.number(),
//     averageHeartRate: z.number(),
//     maxHeartRate: z.number(),
// })

// const workoutSessionsDataSchema = z.object({
//     type: z.literal("WorkoutSessions"),
//     data: z.array(workoutSessionSchema),
// })

// // Main schema for wearable data
// export const wearableDataSchema = z.union([
//     // Raw data format
//     z.array(z.union([
//         heartRateDataSchema,
//         hrvDataSchema,
//         respiratoryRateDataSchema,
//         oxygenSaturationDataSchema,
//         sleepAnalysisDataSchema,
//         stepCountDataSchema,
//         activeEnergyDataSchema,
//         walkingRunningDistanceDataSchema,
//         standHoursDataSchema,
//         workoutSessionsDataSchema,
//     ])),
//     // Summary format
//     activitySummariesSchema
// ])