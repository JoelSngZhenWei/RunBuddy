"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanInputForm } from "./PlanInputForm"
import { Bot, Edit2 } from "lucide-react"
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
