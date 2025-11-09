from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class Workout(BaseModel):
    day: Literal["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    focus: Literal["easy", "long_run", "intervals", "tempo", "recovery", "rest"]
    distance_km: float = Field(..., description="Planned distance in km (0 if rest)")
    target_pace_min_per_km: Optional[float] = Field(
        None, description="Leave None for recovery or rest workouts."
    )
    description: str = Field(..., description="Plain-language description of the workout")
    notes: Optional[str] = None

class WeeklyPlan(BaseModel):
    week_number: int = Field(..., description="Week number in the overall plan")
    focus_summary: str = Field(..., description="High-level weekly focus or theme")
    workouts: List[Workout] = Field(..., description="List of daily workouts for this week")

class TrainingPlan(BaseModel):
    goal_description: str = Field(..., description="High-level description of the overall goal")
    plan_duration_weeks: int = Field(..., description="Total number of weeks in the plan")
    weekly_overview: str = Field(..., description="Summary of how training load evolves week by week")
    weekly_plans: List[WeeklyPlan] = Field(..., description="List of structured weekly plans")