# RAG System Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAG SYSTEM ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   RAG_Docs/      │  44 Markdown Files
│   ├─ Core        │  - Training Knowledge
│   │  Training    │  - Nutrition & Fueling
│   │  Knowledge   │  - Injury Prevention
│   └─ SG Context  │  - Singapore Routes
└────────┬─────────┘
         │
         │ [1. INGESTION PHASE]
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  ingest_rag_documents.py                                 │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │  Read MD    │──▶│ Chunk Text   │──▶│  Generate    │  │
│  │  Files      │   │ (1000 chars) │   │  Embeddings  │  │
│  └─────────────┘   └──────────────┘   └──────┬───────┘  │
│                                               │          │
│  Extract Metadata (category, source, etc.)    │          │
└───────────────────────────────────────────────┼──────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │   OpenAI API          │
                                    │   text-embedding-     │
                                    │   ada-002             │
                                    │                       │
                                    │   Vector: [1536 dims] │
                                    └──────────┬────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  documents table                                       │  │
│  │  ┌────┬──────────┬──────────┬─────────────────────┐   │  │
│  │  │ id │ content  │ metadata │ embedding (vector)  │   │  │
│  │  ├────┼──────────┼──────────┼─────────────────────┤   │  │
│  │  │ 1  │ "..."    │ {...}    │ [0.1, 0.2, ...]     │   │  │
│  │  │ 2  │ "..."    │ {...}    │ [0.3, 0.1, ...]     │   │  │
│  │  │... │ ...      │ ...      │ ...                 │   │  │
│  │  └────┴──────────┴──────────┴─────────────────────┘   │  │
│  │                                                         │  │
│  │  Index: ivfflat (vector_cosine_ops)                    │  │
│  │  Function: match_documents(query_embedding, ...)       │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ [2. QUERY PHASE]
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
    ┌─────────────────────┐   ┌──────────────────────┐
    │  Python API         │   │  REST API            │
    │  (rag_query.py)     │   │  (app/api/rag.py)    │
    │                     │   │                      │
    │  RAGQueryEngine     │   │  POST /api/rag/      │
    │  - search_docs()    │   │  - search            │
    │  - query_with_llm() │   │  - query             │
    │  - get_context()    │   │  - context           │
    └──────────┬──────────┘   └──────────┬───────────┘
               │                         │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │   Your Application      │
               │   - Training Plans      │
               │   - Q&A System          │
               │   - Route Suggestions   │
               └─────────────────────────┘
```

## Query Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      QUERY FLOW                              │
└─────────────────────────────────────────────────────────────┘

User Query: "How to prevent running injuries?"
    │
    ▼
┌─────────────────────────────────────────────┐
│  Step 1: Generate Query Embedding           │
│  ─────────────────────────────────────────  │
│  OpenAI API: text-embedding-ada-002         │
│  Input: "How to prevent running injuries?"  │
│  Output: [0.123, -0.456, 0.789, ...]       │
│           (1536 dimensions)                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Step 2: Semantic Search in Supabase        │
│  ─────────────────────────────────────────  │
│  Function: match_documents()                │
│  • Calculate cosine similarity              │
│  • Filter by threshold (e.g., 0.7)          │
│  • Sort by similarity score                 │
│  • Return top N results (e.g., 5)           │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Step 3: Retrieve Relevant Chunks           │
│  ─────────────────────────────────────────  │
│  Result 1: similarity=0.85                  │
│  • content: "..."                           │
│  • metadata: {                              │
│      filename: "Preventing Injuries",       │
│      category: "Core Training Knowledge"    │
│    }                                        │
│                                             │
│  Result 2: similarity=0.78                  │
│  • content: "..."                           │
│  • metadata: {...}                          │
│  ...                                        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Step 4: Format Context for LLM             │
│  ─────────────────────────────────────────  │
│  Combine chunks into context:               │
│                                             │
│  [Document 1] Preventing Injuries           │
│  Relevance: 85%                             │
│  Content: "..."                             │
│  ---                                        │
│  [Document 2] Running Form                  │
│  Relevance: 78%                             │
│  Content: "..."                             │
│  ...                                        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Step 5: Generate LLM Response              │
│  ─────────────────────────────────────────  │
│  OpenAI API: GPT-4 or GPT-3.5-turbo         │
│                                             │
│  System Prompt:                             │
│  "You are a knowledgeable running coach..." │
│                                             │
│  User Prompt:                               │
│  "Context: [formatted context]              │
│   Question: How to prevent injuries?"       │
│                                             │
│  Response:                                  │
│  "Based on the training documents, here     │
│   are key injury prevention strategies:     │
│   1. Gradual progression (10% rule)...      │
│   [Document: Preventing Injuries]           │
│   2. Proper form and cadence...             │
│   [Document: Running Form]                  │
│   ..."                                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         Return to User with Citations
```

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                   INGESTION DATA FLOW                          │
└────────────────────────────────────────────────────────────────┘

RAG_Docs/Core Training Knowledge/Injury prevention.../file.md
│
├─ Content: "Running injuries can be prevented through..."
│  (2500 characters)
│
└─ Metadata:
   ├─ source: "C:\...\file.md"
   ├─ filename: "Preventing Running Injuries"
   ├─ category: "Core Training Knowledge"
   └─ subcategory: "Injury prevention, Form, Cadence"

         ↓ [Text Splitter]

