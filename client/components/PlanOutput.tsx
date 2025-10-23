"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanInputForm } from "./form/PlanInputForm"
import { Activity, Bot, Brain, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import PlanOutputDetails from "./PlanOutputDetails"

export default function PlanInput() {
    const handleAutofill = async () => {
        console.log("Fetching Strava-based recommendations...")
    }

    return (
        <Card className="w-full h-full relative">
            <CardHeader className="">
                <CardTitle>Your custom plan</CardTitle>
                <CardDescription>Designed by Run Buddy.</CardDescription>
                <CardAction className="h-full">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    title="Regenerate response"
                                    variant="secondary"
                                    size="icon-lg"
                                    className="rounded-full bg- text-primary h-full hover:bg-secondary hover:text-foreground transition-colors"
                                    onClick={handleAutofill}
                                >
                                    <Sparkles className="h-full w-full" />
                                </Button>
                            </TooltipTrigger>

                            <TooltipContent side="bottom">
                                <p>Regenerate response</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardAction>
            </CardHeader>

            <CardContent>
                <PlanOutputDetails />
            </CardContent>
        </Card>
    )
}
