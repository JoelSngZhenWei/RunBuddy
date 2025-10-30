// components/Datepicker.tsx
"use client"

import * as React from "react"
import { Control } from "react-hook-form"
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function DatePickerField({
  control,
  name,
  label,
}: {
  control: Control<any>
  name: "start_date" | "goal_date"
  label: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const hasValue = typeof field.value === "string" && field.value.length > 0
        const dateObj = hasValue ? new Date(field.value) : undefined

        return (
          <FormItem className="flex flex-col overflow-hidden">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-between font-normal",
                    !hasValue && "text-muted-foreground"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {hasValue ? dateObj!.toLocaleDateString() : "Select date"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateObj}
                  onSelect={(d) => {
                    if (!d) return
                    // store as 'YYYY-MM-DD' to match your current string schema/defaults
                    const iso = d.toISOString().slice(0, 10)
                    field.onChange(iso)
                    setOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
