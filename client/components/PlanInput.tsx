"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanInputForm } from "./form/PlanInputForm"
import { Activity, Bot, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export default function PlanInput({
    focus,
}: {
    focus: "input" | "output"
}) {
    const handleAutofill = async () => {
        console.log("Fetching Strava-based recommendations...")
    }
    const showDescriptions = focus === "input"
    return (
        <Card className="w-full h-full relative">
            <CardHeader className="">
                <CardTitle>Design your plan</CardTitle>
                {showDescriptions && (
                    <CardDescription>
                        Customize or auto-fill from your Strava runs.
                    </CardDescription>
                )}
                <CardAction className="h-12">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild className="h-12">
                                <Button
                                    title="Autofill from Strava"
                                    variant="ghost"
                                    size="icon-lg"
                                    className="rounded-full w-12 text-strava h-full  hover:text-strava/80 border cursor-pointer transition-colors"
                                    onClick={handleAutofill}
                                >
                                    <Bot className="h-full w-full" />
                                </Button>
                            </TooltipTrigger>

                            <TooltipContent side="bottom">
                                <p>Populate fields using Strava activity data</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardAction>
            </CardHeader>

            <CardContent>
                <PlanInputForm focus={focus} />
            </CardContent>
        </Card>
    )
}
