// client/contexts/PlanContext.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import type {
  TrainingPlan,
  HydrationPlan,
  NutritionPlan,
  PlanResponse,
} from "@/lib/types"

type FocusType = "input" | "output"

interface PlanContextType {
  generatedPlan: TrainingPlan | null
  setGeneratedPlan: (plan: TrainingPlan | null) => void

  hydrationPlan: HydrationPlan | null
  setHydrationPlan: (plan: HydrationPlan | null) => void

  nutritionPlan: NutritionPlan | null
  setNutritionPlan: (plan: NutritionPlan | null) => void

  /** Convenience: set all three from backend response */
  setFromResponse: (resp: PlanResponse) => void
  clearAll: () => void

  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  focus: FocusType
  setFocus: (focus: FocusType) => void
  planStartDate: string | null
  setPlanStartDate: (date: string | null) => void
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [generatedPlan, setGeneratedPlan] = useState<TrainingPlan | null>(null)
  const [hydrationPlan, setHydrationPlan] = useState<HydrationPlan | null>(null)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [focus, setFocus] = useState<FocusType>("input")
  const [planStartDate, setPlanStartDate] = useState<string | null>(null)

  const setFromResponse = (resp: PlanResponse) => {
    setGeneratedPlan(resp.plan ?? null)
    setHydrationPlan(resp.hydration_plan ?? null)
    setNutritionPlan(resp.nutrition_plan ?? null)
  }

  const clearAll = () => {
    setGeneratedPlan(null)
    setHydrationPlan(null)
    setNutritionPlan(null)
    setPlanStartDate(null)
  }

  return (
    <PlanContext.Provider
      value={{
        generatedPlan,
        setGeneratedPlan,
        hydrationPlan,
        setHydrationPlan,
        nutritionPlan,
        setNutritionPlan,
        setFromResponse,
        clearAll,
        isGenerating,
        setIsGenerating,
        focus,
        setFocus,
        planStartDate,
        setPlanStartDate,
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used within a PlanProvider")
  return ctx
}
