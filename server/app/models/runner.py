from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class RunnerProfile(BaseModel):
    name: str
    age: int
    sex: Literal["male", "female", "other"]
    experience_level: Literal["beginner", "intermediate", "advanced"]
    weekly_mileage_km: float = Field(..., description="Current average weekly mileage in km")
    preferred_units: Literal["km", "mi"] = "km"
    available_days: List[Literal["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]]
    constraints: List[str] = Field(
        default_factory=list,
        description="Injuries, schedule constraints, etc",
    )