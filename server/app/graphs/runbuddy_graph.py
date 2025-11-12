# runbuddy_graph.py
import os
import sys
from typing import Annotated, List, Optional
import inspect
from pathlib import Path

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

# Add server directory to path for RAG imports
sys.path.append(str(Path(__file__).parent.parent.parent))
try:
    from rag_query import RAGQueryEngine
    RAG_AVAILABLE = True
except ImportError:
    print("Warning: RAG system not available. Install dependencies and set SUPABASE_URL/SUPABASE_SERVICE_KEY")
    RAG_AVAILABLE = False


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
    Generate a running training plan using the user's inputs with RAG context.
    """
    print(f"Executing Agent: {inspect.currentframe().f_code.co_name}")

    weeks = state.weeks or 8
    runner_profile = state.runner_profile or "Runner profile unavailable."
    recent_runs = state.recent_runs or "No recent runs provided."
    goal_description = state.goal_description or "No goal specified."
    country = state.country or "Singapore"

    if not isinstance(runner_profile, str):
        runner_profile_text = runner_profile.model_dump()
        # Extract fitness level if available
        fitness_level = getattr(runner_profile, 'fitness_level', None) or "Intermediate"
    else:
        runner_profile_text = runner_profile
        fitness_level = "Intermediate"

    # -------------------------
    # Retrieve RAG Context
    # -------------------------
    rag_context = ""
    if RAG_AVAILABLE and settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        try:
            print("🔍 Retrieving RAG context from knowledge base...")
            rag_engine = RAGQueryEngine(similarity_threshold=0.6, max_results=5)
            
            # Build queries to gather relevant context
            queries = []
            
            # General training periodization for the goal
            queries.append({
                "query": f"training plan structure for {goal_description} {fitness_level}",
                "category": "Core Training Knowledge",
                "subcategory": "Training periodisation, base-build-taper",
                "context": "training_plan"
            })
            
            # Intensity zones and pace
            queries.append({
                "query": "heart rate zones and pace for running training",
                "category": "Core Training Knowledge",
                "subcategory": "Intensity zones, HR pace",
                "context": "training_plan"
            })
            
            # Progression guidelines (10% rule, ACWR)
            queries.append({
                "query": "weekly mileage progression and training load management",
                "category": "Core Training Knowledge",
                "subcategory": "Progression & load (10 % rule, ACWR)",
                "context": "training_plan"
            })
            
            # Location-specific advice (Singapore)
            if country.lower() == "singapore" or "singapore" in country.lower():
                queries.append({
                    "query": "running training in heat and humidity adaptation",
                    "category": "SG Context",
                    "subcategory": "Heat and humidity adaptation",
                    "context": "training_plan"
                })
                
                queries.append({
                    "query": "running routes and locations in Singapore",
                    "category": "SG Context",
                    "subcategory": "Running routes",
                    "context": "training_plan"
                })
                
                # Singapore training guidelines
                queries.append({
                    "query": "Singapore running guidelines and safety",
                    "category": "SG Context",
                    "subcategory": "Guidelines",
                    "context": "training_plan"
                })
            
            # Injury prevention
            queries.append({
                "query": "injury prevention and safe running practices",
                "category": "Core Training Knowledge",
                "subcategory": "Injury prevention, Form, Cadence",
                "context": "training_plan"
            })
            
            # Recovery and nutrition
            queries.append({
                "query": "recovery HRV sleep and nutrition for runners",
                "category": "Core Training Knowledge",
                "context": "training_plan"
            })
            
            # Gather all relevant context
            all_context_parts = []
            for query_info in queries:
                try:
                    results = rag_engine.search_documents(**query_info)
                    for result in results:
                        content = result.get('content', '')
                        metadata = result.get('metadata', {})
                        similarity = result.get('similarity', 0)
                        
                        if content and similarity > 0.6:  # Only include highly relevant content
                            source = f"[{metadata.get('filename', 'Unknown')}]"
                            if metadata.get('category'):
                                source += f" ({metadata['category']}"
                                if metadata.get('subcategory'):
                                    source += f" > {metadata['subcategory']}"
                                source += ")"
                            
                            all_context_parts.append(f"{source}\n{content}")
                except Exception as e:
                    print(f"Warning: Failed to retrieve context for query: {query_info.get('query')} - {e}")
                    continue
            
            if all_context_parts:
                rag_context = "\n\n---\n\n".join(all_context_parts)
                print(f"✅ Retrieved {len(all_context_parts)} relevant context chunks from RAG")
            else:
                print("⚠️ No relevant RAG context found")
                
        except Exception as e:
            print(f"⚠️ Error retrieving RAG context: {e}")
            print("Continuing without RAG context...")
            rag_context = ""
    else:
        print("ℹ️ RAG not available - proceeding without knowledge base context")
        if not RAG_AVAILABLE:
            print("  (RAGQueryEngine not imported)")
        elif not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            print("  (SUPABASE_URL or SUPABASE_SERVICE_KEY not configured)")

    # -------------------------
    # Build enhanced system message with RAG context
    # -------------------------
    system_msg = """You are a long-distance running coach with access to evidence-based training knowledge.

You must:
- Be conservative about sudden mileage increases (follow the 10% rule).
- Respect injuries and constraints.
- Use the runner's preferred units (km or miles).
- Align workouts with available days.
- Include pace or effort where possible.
- Follow evidence-based training principles from the provided knowledge base.
- Reply STRICTLY using the TrainingPlan JSON schema (no extra keys)."""

    # Format recent runs for prompt
    if isinstance(recent_runs, str):
        recent_runs_text = recent_runs
    elif recent_runs and len(recent_runs) > 0:
        recent_runs_text = "\n".join([f"- {r.model_dump()}" for r in recent_runs])
    else:
        recent_runs_text = "No recent runs provided"
    
    # Build user prompt with RAG context
    user_prompt_parts = [f"""Create a {weeks}-week training plan.

Runner profile:
{runner_profile_text}

Recent runs:
{recent_runs_text}

Goal:
{goal_description}

Location: {country}"""]
    
    # Add weather context if available
    if state.avg_temp is not None and state.avg_humidity is not None:
        user_prompt_parts.append(f"""
Weather conditions:
- Average temperature: {state.avg_temp}°C
- Average humidity: {state.avg_humidity}%
""")
    
    # Add RAG context if available
    if rag_context:
        user_prompt_parts.append(f"""
TRAINING KNOWLEDGE BASE (Use this as reference for evidence-based recommendations):
{rag_context}

IMPORTANT: Use the knowledge base context to inform your training plan. Follow:
- Training periodization principles (base, build, taper phases)
- Intensity zone guidelines for workouts
- Safe progression rules (10% rule, ACWR)
- Location-specific considerations for {country}
- Injury prevention best practices
""")
    
    user_prompt_parts.append("""
Respond ONLY with JSON that matches the TrainingPlan schema.
""")
    
    user_prompt = "\n".join(user_prompt_parts)

    # Create prompt with the complete user message (not using template variables)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_msg),
            ("human", "{user_input}"),
        ]
    )

    chain = prompt | model.with_structured_output(TrainingPlan)
    plan: TrainingPlan = chain.invoke(
        {
            "user_input": user_prompt,
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
