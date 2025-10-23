"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanInputForm } from "./form/PlanInputForm"
import { Activity, Bot, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export default function PlanInput() {
    const handleAutofill = async () => {
        console.log("Fetching Strava-based recommendations...")
    }

    return (
        <Card className="w-full h-full relative">
            <CardHeader className="">
                <CardTitle>Design your plan</CardTitle>
                <CardDescription>Customize or auto-fill from your Strava runs.</CardDescription>
                <CardAction className="h-full">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    title="Autofill from Strava"
                                    variant="secondary"
                                    size="icon-lg"
                                    className="rounded-full bg-strava text-background h-full hover:bg-secondary hover:text-strava transition-colors"
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
                <PlanInputForm />
            </CardContent>
        </Card>
    )
}
