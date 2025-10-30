"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trainingPlanSchema } from "@/lib/schemas/TrainingPlanSchema"
import { DatePickerField } from "../Datepicker"
import { toast } from "sonner"


type FormValues = z.infer<typeof trainingPlanSchema>

export function PlanInputForm({ focus }: { focus: "input" | "output" }) {
    const form = useForm<FormValues>({
        resolver: zodResolver(trainingPlanSchema),
        defaultValues: {
            goal_event: "",
            goal_target: "",
            days_per_week: 4,
            current_weekly_km: 35,
            fitness_level: "Intermediate",
            country: "",
            injury: "",
            start_date: "",
            goal_date: "",
        },
    })

    const onSubmit = (values: FormValues) => {
        console.log("submitted:", values)
    }

    const showAllContent = focus === "input"

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-rows-5 gap-8">
                    {/* form row 1 */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Goal Event */}
                        <FormField
                            control={form.control}
                            name="goal_event"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal Event</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Half Marathon" {...field} />
                                    </FormControl>
                                    {showAllContent && (
                                        <FormDescription>
                                            The distance or race you’re training for.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Goal Target */}
                        <FormField
                            control={form.control}
                            name="goal_target"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal Target</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Finish under 2 hours" {...field} />
                                    </FormControl>
                                    {showAllContent && (
                                        <FormDescription>
                                            Describe your performance target or goal.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* form row2 */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Dates */}
                        <DatePickerField control={form.control} name="start_date" label="Start Date" />
                        <DatePickerField control={form.control} name="goal_date" label="Goal Date" />

                    </div>

                    {/* form row 3 */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="fitness_level"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fitness Level</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Beginner / Intermediate / Advanced" {...field} />
                                    </FormControl>
                                    {showAllContent && (
                                        <FormDescription>
                                            General training experience or fitness level.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Country */}
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Singapore" {...field} />
                                    </FormControl>
                                    {showAllContent && (
                                        <FormDescription>
                                            Where will you be training and competing in.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* form row 4 */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Days per Week */}
                        <FormField
                            control={form.control}
                            name="days_per_week"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Days per Week</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={7}
                                            placeholder="4"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    {showAllContent && (
                                        <FormDescription>
                                            How many days you can train per week.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* weekly distance current */}
                        <FormField
                            control={form.control}
                            name="current_weekly_km"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Weekly Distance (km)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="35"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    {showAllContent && (
                                        <FormDescription>
                                            Approximate weekly mileage currently.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* form row 5 */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="injury"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Injury (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Optional" {...field} />
                                    </FormControl>
                                    {showAllContent && (
                                        <FormDescription>
                                            Any past injuries you would like to highlight.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        disabled={!showAllContent || form.formState.isSubmitting}
                        onClick={() =>
                            toast("Event has been created", {
                                description: "Sunday, December 03, 2023 at 9:00 AM",
                                action: {
                                    label: "Undo",
                                    onClick: () => console.log("Undo"),
                                },
                            })
                        }
                    >
                        {form.formState.isSubmitting ? "Generating..." : "Generate Plan"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={!showAllContent || form.formState.isSubmitting}
                    >
                        Reset
                    </Button>
                </div>
            </form>
        </Form>
    )
}
