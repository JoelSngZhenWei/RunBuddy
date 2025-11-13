"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DayHydration } from "@/lib/types"
import React from "react"

export function HydrationNotes({
    day,
    dayLabel,
}: {
    day: DayHydration
    dayLabel: string
}) {
    const sections = [
        { key: "daily", label: "Daily", note: day.daily?.notes },
        { key: "pre", label: "Pre-Run", note: day.pre_run?.notes },
        { key: "during", label: "During Run", note: day.during_run?.notes },
        { key: "post", label: "Post-Run", note: day.post_run?.notes },
    ].filter((s) => s.note && s.note.trim().length > 0)

    const dayNote = day.notes?.trim()
    if (sections.length === 0 && !dayNote) return null

    return (
        <Card className="w-full border-none shadow-none">
            <CardHeader className="">
                <CardTitle className="text-base font-semibold text-foreground">
                    {dayLabel} Hydration
                </CardTitle>
                {dayNote && (
                    <CardDescription className="text-base leading-relaxed">
                        {dayNote}
                    </CardDescription>
                )}
            </CardHeader>

            <CardContent className="space-y-4 text-base text-muted-foreground ">
                {sections.map((s) => (
                    <div key={s.key} className="flex items-baseline gap-2">
                        <span className="font-medium text-foreground">{s.label}:</span>
                        <span className="leading-relaxed">{s.note}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
