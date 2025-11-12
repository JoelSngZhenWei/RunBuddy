"""
Quick test script to verify RAG metrics tracking
Run this after you've generated some training plans or made RAG queries.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from rag_metrics import get_metrics_tracker


def test_metrics_basics():
    """Test basic metrics functionality."""
    print("\n" + "="*80)
    print("🧪 TESTING RAG METRICS SYSTEM")
    print("="*80)
    
    metrics = get_metrics_tracker()
    
    # Check if log file exists
    log_path = Path(metrics.log_file)
    print(f"\n📁 Log file location: {log_path}")
    print(f"   Exists: {'✅ Yes' if log_path.exists() else '❌ No (will be created on first query)'}")
    
    if log_path.exists():
        # Get file size
        size_bytes = log_path.stat().st_size
        size_kb = size_bytes / 1024
        print(f"   Size: {size_kb:.2f} KB")
        
        # Count entries
        with open(log_path, 'r', encoding='utf-8') as f:
            entries = len(f.readlines())
        print(f"   Total entries: {entries}")
        
        if entries > 0:
            print("\n" + "="*80)
            print("📊 CURRENT SESSION SUMMARY")
            print("="*80)
            summary = metrics.get_session_summary()
            for key, value in summary.items():
                print(f"   {key}: {value}")
            
            print("\n" + "="*80)
            print("📈 HISTORICAL ANALYSIS (ALL TIME)")
            print("="*80)
            analysis = metrics.analyze_logs()
            
            if "error" not in analysis:
                print(f"\n   Total Queries: {analysis['total_queries']}")
                print(f"   Total Documents: {analysis['total_documents_retrieved']}")
                print(f"   Avg Docs/Query: {analysis['avg_documents_per_query']:.2f}")
                
                print(f"\n   Similarity Scores:")
                sim = analysis['similarity_stats']
                print(f"      Average: {sim['overall_avg']:.4f} ({sim['overall_avg']*100:.2f}%)")
                print(f"      Max: {sim['max']:.4f}")
                print(f"      Min: {sim['min']:.4f}")
                
                if analysis['category_usage']:
                    print(f"\n   Category Usage:")
                    for cat, count in analysis['category_usage'].items():
                        print(f"      {cat}: {count}")
                
                if analysis['top_sources']:
                    print(f"\n   Top 5 Sources:")
                    for i, src in enumerate(analysis['top_sources'][:5], 1):
                        print(f"      {i}. {src['source']}: {src['count']} times")
                
                if analysis['queries_by_context']:
                    print(f"\n   Queries by Context:")
                    for ctx, count in analysis['queries_by_context'].items():
                        ctx_name = ctx if ctx else "Unspecified"
                        print(f"      {ctx_name}: {count}")
                
                print(f"\n   Time Range:")
                print(f"      First: {analysis['time_range']['first']}")
                print(f"      Last: {analysis['time_range']['last']}")
            else:
                print(f"\n   ⚠️ {analysis['error']}")
        else:
            print("\n   ℹ️ No queries logged yet")
    else:
        print("\n   ℹ️ No metrics logged yet. Metrics will be created when you:")
        print("      - Generate a training plan")
        print("      - Call the RAG API endpoints")
        print("      - Use the RAG query engine")
    
    print("\n" + "="*80)
    print("✅ TEST COMPLETE")
    print("="*80)
    print("\nTo generate test data:")
    print("   1. Generate a training plan in the app")
    print("   2. Or run: python server/rag_query.py")
    print("   3. Then run this test again to see metrics")
    print("\nTo view full metrics:")
    print("   python server/view_rag_metrics.py")
    print("\n")


if __name__ == "__main__":
    test_metrics_basics()
