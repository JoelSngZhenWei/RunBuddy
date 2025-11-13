# app/graphs/safety_tools.py
from __future__ import annotations
from typing import List, Optional, Dict, Any
from app.models.plan import TrainingPlan

def weekly_mileage_km(plan: TrainingPlan) -> List[float]:
    """Sum per-week distances from the plan."""
    totals: List[float] = []
    for wk in plan.weekly_plans:
        totals.append(sum(max(0.0, w.distance_km or 0.0) for w in wk.workouts))
    return totals

def weekly_increments(totals: List[float]) -> List[Optional[Dict[str, float]]]:
    """
    For week i>0, return absolute (km) and percent (%) delta vs previous week.
    For week 0, return None.
    """
    incs: List[Optional[Dict[str, float]]] = [None]
    for i in range(1, len(totals)):
        prev, cur = totals[i-1], totals[i]
        abs_delta = cur - prev
        pct = (abs_delta / prev * 100.0) if prev > 0 else (float("inf") if cur > 0 else 0.0)
        incs.append({"abs_km": round(abs_delta, 2),
                     "pct": None if pct == float("inf") else round(pct, 1)})
    return incs

def weekly_workout_counts(plan: TrainingPlan) -> List[int]:
    """Total number of workouts per week."""
    return [len(wk.workouts) for wk in plan.weekly_plans]

def weekly_focus_histogram(plan: TrainingPlan) -> List[Dict[str, int]]:
    """Counts per focus type for each week."""
    per_week: List[Dict[str, int]] = []
    for wk in plan.weekly_plans:
        hist: Dict[str, int] = {}
        for w in wk.workouts:
            hist[w.focus] = hist.get(w.focus, 0) + 1
        per_week.append(hist)
    return per_week

def weekly_focus_variety_count(plan: TrainingPlan) -> List[int]:
    """Number of distinct focus types per week."""
    return [len({w.focus for w in wk.workouts}) for wk in plan.weekly_plans]

def build_numeric_safety_report(plan: TrainingPlan) -> Dict[str, Any]:
    """
    Returns numbers only. No judgments, no thresholds, no flags.
    - weekly_totals_km: [float]
    - weekly_increments: [None | {abs_km: float, pct: float|None}]
    - weekly_workout_counts: [int]
    - weekly_focus_histogram: [dict]
    - weekly_focus_variety_count: [int]
    """
    totals = weekly_mileage_km(plan)
    return {
        "weekly_totals_km": [round(x, 2) for x in totals],
        "weekly_increments": weekly_increments(totals),
        "weekly_workout_counts": weekly_workout_counts(plan),
        "weekly_focus_histogram": weekly_focus_histogram(plan),
        "weekly_focus_variety_count": weekly_focus_variety_count(plan),
    }
