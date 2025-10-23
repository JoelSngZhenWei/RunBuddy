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


type FormValues = z.infer<typeof trainingPlanSchema>

export function PlanInputForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(trainingPlanSchema),
        defaultValues: {
            goal_event: "",
            goal_target: "",
            days_per_week: 4,
            current_weekly_km: 35,
            fitness_level: "Intermediate",
            country: "",
            start_date: "",
            goal_date: "",
        },
    })

    const onSubmit = (values: FormValues) => {
        console.log("submitted:", values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-rows-4 gap-8">
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
                                    <FormDescription>
                                        The distance or race you’re training for.
                                    </FormDescription>
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
                                    <FormDescription>
                                        Describe your performance target or goal.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* form row2 */}
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
                                    <FormDescription>
                                        How many days you can train per week.
                                    </FormDescription>
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
                                    <FormDescription>
                                        Approximate weekly mileage currently.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                    <FormDescription>
                                        General training experience or fitness level.
                                    </FormDescription>
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
                                    <FormDescription>
                                        Where will you be training and competing in.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* form row 4 */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Dates */}
                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="goal_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal Race Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Generating..." : "Generate Plan"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={form.formState.isSubmitting}
                    >
                        Reset
                    </Button>
                </div>
            </form>
        </Form>
    )
}
