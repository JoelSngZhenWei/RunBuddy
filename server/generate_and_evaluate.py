"""
Generate training plans (baseline and RAG-enhanced) and evaluate them.

This script:
1. Generates a baseline plan (without RAG)
2. Generates a RAG-enhanced plan (with RAG)
3. Saves both as JSON
4. Evaluates and compares them
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.models.plan import TrainingPlan
from app.models.runner import RunnerProfile
from app.models.requests import PlanRequest
from app.graphs.overall_state import OverallState
from app.graphs.nodes.planner import planner_node
from app.llm import model
from langchain_core.prompts import ChatPromptTemplate
from evaluate_models import ModelEvaluator

# Try to import RAG
try:
    from rag_query import RAGQueryEngine
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    print("⚠️  RAG not available - will generate baseline only")


def generate_baseline_plan(input_request: Dict[str, Any]) -> TrainingPlan:
    """Generate a training plan WITHOUT RAG context (baseline)."""
    print("\n" + "="*60)
    print("Generating BASELINE plan (no RAG)...")
    print("="*60)
    
    weeks = input_request.get("weeks", 8)
    runner_profile = input_request.get("runner_profile", {})
    goal_description = input_request.get("goal_description", "No goal specified.")
    country = input_request.get("country", "Singapore")
    
    # Format runner profile
    if isinstance(runner_profile, dict):
        runner_profile_text = json.dumps(runner_profile, indent=2)
        fitness_level = runner_profile.get("experience_level", runner_profile.get("fitness_level", "intermediate"))
    else:
        runner_profile_text = str(runner_profile)
        fitness_level = "intermediate"
    
    # System message (same as planner_node but without RAG instructions)
    system_msg = """You are a long-distance running coach.

You must:
- Vary which days of the week are long runs.
- Be conservative about sudden mileage increases (follow the 10% rule).
- Respect injuries and constraints.
- Use the runner's preferred units (km or miles).
- Align workouts with available days.
- Include pace or effort where possible.
- Reply STRICTLY using the TrainingPlan JSON schema (no extra keys)."""

    # User prompt (without RAG context)
    user_prompt = f"""Create a {weeks}-week training plan.

Runner profile:
{runner_profile_text}

Goal:
{goal_description}

Location: {country}

