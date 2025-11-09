// client/app/plan/page.tsx
"use client"

import * as React from "react"
import PlanInput from "@/components/plan/PlanInput"
import PlanOutput from "@/components/plan/PlanOutput"
import { cn } from "@/lib/utils"
import { PlanProvider, usePlan } from "@/contexts/PlanContext"

function PlanLayout() {
  const { focus, setFocus } = usePlan()

  return (
    <div className="flex flex-col-2 gap-2 p-2 min-h-[95vh]">
      {/* Input Section */}
      <div
        onClick={() => setFocus("input")}
        className={cn(
          "transition-all duration-500 ease-in-out overflow-hidden max-h-[95vh]",
          focus === "input"
            ? "flex-[5]"
            : "flex-[1] opacity-50 hover:opacity-100"
        )}
      >
        <PlanInput focus={focus} />
      </div>

      {/* Output Section */}
      <div
        onClick={() => setFocus("output")}
        className={cn(
          "transition-all duration-500 ease-in-out overflow-hidden max-h-[95vh]",
          focus === "output"
            ? "flex-[5]"
            : "flex-[1] opacity-50 hover:opacity-100"
        )}
      >
        <PlanOutput focus={focus} />
      </div>
    </div>
  )
}

export default function Plan() {
  return (
    <PlanProvider>
      <PlanLayout />
    </PlanProvider>
  )
}
