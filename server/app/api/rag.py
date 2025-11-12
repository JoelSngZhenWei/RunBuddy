"""
RAG API endpoints for querying the knowledge base
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
import sys
from pathlib import Path

# Add parent directory to path to import rag_query
sys.path.append(str(Path(__file__).parent.parent.parent))
from rag_query import RAGQueryEngine
from rag_metrics import get_metrics_tracker

router = APIRouter(prefix="/api/rag", tags=["rag"])

# Initialize RAG engine
rag_engine = RAGQueryEngine(similarity_threshold=0.7, max_results=5)


class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    category: Optional[str] = Field(None, description="Filter by category")
    subcategory: Optional[str] = Field(None, description="Filter by subcategory")
    similarity_threshold: Optional[float] = Field(None, ge=0, le=1, description="Minimum similarity score")
    max_results: Optional[int] = Field(None, ge=1, le=20, description="Maximum number of results")
    context: Optional[str] = Field(None, description="Context for tracking (e.g., 'training_plan', 'user_query')")


class QueryRequest(BaseModel):
    query: str = Field(..., description="User question")
    category: Optional[str] = Field(None, description="Filter by category")
    subcategory: Optional[str] = Field(None, description="Filter by subcategory")
    system_prompt: Optional[str] = Field(None, description="Custom system prompt for LLM")
    model: str = Field("gpt-4", description="OpenAI model to use")


class SearchResult(BaseModel):
    id: int
    content: str
    metadata: dict
    similarity: float


class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]


@router.post("/search", response_model=List[SearchResult])
async def search_documents(request: SearchRequest):
    """
    Search for relevant documents in the knowledge base.
    
    Returns a list of document chunks with similarity scores.
    """
    try:
        results = rag_engine.search_documents(
            query=request.query,
            category=request.category,
            subcategory=request.subcategory,
            similarity_threshold=request.similarity_threshold,
            max_results=request.max_results,
            context=request.context
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query", response_model=QueryResponse)
async def query_with_context(request: QueryRequest):
    """
    Query the knowledge base and get an LLM-generated response.
    
    This endpoint retrieves relevant context and uses an LLM to generate
    a comprehensive answer to the user's question.
    """
    try:
        # Get answer from RAG system
        answer = rag_engine.query_with_llm(
            query=request.query,
            category=request.category,
            subcategory=request.subcategory,
            system_prompt=request.system_prompt,
            model=request.model
        )
        
        # Get source documents
        sources = rag_engine.search_documents(
            query=request.query,
            category=request.category,
            subcategory=request.subcategory
        )
        
        # Format sources for response
        formatted_sources = [
            {
                "filename": source.get("metadata", {}).get("filename"),
                "category": source.get("metadata", {}).get("category"),
                "subcategory": source.get("metadata", {}).get("subcategory"),
                "similarity": source.get("similarity")
            }
            for source in sources
        ]
        
        return {
            "answer": answer,
            "sources": formatted_sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/context")
async def get_context(
    query: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    subcategory: Optional[str] = Query(None, description="Filter by subcategory")
):
    """
    Get formatted context for a query without LLM processing.
    
    Useful for debugging or when you want to see the raw context
    that would be provided to the LLM.
    """
    try:
        context = rag_engine.get_context_for_query(
            query=query,
            category=category,
            subcategory=subcategory
        )
        return {"context": context}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_categories():
    """
    Get available categories and subcategories from the knowledge base.
    """
    try:
        # Query Supabase for unique categories
        from rag_query import supabase
        
        response = supabase.table("documents").select("metadata").execute()
        
        categories = {}
        for doc in response.data:
            metadata = doc.get("metadata", {})
            cat = metadata.get("category")
            subcat = metadata.get("subcategory")
            
            if cat:
                if cat not in categories:
                    categories[cat] = set()
                if subcat:
                    categories[cat].add(subcat)
        
        # Convert sets to lists for JSON serialization
        categories = {k: list(v) for k, v in categories.items()}
        
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_rag_metrics(limit: Optional[int] = Query(None, description="Limit analysis to recent N queries")):
    """
    Get RAG retrieval metrics and analytics.
    
    Returns statistics about:
    - Total queries and documents retrieved
    - Average similarity scores
    - Most used categories and sources
    - Query patterns by context
    """
    try:
        metrics = get_metrics_tracker()
        analysis = metrics.analyze_logs(limit=limit)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/session")
async def get_session_metrics():
    """
    Get metrics for the current session.
    
    Returns real-time statistics about queries made since the server started.
    """
    try:
        metrics = get_metrics_tracker()
        summary = metrics.get_session_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
