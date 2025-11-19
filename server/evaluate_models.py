"""
Comprehensive Model Evaluation Framework for RunBuddy Training Plans

This module provides evaluation capabilities to compare:
- Baseline model (GPT-4.1 without RAG)
- RAG-enhanced model (GPT-4.1 with RAG context)
- Fine-tuned models (if available)

Evaluation methods:
1. Automatic metrics (safety, schema compliance, completeness)
2. LLM-as-judge (GPT-4 evaluating quality)
3. Human evaluation (structured format for manual review)
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict

from app.models.plan import TrainingPlan
from app.graphs.nodes.tools.safety_tools import build_numeric_safety_report
from app.llm import model as llm_model
from langchain_core.prompts import ChatPromptTemplate
from pydantic import ValidationError


@dataclass
class AutomaticMetrics:
    """Automatic evaluation metrics that don't require human judgment."""
    # Safety metrics
    max_weekly_increase_pct: Optional[float] = None
    max_weekly_increase_km: Optional[float] = None
    safety_violations: List[str] = None
    
    # Schema compliance
    schema_valid: bool = True
    schema_errors: List[str] = None
    
    # Completeness
    total_weeks: int = 0
    total_workouts: int = 0
    avg_workouts_per_week: float = 0.0
    workouts_with_pace: int = 0
    workouts_with_notes: int = 0
    
    # Structure quality
    focus_variety_score: float = 0.0  # Average distinct focus types per week
    rest_days_per_week: float = 0.0
    long_run_frequency: float = 0.0
    
    def __post_init__(self):
        if self.safety_violations is None:
            self.safety_violations = []
        if self.schema_errors is None:
            self.schema_errors = []


@dataclass
class LLMJudgeScores:
    """Scores from LLM-as-judge evaluation."""
    overall_quality: float = 0.0  # 1-10 scale
    safety_appropriateness: float = 0.0
    adherence_to_principles: float = 0.0
    personalization: float = 0.0
    completeness: float = 0.0
    reasoning_quality: str = ""
    strengths: List[str] = None
    weaknesses: List[str] = None
    
    def __post_init__(self):
        if self.strengths is None:
            self.strengths = []
        if self.weaknesses is None:
            self.weaknesses = []


@dataclass
class HumanEvaluationScores:
    """Scores from human evaluation."""
    overall_quality: float = 0.0  # 1-10 scale
    safety_rating: float = 0.0
    usefulness: float = 0.0
    clarity: float = 0.0
    preference: Optional[str] = None  # "baseline", "rag", "finetuned", "tie"
    comments: str = ""


@dataclass
class ModelEvaluation:
    """Complete evaluation for a single model output."""
    model_name: str
    model_type: str  # "baseline", "rag", "finetuned"
    input_request: Dict[str, Any]
    output_plan: Optional[TrainingPlan] = None
    automatic_metrics: Optional[AutomaticMetrics] = None
    llm_judge_scores: Optional[LLMJudgeScores] = None
    human_scores: Optional[HumanEvaluationScores] = None
    evaluation_timestamp: str = ""
    errors: List[str] = None
    
    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        if not self.evaluation_timestamp:
            self.evaluation_timestamp = datetime.utcnow().isoformat()


