"""
Quick test to verify RAG integration is working
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("RAG Integration Verification")
print("=" * 60)

# Check environment variables
print("\n1. Checking Environment Variables...")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

if supabase_url:
    print(f"   ✅ SUPABASE_URL: {supabase_url[:30]}...")
else:
    print("   ❌ SUPABASE_URL: NOT SET")

if supabase_key:
    print(f"   ✅ SUPABASE_SERVICE_KEY: {'*' * 20}...")
else:
    print("   ❌ SUPABASE_SERVICE_KEY: NOT SET")

if openai_key:
    print(f"   ✅ OPENAI_API_KEY: {'*' * 20}...")
else:
    print("   ❌ OPENAI_API_KEY: NOT SET")

# Check if RAG can be imported
print("\n2. Checking RAG Module...")
try:
    from rag_query import RAGQueryEngine
    print("   ✅ RAGQueryEngine imported successfully")
    RAG_AVAILABLE = True
except ImportError as e:
    print(f"   ❌ Failed to import RAGQueryEngine: {e}")
    RAG_AVAILABLE = False

# Test RAG query if available
if RAG_AVAILABLE and supabase_url and supabase_key:
    print("\n3. Testing RAG Query...")
    try:
        rag_engine = RAGQueryEngine(similarity_threshold=0.6, max_results=3)
        results = rag_engine.search_documents("training plan for half marathon")
        
        if results and len(results) > 0:
            print(f"   ✅ RAG query successful: Found {len(results)} results")
            print(f"   ✅ First result similarity: {results[0].get('similarity', 0):.2%}")
        else:
            print("   ⚠️  RAG query returned no results")
            print("   💡 This might mean documents are not ingested yet")
    except Exception as e:
        print(f"   ❌ RAG query failed: {e}")
        print("   💡 Check your Supabase connection and database setup")

# Check backend integration
print("\n4. Checking Backend Integration...")
try:
    from app.core.config import settings
    from app.graphs.runbuddy_graph import RAG_AVAILABLE as GRAPH_RAG_AVAILABLE
    
    if GRAPH_RAG_AVAILABLE:
        print("   ✅ RAG is available in runbuddy_graph.py")
    else:
        print("   ❌ RAG is NOT available in runbuddy_graph.py")
    
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY:
        print("   ✅ Supabase settings are configured in backend")
    else:
        print("   ❌ Supabase settings are NOT configured in backend")
except Exception as e:
    print(f"   ⚠️  Could not check backend integration: {e}")

# Summary
print("\n" + "=" * 60)
print("Summary")
print("=" * 60)

if supabase_url and supabase_key and openai_key and RAG_AVAILABLE:
    print("✅ RAG Integration: READY")
    print("\nTo test:")
    print("1. Start the backend server: uvicorn app.main:app --reload")
    print("2. Generate a training plan from the frontend")
    print("3. Check backend logs for: '🔍 Retrieving RAG context...'")
    print("4. Look for: '✅ Retrieved X relevant context chunks from RAG'")
else:
    print("❌ RAG Integration: NOT READY")
    print("\nMissing requirements:")
    if not supabase_url:
        print("  - SUPABASE_URL in .env")
    if not supabase_key:
        print("  - SUPABASE_SERVICE_KEY in .env")
    if not openai_key:
        print("  - OPENAI_API_KEY in .env")
    if not RAG_AVAILABLE:
        print("  - RAG module dependencies (run: pip install -r requirements.txt)")

print("\n" + "=" * 60)

