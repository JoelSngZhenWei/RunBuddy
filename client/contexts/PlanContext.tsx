// client/contexts/PlanContext.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import type { TrainingPlan } from "@/lib/types/runbuddy"

type FocusType = "input" | "output"

interface PlanContextType {
  generatedPlan: TrainingPlan | null
  setGeneratedPlan: (plan: TrainingPlan | null) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  focus: FocusType
  setFocus: (focus: FocusType) => void
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [generatedPlan, setGeneratedPlan] = useState<TrainingPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [focus, setFocus] = useState<FocusType>("input")

  return (
    <PlanContext.Provider
      value={{
        generatedPlan,
        setGeneratedPlan,
        isGenerating,
        setIsGenerating,
        focus,
        setFocus,
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider")
  }
  return context
}
