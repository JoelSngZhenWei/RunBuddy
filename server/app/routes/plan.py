from fastapi import APIRouter

from app.services.langgraph_service import generate_training_plan
from app.models.plan import TrainingPlan
from app.models.requests import PlanRequest

router = APIRouter(prefix="/plan", tags=["Training Plan"])

@router.post("/", response_model=TrainingPlan)
def create_plan(req: PlanRequest):
    return generate_training_plan(req)
