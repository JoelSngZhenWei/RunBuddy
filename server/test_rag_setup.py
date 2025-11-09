"""
Test script to verify Supabase connection and schema setup.
Run this before ingesting documents to ensure everything is configured correctly.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()


def test_connection():
    """Test basic connection to Supabase."""
    print("Testing Supabase connection...")
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file")
        return False
    
    try:
        supabase: Client = create_client(url, key)
        print("✅ Successfully connected to Supabase")
        return supabase
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {str(e)}")
        return False


def test_table_exists(supabase: Client):
    """Test if the documents table exists."""
    print("\nTesting documents table...")
    
    try:
        response = supabase.table("documents").select("id").limit(1).execute()
        print("✅ Documents table exists")
        return True
    except Exception as e:
        print(f"❌ Documents table not found: {str(e)}")
        print("\n💡 Run the SQL setup script in Supabase:")
        print("   1. Go to Supabase Dashboard > SQL Editor")
        print("   2. Run the script from: server/setup_supabase_schema.sql")
        return False


def test_vector_extension(supabase: Client):
    """Test if pgvector extension is enabled."""
    print("\nTesting pgvector extension...")
    
    try:
        # Try to query with vector operations
        result = supabase.rpc(
            'match_documents',
            {
                'query_embedding': [0.0] * 1536,
                'match_threshold': 0.0,
                'match_count': 1
            }
        ).execute()
        print("✅ pgvector extension is enabled")
        print("✅ match_documents function exists")
        return True
    except Exception as e:
        error_msg = str(e).lower()
        if "function" in error_msg and "does not exist" in error_msg:
            print("❌ match_documents function not found")
            print("\n💡 Run the SQL setup script to create the function")
        elif "extension" in error_msg:
            print("❌ pgvector extension not enabled")
            print("\n💡 Enable pgvector extension in Supabase:")
            print("   1. Go to Database > Extensions")
            print("   2. Search for 'vector'")
            print("   3. Enable pgvector extension")
        else:
            print(f"❌ Error testing vector operations: {str(e)}")
        return False


def test_openai_key():
    """Test if OpenAI API key is configured."""
    print("\nTesting OpenAI API key...")
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ Missing OPENAI_API_KEY in .env file")
        return False
    
    if not api_key.startswith("sk-"):
        print("⚠️  OPENAI_API_KEY format looks incorrect (should start with 'sk-')")
        return False
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        # Test with a minimal request
        response = client.embeddings.create(
            input="test",
            model="text-embedding-ada-002"
        )
        
        if response.data and len(response.data[0].embedding) == 1536:
            print("✅ OpenAI API key is valid")
            print(f"✅ Embeddings API working (dimension: {len(response.data[0].embedding)})")
            return True
        else:
            print("⚠️  Unexpected response from OpenAI API")
            return False
            
    except Exception as e:
        print(f"❌ Error testing OpenAI API: {str(e)}")
        return False


def test_file_access():
    """Test if RAG_Docs directory is accessible."""
    print("\nTesting RAG_Docs directory access...")
    
    from pathlib import Path
    
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    rag_docs_dir = project_root / "RAG_Docs"
    
    if not rag_docs_dir.exists():
        print(f"❌ RAG_Docs directory not found at: {rag_docs_dir}")
        return False
    
    md_files = list(rag_docs_dir.rglob("*.md"))
    
    if not md_files:
        print(f"⚠️  No markdown files found in {rag_docs_dir}")
        return False
    
    print(f"✅ RAG_Docs directory found at: {rag_docs_dir}")
    print(f"✅ Found {len(md_files)} markdown files")
    
    # Show some examples
    print("\nSample files:")
    for f in md_files[:5]:
        rel_path = f.relative_to(rag_docs_dir)
        print(f"   - {rel_path}")
    
    if len(md_files) > 5:
        print(f"   ... and {len(md_files) - 5} more")
    
    return True


def test_dependencies():
    """Test if required Python packages are installed."""
    print("\nTesting Python dependencies...")
    
    required_packages = [
        ("supabase", "supabase"),
        ("openai", "openai"),
        ("langchain", "langchain"),
        ("tiktoken", "tiktoken"),
        ("dotenv", "python-dotenv"),
    ]
    
    all_installed = True
    for package_name, import_name in required_packages:
        try:
            __import__(import_name)
            print(f"✅ {package_name} installed")
        except ImportError:
            print(f"❌ {package_name} not installed")
            all_installed = False
    
    if not all_installed:
        print("\n💡 Install missing packages:")
        print("   cd server")
        print("   pip install -r requirements.txt")
    
    return all_installed


def main():
    """Run all tests."""
    print("=" * 60)
    print("RAG System Setup Verification")
    print("=" * 60)
    
    results = {
        "Dependencies": test_dependencies(),
        "Environment Variables": True,
        "Supabase Connection": False,
        "Documents Table": False,
        "Vector Extension": False,
        "OpenAI API": False,
        "RAG_Docs Access": test_file_access(),
    }
    
    # Test Supabase connection
    supabase = test_connection()
    if supabase:
        results["Supabase Connection"] = True
        results["Documents Table"] = test_table_exists(supabase)
        results["Vector Extension"] = test_vector_extension(supabase)
    
    # Test OpenAI
    results["OpenAI API"] = test_openai_key()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All tests passed! You're ready to ingest documents.")
        print("\nNext steps:")
        print("1. Run: python ingest_rag_documents.py")
        print("2. Test: python rag_query.py")
    else:
        print("⚠️  Some tests failed. Please fix the issues above before proceeding.")
        print("\nCommon fixes:")
        print("- Install dependencies: pip install -r requirements.txt")
        print("- Run SQL setup in Supabase Dashboard")
        print("- Check .env file has all required keys")
    print("=" * 60)


if __name__ == "__main__":
    main()
