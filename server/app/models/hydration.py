# app/models/hydration.py
from typing import Optional
from pydantic import BaseModel, Field


class DailyBaseline(BaseModel):
    """Outside-workout baseline."""
    baseline_fluids_ml: int = Field(..., ge=0, description="Daily fluids outside workouts")
    electrolyte_mg: Optional[int] = Field(None, ge=0, description="Daily electrolytes outside workouts")
    notes: Optional[str] = None

class PreRun(BaseModel):
    timing_min_before: int = Field(..., ge=0, le=180, description="Finish drinking this many minutes pre-run")
    fluids_ml: int = Field(..., ge=0)
    sodium_mg: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None

class DuringRun(BaseModel):
    """Simple, single-band guidance (keep it basic)."""
    fluids_ml_per_hour: int = Field(..., ge=0)
    sodium_mg_per_hour: int = Field(..., ge=0)
    carbs_g_per_hour: Optional[int] = Field(None, ge=0, description="Optional, if you surface carbs/h here")
    notes: Optional[str] = None

class PostRun(BaseModel):
    fluids_ml: Optional[int] = Field(None, ge=0, description="Used if strategy == 'volume_rule'")
    sodium_mg: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None

class DayHydration(BaseModel):
    """One split (average / training_day / race_day)."""
    daily: DailyBaseline
    pre_run: PreRun
    during_run: DuringRun
    post_run: PostRun
    notes: Optional[str] = None

class HydrationPlan(BaseModel):
    """Top-level hydration outputs to pair with your TrainingPlan."""
    average_day: DayHydration = Field(..., description="Overall weekly average day")
    training_day: DayHydration = Field(..., description="Days with workouts (non-race)")
    race_day: DayHydration = Field(..., description="Race-eve / race-day")
    rationale: Optional[str] = Field(
        None, description="Why these differ (heat, glycogen needs, GI comfort, etc.)"
    )