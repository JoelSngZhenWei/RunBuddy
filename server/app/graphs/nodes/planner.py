
import inspect
from pathlib import Path
import sys
from app.graphs.overall_state import OverallState
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import END
from app.llm import model
from app.core.config import settings
from langchain_core.prompts import ChatPromptTemplate
from app.models.plan import TrainingPlan

sys.path.append(str(Path(__file__).parent.parent.parent.parent))
try:
    from rag_query import RAGQueryEngine

    RAG_AVAILABLE = True
except ImportError:
    print(
        "Warning: RAG system not available. Install dependencies and set SUPABASE_URL/SUPABASE_SERVICE_KEY"
    )
    RAG_AVAILABLE = False

def planner_node(state: OverallState):
    """
    Generate a running training plan using the user's inputs with RAG context.
    """
    print(f"[{inspect.currentframe().f_code.co_name}] Executing agent")

    weeks = state.weeks or 8
    runner_profile = state.runner_profile or "Runner profile unavailable."
    recent_runs = state.recent_runs or "No recent runs provided."
    goal_description = state.goal_description or "No goal specified."
    country = state.country or "Singapore"

    if not isinstance(runner_profile, str):
        runner_profile_text = runner_profile.model_dump()
        # Extract fitness level if available
        fitness_level = getattr(runner_profile, "fitness_level", None) or "Intermediate"
    else:
        runner_profile_text = runner_profile
        fitness_level = "Intermediate"

    # -------------------------
    # Retrieve RAG Context
    # -------------------------
    rag_context = ""
    if RAG_AVAILABLE and settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        try:
            print(
                f"[{inspect.currentframe().f_code.co_name}] Retrieving RAG context from knowledge base..."
            )
            rag_engine = RAGQueryEngine(similarity_threshold=0.6, max_results=5)

            # Build queries to gather relevant context
            queries = []

            # General training periodization for the goal
            queries.append(
                {
                    "query": f"training plan structure for {goal_description} {fitness_level}",
                    "category": "Core Training Knowledge",
                    "subcategory": "Training periodisation, base-build-taper",
                    "context": "training_plan",
                }
            )

            # Intensity zones and pace
            queries.append(
                {
                    "query": "heart rate zones and pace for running training",
                    "category": "Core Training Knowledge",
                    "subcategory": "Intensity zones, HR pace",
                    "context": "training_plan",
                }
            )

            # Progression guidelines (10% rule, ACWR)
            queries.append(
                {
                    "query": "weekly mileage progression and training load management",
                    "category": "Core Training Knowledge",
                    "subcategory": "Progression & load (10 % rule, ACWR)",
                    "context": "training_plan",
                }
            )

            # Location-specific advice (Singapore)
            if country.lower() == "singapore" or "singapore" in country.lower():
                queries.append(
                    {
                        "query": "running training in heat and humidity adaptation",
                        "category": "SG Context",
                        "subcategory": "Heat and humidity adaptation",
                        "context": "training_plan",
                    }
                )

                queries.append(
                    {
                        "query": "running routes and locations in Singapore",
                        "category": "SG Context",
                        "subcategory": "Running routes",
                        "context": "training_plan",
                    }
                )

                # Singapore training guidelines
                queries.append(
                    {
                        "query": "Singapore running guidelines and safety",
                        "category": "SG Context",
                        "subcategory": "Guidelines",
                        "context": "training_plan",
                    }
                )

            # Injury prevention
            queries.append(
                {
                    "query": "injury prevention and safe running practices",
                    "category": "Core Training Knowledge",
                    "subcategory": "Injury prevention, Form, Cadence",
                    "context": "training_plan",
                }
            )

            # Recovery and nutrition
            queries.append(
                {
                    "query": "recovery HRV sleep and nutrition for runners",
                    "category": "Core Training Knowledge",
                    "context": "training_plan",
                }
            )

            # Gather all relevant context
            all_context_parts = []
            for query_info in queries:
                try:
                    results = rag_engine.search_documents(**query_info)
                    for result in results:
                        content = result.get("content", "")
                        metadata = result.get("metadata", {})
                        similarity = result.get("similarity", 0)

                        if (
                            content and similarity > 0.6
                        ):  # Only include highly relevant content
                            source = f"[{metadata.get('filename', 'Unknown')}]"
                            if metadata.get("category"):
                                source += f" ({metadata['category']}"
                                if metadata.get("subcategory"):
                                    source += f" > {metadata['subcategory']}"
                                source += ")"

                            all_context_parts.append(f"{source}\n{content}")
                except Exception as e:
                    print(
                        f"Warning: Failed to retrieve context for query: {query_info.get('query')} - {e}"
                    )
                    continue

            if all_context_parts:
                rag_context = "\n\n---\n\n".join(all_context_parts)
                print(
                    f"[{inspect.currentframe().f_code.co_name}] Retrieved {len(all_context_parts)} relevant context chunks from RAG"
                )
            else:
                print("⚠️ No relevant RAG context found")

        except Exception as e:
            print(f"⚠️ Error retrieving RAG context: {e}")
            print("Continuing without RAG context...")
            rag_context = ""
    else:
        print(
            f"[{inspect.currentframe().f_code.co_name}] RAG not available - proceeding without knowledge base context"
        )
        if not RAG_AVAILABLE:
            print(
                f"[{inspect.currentframe().f_code.co_name}]  (RAGQueryEngine not imported)"
            )
        elif not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            print(
                f"[{inspect.currentframe().f_code.co_name}]  (SUPABASE_URL or SUPABASE_SERVICE_KEY not configured)"
            )

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
    user_prompt_parts = [
        f"""Create a {weeks}-week training plan.

Runner profile:
{runner_profile_text}

Recent runs:
{recent_runs_text}

Goal:
{goal_description}

Location: {country}"""
    ]

    # Add weather context if available
    if state.avg_temp is not None and state.avg_humidity is not None:
        user_prompt_parts.append(
            f"""
Weather conditions:
- Average temperature: {state.avg_temp}°C
- Average humidity: {state.avg_humidity}%
"""
        )

    # Add RAG context if available
    if rag_context:
        user_prompt_parts.append(
            f"""
TRAINING KNOWLEDGE BASE (Use this as reference for evidence-based recommendations):
{rag_context}

IMPORTANT: Use the knowledge base context to inform your training plan. Follow:
- Training periodization principles (base, build, taper phases)
- Intensity zone guidelines for workouts
- Safe progression rules (10% rule, ACWR)
- Location-specific considerations for {country}
- Injury prevention best practices
"""
        )
        print(f"[{inspect.currentframe().f_code.co_name}] RAG context added to input")
        

    user_prompt_parts.append(
        """
Respond ONLY with JSON that matches the TrainingPlan schema.
"""
    )

    user_prompt = "\n".join(user_prompt_parts)

    # Create prompt with the complete user message (not using template variables)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_msg),
            ("human", "{user_input}"),
        ]
    )

    chain = prompt | model.with_structured_output(TrainingPlan)
    print(f"[{inspect.currentframe().f_code.co_name}] Invoking model chain")
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
    print(f"[{inspect.currentframe().f_code.co_name}] Training plan of length {weeks} weeks generated")
    return {
        "plan": plan,
        "messages": messages,
    }

