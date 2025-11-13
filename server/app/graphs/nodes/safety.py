# app/graphs/safety_node.py
import inspect
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import END
from app.llm import model
from app.graphs.overall_state import OverallState
from app.graphs.nodes.tools.safety_tools import (
    build_numeric_safety_report,
)


def safety_node(state: OverallState):
    print(f"[{inspect.currentframe().f_code.co_name}] Executing agent")
    if state.plan is None:
        return {}

    # 1) Arithmetic volume check
    numeric_report = build_numeric_safety_report(state.plan)
    print(
        f"[{inspect.currentframe().f_code.co_name}] Numeric safety report generated {numeric_report}"
    )

    # 2) LLM assessment (we pass the numeric report in for transparency)
    prompt = f"""
You are RunBuddy's safety evaluator.

Check the plan's safety. You are ALSO given a numeric volume audit.
If the numeric audit reports violations, strongly consider REJECTING unless the
context explains why it's acceptable (e.g., mis-logging rest days).

User instruction:
{state.instruction}

User profile:
{state.runner_profile}

Average weather:
{state.avg_temp} °C
{state.avg_humidity} % humidity

Numeric volume audit:
{numeric_report}

Consider:
- Unsafe weekly mileage jumps (by % and by absolute km).
- Enough rest/easy days.
- Gradual progression of volume AND intensity.
- Recreational runner achievability.
- Injury/overtraining risk handling.

Respond with a short, **verbose evaluation** beginning with either:
"approved" or "reject", then give 2–5 concise bullets why.
"""
    response = model.invoke(prompt)
    text = (getattr(response, "content", None) or str(response)).strip()
    approved = text.lower().startswith("approved")

    messages = state.messages or []
    messages.append(
        HumanMessage(content="[SAFETY CHECK INPUT]\n" + state.plan.model_dump_json())
    )
    messages.append(AIMessage(content="[SAFETY CHECK OUTPUT]\n" + text))

    if approved:
        print(f"[{inspect.currentframe().f_code.co_name}] Plan passed safety check")
    else:
        print(f"[{inspect.currentframe().f_code.co_name}] Plan failed safety check")

    return {
        "approved": approved,
        "plan": state.plan,
        "messages": messages,
    }


def route_from_checker(state: OverallState):
    from langgraph.graph import END

    return END if state.approved else "classify_intent_node"
