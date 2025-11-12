# RAG Metrics and Analytics Guide

## Overview

The RunBuddy RAG system now includes comprehensive metrics tracking to help you monitor and optimize retrieval performance. Metrics are automatically logged every time the RAG system retrieves documents.

## What Gets Tracked

### Per-Query Metrics
- **Query text** - What was searched for
- **Timestamp** - When the query occurred
- **Context** - Where the query came from (e.g., "training_plan", "user_query")
- **Category filters** - Any category/subcategory filters applied
- **Results count** - Number of documents retrieved
- **Similarity scores** - Average, max, and min similarity scores
- **Source documents** - Which files/documents were retrieved
- **Categories found** - What categories the results came from

### Aggregated Analytics
- Total queries over time
- Average documents per query
- Overall similarity score statistics
- Most frequently used categories
- Most referenced source documents
- Query patterns by context type
- Time range of queries

## How to View Metrics

### 1. Command Line Tool

View comprehensive analysis:
```bash
cd server
python view_rag_metrics.py
```

View recent queries:
```bash
python view_rag_metrics.py --recent 20
```

Export to JSON:
```bash
python view_rag_metrics.py --export
```

### 2. API Endpoints

#### Get Overall Metrics
```http
GET http://localhost:8000/api/rag/metrics
```

Optional: Limit to recent N queries:
```http
GET http://localhost:8000/api/rag/metrics?limit=100
```

**Response Example:**
```json
{
  "total_queries": 45,
  "total_documents_retrieved": 225,
  "avg_documents_per_query": 5.0,
  "similarity_stats": {
    "overall_avg": 0.8234,
    "max": 0.9512,
    "min": 0.7001
  },
  "category_usage": {
    "Core Training Knowledge": 30,
    "SG Context": 15
  },
  "top_sources": [
    {"source": "training-periodization.md", "count": 12},
    {"source": "heat-adaptation.md", "count": 8}
  ],
  "queries_by_context": {
    "training_plan": 35,
    "user_query": 10
  },
  "time_range": {
    "first": "2024-01-15T10:30:00",
    "last": "2024-01-15T14:45:00"
  }
}
```

#### Get Current Session Metrics
```http
GET http://localhost:8000/api/rag/metrics/session
```

Shows real-time stats since the server started.

**Response Example:**
```json
{
  "total_queries": 12,
  "total_retrievals": 12,
  "total_documents_retrieved": 60,
  "avg_documents_per_query": 5.0,
  "similarity_stats": {
    "avg": 0.8156,
    "max": 0.9401,
    "min": 0.7203
  },
  "categories_used": {
    "Core Training Knowledge": 8,
    "SG Context": 4
  }
}
```

### 3. Log File

Metrics are stored in: `server/logs/rag_metrics.jsonl`

Each line is a JSON object representing one query. You can analyze this file with any JSON processing tool.

**Log Entry Example:**
```json
{
  "timestamp": "2024-01-15T14:30:25.123456",
  "query": "How should I adapt training for Singapore heat?",
  "context": "training_plan",
  "filters": {
    "category": "SG Context",
    "subcategory": null
  },
  "results": {
    "count": 5,
    "avg_similarity": 0.8523,
    "max_similarity": 0.9234,
    "min_similarity": 0.7812,
    "sources": [
      "heat-adaptation.md",
      "singapore-running-routes.md"
    ],
    "categories": ["SG Context"]
  }
}
```

## Using Metrics to Improve RAG

### 1. Monitor Similarity Scores

**Good similarity scores:** 0.75 - 1.0
- Indicates strong relevance between query and retrieved documents
- High confidence in the context provided to LLM

**Medium similarity scores:** 0.60 - 0.75
- Moderate relevance
- May want to review if queries in this range are getting good answers

**Low similarity scores:** < 0.60
- Weak relevance
- Consider:
  - Adjusting similarity threshold
  - Adding more documents to the knowledge base
  - Improving query phrasing

### 2. Analyze Top Sources

If certain documents are retrieved very frequently:
- ✅ Good: Shows they contain valuable, commonly needed information
- ⚠️ Watch: Make sure other relevant docs aren't being overlooked
- 💡 Action: Ensure these key documents are comprehensive and up-to-date

### 3. Check Category Distribution

Look for imbalances:
- If "Core Training Knowledge" is used 90% of the time, maybe SG Context needs expansion
- If certain subcategories never appear, they might not be useful or need better content

### 4. Track Query Patterns

