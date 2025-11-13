# runbuddy_graph.py
import inspect
from pathlib import Path

from langgraph.graph import StateGraph, START, END
from app.graphs.overall_state import OverallState
from app.graphs.nodes.classify_intent import classify_intent_node, route_from_intent

from app.graphs.nodes.route import route_node
from app.graphs.nodes.nutrition import nutrition_node
from app.graphs.nodes.safety import safety_node
from app.graphs.nodes.safety import route_from_checker
from app.graphs.nodes.weather import weather_node
from app.graphs.nodes.planner import planner_node
from app.graphs.nodes.hydration import hydration_node


# helper nodes and routers
def fanout_node(state: OverallState):
    print(
        f"[{inspect.currentframe().f_code.co_name}] Routing to nutrition node and weather node"
    )
    return {}


def plan_ready_router(state: OverallState):
    """Proceed to safety only once a plan exists; otherwise END this branch."""
    out = "safety_node" if state.plan is not None else END
    print(f"[{inspect.currentframe().f_code.co_name}] -> {out}")
    return out


# ----------------- Graph compilation -----------------

builder = StateGraph(OverallState)

# Nodes
builder.add_node("classify_intent_node", classify_intent_node)
builder.add_node("fanout_node", fanout_node)
builder.add_node("weather_node", weather_node)
builder.add_node("nutrition_node", nutrition_node)
builder.add_node("hydration_node", hydration_node)
builder.add_node("planner_node", planner_node)
builder.add_node("route_node", route_node)
builder.add_node("safety_node", safety_node)

# Flow
builder.add_edge(START, "classify_intent_node")
builder.add_conditional_edges("classify_intent_node", route_from_intent, ["fanout_node"])

builder.add_edge("fanout_node", "weather_node")
builder.add_edge("fanout_node", "nutrition_node")
builder.add_edge("nutrition_node", "hydration_node")

builder.add_edge("weather_node", "planner_node")
builder.add_edge("planner_node", "route_node")
builder.add_conditional_edges("route_node", plan_ready_router, ["safety_node"])

builder.add_conditional_edges("safety_node", route_from_checker, ["classify_intent_node", END])

graph = builder.compile()


# visualising graph
try:
    from pathlib import Path

    # Render the graph as a Mermaid diagram (xray=True shows node/edge details)
    img_bytes = graph.get_graph(xray=True).draw_mermaid_png()

    # Save it inside your working folder (e.g., same folder as this file)
    output_path = Path(__file__).parent / "runbuddy_graph.png"
    with open(output_path, "wb") as f:
        f.write(img_bytes)

    print(f"LangGraph visualization regenerated: {output_path.resolve()}")

except Exception as e:
    print(f"Failed to auto-generate LangGraph diagram: {e}")
