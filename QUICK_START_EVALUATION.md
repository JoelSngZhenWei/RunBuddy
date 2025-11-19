# Model Evaluation - Quick Start

## One Command to Do Everything

```bash
cd server
python generate_and_evaluate.py
```

This will:
1. ✅ Generate a baseline plan (no RAG)
2. ✅ Generate a RAG-enhanced plan (with RAG)
3. ✅ Save both as JSON
4. ✅ Evaluate both plans
5. ✅ Compare them
6. ✅ Save results

---

## What It Does

1. **Creates a default test case** (or use your own with `--input`)
2. **Generates baseline plan** using GPT-4.1 without RAG
3. **Generates RAG plan** using GPT-4.1 with RAG context
4. **Saves both plans** as JSON files
5. **Evaluates both** with automatic metrics + LLM judge
6. **Compares them** and shows which is better

---

## Output Files

After running, you'll have:

```
evaluation_data/
├── input_request_20250113_120000.json    # Your input
├── baseline_plan_20250113_120000.json     # Baseline plan
├── rag_plan_20250113_120000.json         # RAG plan
└── evaluation_results/
    ├── eval_baseline_gpt4_*.json         # Baseline evaluation
    ├── eval_rag_enhanced_gpt4_*.json     # RAG evaluation
    └── comparison_*.json                 # Comparison report
```

---

## Options

### Use Your Own Input

```bash
python generate_and_evaluate.py --input my_input.json
```

Your `my_input.json` should look like:
```json
{
  "instruction": "Generate a training plan",
  "goal_description": "Half Marathon in 2:15",
  "runner_profile": {
    "fitness_level": "Intermediate",
    "weekly_mileage_km": 35.0,
    "preferred_units": "km"
  },
  "weeks": 8,
  "country": "Singapore"
}
```

### Skip RAG (baseline only)

```bash
python generate_and_evaluate.py --skip-rag
```

### Just Generate Plans (skip evaluation)

```bash
python generate_and_evaluate.py --skip-evaluation
```

### Custom Output Directory

```bash
python generate_and_evaluate.py --output-dir my_results
```

---

## Generate Report

After evaluation, generate a readable report:

```bash
python generate_evaluation_report.py \
    evaluation_data/evaluation_results/comparison_*.json \
    --format both
```

This creates:
- `report_*.txt` - Text report
- `report_*.md` - Markdown report

---

## Example Output

```
================================================================
GENERATE AND EVALUATE TRAINING PLANS
================================================================

Input Request:
  Goal: Standard Chartered Half Marathon | Target: Finish in 2 hours 15 minutes
  Weeks: 8
  Country: Singapore

💾 Input request saved: evaluation_data/input_request_20250113_120000.json

============================================================
Generating BASELINE plan (no RAG)...
============================================================
✅ Baseline plan generated: 8 weeks, 56 workouts
💾 Baseline plan saved: evaluation_data/baseline_plan_20250113_120000.json

============================================================
Generating RAG-ENHANCED plan (with RAG context)...
============================================================
✅ RAG-enhanced plan generated: 8 weeks, 56 workouts
💾 RAG plan saved: evaluation_data/rag_plan_20250113_120000.json

============================================================
EVALUATING PLANS
============================================================

✅ Baseline evaluated
   Overall Quality: 7.8/10

✅ RAG-enhanced evaluated
   Overall Quality: 8.5/10

============================================================
COMPARING MODELS
============================================================

💾 Comparison saved: evaluation_data/evaluation_results/comparison_20250113_120000.json

📊 Summary:
   • Best automatic metrics: rag_enhanced_gpt4
   • Best LLM-judged quality: rag_enhanced_gpt4

🤖 LLM Judge Comparison:
   Winner: B
   Reasoning: The RAG-enhanced plan shows better adherence to training principles...

================================================================
✅ EVALUATION COMPLETE
================================================================
```

---

## Troubleshooting

### "RAG not available"
- Make sure you have `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in your `.env`
- Or use `--skip-rag` to test baseline only

### "OpenAI API key not found"
- Set `OPENAI_API_KEY` in your `.env` file
- Or export it: `export OPENAI_API_KEY=your_key`

### "Module not found"
- Make sure you're in the `server/` directory
- Or run: `cd server && python generate_and_evaluate.py`

---

## Next Steps

1. **Run the script** - `python generate_and_evaluate.py`
2. **Check results** - Look in `evaluation_data/evaluation_results/`
3. **Generate report** - Use `generate_evaluation_report.py`
4. **Review findings** - See which model performs better

---

## Full Workflow

```bash
# Step 1: Generate and evaluate
cd server
python generate_and_evaluate.py

# Step 2: Generate report
python generate_evaluation_report.py \
    evaluation_data/evaluation_results/comparison_*.json \
    --format both

# Step 3: Read the report
cat evaluation_data/evaluation_results/report_*.txt
```

That's it! You now have:
- ✅ Both plans generated
- ✅ Both plans evaluated
- ✅ Comparison report
- ✅ Human-readable summary