┌──────────────────────────┐  ┌──────────────────────────┐
│ Chunk 1                  │  │ Chunk 2                  │
├──────────────────────────┤  ├──────────────────────────┤
│ content: "Running inj... │  │ content: "...through pr..│
│ (1000 chars)             │  │ (1000 chars)             │
│                          │  │                          │
│ metadata:                │  │ metadata:                │
│  • source: "..."         │  │  • source: "..."         │
│  • filename: "..."       │  │  • filename: "..."       │
│  • category: "..."       │  │  • category: "..."       │
│  • chunk_index: 0        │  │  • chunk_index: 1        │
│  • total_chunks: 3       │  │  • total_chunks: 3       │
└──────────────────────────┘  └──────────────────────────┘
         ↓                             ↓
    [Embed]                       [Embed]
         ↓                             ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│ embedding:               │  │ embedding:               │
│ [0.123, -0.456, 0.789,   │  │ [0.321, 0.654, -0.987,   │
│  ..., 0.234]             │  │  ..., 0.432]             │
│ (1536 dims)              │  │ (1536 dims)              │
└──────────────────────────┘  └──────────────────────────┘
         ↓                             ↓
         └──────────┬──────────────────┘
                    ↓
            [Upload to Supabase]
                    ↓
        ┌───────────────────────┐
        │  documents table      │
        │  • id: 1              │
        │  • id: 2              │
        │  ...                  │
        └───────────────────────┘
```

## Component Interactions

```
┌──────────────────────────────────────────────────────────┐
│             COMPONENT INTERACTION DIAGRAM                 │
└──────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │
         │ HTTP Request
         │ POST /api/rag/query
         │ {query: "..."}
         ▼
┌──────────────────────────────────┐
│   FastAPI Backend                │
│   ┌────────────────────────────┐ │
│   │  /api/rag/query endpoint   │ │
│   │  (app/api/rag.py)          │ │
│   └──────────┬─────────────────┘ │
└──────────────┼───────────────────┘
               │
               │ Calls
               ▼
┌──────────────────────────────────┐
│   RAGQueryEngine                 │
│   (rag_query.py)                 │
│   ┌────────────────────────────┐ │
│   │ 1. generate_query_embed()  │ │─┐
│   └────────────────────────────┘ │ │
│   ┌────────────────────────────┐ │ │
│   │ 2. search_documents()      │ │ │
│   └────────────────────────────┘ │ │
│   ┌────────────────────────────┐ │ │
│   │ 3. query_with_llm()        │ │ │
│   └────────────────────────────┘ │ │
└──────────────────────────────────┘ │
                                     │
         ┌───────────────────────────┼──────────────┐
         │                           │              │
         ▼                           ▼              ▼
┌────────────────┐        ┌──────────────┐  ┌─────────────┐
│  OpenAI API    │        │  Supabase    │  │  OpenAI API │
│  Embeddings    │        │  Vector DB   │  │  Chat       │
│                │        │              │  │  Completion │
│  text-embed... │        │  match_      │  │  GPT-4      │
│                │        │  documents() │  │             │
└────────┬───────┘        └──────┬───────┘  └─────┬───────┘
         │                       │                │
         │ Embedding             │ Documents      │ Answer
         │ [1536 dims]           │ with scores    │ + sources
         │                       │                │
         └───────────────────────┴────────────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │   Response     │
                        │   {            │
                        │     answer,    │
                        │     sources    │
                        │   }            │
                        └────────┬───────┘
                                 │
                                 ▼
                          Back to Frontend
```

## File Organization

```
RunBuddy/
│
├── RAG_Docs/                    # Source documents
│   ├── Core Training Knowledge/
│   └── SG Context/
│
├── server/
│   ├── requirements.txt         # Updated with RAG deps
│   ├── setup_supabase_schema.sql # DB schema
│   │
│   ├── ingest_rag_documents.py  # Ingestion script
│   ├── rag_query.py             # Query engine
│   ├── manage_rag_db.py         # DB management
│   ├── test_rag_setup.py        # Setup verification
│   ├── example_rag_integration.py # Integration example
│   │
│   └── app/
│       ├── main.py              # Updated with RAG router
│       └── api/
│           └── rag.py           # New RAG endpoints
│
├── RAG_SETUP.md                 # Comprehensive guide
├── QUICKSTART_RAG.md            # Quick start guide
└── RAG_IMPLEMENTATION_SUMMARY.md # This summary
```

## Technology Stack

```
┌────────────────────────────────────────────────┐
│              TECHNOLOGY STACK                   │
└────────────────────────────────────────────────┘

Backend:
  • Python 3.x
  • FastAPI
  • Supabase Python Client
  • OpenAI Python SDK
  • LangChain (text splitting)

Database:
  • Supabase (PostgreSQL)
  • pgvector extension
  • Vector indexes (ivfflat)

AI/ML:
  • OpenAI text-embedding-ada-002
  • OpenAI GPT-4 / GPT-3.5-turbo
  • Cosine similarity search

Integration:
  • REST API endpoints
  • JSON request/response
  • CORS enabled for Next.js
```
