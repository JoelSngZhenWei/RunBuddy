"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface GeneratedPlan {
  success: boolean
  plan: string
  metadata?: {
    generatedAt: string
    calendarIntegration: boolean
    model: string
    tokensUsed?: any
  }
}

interface PlanContextType {
  generatedPlan: GeneratedPlan | null
  setGeneratedPlan: (plan: GeneratedPlan | null) => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <PlanContext.Provider
      value={{
        generatedPlan,
        setGeneratedPlan,
        isGenerating,
        setIsGenerating,
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

