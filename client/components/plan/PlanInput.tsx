"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanInputForm } from "./PlanInputForm"
import { Bot, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { ScrollArea } from "../ui/scroll-area"
import { toast } from "sonner"

export default function PlanInput({
    focus,
}: {
    focus: "input" | "output"
}) {
    const handleAutofill = async () => {
        toast("Autofilled with information from Strava", {
            description: "X number of activities found.",
            duration: 1500,
            icon: <Edit2 className="h-5 w-5 text-strava" />
        })
    }
    const showAllContent = focus === "input"
    return (
        <Card className="w-full h-full relative">
            <CardHeader className="">
                <CardTitle>Design your plan</CardTitle>
                {showAllContent && (
                    <>
                        <CardDescription>
                            Customize or auto-fill from your Strava runs.
                        </CardDescription>
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
                                            <Edit2 className="h-full w-full" />
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent side="bottom">
                                        <p>Auto fill from Strava.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardAction>
                    </>
                )}
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[80vh]">
                    <PlanInputForm focus={focus} />
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
