
import inspect
from app.graphs.overall_state import OverallState
from langchain_core.messages import HumanMessage, AIMessage

def route_node(state: OverallState):
    """
    Route planning node - enriches training plan with route suggestions based on location.
    Fetches route recommendations from OneMap API (Singapore) if address is provided.
    """
    print(f"[{inspect.currentframe().f_code.co_name}] Executing agent")
    
    print(f"[{inspect.currentframe().f_code.co_name}] DEBUG - Address received: {state.address}")
    print(f"[{inspect.currentframe().f_code.co_name}] DEBUG - Country received: {state.country}")

    # Check if we have a plan to work with
    if not state.plan:
        print("⚠️ No training plan available for route enrichment")
        return {"messages": state.messages or []}

    print(f"[{inspect.currentframe().f_code.co_name}] DEBUG - Plan has {len(state.plan.weekly_plans)} weeks")

    # Get address from state
    address = state.address

    # Only process routes for Singapore with a valid address
    if not address or state.country.lower() != "singapore":
        print(
            f"ℹ️ Skipping route planning (address: {address}, country: {state.country})"
        )
        messages = state.messages or []
        messages.append(
            HumanMessage(
                content="[ROUTE PLANNING] Skipping route planning - address not provided or country not Singapore"
            )
        )
        return {"messages": messages}

    messages = state.messages or []

    try:
        from app.lib.onemap_utils import suggest_routes_for_distance

        # print(f"🗺️ Fetching route recommendations for: {address}")
        messages.append(
            HumanMessage(content=f"[ROUTE PLANNING] Searching routes from: {address}")
        )

        # Find all runs in the plan and suggest routes (except rest days)
        route_suggestions = []
        routes_generated = 0

        # Count all workouts that need routes for debugging
        workout_count = 0
        for week in state.plan.weekly_plans:
            for workout in week.workouts:
                if workout.focus != "rest" and workout.distance_km > 0:
                    workout_count += 1

        # print(f"DEBUG - Found {workout_count} workouts with distance > 0 in the plan")

        # Create a new plan with modified workouts (Pydantic models are immutable)
        modified_weekly_plans = []

        for week in state.plan.weekly_plans:
            modified_workouts = []

            for workout in week.workouts:
                # Create a copy of the workout data
                workout_dict = workout.model_dump()

                # Generate routes for all runs (skip rest days and zero-distance workouts)
                if workout.focus != "rest" and workout.distance_km > 0:
                    # print(
                    #     f"📍 Generating route for Week {week.week_number}, {workout.day}: {workout.distance_km}km ({workout.focus})"
                    # )

                    # Get route suggestion
                    routes = suggest_routes_for_distance(
                        address=address,
                        target_distance_km=workout.distance_km,
                        num_suggestions=1,
                    )

                    if routes and len(routes) > 0:
                        route = routes[0]

                        # Build route description with ALL directions
                        route_desc = (
                            f"🗺️ Suggested {route['distance_km']}km route from {address}"
                        )

                        if route.get("directions"):
                            num_directions = len(route["directions"])
                            route_desc += f"\n\n📍 Turn-by-turn directions ({num_directions} steps):\n"

                            # Include ALL directions, not just the first 3
                            for i, direction in enumerate(route["directions"], 1):
                                route_desc += f"{i}. {direction}\n"

                        # Append to workout notes in the dict
                        original_notes = workout_dict.get("notes") or ""
                        if original_notes:
                            workout_dict["notes"] = f"{original_notes}\n\n{route_desc}"
                        else:
                            workout_dict["notes"] = route_desc

                        # print(
                        #     f"✅ Added route to workout notes: {workout_dict['notes'][:50]}..."
                        # )

                        route_suggestions.append(
                            f"Week {week.week_number}, {workout.day}: {workout.distance_km}km - Route added"
                        )
                        routes_generated += 1
                    else:
                        print(f"⚠️ Could not generate route for {workout.distance_km}km")

                # Create new Workout instance with potentially modified notes
                from app.models.plan import Workout

                modified_workouts.append(Workout(**workout_dict))

            # Create new WeeklyPlan with modified workouts
            from app.models.plan import WeeklyPlan

            modified_weekly_plans.append(
                WeeklyPlan(
                    week_number=week.week_number,
                    focus_summary=week.focus_summary,
                    workouts=modified_workouts,
                )
            )

        # Create new TrainingPlan with modified weekly plans
        from app.models.plan import TrainingPlan

        modified_plan = TrainingPlan(
            goal_description=state.plan.goal_description,
            plan_duration_weeks=state.plan.plan_duration_weeks,
            weekly_overview=state.plan.weekly_overview,
            weekly_plans=modified_weekly_plans,
        )

        # Add summary to messages
        if route_suggestions:
            route_summary = f"Generated {routes_generated} route(s):\n" + "\n".join(
                route_suggestions
            )
            messages.append(AIMessage(content=f"[ROUTE PLANNING] {route_summary}"))
            print(f"[{inspect.currentframe().f_code.co_name}] Generated {routes_generated} routes successfully")
        else:
            messages.append(
                AIMessage(
                    content="[ROUTE PLANNING] No workouts with distance found requiring route planning"
                )
            )
            # print("ℹ️ No workouts with distance found for route planning")

        return {
            "messages": messages,
            "plan": modified_plan,  # Return the new modified plan
        }

    except ImportError:
        print("❌ OneMap utilities not available")
        messages.append(
            AIMessage(content="[ROUTE PLANNING] Error: OneMap utilities not available")
        )
        return {"messages": messages}
    except Exception as e:
        print(f"❌ Error in route planning: {e}")
        import traceback

        traceback.print_exc()
        messages.append(AIMessage(content=f"[ROUTE PLANNING] Error: {str(e)}"))
        return {"messages": messages}