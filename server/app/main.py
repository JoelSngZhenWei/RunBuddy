from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.rag import router as rag_router
from app.routes.plan import router as plan_router

from app.models.requests import PlanRequest
from app.services.langgraph_service import generate_training_plan
from app.models.plan import TrainingPlan
from app.models.response import PlanResponse
app = FastAPI(title="RunBuddy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plan_router)
app.include_router(rag_router)


@app.get("/")
def root():
    return {"msg": "RunBuddy backend running"}


# You can just return TrainingPlan directly
@app.post("/plan", response_model=PlanResponse)
def generate_plan(req: PlanRequest):
    return generate_training_plan(req)
