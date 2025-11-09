from typing import Optional
from pydantic import BaseModel

class RecentRun(BaseModel):
    date: str
    distance_km: float
    duration_min: float
    avg_pace_min_per_km: float
    notes: Optional[str] = None