Respond ONLY with JSON that matches the TrainingPlan schema."""

    # Generate plan
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_msg),
        ("human", "{user_input}"),
    ])
    
    chain = prompt | model.with_structured_output(TrainingPlan)
    plan = chain.invoke({"user_input": user_prompt})
    
    print(f"✅ Baseline plan generated: {weeks} weeks, {sum(len(wk.workouts) for wk in plan.weekly_plans)} workouts")
    return plan


def generate_rag_plan(input_request: Dict[str, Any]) -> TrainingPlan:
    """Generate a training plan WITH RAG context."""
    print("\n" + "="*60)
    print("Generating RAG-ENHANCED plan (with RAG context)...")
    print("="*60)
    
    if not RAG_AVAILABLE:
        raise ValueError("RAG not available. Cannot generate RAG-enhanced plan.")
    
    # Convert runner_profile dict to RunnerProfile object if needed
    runner_profile = input_request.get("runner_profile")
    if isinstance(runner_profile, dict):
        try:
            runner_profile = RunnerProfile(**runner_profile)
        except Exception as e:
            print(f"⚠️  Warning: Could not create RunnerProfile object: {e}")
            print("   Using dict format instead...")
    
    # Create OverallState (same as the service does)
    state = OverallState(
        instruction=input_request.get("instruction", "Generate training plan"),
        country=input_request.get("country", "Singapore"),
        weeks=input_request.get("weeks", 8),
        runner_profile=runner_profile,
        recent_runs=input_request.get("recent_runs"),
        goal_description=input_request.get("goal_description"),
        address=input_request.get("address"),
    )
    
    # Use the existing planner_node which includes RAG
    result = planner_node(state)
    plan = result.get("plan")
    
    if plan is None:
        raise ValueError("Failed to generate plan from planner_node")
    
    print(f"✅ RAG-enhanced plan generated: {plan.plan_duration_weeks} weeks, {sum(len(wk.workouts) for wk in plan.weekly_plans)} workouts")
    return plan


def create_default_input_request() -> Dict[str, Any]:
    """Create a default input request for testing."""
    return {
        "instruction": "Generate a training plan for a half marathon",
        "goal_description": "Standard Chartered Half Marathon | Target: Finish in 2 hours 15 minutes",
        "runner_profile": {
            "name": "Test Runner",
            "age": 30,
            "sex": "male",
            "experience_level": "intermediate",
            "weekly_mileage_km": 35.0,
            "preferred_units": "km",
            "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "constraints": []
        },
        "weeks": 8,
        "country": "Singapore",
        "recent_runs": None,
        "address": None
    }


def main():
    """Main function to generate plans and evaluate them."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate and evaluate training plans")
    parser.add_argument('--input', '-i', help='Input request JSON file (optional)')
    parser.add_argument('--output-dir', '-o', default='evaluation_data', help='Output directory')
    parser.add_argument('--skip-rag', action='store_true', help='Skip RAG plan generation')
    parser.add_argument('--skip-evaluation', action='store_true', help='Skip evaluation, just generate plans')
    
    args = parser.parse_args()
    
    # Load or create input request
    if args.input:
        with open(args.input, 'r') as f:
            input_request = json.load(f)
    else:
        print("No input file provided. Using default test case.")
        print("(Use --input to provide your own input_request.json)")
        input_request = create_default_input_request()
    
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    print("\n" + "="*60)
    print("GENERATE AND EVALUATE TRAINING PLANS")
    print("="*60)
    print(f"\nInput Request:")
    print(f"  Goal: {input_request.get('goal_description', 'N/A')}")
    print(f"  Weeks: {input_request.get('weeks', 'N/A')}")
    print(f"  Country: {input_request.get('country', 'N/A')}")
    
    # Save input request
    input_file = output_dir / f"input_request_{timestamp}.json"
    with open(input_file, 'w') as f:
        json.dump(input_request, f, indent=2, default=str)
    print(f"\n💾 Input request saved: {input_file}")
    
    evaluations = []
    
    # Generate baseline plan
    try:
        baseline_plan = generate_baseline_plan(input_request)
        baseline_file = output_dir / f"baseline_plan_{timestamp}.json"
        with open(baseline_file, 'w') as f:
            json.dump(baseline_plan.model_dump(), f, indent=2, default=str)
        print(f"💾 Baseline plan saved: {baseline_file}")
    except Exception as e:
        print(f"❌ Error generating baseline plan: {e}")
        baseline_plan = None
        baseline_file = None
    
    # Generate RAG plan
    rag_plan = None
    rag_file = None
    if not args.skip_rag and RAG_AVAILABLE:
        try:
            rag_plan = generate_rag_plan(input_request)
            rag_file = output_dir / f"rag_plan_{timestamp}.json"
            with open(rag_file, 'w') as f:
                json.dump(rag_plan.model_dump(), f, indent=2, default=str)
            print(f"💾 RAG plan saved: {rag_file}")
        except Exception as e:
            print(f"❌ Error generating RAG plan: {e}")
            print("   Continuing with baseline evaluation only...")
    elif args.skip_rag:
        print("\n⏭️  Skipping RAG plan generation (--skip-rag)")
    elif not RAG_AVAILABLE:
        print("\n⏭️  Skipping RAG plan (RAG not available)")
    
    # Evaluate plans
    if not args.skip_evaluation:
        print("\n" + "="*60)
        print("EVALUATING PLANS")
        print("="*60)
        
        evaluator = ModelEvaluator(output_dir=str(output_dir / "evaluation_results"))
        
        # Evaluate baseline
        if baseline_plan:
            try:
                baseline_eval = evaluator.evaluate_model_output(
                    model_name="baseline_gpt4",
                    model_type="baseline",
                    output_plan=baseline_plan,
                    input_request=input_request,
                    run_llm_judge=True
                )
                evaluations.append(baseline_eval)
                evaluator.save_evaluation(baseline_eval)
                print(f"\n✅ Baseline evaluated")
                if baseline_eval.llm_judge_scores:
                    print(f"   Overall Quality: {baseline_eval.llm_judge_scores.overall_quality:.1f}/10")
            except Exception as e:
                print(f"❌ Error evaluating baseline: {e}")
        
        # Evaluate RAG
        if rag_plan:
            try:
                rag_eval = evaluator.evaluate_model_output(
                    model_name="rag_enhanced_gpt4",
                    model_type="rag",
                    output_plan=rag_plan,
                    input_request=input_request,
                    run_llm_judge=True
                )
                evaluations.append(rag_eval)
                evaluator.save_evaluation(rag_eval)
                print(f"\n✅ RAG-enhanced evaluated")
                if rag_eval.llm_judge_scores:
                    print(f"   Overall Quality: {rag_eval.llm_judge_scores.overall_quality:.1f}/10")
            except Exception as e:
                print(f"❌ Error evaluating RAG plan: {e}")
        
        # Compare if we have both
        if len(evaluations) >= 2:
            print("\n" + "="*60)
            print("COMPARING MODELS")
            print("="*60)
            
            comparison = evaluator.compare_models(evaluations)
            comparison_file = output_dir / "evaluation_results" / f"comparison_{timestamp}.json"
            print(f"\n💾 Comparison saved: {comparison_file}")
            
            # Print summary
            if comparison.get('recommendations'):
                print("\n📊 Summary:")
                for rec in comparison['recommendations']:
                    print(f"   • {rec}")
            
            # LLM direct comparison
            if baseline_plan and rag_plan:
                print("\n🤖 LLM Judge Comparison:")
                llm_comparison = evaluator.compare_plans_llm_judge(
                    baseline_plan,
                    rag_plan,
                    "Baseline",
                    "RAG-Enhanced",
                    input_request
                )
                print(f"   Winner: {llm_comparison.get('winner', 'tie')}")
                reasoning = llm_comparison.get('reasoning', 'N/A')
                if len(reasoning) > 200:
                    reasoning = reasoning[:200] + "..."
                print(f"   Reasoning: {reasoning}")
        
        print("\n" + "="*60)
        print("✅ EVALUATION COMPLETE")
        print("="*60)
        print(f"\nFiles saved in: {output_dir}")
        print(f"  - Input request: {input_file.name}")
        if baseline_file:
            print(f"  - Baseline plan: {baseline_file.name}")
        if rag_file:
            print(f"  - RAG plan: {rag_file.name}")
        print(f"  - Evaluation results: evaluation_results/")
        
        print("\n💡 Next step: Generate report with:")
        print(f"   python generate_evaluation_report.py {output_dir}/evaluation_results/comparison_{timestamp}.json")
    else:
        print("\n⏭️  Skipping evaluation (--skip-evaluation)")
        print(f"\n✅ Plans generated in: {output_dir}")


if __name__ == "__main__":
    main()

