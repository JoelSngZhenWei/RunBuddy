// Mock wearable data for different activity levels (sedentary, moderately active, highly active)

// Activity Level Summaries
export const activitySummaries = {
  sedentary: {
    averageHeartRate: 84, // bpm
    averageHRV: 36, // ms
    averageRespiratoryRate: 16, // breaths/min
    averageOxygenSaturation: 95.5, // %
    averageSleepDuration: 7.7, // hours
    averageSteps: 3833,
    averageActiveCalories: 300,
    averageDistance: 2.3, // km
    averageStandHours: 6.3,
    workoutFrequency: 0.33, // workouts per day
    sleepQuality: "Poor", // based on deep + REM sleep percentages
    recoveryStatus: "Low",
    fitnessLevel: "Sedentary"
  },
  moderate: {
    averageHeartRate: 75, // bpm
    averageHRV: 48, // ms
    averageRespiratoryRate: 14, // breaths/min
    averageOxygenSaturation: 97.8, // %
    averageSleepDuration: 7.5, // hours
    averageSteps: 9367,
    averageActiveCalories: 605,
    averageDistance: 6.5, // km
    averageStandHours: 11,
    workoutFrequency: 1, // workouts per day
    sleepQuality: "Good", // based on deep + REM sleep percentages
    recoveryStatus: "Moderate",
    fitnessLevel: "Active"
  },
  high: {
    averageHeartRate: 65, // bpm
    averageHRV: 68, // ms
    averageRespiratoryRate: 12, // breaths/min
    averageOxygenSaturation: 98.7, // %
    averageSleepDuration: 8, // hours
    averageSteps: 15433,
    averageActiveCalories: 883,
    averageDistance: 13.5, // km
    averageStandHours: 14.3,
    workoutFrequency: 1.67, // workouts per day
    sleepQuality: "Excellent", // based on deep + REM sleep percentages
    recoveryStatus: "High",
    fitnessLevel: "Highly Active"
  }
}

// export const sedentaryUserData = [
//   {
//     "type": "HeartRate",
//     "unit": "count/min",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 82},
//       {"timestamp": "2025-10-30T12:00:00Z", "value": 88},
//       {"timestamp": "2025-10-30T18:00:00Z", "value": 85},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 80},
//       {"timestamp": "2025-10-31T12:00:00Z", "value": 86},
//       {"timestamp": "2025-10-31T18:00:00Z", "value": 84},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 78},
//       {"timestamp": "2025-11-01T12:00:00Z", "value": 90},
//       {"timestamp": "2025-11-01T18:00:00Z", "value": 83}
//     ]
//   },
//   {
//     "type": "HeartRateVariability",
//     "unit": "ms",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 35},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 38},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 36}
//     ]
//   },
//   {
//     "type": "RespiratoryRate",
//     "unit": "breaths/min",
//     "data": [
//       {"timestamp": "2025-10-30T03:00:00Z", "value": 16},
//       {"timestamp": "2025-10-31T03:00:00Z", "value": 17},
//       {"timestamp": "2025-11-01T03:00:00Z", "value": 16}
//     ]
//   },
//   {
//     "type": "OxygenSaturation",
//     "unit": "%",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 96},
//       {"timestamp": "2025-10-30T14:00:00Z", "value": 95},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 96},
//       {"timestamp": "2025-10-31T14:00:00Z", "value": 95},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 96},
//       {"timestamp": "2025-11-01T14:00:00Z", "value": 95}
//     ]
//   },
//   {
//     "type": "SleepAnalysis",
//     "unit": "hours",
//     "data": [
//       {
//         "startDate": "2025-10-29T23:30:00Z",
//         "endDate": "2025-10-30T07:30:00Z",
//         "value": 8,
//         "stages": {
//           "deep": 1.5,
//           "rem": 1.5,
//           "light": 4.0,
//           "awake": 1.0
//         }
//       },
//       {
//         "startDate": "2025-10-30T23:45:00Z",
//         "endDate": "2025-10-31T07:15:00Z",
//         "value": 7.5,
//         "stages": {
//           "deep": 1.3,
//           "rem": 1.4,
//           "light": 3.8,
//           "awake": 1.0
//         }
//       },
//       {
//         "startDate": "2025-10-31T23:00:00Z",
//         "endDate": "2025-11-01T06:30:00Z",
//         "value": 7.5,
//         "stages": {
//           "deep": 1.2,
//           "rem": 1.3,
//           "light": 4.0,
//           "awake": 1.0
//         }
//       }
//     ]
//   },
//   {
//     "type": "StepCount",
//     "unit": "steps",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 3500},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 4200},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 3800}
//     ]
//   },
//   {
//     "type": "ActiveEnergyBurned",
//     "unit": "kcal",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 280},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 320},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 300}
//     ]
//   },
//   {
//     "type": "WalkingRunningDistance",
//     "unit": "km",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 2.1},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 2.5},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 2.3}
//     ]
//   },
//   {
//     "type": "StandHours",
//     "unit": "hours",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 6},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 7},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 6}
//     ]
//   },
//   {
//     "type": "WorkoutSessions",
//     "data": [
//       {
//         "startDate": "2025-10-31T12:00:00Z",
//         "endDate": "2025-10-31T12:20:00Z",
//         "workoutType": "Walking",
//         "duration": 20,
//         "unit": "minutes",
//         "distance": 1.2,
//         "distanceUnit": "km",
//         "caloriesBurned": 80,
//         "averageHeartRate": 105,
//         "maxHeartRate": 115
//       }
//     ]
//   }
// ]

