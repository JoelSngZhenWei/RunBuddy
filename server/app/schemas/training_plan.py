from pydantic import BaseModel
from typing import Optional

class TrainingPlanRequest(BaseModel):
    goal_event: str
    goal_target: str
    days_per_week: int
    current_weekly_km: int
    fitness_level: str
    country: str
    injury: Optional[str] = ""
    start_date: str       
    goal_date: str