See what contexts trigger RAG queries:
- `training_plan` - Queries from the training plan generator
- `user_query` - Direct user questions
- Custom contexts you define

This helps understand how users interact with your system.

### 5. Optimize Performance

**If avg_documents_per_query is too low (< 3):**
- Lower the similarity threshold
- Add more diverse content to knowledge base

**If avg_documents_per_query is too high (> 10):**
- Raise the similarity threshold
- Make queries more specific
- Use category filters

## Programmatic Access

### In Python (Backend)

```python
from rag_metrics import get_metrics_tracker

# Get the global metrics instance
metrics = get_metrics_tracker()

# Get session summary
summary = metrics.get_session_summary()
print(f"Queries this session: {summary['total_queries']}")

# Analyze all historical logs
analysis = metrics.analyze_logs(limit=100)  # Last 100 queries
print(f"Avg similarity: {analysis['similarity_stats']['overall_avg']}")

# Print formatted summary
metrics.print_summary()
```

### In TypeScript (Frontend)

```typescript
// Get overall metrics
const response = await fetch('http://localhost:8000/api/rag/metrics');
const metrics = await response.json();

console.log(`Total queries: ${metrics.total_queries}`);
console.log(`Avg similarity: ${metrics.similarity_stats.overall_avg}`);

// Get session metrics
const sessionResponse = await fetch('http://localhost:8000/api/rag/metrics/session');
const sessionMetrics = await sessionResponse.json();
```

## Automatic Logging

Metrics are logged automatically in these scenarios:

1. **RAG API Calls** - When you call `/api/rag/search` or `/api/rag/query`
2. **Training Plan Generation** - When the LangGraph planner retrieves context
3. **Custom Queries** - Any use of `RAGQueryEngine.search_documents()`

You can provide a `context` parameter to categorize your queries:

```python
results = rag_engine.search_documents(
    query="What is the 10% rule?",
    context="user_query"  # Custom context label
)
```

## Dashboard Ideas

You can build a dashboard using the metrics API:

### Key Metrics to Display
- 📊 Total queries today/this week
- 🎯 Average similarity score trend
- 📚 Most retrieved documents (word cloud?)
- 🔥 Query volume over time
- 📁 Category usage distribution

### Sample Dashboard Code (React)

```tsx
const RAGMetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    fetch('/api/rag/metrics')
      .then(r => r.json())
      .then(setMetrics);
  }, []);
  
  if (!metrics) return <Loading />;
  
  return (
    <div>
      <MetricCard 
        title="Total Queries" 
        value={metrics.total_queries}
      />
      <MetricCard 
        title="Avg Similarity" 
        value={`${(metrics.similarity_stats.overall_avg * 100).toFixed(1)}%`}
      />
      <SourcesChart data={metrics.top_sources} />
    </div>
  );
};
```

## Troubleshooting

### No metrics showing?

1. **Check if log file exists:**
   ```bash
   ls server/logs/rag_metrics.jsonl
   ```

2. **Make sure queries are being made:**
   - Try generating a training plan
   - Call the RAG API directly
   - Check that `get_metrics_tracker()` is being called

3. **Verify permissions:**
   - Ensure `server/logs/` directory is writable

### Metrics seem wrong?

1. **Clear the log file to start fresh:**
   ```bash
   del server\logs\rag_metrics.jsonl  # Windows
   rm server/logs/rag_metrics.jsonl   # Mac/Linux
   ```

2. **Check timestamps:**
   - Make sure you're looking at the right time range
   - Use `--recent` flag to see latest queries

### Performance concerns?

The metrics system is designed to be lightweight:
- Log writes are append-only (fast)
- Analysis is done on-demand
- No database overhead
- Minimal memory footprint

If log files get too large (>100MB), consider archiving old entries.

## Best Practices

1. **Review metrics regularly** - Weekly reviews help spot trends
2. **Set baselines** - Know your normal similarity scores
3. **Track changes** - Compare metrics before/after knowledge base updates
4. **Use contexts** - Label different query types for better analysis
5. **Export for analysis** - Use `--export` for custom analysis in Excel/Python
6. **Monitor top sources** - Ensure key documents are being used
7. **Check for outliers** - Very low similarity scores indicate problems

## Future Enhancements

Possible additions:
- Query latency tracking
- Token usage monitoring
- A/B testing different similarity thresholds
- Real-time alerting for anomalies
- Integration with observability tools (DataDog, etc.)
- Automatic quality scoring of retrieved contexts

---

**Questions?** Check the API docs at `http://localhost:8000/docs` when your server is running.