// export const moderatelyActiveUserData = [
//   {
//     "type": "HeartRate",
//     "unit": "count/min",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 72},
//       {"timestamp": "2025-10-30T12:00:00Z", "value": 80},
//       {"timestamp": "2025-10-30T18:00:00Z", "value": 76},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 70},
//       {"timestamp": "2025-10-31T12:00:00Z", "value": 78},
//       {"timestamp": "2025-10-31T18:00:00Z", "value": 74},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 68},
//       {"timestamp": "2025-11-01T12:00:00Z", "value": 82},
//       {"timestamp": "2025-11-01T18:00:00Z", "value": 75}
//     ]
//   },
//   {
//     "type": "HeartRateVariability",
//     "unit": "ms",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 45},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 52},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 48}
//     ]
//   },
//   {
//     "type": "RespiratoryRate",
//     "unit": "breaths/min",
//     "data": [
//       {"timestamp": "2025-10-30T03:00:00Z", "value": 14},
//       {"timestamp": "2025-10-31T03:00:00Z", "value": 15},
//       {"timestamp": "2025-11-01T03:00:00Z", "value": 13}
//     ]
//   },
//   {
//     "type": "OxygenSaturation",
//     "unit": "%",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 98},
//       {"timestamp": "2025-10-30T14:00:00Z", "value": 97},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 99},
//       {"timestamp": "2025-10-31T14:00:00Z", "value": 98},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 98},
//       {"timestamp": "2025-11-01T14:00:00Z", "value": 97}
//     ]
//   },
//   {
//     "type": "SleepAnalysis",
//     "unit": "hours",
//     "data": [
//       {
//         "startDate": "2025-10-29T22:30:00Z",
//         "endDate": "2025-10-30T06:30:00Z",
//         "value": 8,
//         "stages": {
//           "deep": 2.5,
//           "rem": 2.0,
//           "light": 3.0,
//           "awake": 0.5
//         }
//       },
//       {
//         "startDate": "2025-10-30T22:45:00Z",
//         "endDate": "2025-10-31T06:15:00Z",
//         "value": 7.5,
//         "stages": {
//           "deep": 2.0,
//           "rem": 1.8,
//           "light": 3.2,
//           "awake": 0.5
//         }
//       },
//       {
//         "startDate": "2025-10-31T23:00:00Z",
//         "endDate": "2025-11-01T06:00:00Z",
//         "value": 7,
//         "stages": {
//           "deep": 1.8,
//           "rem": 1.5,
//           "light": 3.0,
//           "awake": 0.7
//         }
//       }
//     ]
//   },
//   {
//     "type": "StepCount",
//     "unit": "steps",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 8200},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 10500},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 9400}
//     ]
//   },
//   {
//     "type": "ActiveEnergyBurned",
//     "unit": "kcal",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 520},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 680},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 615}
//     ]
//   },
//   {
//     "type": "WalkingRunningDistance",
//     "unit": "km",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 5.8},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 7.2},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 6.5}
//     ]
//   },
//   {
//     "type": "StandHours",
//     "unit": "hours",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 10},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 12},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 11}
//     ]
//   },
//   {
//     "type": "WorkoutSessions",
//     "data": [
//       {
//         "startDate": "2025-10-30T17:00:00Z",
//         "endDate": "2025-10-30T17:45:00Z",
//         "workoutType": "Running",
//         "duration": 45,
//         "unit": "minutes",
//         "distance": 6.5,
//         "distanceUnit": "km",
//         "caloriesBurned": 380,
//         "averageHeartRate": 145,
//         "maxHeartRate": 165
//       },
//       {
//         "startDate": "2025-10-31T07:00:00Z",
//         "endDate": "2025-10-31T08:00:00Z",
//         "workoutType": "Cycling",
//         "duration": 60,
//         "unit": "minutes",
//         "distance": 18.5,
//         "distanceUnit": "km",
//         "caloriesBurned": 450,
//         "averageHeartRate": 130,
//         "maxHeartRate": 155
//       },
//       {
//         "startDate": "2025-11-01T18:30:00Z",
//         "endDate": "2025-11-01T19:15:00Z",
//         "workoutType": "Strength Training",
//         "duration": 45,
//         "unit": "minutes",
//         "caloriesBurned": 320,
//         "averageHeartRate": 115,
//         "maxHeartRate": 140
//       }
//     ]
//   }
// ]

