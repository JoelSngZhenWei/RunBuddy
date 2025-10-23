"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import MiniRouteMap from "@/components/MiniRouteMap"

type ActivityCardProps = {
    start_date: string
    name: string
    sport_type: string
    heartrate: number
    distance: number
    average_speed: number
    moving_time: number
    summary_polyline: string
}

export default function ActivityCard({
    start_date,
    name,
    sport_type,
    heartrate,
    distance,
    average_speed,
    moving_time,
    summary_polyline,
}: ActivityCardProps) {
    // --- conversions ---
    const formattedSportType = sport_type.replace(/([a-z])([A-Z])/g, '$1 $2');
    const km = (distance / 1000).toFixed(2)
    const minutes = Math.floor(moving_time / 60)
    const seconds = moving_time % 60
    const formattedTime = `${minutes}m ${seconds}s`

    // pace (min/km)
    const secondsPerKm = 1000 / average_speed
    const paceMin = Math.floor(secondsPerKm / 60)
    const paceSec = Math.round(secondsPerKm % 60)
    const formattedPace = `${paceMin}:${paceSec.toString().padStart(2, "0")}/km`

    const date = new Date(start_date).toLocaleDateString()

    return (
        <Card className="w-full bg-background ">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{name}</CardTitle>
                {formattedSportType && (
                    <p className="text-sm italic text-muted-foreground">
                        {formattedSportType}
                    </p>
                )}
                <p className="text-xs text-muted-foreground">
                    {date}
                </p>
            </CardHeader>
            <CardContent className="">
                <div className="grid grid-cols-5">
                    <div className="flex flex-col justify-center p-2">
                        <span className="text-sm">Heartrate</span>
                        <span className="">
                            {heartrate ?? <span className="invisible">0</span>}
                        </span>
                    </div>

                    <div className="flex flex-col justify-center p-2">
                        <span className="text-sm">Time</span>
                        <span>{formattedTime}</span>
                    </div>

                    <div className="flex flex-col justify-center p-2">
                        <span className="text-sm">Distance</span>
                        <span>
                            {distance === 0 ? <span className="invisible">0</span> : `${km} km`}
                        </span>
                    </div>

                    <div className="flex flex-col justify-center p-2">
                        <span className="text-sm">Pace</span>
                        <span className="">
                            {average_speed === 0 ? <span className="invisible">0</span> : formattedPace}
                        </span>
                    </div>


                    <div className="flex items-center justify-center rounded-xl bg-card border">
                        <MiniRouteMap polyline={summary_polyline} sport_type={sport_type}/>
                    </div>
                </div>
                <div className="flex justify-between text-sm items-center">
                </div>
            </CardContent>
        </Card>
    )
}
