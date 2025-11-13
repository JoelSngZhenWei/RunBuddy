from typing import Optional
from pydantic import BaseModel, Field

from app.models.plan import TrainingPlan
from app.models.hydration import HydrationPlan
from app.models.nutrition import NutritionPlan


class PlanResponse(BaseModel):
    plan: TrainingPlan = Field(..., description="Structured multi-week training plan")
    hydration_plan: Optional[HydrationPlan] = Field(
        None, description="Hydration guidance bundle (avg / training / race-day)"
    )
    nutrition_plan: Optional[NutritionPlan] = Field(
        None, description="Nutrition macros bundle (avg / training / race-day)"
    )
