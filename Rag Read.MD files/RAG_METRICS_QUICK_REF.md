# 📊 RAG Metrics Quick Reference

## Quick Commands

### View Metrics
```bash
cd server

# Full analysis
python view_rag_metrics.py

# Last 10 queries
python view_rag_metrics.py --recent 10

# Export to JSON
python view_rag_metrics.py --export

# Test if metrics are working
python test_metrics.py
```

### API Endpoints
```bash
# Overall metrics
GET http://localhost:8000/api/rag/metrics

# Session metrics
GET http://localhost:8000/api/rag/metrics/session
```

## What Gets Tracked

✅ Every RAG query logs:
- Query text and timestamp  
- Number of documents retrieved
- Similarity scores (avg/max/min)
- Source documents used
- Categories filtered
- Context type

## Key Metrics

| Metric | Good Range | Action if Outside |
|--------|-----------|-------------------|
| Avg Similarity | 0.75 - 1.0 | < 0.75: Lower threshold or add content |
| Docs per Query | 3 - 7 | Too low: Lower threshold; Too high: Raise threshold |
| Retrieval Success | > 90% | < 90%: Review query patterns and content coverage |

## Common Use Cases

### After Generating Training Plans
```bash
python view_rag_metrics.py --recent 20
```
See which documents were used for the plan.

### Checking System Health
```bash
python test_metrics.py
```
Quick check if metrics are working.

### Building Dashboard
```typescript
const response = await fetch('/api/rag/metrics');
const metrics = await response.json();
// Use metrics.top_sources, metrics.similarity_stats, etc.
```

### Debugging Low Quality Results
1. Check avg similarity score
2. Look at which sources are being retrieved
3. Review if right categories are being queried
4. Adjust threshold or add missing content

## Files

- **Metrics Module:** `server/rag_metrics.py`
- **View Tool:** `server/view_rag_metrics.py`  
- **Test Tool:** `server/test_metrics.py`
- **Log File:** `server/logs/rag_metrics.jsonl`
- **Full Guide:** `RAG_METRICS_GUIDE.md`

## Metrics Flow

```
User Action → RAG Query → Automatic Logging → Log File
                                                   ↓
                                     View/API/Analysis Tools
```

## Pro Tips

💡 Tag your queries with `context` parameter for better tracking:
```python
results = rag_engine.search_documents(
    query="...",
    context="user_query"  # or "training_plan", "debug", etc.
)
```

💡 Review metrics weekly to spot trends

💡 Low similarity? Check if:
- Queries are too specific
- Knowledge base needs more content
- Threshold is too high

💡 Export metrics for custom analysis:
```bash
python view_rag_metrics.py --export
# Analyze in Excel, Python, or BI tools
```

---

**More Details:** See `RAG_METRICS_GUIDE.md`
