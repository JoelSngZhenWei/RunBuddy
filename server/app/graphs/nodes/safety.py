
import inspect
from app.graphs.overall_state import OverallState
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import END
from app.llm import model

def safety_node(state: OverallState):
    print(f"[{inspect.currentframe().f_code.co_name}] Executing agent")
    if state.plan is None:
        return {}  # return no writes; avoids channel collisions
    
    prompt = f"""
You are RunBuddy's safety evaluator.

Your job is to check whether the following generated training plan looks
reasonable and safe for the runner.

User instruction:
{state.instruction}

User profile:
{state.runner_profile}

Average weather:
{state.avg_temp} degrees celcius
{state.avg_humidity} percent average humidity

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

    response = model.invoke(prompt)
    text = response.content.strip()

    approved = text.lower().startswith("approved")
    next_plan = state.plan

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
        "plan": next_plan,
        "messages": messages,
    }


def route_from_checker(state: OverallState):
    if state.approved:
        return END
    else:
        return "classify_intent_node"