"use client"

import * as React from "react"
import PlanInput from "@/components/PlanInput"
import PlanOutput from "@/components/PlanOutput"
import { cn } from "@/lib/utils"

export default function Plan() {
  const [focus, setFocus] = React.useState<"input" | "output">("input")

  return (
    <div className="flex flex-col-2 gap-2 p-2 min-h-[95vh]">
      {/* Input Section */}
      <div
        onClick={() => setFocus("input")}
        className={cn(
          "transition-all duration-500 ease-in-out overflow-hidden max-h-[95vh]",
          focus === "input"
            ? "flex-[5] "
            : "flex-[1] opacity-50 hover:opacity-100"
        )}
      >
        <PlanInput focus={focus}/>
      </div>

      {/* Output Section */}
      <div
        onClick={() => setFocus("output")}
        className={cn(
          "transition-all duration-500 ease-in-out max-h-[94.8vh]",
          focus === "output"
            ? "flex-[5] "
            : "flex-[1] opacity-50 hover:opacity-100"
        )}
      >
        <PlanOutput />
      </div>
    </div>
  )
}
