"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FaRunning, FaClock } from "react-icons/fa"
import MiniRouteMap from "@/components/MiniRouteMap"

type ActivityCardProps = {
    start_date: string
    name: string
    distance: number
    average_speed: number
    moving_time: number
    summary_polyline?: string | null
}

export default function ActivityCard({
    start_date,
    name,
    distance,
    average_speed,
    moving_time,
    summary_polyline,
}: ActivityCardProps) {
    // --- conversions ---
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
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <p className="text-sm text-muted-foreground">{date}</p>
            </CardHeader>
            <CardContent className="">
                <div className="grid grid-cols-4">
                    <div className="flex flex-col justify-center p-2">
                        <span className="text-sm">Distance</span>
                        <span>{km} km</span>
                    </div>

                    <div className="flex flex-col justify-center p-2">
                        <span className="text-sm">Pace</span>
                        <span>{formattedPace}</span>
                    </div>

                    <div className="flex flex-col justify-center p-2">

                        <span className="text-sm">Time</span>
                        <span>{formattedTime}</span>
                    </div>

                    <div className="flex items-center justify-center border rounded-xl">
                        {summary_polyline ? (
                            <MiniRouteMap polyline={summary_polyline} />
                        ) : (
                            <div className="text-xs text-muted-foreground">No route map</div>
                        )}
                    </div>
                </div>
                <div className="flex justify-between text-sm items-center">
                </div>
            </CardContent>
        </Card>
    )
}
