from typing import List, Optional
from pydantic import BaseModel

from app.models.runner import RunnerProfile
from app.models.runs import RecentRun

class PlanRequest(BaseModel):
    instruction: str
    country: Optional[str] = "Singapore"
    weeks: Optional[int] = None
    runner_profile: Optional[RunnerProfile] = None
    recent_runs: Optional[List[RecentRun]] = None
    goal_description: Optional[str] = None