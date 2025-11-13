# app/graphs/nodes/nutrition.py
import inspect
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from app.graphs.overall_state import OverallState
from app.llm import model
from app.models.nutrition import NutritionPlan


def nutrition_node(state: OverallState):
    print(f"[{inspect.currentframe().f_code.co_name}] Executing agent")

    runner_profile = state.runner_profile or "Runner profile unavailable."
    goal_description = state.goal_description or "No goal specified."
    country = state.country or "Singapore"

    system_msg = (
        "You are a running sports nutritionist. "
        "Return STRICT JSON matching the NutritionPlan schema. "
        "Each Macros block must have carbs_pct, protein_pct, fat_pct totaling ~100. "
        "Prefer integers or one decimal place; keep realistic for endurance athletes."
    )

    human_msg = f"""
Context:
- Country: {country}
- Runner profile: {runner_profile}
- Goal: {goal_description}

Task:
Provide macro splits for:
1) average_macros (overall weekly average),
2) training_day_macros (days with workouts, non-race), and
3) race_day_macros (race-eve / race-day, higher carbs and easy digestibility).

Include a short 'rationale' explaining differences (e.g., glycogen needs, heat/humidity).
Output ONLY JSON for NutritionPlan:
{{
  "average_macros": {{"carbs_pct": float, "protein_pct": float, "fat_pct": float, "notes": str?}},
  "training_day_macros": {{"carbs_pct": float, "protein_pct": float, "fat_pct": float, "notes": str?}},
  "race_day_macros": {{"carbs_pct": float, "protein_pct": float, "fat_pct": float, "notes": str?}},
  "rationale": str?
}}
"""

    prompt = ChatPromptTemplate.from_messages(
        [("system", system_msg), ("human", "{q}")]
    )

    print(f"[{inspect.currentframe().f_code.co_name}] Invoking model chain")
    chain = prompt | model.with_structured_output(NutritionPlan)
    guidelines: NutritionPlan = chain.invoke({"q": human_msg})

    msg = AIMessage(
        content="[NUTRITION_MACROS]\n"
        f"Avg: C{guidelines.average_macros.carbs_pct}% / "
        f"P{guidelines.average_macros.protein_pct}% / "
        f"F{guidelines.average_macros.fat_pct}%\n"
        f"Train-day: C{guidelines.training_day_macros.carbs_pct}% / "
        f"P{guidelines.training_day_macros.protein_pct}% / "
        f"F{guidelines.training_day_macros.fat_pct}%\n"
        f"Race-day: C{guidelines.race_day_macros.carbs_pct}% / "
        f"P{guidelines.race_day_macros.protein_pct}% / "
        f"F{guidelines.race_day_macros.fat_pct}%"
    )
    messages = (state.messages or []) + [msg]

    print(f"[{inspect.currentframe().f_code.co_name}] Nutrition plan generated")

    return {
        "nutrition_guidelines": guidelines,  # only changed key
        "messages": messages,  # add_messages channel
    }
