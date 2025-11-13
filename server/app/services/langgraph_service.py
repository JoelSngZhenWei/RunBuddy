from app.graphs.runbuddy_graph import graph, OverallState
from app.models.requests import PlanRequest
from app.models.response import PlanResponse


def generate_training_plan(req: PlanRequest):
    state = OverallState(
        instruction=req.instruction,
        country=req.country,
        weeks=req.weeks,
        runner_profile=req.runner_profile,
        recent_runs=req.recent_runs,
        goal_description=req.goal_description,
        address=req.address,
    )
    result = graph.invoke(state)
    # return result["plan"]
    return PlanResponse(
        plan=result["plan"],
        hydration_plan=result.get("hydration_plan"),
        nutrition_plan=result.get("nutrition_plan"),
    )