
import inspect
from app.graphs.overall_state import OverallState
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import END
from app.llm import model

def classify_intent_node(state: OverallState):
    print(f"[{inspect.currentframe().f_code.co_name}] Executing agent")

    prompt = f"""You are an intent classifier.
    User instruction: "{state.instruction}"

    Possible intents: ["planning"]
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

    print(f"[{inspect.currentframe().f_code.co_name}] {intent} workflow activated")

    return {
        "intent": intent,
        "messages": messages,
    }


def route_from_intent(state: OverallState):
    if state.intent == "planning":
        return "fanout_node"
    else:
        return END