from fastapi import APIRouter
from app.schemas.training_plan import TrainingPlanRequest

router = APIRouter(prefix="/api", tags=["training"])

@router.post("/plan")
def create_plan(req: TrainingPlanRequest):
    return req.model_dump() 