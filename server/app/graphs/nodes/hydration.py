# app/graphs/nodes/hydration.py
import inspect
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from app.graphs.overall_state import OverallState
from app.llm import model
from app.models.hydration import HydrationPlan

def hydration_node(state: OverallState):
    print(f"[{inspect.currentframe().f_code.co_name}] Executing agent")

    country = state.country or "Singapore"
    avg_temp = state.avg_temp  # may be None if weather not done yet
    avg_humidity = state.avg_humidity

    system_msg = (
        "You are a sports hydration specialist for endurance runners. "
        "Return STRICT JSON that matches the HydrationPlan schema. "
        "Use realistic integers for ml/mg; keep notes concise."
    )

    human_msg = f"""
Context:
- Country: {country}
- Weather (if known): temp={avg_temp}°C, humidity={avg_humidity}%
Task:
Provide a HydrationPlan with three splits (average_day, training_day, race_day).
Each DayHydration must include:
- daily: baseline_fluids_ml (ml), electrolyte_mg (optional), notes?
- pre_run: timing_min_before, fluids_ml, sodium_mg?, notes?
- during_run: fluids_ml_per_hour, sodium_mg_per_hour, carbs_g_per_hour?, notes?
- post_run: fluids_ml, sodium_mg?, notes?
Add a short top-level 'rationale'.

Output:
Return ONLY JSON conforming to HydrationPlan.
"""

    prompt = ChatPromptTemplate.from_messages([("system", system_msg), ("human", "{q}")])
    chain = prompt | model.with_structured_output(HydrationPlan)
    plan: HydrationPlan = chain.invoke({"q": human_msg})

    # Optional log line for debugging/telemetry
    msg = AIMessage(
        content=(
            "[HYDRATION]\n"
            f"Avg baseline: {plan.average_day.daily.baseline_fluids_ml} ml | "
            f"Train during: {plan.training_day.during_run.fluids_ml_per_hour} ml/h | "
            f"Race sodium: {plan.race_day.during_run.sodium_mg_per_hour} mg/h"
        )
    )
    messages = (state.messages or []) + [msg]
    print(f"[{inspect.currentframe().f_code.co_name}] Hydration plan generated")
    return {
        "hydration_plan": plan,   # <-- only changed key
        "messages": messages,     # <-- add_messages channel, safe to append
    }