// export const highlyActiveUserData = [
//   {
//     "type": "HeartRate",
//     "unit": "count/min",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 62},
//       {"timestamp": "2025-10-30T12:00:00Z", "value": 68},
//       {"timestamp": "2025-10-30T18:00:00Z", "value": 65},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 60},
//       {"timestamp": "2025-10-31T12:00:00Z", "value": 70},
//       {"timestamp": "2025-10-31T18:00:00Z", "value": 66},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 58},
//       {"timestamp": "2025-11-01T12:00:00Z", "value": 72},
//       {"timestamp": "2025-11-01T18:00:00Z", "value": 64}
//     ]
//   },
//   {
//     "type": "HeartRateVariability",
//     "unit": "ms",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 65},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 68},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 70}
//     ]
//   },
//   {
//     "type": "RespiratoryRate",
//     "unit": "breaths/min",
//     "data": [
//       {"timestamp": "2025-10-30T03:00:00Z", "value": 12},
//       {"timestamp": "2025-10-31T03:00:00Z", "value": 13},
//       {"timestamp": "2025-11-01T03:00:00Z", "value": 12}
//     ]
//   },
//   {
//     "type": "OxygenSaturation",
//     "unit": "%",
//     "data": [
//       {"timestamp": "2025-10-30T08:00:00Z", "value": 99},
//       {"timestamp": "2025-10-30T14:00:00Z", "value": 98},
//       {"timestamp": "2025-10-31T08:00:00Z", "value": 99},
//       {"timestamp": "2025-10-31T14:00:00Z", "value": 99},
//       {"timestamp": "2025-11-01T08:00:00Z", "value": 99},
//       {"timestamp": "2025-11-01T14:00:00Z", "value": 98}
//     ]
//   },
//   {
//     "type": "SleepAnalysis",
//     "unit": "hours",
//     "data": [
//       {
//         "startDate": "2025-10-29T21:30:00Z",
//         "endDate": "2025-10-30T05:30:00Z",
//         "value": 8,
//         "stages": {
//           "deep": 3.0,
//           "rem": 2.2,
//           "light": 2.5,
//           "awake": 0.3
//         }
//       },
//       {
//         "startDate": "2025-10-30T21:45:00Z",
//         "endDate": "2025-10-31T05:45:00Z",
//         "value": 8,
//         "stages": {
//           "deep": 2.8,
//           "rem": 2.3,
//           "light": 2.6,
//           "awake": 0.3
//         }
//       },
//       {
//         "startDate": "2025-10-31T22:00:00Z",
//         "endDate": "2025-11-01T06:00:00Z",
//         "value": 8,
//         "stages": {
//           "deep": 2.9,
//           "rem": 2.2,
//           "light": 2.6,
//           "awake": 0.3
//         }
//       }
//     ]
//   },
//   {
//     "type": "StepCount",
//     "unit": "steps",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 15000},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 16800},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 14500}
//     ]
//   },
//   {
//     "type": "ActiveEnergyBurned",
//     "unit": "kcal",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 850},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 920},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 880}
//     ]
//   },
//   {
//     "type": "WalkingRunningDistance",
//     "unit": "km",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 12.5},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 14.2},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 13.8}
//     ]
//   },
//   {
//     "type": "StandHours",
//     "unit": "hours",
//     "data": [
//       {"timestamp": "2025-10-30T23:59:00Z", "value": 14},
//       {"timestamp": "2025-10-31T23:59:00Z", "value": 15},
//       {"timestamp": "2025-11-01T23:59:00Z", "value": 14}
//     ]
//   },
//   {
//     "type": "WorkoutSessions",
//     "data": [
//       {
//         "startDate": "2025-10-30T06:00:00Z",
//         "endDate": "2025-10-30T07:15:00Z",
//         "workoutType": "Running",
//         "duration": 75,
//         "unit": "minutes",
//         "distance": 12.5,
//         "distanceUnit": "km",
//         "caloriesBurned": 750,
//         "averageHeartRate": 155,
//         "maxHeartRate": 175
//       },
//       {
//         "startDate": "2025-10-30T17:30:00Z",
//         "endDate": "2025-10-30T18:30:00Z",
//         "workoutType": "Swimming",
//         "duration": 60,
//         "unit": "minutes",
//         "distance": 2.5,
//         "distanceUnit": "km",
//         "caloriesBurned": 500,
//         "averageHeartRate": 140,
//         "maxHeartRate": 160
//       },
//       {
//         "startDate": "2025-10-31T06:00:00Z",
//         "endDate": "2025-10-31T07:30:00Z",
//         "workoutType": "Cycling",
//         "duration": 90,
//         "unit": "minutes",
//         "distance": 35,
//         "distanceUnit": "km",
//         "caloriesBurned": 800,
//         "averageHeartRate": 145,
//         "maxHeartRate": 165
//       },
//       {
//         "startDate": "2025-10-31T18:00:00Z",
//         "endDate": "2025-10-31T19:00:00Z",
//         "workoutType": "Strength Training",
//         "duration": 60,
//         "unit": "minutes",
//         "caloriesBurned": 400,
//         "averageHeartRate": 125,
//         "maxHeartRate": 150
//       },
//       {
//         "startDate": "2025-11-01T07:00:00Z",
//         "endDate": "2025-11-01T08:30:00Z",
//         "workoutType": "Trail Running",
//         "duration": 90,
//         "unit": "minutes",
//         "distance": 14,
//         "distanceUnit": "km",
//         "caloriesBurned": 850,
//         "averageHeartRate": 160,
//         "maxHeartRate": 180
//       }
//     ]
//   }
// ]