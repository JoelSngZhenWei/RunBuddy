"""
View and analyze RAG retrieval metrics
Run this script to see analytics about your RAG system performance.
"""

import sys
from pathlib import Path
from rag_metrics import RAGMetrics
import json


def print_detailed_analysis():
    """Print a comprehensive analysis of RAG metrics."""
    metrics = RAGMetrics()
    
    # Check if log file exists
    if not Path(metrics.log_file).exists():
        print("❌ No metrics log file found.")
        print(f"Expected location: {metrics.log_file}")
        print("\nMetrics will be created automatically when you:")
        print("  1. Run RAG queries through the API")
        print("  2. Generate training plans (which use RAG)")
        print("  3. Use the /api/rag/search or /api/rag/query endpoints")
        return
    
    # Get overall analysis
    analysis = metrics.analyze_logs()
    
    if "error" in analysis:
        print(f"❌ Error: {analysis['error']}")
        return
    
    print("\n" + "="*80)
    print("📊 RAG RETRIEVAL METRICS - COMPREHENSIVE ANALYSIS")
    print("="*80)
    
    # Overall stats
    print(f"\n📈 OVERALL STATISTICS")
    print(f"   Total Queries: {analysis['total_queries']}")
    print(f"   Total Documents Retrieved: {analysis['total_documents_retrieved']}")
    print(f"   Avg Documents/Query: {analysis['avg_documents_per_query']:.2f}")
    
    # Similarity scores
    print(f"\n🎯 SIMILARITY SCORES")
    sim = analysis['similarity_stats']
    print(f"   Average: {sim['overall_avg']:.4f} ({sim['overall_avg']*100:.2f}%)")
    print(f"   Maximum: {sim['max']:.4f} ({sim['max']*100:.2f}%)")
    print(f"   Minimum: {sim['min']:.4f} ({sim['min']*100:.2f}%)")
    
    # Category usage
    if analysis['category_usage']:
        print(f"\n📁 CATEGORY USAGE")
        for cat, count in sorted(analysis['category_usage'].items(), key=lambda x: x[1], reverse=True):
            print(f"   {cat}: {count} queries")
    
    # Top sources
    if analysis['top_sources']:
        print(f"\n📚 TOP 10 MOST REFERENCED SOURCES")
        for i, source_info in enumerate(analysis['top_sources'], 1):
            print(f"   {i:2d}. {source_info['source']}: {source_info['count']} retrievals")
    
    # Query patterns
    if analysis['queries_by_context']:
        print(f"\n🔍 QUERIES BY CONTEXT")
        for context, count in sorted(analysis['queries_by_context'].items(), key=lambda x: x[1], reverse=True):
            context_name = context if context else "Unspecified"
            print(f"   {context_name}: {count} queries")
    
    # Time range
    print(f"\n⏰ TIME RANGE")
    print(f"   First Query: {analysis['time_range']['first']}")
    print(f"   Last Query:  {analysis['time_range']['last']}")
    
    print("\n" + "="*80)


def print_recent_queries(n: int = 10):
    """Print the most recent N queries."""
    metrics = RAGMetrics()
    
    if not Path(metrics.log_file).exists():
        print("❌ No metrics log file found.")
        return
    
    entries = []
    with open(metrics.log_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                entries.append(json.loads(line))
    
    if not entries:
        print("No queries found in log.")
        return
    
    recent = entries[-n:]
    
    print("\n" + "="*80)
    print(f"📝 LAST {len(recent)} QUERIES")
    print("="*80)
    
    for i, entry in enumerate(reversed(recent), 1):
        print(f"\n{i}. Query: {entry['query']}")
        print(f"   Time: {entry['timestamp']}")
        if entry.get('context'):
            print(f"   Context: {entry['context']}")
        if entry['filters']['category']:
            print(f"   Category Filter: {entry['filters']['category']}")
        
        results = entry['results']
        print(f"   Results: {results['count']} documents")
        print(f"   Avg Similarity: {results['avg_similarity']:.4f} ({results['avg_similarity']*100:.2f}%)")
        
        if results['sources']:
            print(f"   Sources: {', '.join(results['sources'][:3])}")
            if len(results['sources']) > 3:
                print(f"            ... and {len(results['sources']) - 3} more")
        
        print("   " + "-"*76)
    
    print("="*80)


def export_metrics_to_json(output_file: str = "rag_metrics_export.json"):
    """Export all metrics to a JSON file."""
    metrics = RAGMetrics()
    
    if not Path(metrics.log_file).exists():
        print("❌ No metrics log file found.")
        return
    
    analysis = metrics.analyze_logs()
    
    output_path = Path(__file__).parent / output_file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2)
    
    print(f"✅ Metrics exported to: {output_path}")


def main():
    """Main function to display metrics."""
    import argparse
    
    parser = argparse.ArgumentParser(description="View RAG retrieval metrics")
    parser.add_argument(
        '--recent', '-r',
        type=int,
        metavar='N',
        help='Show N most recent queries (default: 10)'
    )
    parser.add_argument(
        '--export', '-e',
        action='store_true',
        help='Export metrics to JSON file'
    )
    
    args = parser.parse_args()
    
    if args.export:
        export_metrics_to_json()
    elif args.recent:
        print_recent_queries(args.recent)
    else:
        # Default: show full analysis
        print_detailed_analysis()
        print("\n💡 TIP: Use --recent N to see recent queries, or --export to save metrics")


if __name__ == "__main__":
    main()
