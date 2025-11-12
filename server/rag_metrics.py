"""
RAG Metrics Tracker
Tracks and analyzes RAG retrieval performance and quality.
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
from collections import defaultdict


class RAGMetrics:
    """Track RAG retrieval metrics for analysis."""
    
    def __init__(self, log_file: Optional[str] = None):
        """
        Initialize metrics tracker.
        
        Args:
            log_file: Path to log file. If None, uses default in server/logs/
        """
        if log_file is None:
            log_dir = Path(__file__).parent.parent / "logs"
            log_dir.mkdir(exist_ok=True)
            log_file = str(log_dir / "rag_metrics.jsonl")
        
        self.log_file = log_file
        self.current_session = {
            "queries": [],
            "retrieval_stats": defaultdict(int),
            "similarity_scores": [],
            "categories_used": defaultdict(int),
        }
    
    def log_retrieval(
        self,
        query: str,
        results: List[Dict],
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        context: Optional[str] = None
    ):
        """
        Log a RAG retrieval event.
        
        Args:
            query: The search query
            results: List of retrieved documents with metadata
            category: Filter category used (if any)
            subcategory: Filter subcategory used (if any)
            context: Additional context (e.g., "training_plan", "user_query")
        """
        timestamp = datetime.utcnow().isoformat()
        
        # Extract metrics from results
        num_results = len(results)
        similarities = [r.get('similarity', 0) for r in results]
        
        avg_similarity = sum(similarities) / len(similarities) if similarities else 0
        max_similarity = max(similarities) if similarities else 0
        min_similarity = min(similarities) if similarities else 0
        
        # Track categories/sources
        sources = []
        categories_found = set()
        for r in results:
            metadata = r.get('metadata', {})
            if metadata.get('filename'):
                sources.append(metadata['filename'])
            if metadata.get('category'):
                categories_found.add(metadata['category'])
        
        # Build log entry
        log_entry = {
            "timestamp": timestamp,
            "query": query,
            "context": context,
            "filters": {
                "category": category,
                "subcategory": subcategory,
            },
            "results": {
                "count": num_results,
                "avg_similarity": round(avg_similarity, 4),
                "max_similarity": round(max_similarity, 4),
                "min_similarity": round(min_similarity, 4),
                "sources": sources,
                "categories": list(categories_found),
            }
        }
        
        # Update session stats
        self.current_session["queries"].append(query)
        self.current_session["retrieval_stats"]["total_retrievals"] += 1
        self.current_session["retrieval_stats"]["total_documents"] += num_results
        self.current_session["similarity_scores"].extend(similarities)
        
        if category:
            self.current_session["categories_used"][category] += 1
        
        # Write to log file
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(log_entry) + "\n")
        
        return log_entry
    
    def get_session_summary(self) -> Dict:
        """Get summary statistics for the current session."""
        similarities = self.current_session["similarity_scores"]
        
        return {
            "total_queries": len(self.current_session["queries"]),
            "total_retrievals": self.current_session["retrieval_stats"]["total_retrievals"],
            "total_documents_retrieved": self.current_session["retrieval_stats"]["total_documents"],
            "avg_documents_per_query": (
                self.current_session["retrieval_stats"]["total_documents"] / 
                max(self.current_session["retrieval_stats"]["total_retrievals"], 1)
            ),
            "similarity_stats": {
                "avg": round(sum(similarities) / len(similarities), 4) if similarities else 0,
                "max": round(max(similarities), 4) if similarities else 0,
                "min": round(min(similarities), 4) if similarities else 0,
            },
            "categories_used": dict(self.current_session["categories_used"]),
        }
    
    def analyze_logs(self, limit: Optional[int] = None) -> Dict:
        """
        Analyze all logged retrieval events.
        
        Args:
            limit: Maximum number of recent entries to analyze (None = all)
            
        Returns:
            Analysis dictionary with statistics
        """
        if not os.path.exists(self.log_file):
            return {"error": "No log file found"}
        
        entries = []
        with open(self.log_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))
        
        if limit:
            entries = entries[-limit:]
        
        if not entries:
            return {"error": "No entries found"}
        
        # Aggregate statistics
        total_queries = len(entries)
        total_docs = sum(e['results']['count'] for e in entries)
        all_similarities = []
        category_usage = defaultdict(int)
        source_usage = defaultdict(int)
        queries_by_context = defaultdict(int)
        
        for entry in entries:
            # Similarities
            all_similarities.append(entry['results']['avg_similarity'])
            
            # Category usage
            if entry['filters']['category']:
                category_usage[entry['filters']['category']] += 1
            
            # Source usage
            for source in entry['results']['sources']:
                source_usage[source] += 1
            
            # Context tracking
            if entry.get('context'):
                queries_by_context[entry['context']] += 1
        
        # Top sources
        top_sources = sorted(
            source_usage.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        return {
            "total_queries": total_queries,
            "total_documents_retrieved": total_docs,
            "avg_documents_per_query": round(total_docs / total_queries, 2),
            "similarity_stats": {
                "overall_avg": round(sum(all_similarities) / len(all_similarities), 4),
                "max": round(max(all_similarities), 4),
                "min": round(min(all_similarities), 4),
            },
            "category_usage": dict(category_usage),
            "top_sources": [
                {"source": source, "count": count}
                for source, count in top_sources
            ],
            "queries_by_context": dict(queries_by_context),
            "time_range": {
                "first": entries[0]['timestamp'],
                "last": entries[-1]['timestamp'],
            }
        }
    
    def print_summary(self):
        """Print a formatted summary of metrics."""
        summary = self.get_session_summary()
        
        print("\n" + "="*60)
        print("RAG RETRIEVAL METRICS - SESSION SUMMARY")
        print("="*60)
        print(f"Total Queries: {summary['total_queries']}")
        print(f"Total Documents Retrieved: {summary['total_documents_retrieved']}")
        print(f"Avg Documents per Query: {summary['avg_documents_per_query']:.2f}")
        print(f"\nSimilarity Scores:")
        print(f"  Average: {summary['similarity_stats']['avg']:.4f}")
        print(f"  Max: {summary['similarity_stats']['max']:.4f}")
        print(f"  Min: {summary['similarity_stats']['min']:.4f}")
        
        if summary['categories_used']:
            print(f"\nCategories Used:")
            for cat, count in summary['categories_used'].items():
                print(f"  {cat}: {count}")
        
        print("="*60)


# Global instance
_metrics_instance = None

def get_metrics_tracker() -> RAGMetrics:
    """Get or create the global metrics tracker instance."""
    global _metrics_instance
    if _metrics_instance is None:
        _metrics_instance = RAGMetrics()
    return _metrics_instance
