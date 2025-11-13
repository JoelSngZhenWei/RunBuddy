from app.graphs.runbuddy_graph import graph, OverallState
from app.models.requests import PlanRequest


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
    return result["plan"]
