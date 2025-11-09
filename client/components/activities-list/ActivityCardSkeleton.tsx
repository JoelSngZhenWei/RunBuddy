"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ActivityCardSkeleton() {
    return (
        <Card className="w-full bg-background h-[28vh]">
            <CardHeader>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-1/3" /> {/* title */}
                    <Skeleton className="h-4 w-1/4" /> {/* sport type */}
                    <Skeleton className="h-3 w-1/5" /> {/* date */}
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-5 gap-2">
                    {/* Heartrate */}
                    <div className="flex flex-col justify-center p-2 gap-1">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-4 w-10" />
                    </div>

                    {/* Time */}
                    <div className="flex flex-col justify-center p-2 gap-1">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-4 w-12" />
                    </div>

                    {/* Distance */}
                    <div className="flex flex-col justify-center p-2 gap-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-4 w-16" />
                    </div>

                    {/* Pace */}
                    <div className="flex flex-col justify-center p-2 gap-1">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-4 w-14" />
                    </div>

                    {/* Map preview placeholder */}
                    <Skeleton className=" rounded-md h-21" />
                </div>
            </CardContent>
        </Card>
    )
}
