# RAG (Retrieval-Augmented Generation) System Setup

This document explains how to set up and use the RAG system for RunBuddy's knowledge base.

## Overview

The RAG system allows the application to:

1. Store training knowledge from markdown files in a vector database (Supabase)
2. Retrieve relevant context based on user queries
3. Use LLMs to generate informed responses based on the knowledge base

## Architecture

```
RAG_Docs (Markdown files)
    ↓
ingest_rag_documents.py (Process & Embed)
    ↓
Supabase Vector Database
    ↓
rag_query.py (Search & Query)
    ↓
FastAPI Endpoints (api/rag.py)
    ↓
Client Application
```

## Setup Instructions

### 1. Set up Supabase Database Schema

First, you need to create the necessary tables and functions in Supabase.

**Option A: Using Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `server/setup_supabase_schema.sql`
4. Paste and run the SQL script

**Option B: Using Supabase CLI** (if installed)

```bash
supabase db push
```

### 2. Install Python Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
pip install -r requirements.txt
```

### 3. Verify Environment Variables

Make sure your `.env` file contains:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Ingest Documents

Run the ingestion script to process all markdown files and upload them to Supabase:

```bash
cd server
python ingest_rag_documents.py
```

This will:

- Scan the `RAG_Docs` directory for all `.md` files
- Split documents into chunks (1000 characters with 200 character overlap)
- Generate embeddings using OpenAI's `text-embedding-ada-002`
- Upload chunks and embeddings to Supabase

**Expected Output:**

```
Starting RAG document ingestion from: C:\...\RAG_Docs

Found 44 markdown files
Processing: RAG_Docs\Core Training Knowledge\...
  ✓ Processed 5 chunks
...

Total chunks generated: 523

Uploading 523 chunks to Supabase...
  ✓ Uploaded batch 1 (100 chunks)
  ✓ Uploaded batch 2 (100 chunks)
...

✓ Ingestion complete!
```

### 5. Test the RAG System

Test the query functionality:

```bash
cd server
python rag_query.py
```

This will run several test queries and show you the relevant documents found.

## Using the RAG System

### Python API

```python
from rag_query import RAGQueryEngine

# Initialize the engine
rag = RAGQueryEngine(similarity_threshold=0.7, max_results=5)

# Search for relevant documents
results = rag.search_documents("How to prevent running injuries?")

# Get formatted context
context = rag.get_context_for_query("What is the 10% rule?")

# Query with LLM
answer = rag.query_with_llm(
    query="How should I train in Singapore's heat?",
    category="SG Context"
)
```

### REST API Endpoints

Once your FastAPI server is running:

#### 1. Search Documents

```bash
POST http://localhost:8000/api/rag/search
Content-Type: application/json

{
  "query": "injury prevention",
  "category": "Core Training Knowledge",
  "max_results": 3
}
```

**Response:**

```json
[
  {
    "id": 123,
    "content": "...",
    "metadata": {
      "filename": "Preventing Running Injuries",
      "category": "Core Training Knowledge",
      "subcategory": "Injury prevention, Form, Cadence"
    },
    "similarity": 0.85
  }
]
```

#### 2. Query with LLM

```bash
POST http://localhost:8000/api/rag/query
Content-Type: application/json

{
  "query": "What are the best practices for preventing running injuries?",
  "model": "gpt-4"
}
```

**Response:**

```json
{
  "answer": "Based on the training documents...",
  "sources": [
    {
      "filename": "Preventing Running Injuries",
      "category": "Core Training Knowledge",
      "subcategory": "Injury prevention, Form, Cadence",
      "similarity": 0.85
    }
  ]
}
```

#### 3. Get Context (Debug)

```bash
GET http://localhost:8000/api/rag/context?query=heat+training&category=SG+Context
```

#### 4. List Categories

```bash
GET http://localhost:8000/api/rag/categories
```

**Response:**

```json
{
  "categories": {
    "Core Training Knowledge": [
      "Injury prevention, Form, Cadence",
      "Intensity zones, HR pace",
      "Nutrition & fueling",
      "Progression & load (10 % rule, ACWR)",
      "Recovery, HRV, Sleep",
      "Training periodisation, base-build-taper"
    ],
    "SG Context": [
      "Guidelines",
      "Heat and humidity adaptation",
      "Running routes",
      "Training Plan"
    ]
  }
}
```

## Configuration Options

### DocumentProcessor Parameters

```python
DocumentProcessor(
    chunk_size=1000,      # Size of each text chunk
    chunk_overlap=200     # Overlap between chunks
)
```

### RAGQueryEngine Parameters

```python
RAGQueryEngine(
    similarity_threshold=0.7,  # Minimum similarity (0-1)
    max_results=5              # Max documents to return
)
```

### Search Filters

You can filter searches by:

- **category**: Top-level category (e.g., "Core Training Knowledge", "SG Context")
- **subcategory**: Sub-category (e.g., "Injury prevention, Form, Cadence")

## Document Structure

The system extracts metadata from the file path:

```
RAG_Docs/
  Core Training Knowledge/        ← category
    Injury prevention.../         ← subcategory
      Running Safely.md           ← filename
```

Each chunk includes:

- **content**: Text content
- **metadata**:
  - `source`: Full file path
  - `filename`: File name without extension
  - `category`: Top-level folder
  - `subcategory`: Second-level folder
  - `chunk_index`: Position in document
  - `total_chunks`: Total chunks from document
- **embedding**: 1536-dimensional vector

## Adding New Documents

1. Add new `.md` files to the `RAG_Docs` directory
2. Re-run the ingestion script:
   ```bash
   python ingest_rag_documents.py
   ```

**Note:** The current script appends to existing data. To refresh completely:

1. Clear the `documents` table in Supabase
2. Re-run ingestion

## Updating Documents

To update existing documents:

1. Delete old entries from Supabase (filter by filename in metadata)
2. Re-run ingestion for those specific files, or
3. Clear entire table and re-ingest everything

## Troubleshooting

### Import Errors

If you see import errors, ensure you've installed dependencies:

```bash
pip install -r requirements.txt
```

### Supabase Connection Errors

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`
- Check that the schema has been created (run `setup_supabase_schema.sql`)

### OpenAI API Errors

- Verify `OPENAI_API_KEY` in `.env`
- Check API quota/billing

### No Results Found

- Lower the `similarity_threshold`
- Check that documents have been ingested
- Verify the query is relevant to document content

## Cost Estimation

**Ingestion Costs (One-time):**

- OpenAI Embeddings: ~$0.0001 per 1K tokens
- For 44 documents → ~500 chunks → ~$0.05-0.15

**Query Costs (Per query):**

- Embedding generation: ~$0.0001 per query
- LLM completion (if using `query_with_llm`):
  - GPT-4: ~$0.01-0.05 per query
  - GPT-3.5-turbo: ~$0.001-0.005 per query

## Best Practices

1. **Chunk Size**: Keep chunks large enough to be meaningful (800-1500 chars)
2. **Overlap**: Use overlap to avoid context loss at boundaries (150-300 chars)
3. **Similarity Threshold**: Start with 0.7, adjust based on results
4. **Categories**: Use category filters to narrow searches and improve relevance
5. **Caching**: Consider caching frequent queries to reduce API calls

## Future Enhancements

- [ ] Incremental updates (only process new/changed files)
- [ ] Multiple embedding models support
- [ ] Hybrid search (keyword + semantic)
- [ ] Query caching layer
- [ ] Analytics on query patterns
- [ ] Auto-categorization using LLMs
- [ ] Support for other document formats (PDF, DOCX)
