from pydantic import BaseModel
from typing import Annotated, List, Optional

from app.models.runs import RecentRun
from app.models.runner import RunnerProfile
from app.models.plan import TrainingPlan
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages

from app.models.nutrition import NutritionPlan
from app.models.hydration import HydrationPlan

class OverallState(BaseModel):
    instruction: str
    country: str
    # user inputs
    runner_profile: Optional[RunnerProfile] = None
    weeks: int | None = None
    recent_runs: Optional[List[RecentRun]] = None
    goal_description: str | None = None
    address: Optional[str] = None
    
    # system state
    approved: bool | None = None
    intent: str | None = None
    plan: TrainingPlan | None = None

    # weather state
    avg_temp: Optional[float] = None
    avg_humidity: Optional[float] = None
    
    nutrition_plan: Optional[NutritionPlan] = None
    hydration_plan: Optional[HydrationPlan] = None 
    
    messages: Annotated[List[AnyMessage], add_messages] = []
    model_config = {"arbitrary_types_allowed": True}