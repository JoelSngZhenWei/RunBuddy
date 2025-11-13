# app/models/nutrition.py
from typing import Optional
from pydantic import BaseModel, Field, model_validator

class Macros(BaseModel):
    carbs_pct: float = Field(..., ge=0, le=100, description="Percent kcal from carbs")
    protein_pct: float = Field(..., ge=0, le=100, description="Percent kcal from protein")
    fat_pct: float = Field(..., ge=0, le=100, description="Percent kcal from fat")
    notes: Optional[str] = None

    @model_validator(mode="after")
    def _sum_to_100(self):
        total = self.carbs_pct + self.protein_pct + self.fat_pct
        if not (99.0 <= total <= 101.0):  # allow small rounding tolerance
            raise ValueError(f"Macro percentages should sum to ~100 (got {total:.1f})")
        return self

class NutritionPlan(BaseModel):
    average_macros: Macros = Field(..., description="Overall weekly average split")
    training_day_macros: Macros = Field(..., description="Days with workouts (non-race)")
    race_day_macros: Macros = Field(..., description="Race-eve / race-day split")
    rationale: Optional[str] = Field(
        None,
        description="Why these ratios differ (e.g., higher carbs on training/race days, digestibility)"
    )
