# runbuddy_graph.py
import os
from typing import Annotated, List, Optional
import inspect

from pydantic import BaseModel
from langchain_core.messages import AnyMessage, HumanMessage, AIMessage
from langchain.chat_models import init_chat_model
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
import requests

from app.core.config import settings
from app.core.coords import COUNTRY_COORDS
from app.models.runner import RunnerProfile
from app.models.plan import TrainingPlan
from app.models.runs import RecentRun


class OverallState(BaseModel):
    instruction: str
    country: str
    # user inputs
    runner_profile: Optional[RunnerProfile] = None
    weeks: int | None = None
    recent_runs: Optional[List[RecentRun]] = None
    goal_description: str | None = None

    # system state
    approved: bool | None = None
    intent: str | None = None
    plan: TrainingPlan | None = None

    # weather state
    country: str
    avg_temp: Optional[float] = None
    avg_humidity: Optional[float] = None

    messages: Annotated[List[AnyMessage], add_messages] = []
    model_config = {"arbitrary_types_allowed": True}


# ----------------- Model init -----------------

# In prod, set this in env, not hard-code it.
os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
model = init_chat_model("gpt-4.1", temperature=0)

# ----------------- Nodes -----------------

from langchain_core.prompts import ChatPromptTemplate


def weather_node(state: OverallState):
    print(f"Executing Agent: {inspect.currentframe().f_code.co_name}")
    country = state.country.strip()
    match = next(
        (c for c in COUNTRY_COORDS if c["country"].lower() == country.lower()), None
    )
    if not match:
        raise ValueError(f"No coordinates found for {country}")

    lat, lon = match["lat"], match["lon"]

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        "&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean"
        "&timezone=auto"
    )

    res = requests.get(url).json()
    daily = res.get("daily", {})
    temps_max = daily.get("temperature_2m_max", [])
    temps_min = daily.get("temperature_2m_min", [])
    humidity = daily.get("relative_humidity_2m_mean", [])

    if not temps_max or not temps_min or not humidity:
        raise ValueError(f"Incomplete weather data for {country}")

    avg_temp = sum((tmax + tmin) / 2 for tmax, tmin in zip(temps_max, temps_min)) / len(
        temps_max
    )
    avg_humidity = sum(humidity) / len(humidity)

    state.avg_temp = round(avg_temp, 2)
    state.avg_humidity = round(avg_humidity, 1)

    return state


def planner_node(state: OverallState):
    """
    Generate a running training plan using the user's inputs.
    """
    print(f"Executing Agent: {inspect.currentframe().f_code.co_name}")

    weeks = state.weeks or 8
    runner_profile = state.runner_profile or "Runner profile unavailable."
    recent_runs = state.recent_runs or "No recent runs provided."
    goal_description = state.goal_description or "No goal specified."

    if not isinstance(runner_profile, str):
        runner_profile_text = runner_profile.model_dump()
    else:
        runner_profile_text = runner_profile

    system_msg = """
        You are a long-distance running coach.

        You must:
        - Be conservative about sudden mileage increases.
        - Respect injuries and constraints.
        - Use the runner's preferred units (km or miles).
        - Align workouts with available days.
        - Include pace or effort where possible.
        - Reply STRICTLY using the TrainingPlan JSON schema (no extra keys).
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_msg),
            (
                "human",
                """Create a {weeks}-week training plan.

                Runner profile:
                {runner_profile}

                Recent runs:
                {recent_runs}

                Goal:
                {goal_description}

                Respond ONLY with JSON that matches the TrainingPlan schema.
                """,
            ),
        ]
    )

    chain = prompt | model.with_structured_output(TrainingPlan)
    plan: TrainingPlan = chain.invoke(
        {
            "weeks": weeks,
            "runner_profile": runner_profile_text,
            "recent_runs": [r.model_dump() for r in recent_runs] if recent_runs else [],
            "goal_description": goal_description,
        }
    )
    plan_text = plan.model_dump_json(indent=2)
    messages = state.messages or []
    messages.append(
        HumanMessage(
            content=f"Generate a {weeks}-week training plan for:\n{goal_description}"
        )
    )
    messages.append(AIMessage(content=plan_text))

    return {
        "plan": plan,
        "messages": messages,
    }


def classify_intent_node(state: OverallState):
    print(f"Executing Agent: {inspect.currentframe().f_code.co_name}")

    prompt = f"""You are an intent classifier.
    User instruction: "{state.instruction}"

    Possible intents: ["planning", "revise", "advice"]
    For now always return "planning".
    Respond with only the intent label.
    """
    response = model.invoke(prompt)
    intent = response.content.strip().lower()
    messages = state.messages or []
    messages.append(
        HumanMessage(content=f"[INTENT CLASSIFICATION INPUT]\n{state.instruction}")
    )
    messages.append(AIMessage(content=f"[INTENT CLASSIFICATION OUTPUT]\n{intent}"))

    return {
        "intent": intent,
        "messages": messages,
    }


def route_from_intent(state: OverallState):
    if state.intent == "planning":
        return "weather_node"
    else:
        return END


def safety_node(state: OverallState):
    prompt = f"""
You are RunBuddy's safety evaluator.

Your job is to check whether the following generated training plan looks
reasonable and safe for the runner.

User instruction:
{state.instruction}

Training plan to review:
{state.plan.model_dump()}

Consider the following:
- Are there any unsafe or excessive weekly mileage increases?
- Are there enough rest or easy days?
- Does the plan escalate volume and intensity gradually?
- Does it appear achievable for a normal recreational runner?
- Are injury or overtraining risks mentioned or implicitly handled?

Respond with a short, **verbose evaluation** beginning with either:
"approved" – if the plan looks safe enough overall,
or
"reject" – if the plan seems unsafe or poorly structured.

Then briefly explain why.
"""
    print(f"Executing Agent: {inspect.currentframe().f_code.co_name}")
    response = model.invoke(prompt)
    text = response.content.strip()

    approved = text.lower().startswith("approved")
    next_plan = state.plan

    messages = state.messages or []
    messages.append(
        HumanMessage(content="[SAFETY CHECK INPUT]\n" + state.plan.model_dump_json())
    )
    messages.append(AIMessage(content="[SAFETY CHECK OUTPUT]\n" + text))

    return {
        "approved": approved,
        "plan": next_plan,
        "messages": messages,
    }


def route_from_checker(state: OverallState):
    if state.approved:
        return END
    else:
        return "classify_intent_node"


# ----------------- Graph compilation -----------------

builder = StateGraph(OverallState)

builder.add_node("classify_intent_node", classify_intent_node)
builder.add_node("weather_node", weather_node)
builder.add_node("planner_node", planner_node)
builder.add_node("safety_node", safety_node)

builder.add_edge(START, "classify_intent_node")
builder.add_conditional_edges(
    "classify_intent_node", route_from_intent, ["weather_node"]
)
builder.add_edge("weather_node", "planner_node")
builder.add_edge("planner_node", "safety_node")

builder.add_conditional_edges(
    "safety_node",
    route_from_checker,
    ["classify_intent_node", END],
)

graph = builder.compile()
