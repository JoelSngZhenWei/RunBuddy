"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { MultiSelectSports } from "./MultiSelectSports"
import { Filter } from "lucide-react"
// import { MultiSelectFilters } from "./MultiSelectFilters" // (unused)

type Props = {
  sports: string[]  // unique sports from parent
  onFilterChange?: (filters: {
    sports?: string[]
    hasRouteMap?: boolean
    hasHeartRate?: boolean
    hasDistance?: boolean
  }) => void
  onRefresh?: () => void
  disabled?: boolean
}

const formatSportType = (s: string) =>
  s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")

export default function ActivityListControl({ sports, onFilterChange, onRefresh, disabled }: Props) {
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [activityOptions, setActivityOptions] = useState({
    hasRouteMap: false,
    hasHeartRate: false,
    hasDistance: false,
  })

  const sportOptions = useMemo(
    () => sports.map(s => ({ label: formatSportType(s), value: s })),
    [sports]
  )

  function emitFilters(next?: {
    sports?: string[]
    hasRouteMap?: boolean
    hasHeartRate?: boolean
    hasDistance?: boolean
  }) {
    onFilterChange?.(next ?? {
      sports: undefined,
      hasRouteMap: undefined,
      hasHeartRate: undefined,
      hasDistance: undefined,
    })
  }

  function handleReset() {
    setSelectedSports([])
    setActivityOptions({ hasRouteMap: false, hasHeartRate: false, hasDistance: false })
    emitFilters() // clears all in parent (sets to undefined)
  }

  return (
    <div className={disabled ? "opacity-60" : ""} aria-busy={disabled ? true : undefined}>
      <div className="flex flex-wrap items-center gap-3">
        <MultiSelectSports
          options={sportOptions}
          value={selectedSports}
          onChange={(next) => {
            if (disabled) return
            setSelectedSports(next)
            emitFilters({
              sports: next.length ? next : undefined,
              hasRouteMap: activityOptions.hasRouteMap || undefined,
              hasHeartRate: activityOptions.hasHeartRate || undefined,
              hasDistance: activityOptions.hasDistance || undefined,
            })
          }}
          activityOptions={activityOptions}
          onActivityOptionsChange={(next) => {
            if (disabled) return
            const merged = { ...activityOptions, ...next }
            setActivityOptions(merged)
            emitFilters({
              sports: selectedSports.length ? selectedSports : undefined,
              hasRouteMap: merged.hasRouteMap || undefined,
              hasHeartRate: merged.hasHeartRate || undefined,
              hasDistance: merged.hasDistance || undefined,
            })
          }}
          placeholder={
            <span className="flex items-center gap-1 ">
              <Filter className="" />
              Filter
            </span>
          }
          className="w-2xs"
          disabled={disabled}
        />

        <Button
          variant="outline"
          onClick={() => {
            if (disabled) return
            handleReset()
          }}
          disabled={disabled}
        >
          Reset
        </Button>

        <Button onClick={onRefresh} disabled={disabled}>
          Refresh
        </Button>
      </div>
    </div>
  )
}
