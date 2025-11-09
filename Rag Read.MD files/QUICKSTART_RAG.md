# Quick Start: RAG System for RunBuddy

Follow these steps to set up the RAG system and start using it.

## Step 1: Set Up Supabase Database

1. Log into your Supabase dashboard: https://app.supabase.com
2. Select your project (rdmnoofiorrqkkbzilpu)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `server/setup_supabase_schema.sql`
6. Click **Run** to execute the SQL

This creates:

- `documents` table with vector support
- Embedding index for fast similarity search
- `match_documents` function for semantic search
- Row-level security policies

## Step 2: Install Python Dependencies

Open a terminal and run:

```bash
cd server
pip install -r requirements.txt
```

This installs:

- `supabase` - Supabase Python client
- `openai` - OpenAI API client
- `langchain` - Text splitting utilities
- `tiktoken` - Token counting
- Other dependencies

## Step 3: Ingest Your Documents

Run the ingestion script to process all markdown files:

```bash
python ingest_rag_documents.py
```

**Expected output:**

```
Starting RAG document ingestion from: C:\...\RAG_Docs

Found 44 markdown files
Processing: RAG_Docs\Core Training Knowledge\Injury prevention...
  ✓ Processed 5 chunks
...
Total chunks generated: ~500

Uploading chunks to Supabase...
  ✓ Uploaded batch 1 (100 chunks)
...
✓ Ingestion complete!
```

⏱️ **Time:** ~2-5 minutes (depends on number of documents)
💰 **Cost:** ~$0.05-0.15 (OpenAI embeddings)

## Step 4: Verify the Setup

Check that documents were ingested successfully:

```bash
python manage_rag_db.py
```

Select option 1 to count documents. You should see:

```
Total documents in database: 500+
```

## Step 5: Test the System

Run a test query:

```bash
python rag_query.py
```

This runs several test queries and shows relevant documents found.

## Step 6: Start Using the API

### Option A: Use Python Directly

```python
from rag_query import RAGQueryEngine

rag = RAGQueryEngine()

# Get an answer with context
answer = rag.query_with_llm(
    query="How do I prevent running injuries?",
    category="Core Training Knowledge"
)
print(answer)
```

### Option B: Use the REST API

1. Start the FastAPI server:

   ```bash
   cd server
   uvicorn app.main:app --reload
   ```

2. Make API requests:

   ```bash
   # Test the search endpoint
   curl -X POST http://localhost:8000/api/rag/search \
     -H "Content-Type: application/json" \
     -d '{"query": "injury prevention", "max_results": 3}'

   # Test the query endpoint
   curl -X POST http://localhost:8000/api/rag/query \
     -H "Content-Type: application/json" \
     -d '{"query": "How should I train in Singapore heat?"}'
   ```

3. View API docs: http://localhost:8000/docs

## Step 7: Integrate with Your Application

See `server/example_rag_integration.py` for a complete example of how to integrate RAG into your training plan generation.

Key integration points:

```python
# Import the RAG engine
from rag_query import RAGQueryEngine

# Initialize
rag = RAGQueryEngine(similarity_threshold=0.7, max_results=5)

# Get context for a specific topic
results = rag.search_documents(
    query="training periodization for marathon",
    category="Core Training Knowledge"
)

# Use context in LLM prompts
context = rag.get_context_for_query("recovery strategies")
# Add context to your existing LLM prompts
```

## Common Commands

### Manage Database

```bash
# Interactive database management
python manage_rag_db.py

# Options:
# 1. Count documents
# 2. List categories
# 3. Sample documents
# 4. Delete by category
# 5. Clear all documents
```

### Re-ingest Documents

```bash
# If you add/update markdown files
python ingest_rag_documents.py
```

### Test Integration

```bash
# Run the example integration
python example_rag_integration.py
```

## Available API Endpoints

Once the server is running:

| Endpoint              | Method | Description                   |
| --------------------- | ------ | ----------------------------- |
| `/api/rag/search`     | POST   | Search for relevant documents |
| `/api/rag/query`      | POST   | Get LLM answer with context   |
| `/api/rag/context`    | GET    | Get raw context for debugging |
| `/api/rag/categories` | GET    | List available categories     |

## Troubleshooting

### "Import could not be resolved" errors

These are just linting warnings. The code will work once you install dependencies:

```bash
pip install -r requirements.txt
```

### "Table documents does not exist"

Run the SQL setup script in Supabase (Step 1)

### "No results found"

- Lower the similarity threshold: `RAGQueryEngine(similarity_threshold=0.5)`
- Check documents were ingested: `python manage_rag_db.py`

### Rate limit errors (OpenAI)

- Add delays between requests
- Use smaller batch sizes in ingestion
- Check your OpenAI quota

## Next Steps

1. ✅ Complete setup steps above
2. ✅ Test with sample queries
3. 📝 Integrate into your training plan generation
4. 🎨 Create UI components to display sources
5. 📊 Add analytics to track query patterns
6. 🔄 Set up automatic re-ingestion when docs change

## Need Help?

- Check `RAG_SETUP.md` for detailed documentation
- Review `example_rag_integration.py` for code examples
- Test individual components with the Python scripts
- Use `manage_rag_db.py` to inspect the database

## Cost Monitoring

Monitor your costs:

- **Embeddings:** ~$0.0001 per 1K tokens
- **GPT-4 queries:** ~$0.01-0.05 per query
- **GPT-3.5 queries:** ~$0.001-0.005 per query

Consider:

- Caching frequent queries
- Using GPT-3.5-turbo for less critical queries
- Batch processing when possible
