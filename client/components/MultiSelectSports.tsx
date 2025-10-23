// components/MultiSelectSports.tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandEmpty,
    CommandSeparator,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type SportOption = { label: string; value: string }

type ActivityOptions = {
    hasRouteMap?: boolean
    hasHeartRate?: boolean
    hasDistance?: boolean
}

export function MultiSelectSports({
    options,
    value,
    onChange,
    // NEW: activity options (controlled)
    activityOptions,
    onActivityOptionsChange,
    placeholder = "Select...",
    className,
    disabled,
}: {
    options: SportOption[]
    value: string[]
    onChange: (next: string[]) => void

    /** NEW: booleans controlled by parent */
    activityOptions?: ActivityOptions
    onActivityOptionsChange?: (next: ActivityOptions) => void

    placeholder?: React.ReactNode
    className?: string
    disabled?: boolean
}) {
    const [open, setOpen] = React.useState(false)

    const toggleValue = (v: string) => {
        const has = value.includes(v)
        const next = has ? value.filter(x => x !== v) : [...value, v]
        onChange(next)
    }

    const ao = activityOptions ?? {}
    const activeOptionCount =
        Number(!!ao.hasRouteMap) + Number(!!ao.hasHeartRate) + Number(!!ao.hasDistance)

    const label: React.ReactNode = value.length
        ? `${value.length} sports${activeOptionCount ? ` • ${activeOptionCount} options` : ""}`
        : placeholder

    const toggleOpt = (key: keyof ActivityOptions) => {
        if (!onActivityOptionsChange) return
        onActivityOptionsChange({
            ...ao,
            [key]: !ao[key],
        })
    }

    const selectAll = () => onChange(options.map(o => o.value))
    const clearAll = () => onChange([])

    const allSelected = value.length === options.length && options.length > 0

    return (
        <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-[200px] justify-between", className)}
                    disabled={disabled}
                    aria-disabled={disabled || undefined}
                >
                    {label}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[260px]">
                <Command>
                    <CommandList>
                        <CommandEmpty>No options.</CommandEmpty>

                        {/* Sports */}
                        <CommandGroup heading="Sports">
                            {/* Select/Clear all */}
                            <CommandItem
                                onSelect={() => {
                                    if (disabled) return
                                    allSelected ? clearAll() : selectAll()
                                }}
                            >
                                <Checkbox
                                    className="mr-2"
                                    checked={allSelected}
                                    onCheckedChange={() => { }}
                                    disabled={disabled}
                                />
                                {allSelected ? "Clear all" : "Select all"}
                            </CommandItem>

                            {options.map(opt => {
                                const checked = value.includes(opt.value)
                                return (
                                    <CommandItem
                                        key={opt.value}
                                        onSelect={() => {
                                            if (disabled) return
                                            toggleValue(opt.value)
                                        }}
                                    >
                                        <Checkbox
                                            className="mr-2"
                                            checked={checked}
                                            onCheckedChange={() => { }}
                                            disabled={disabled}
                                        />
                                        <span className={cn(checked && "font-medium")}>{opt.label}</span>
                                        {checked && <Check className="ml-auto h-4 w-4" />}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>

                        <CommandSeparator />

                        {/* NEW: Activity Options */}
                        <CommandGroup heading="Activity Options">
                            <CommandItem
                                onSelect={() => {
                                    if (disabled) return
                                    toggleOpt("hasRouteMap")
                                }}
                            >
                                <Checkbox
                                    className="mr-2"
                                    checked={!!ao.hasRouteMap}
                                    onCheckedChange={() => { }}
                                    disabled={disabled}
                                />
                                Has Route Map
                            </CommandItem>

                            <CommandItem
                                onSelect={() => {
                                    if (disabled) return
                                    toggleOpt("hasHeartRate")
                                }}
                            >
                                <Checkbox
                                    className="mr-2"
                                    checked={!!ao.hasHeartRate}
                                    onCheckedChange={() => { }}
                                    disabled={disabled}
                                />
                                Has Heart Rate
                            </CommandItem>

                            <CommandItem
                                onSelect={() => {
                                    if (disabled) return
                                    toggleOpt("hasDistance")
                                }}
                            >
                                <Checkbox
                                    className="mr-2"
                                    checked={!!ao.hasDistance}
                                    onCheckedChange={() => { }}
                                    disabled={disabled}
                                />
                                Has Distance
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