class ModelEvaluator:
    """Main evaluation class for comparing model outputs."""
    
    def __init__(self, output_dir: str = "evaluation_results"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
    def evaluate_automatic_metrics(self, plan: TrainingPlan, runner_profile: Dict) -> AutomaticMetrics:
        """Calculate automatic metrics from a training plan."""
        metrics = AutomaticMetrics()
        
        try:
            # Safety metrics
            safety_report = build_numeric_safety_report(plan)
            weekly_totals = safety_report["weekly_totals_km"]
            weekly_increments = safety_report["weekly_increments"]
            
            # Find max weekly increase
            max_pct = 0.0
            max_km = 0.0
            violations = []
            
            for i, inc in enumerate(weekly_increments):
                if inc is not None:
                    pct = inc.get("pct")
                    abs_km = inc.get("abs_km", 0)
                    
                    if pct is not None and pct > max_pct:
                        max_pct = pct
                    if abs_km > max_km:
                        max_km = abs_km
                    
                    # Check for violations
                    if pct is not None and pct > 15:  # 10% rule with some tolerance
                        violations.append(f"Week {i+1}: {pct:.1f}% increase ({abs_km:.1f} km)")
                    if abs_km > 10:  # Large absolute increase
                        violations.append(f"Week {i+1}: {abs_km:.1f} km absolute increase")
            
            metrics.max_weekly_increase_pct = max_pct
            metrics.max_weekly_increase_km = max_km
            metrics.safety_violations = violations
            
            # Completeness metrics
            metrics.total_weeks = plan.plan_duration_weeks
            total_workouts = sum(len(wk.workouts) for wk in plan.weekly_plans)
            metrics.total_workouts = total_workouts
            metrics.avg_workouts_per_week = total_workouts / max(plan.plan_duration_weeks, 1)
            
            # Workout quality
            workouts_with_pace = 0
            workouts_with_notes = 0
            focus_types = set()
            rest_days = 0
            long_runs = 0
            
            for week in plan.weekly_plans:
                for workout in week.workouts:
                    if workout.target_pace_min_per_km is not None:
                        workouts_with_pace += 1
                    if workout.notes:
                        workouts_with_notes += 1
                    focus_types.add(workout.focus)
                    if workout.focus == "rest":
                        rest_days += 1
                    if workout.focus == "long_run":
                        long_runs += 1
            
            metrics.workouts_with_pace = workouts_with_pace
            metrics.workouts_with_notes = workouts_with_notes
            metrics.focus_variety_score = len(focus_types) / max(plan.plan_duration_weeks, 1)
            metrics.rest_days_per_week = rest_days / max(plan.plan_duration_weeks, 1)
            metrics.long_run_frequency = long_runs / max(plan.plan_duration_weeks, 1)
            
        except Exception as e:
            metrics.schema_errors.append(f"Error calculating metrics: {str(e)}")
        
        return metrics
    
    def evaluate_with_llm_judge(
        self, 
        plan: TrainingPlan, 
        input_request: Dict[str, Any],
        reference_plan: Optional[TrainingPlan] = None
    ) -> LLMJudgeScores:
        """Use LLM-as-judge to evaluate plan quality."""
        scores = LLMJudgeScores()
        
        try:
            plan_json = plan.model_dump_json(indent=2)
            goal = input_request.get("goal_description", "Unknown goal")
            runner_profile = input_request.get("runner_profile", {})
            
            prompt = f"""You are an expert running coach evaluating a training plan.

Goal: {goal}
Runner Profile: {json.dumps(runner_profile, indent=2)}

Training Plan:
{plan_json}

Evaluate this training plan on the following criteria (provide scores 1-10 and brief reasoning):

1. **Overall Quality** (1-10): How well does this plan meet the runner's goals?
2. **Safety Appropriateness** (1-10): Is the plan safe? Does it follow the 10% rule? Are there adequate rest days?
3. **Adherence to Principles** (1-10): Does it follow evidence-based training principles (periodization, intensity zones, progression)?
4. **Personalization** (1-10): How well is it tailored to the runner's profile and constraints?
5. **Completeness** (1-10): Is the plan complete with all necessary details (pace, descriptions, notes)?

Respond in JSON format:
{{
    "overall_quality": <score>,
    "safety_appropriateness": <score>,
    "adherence_to_principles": <score>,
    "personalization": <score>,
    "completeness": <score>,
    "reasoning": "<brief explanation of scores>",
    "strengths": ["<strength1>", "<strength2>", ...],
    "weaknesses": ["<weakness1>", "<weakness2>", ...]
}}
"""
            
            response = llm_model.invoke(prompt)
            content = getattr(response, "content", str(response))
            
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                scores.overall_quality = result.get("overall_quality", 0.0)
                scores.safety_appropriateness = result.get("safety_appropriateness", 0.0)
                scores.adherence_to_principles = result.get("adherence_to_principles", 0.0)
                scores.personalization = result.get("personalization", 0.0)
                scores.completeness = result.get("completeness", 0.0)
                scores.reasoning_quality = result.get("reasoning", "")
                scores.strengths = result.get("strengths", [])
                scores.weaknesses = result.get("weaknesses", [])
            else:
                scores.reasoning_quality = content
                
        except Exception as e:
            scores.reasoning_quality = f"Error in LLM evaluation: {str(e)}"
        
        return scores
    
    def compare_plans_llm_judge(
        self,
        plan1: TrainingPlan,
        plan2: TrainingPlan,
        plan1_name: str,
        plan2_name: str,
        input_request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Use LLM to compare two plans and determine which is better."""
        try:
            goal = input_request.get("goal_description", "Unknown goal")
            runner_profile = input_request.get("runner_profile", {})
            
            prompt = f"""You are an expert running coach comparing two training plans.

Goal: {goal}
Runner Profile: {json.dumps(runner_profile, indent=2)}

Plan A ({plan1_name}):
{plan1.model_dump_json(indent=2)}

Plan B ({plan2_name}):
{plan2.model_dump_json(indent=2)}

Compare these plans and determine which is better overall. Consider:
- Safety and injury prevention
- Adherence to training principles
- Personalization to the runner
- Completeness and clarity

Respond in JSON format:
{{
    "winner": "A" or "B" or "tie",
    "reasoning": "<explanation>",
    "plan_a_scores": {{
        "safety": <1-10>,
        "quality": <1-10>,
        "personalization": <1-10>
    }},
    "plan_b_scores": {{
        "safety": <1-10>,
        "quality": <1-10>,
        "personalization": <1-10>
    }}
}}
"""
            
            response = llm_model.invoke(prompt)
            content = getattr(response, "content", str(response))
            
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {"winner": "tie", "reasoning": content}
                
        except Exception as e:
            return {"winner": "tie", "reasoning": f"Error: {str(e)}"}
    
    def evaluate_model_output(
        self,
        model_name: str,
        model_type: str,
        output_plan: Optional[TrainingPlan],
        input_request: Dict[str, Any],
        run_llm_judge: bool = True
    ) -> ModelEvaluation:
        """Evaluate a single model output."""
        evaluation = ModelEvaluation(
            model_name=model_name,
            model_type=model_type,
            input_request=input_request,
            output_plan=output_plan
        )
        
        if output_plan is None:
            evaluation.errors.append("No plan generated")
            return evaluation
        
        # Automatic metrics
        runner_profile = input_request.get("runner_profile", {})
        if isinstance(runner_profile, dict):
            evaluation.automatic_metrics = self.evaluate_automatic_metrics(
                output_plan, runner_profile
            )
        else:
            evaluation.automatic_metrics = self.evaluate_automatic_metrics(
                output_plan, {}
            )
        
        # LLM-as-judge
        if run_llm_judge:
            evaluation.llm_judge_scores = self.evaluate_with_llm_judge(
                output_plan, input_request
            )
        
        return evaluation
    
    def compare_models(
        self,
        evaluations: List[ModelEvaluation],
        output_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """Compare multiple model evaluations and generate a report."""
        if not evaluations:
            return {"error": "No evaluations provided"}
        
        comparison = {
            "timestamp": datetime.utcnow().isoformat(),
            "models_compared": [e.model_name for e in evaluations],
            "summary": {},
            "detailed_comparison": {},
            "recommendations": []
        }
        
        # Aggregate automatic metrics
        auto_metrics_summary = defaultdict(list)
        llm_scores_summary = defaultdict(list)
        
        for eval in evaluations:
            if eval.automatic_metrics:
                auto_metrics_summary["max_weekly_increase_pct"].append(
                    eval.automatic_metrics.max_weekly_increase_pct or 0
                )
                auto_metrics_summary["safety_violations_count"].append(
                    len(eval.automatic_metrics.safety_violations)
                )
                auto_metrics_summary["avg_workouts_per_week"].append(
                    eval.automatic_metrics.avg_workouts_per_week
                )
                auto_metrics_summary["focus_variety_score"].append(
                    eval.automatic_metrics.focus_variety_score
                )
            
            if eval.llm_judge_scores:
                llm_scores_summary["overall_quality"].append(
                    eval.llm_judge_scores.overall_quality
                )
                llm_scores_summary["safety_appropriateness"].append(
                    eval.llm_judge_scores.safety_appropriateness
                )
                llm_scores_summary["adherence_to_principles"].append(
                    eval.llm_judge_scores.adherence_to_principles
                )
        
        # Create summary
        comparison["summary"] = {
            "automatic_metrics": {
                metric: {
                    "values": values,
                    "avg": sum(values) / len(values) if values else 0,
                    "best": max(values) if values else 0,
                    "worst": min(values) if values else 0
                }
                for metric, values in auto_metrics_summary.items()
            },
            "llm_judge_scores": {
                metric: {
                    "values": values,
                    "avg": sum(values) / len(values) if values else 0,
                    "best": max(values) if values else 0,
                    "worst": min(values) if values else 0
                }
                for metric, values in llm_scores_summary.items()
            }
        }
        
        # Detailed comparison
        comparison["detailed_comparison"] = {
            eval.model_name: {
                "model_type": eval.model_type,
                "automatic_metrics": asdict(eval.automatic_metrics) if eval.automatic_metrics else None,
                "llm_judge_scores": asdict(eval.llm_judge_scores) if eval.llm_judge_scores else None,
                "errors": eval.errors
            }
            for eval in evaluations
        }
        
        # Generate recommendations
        if len(evaluations) >= 2:
            best_auto = max(
                evaluations,
                key=lambda e: (
                    e.automatic_metrics.focus_variety_score if e.automatic_metrics else 0
                ) - (len(e.automatic_metrics.safety_violations) if e.automatic_metrics else 0)
            )
            
            best_llm = max(
                evaluations,
                key=lambda e: e.llm_judge_scores.overall_quality if e.llm_judge_scores else 0
            )
            
            comparison["recommendations"] = [
                f"Best automatic metrics: {best_auto.model_name}",
                f"Best LLM-judged quality: {best_llm.model_name}",
            ]
        
        # Save to file
        if output_file is None:
            output_file = self.output_dir / f"comparison_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        else:
            output_file = Path(output_file)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(comparison, f, indent=2, default=str)
        
        return comparison
    
    def save_evaluation(self, evaluation: ModelEvaluation, filename: Optional[str] = None):
        """Save a single evaluation to file."""
        if filename is None:
            filename = self.output_dir / f"eval_{evaluation.model_name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        else:
            filename = Path(filename)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(asdict(evaluation), f, indent=2, default=str)


def main():
    """Example usage of the evaluation framework."""
    print("Model Evaluation Framework for RunBuddy")
    print("=" * 60)
    print("\nThis framework supports:")
    print("1. Automatic metrics (safety, completeness, structure)")
    print("2. LLM-as-judge evaluation")
    print("3. Human evaluation (structured format)")
    print("4. Model comparison reports")
    print("\nSee evaluate_models_example.py for usage examples.")


if __name__ == "__main__":
    main()


