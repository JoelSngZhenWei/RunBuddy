"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanInputForm } from "./form/PlanInputForm"
import { Activity, Bot, Brain, Copy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import PlanOutputDetails from "./PlanOutputDetails"

export default function PlanInput() {
    return (
        <Card className="w-full h-full relative overflow-hidden">
            <CardHeader className="">
                <CardTitle>Your custom plan</CardTitle>
                <CardDescription>Designed by Run Buddy.</CardDescription>
                <CardAction className="h-full">
                    <div className="grid grid-cols-2 gap-2 h-12">
                        <Button
                            title="Regenerate response"
                            variant="ghost"
                            size="icon-lg"
                            className="rounded-full w-12 text-foreground h-full  hover:text-foreground/80 border cursor-pointer transition-colors"
                        >
                            <Copy className="h-full w-full" />
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        title="Regenerate response"
                                        variant="ghost"
                                        size="icon-lg"
                                        className="rounded-full w-12 text-primary h-full  hover:text-primary/80 border cursor-pointer transition-colors"
                                    >
                                        <Sparkles className="h-full w-full" />
                                    </Button>
                                </TooltipTrigger>

                                <TooltipContent side="bottom">
                                    <p>Regenerate response</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardAction>
            </CardHeader>

            <CardContent>
                <PlanOutputDetails />
            </CardContent>
        </Card>
    )
}
