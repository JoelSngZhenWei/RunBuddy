"""
RAG Query Module (PostgREST version)
- Queries Supabase (PostgREST /rest/v1) without the Supabase Python SDK
- Embeds queries with OpenAI text-embedding-3-small (1536-dim)
- Calls the SQL RPC: public.match_documents(query_embedding, match_threshold, match_count)
"""

import os
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
from postgrest import SyncPostgrestClient
from openai import OpenAI

# -------------------------
# Env & clients
# -------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")             # e.g. https://xxxx.supabase.co
SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_KEY")     # service role key (secret!)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SERVICE_KEY or not OPENAI_API_KEY:
    raise RuntimeError("Missing SUPABASE_URL / SUPABASE_SERVICE_KEY / OPENAI_API_KEY in .env")

# PostgREST client talks straight to REST (no websockets/auth client)
pg = SyncPostgrestClient(
    f"{SUPABASE_URL}/rest/v1",
    headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Accept-Profile": "public",
        "Content-Profile": "public",
        "Prefer": "return=representation",
    },
)

openai_client = OpenAI(api_key=OPENAI_API_KEY)


class RAGQueryEngine:
    def __init__(self, similarity_threshold: float = 0.7, max_results: int = 5):
        """
        Args:
            similarity_threshold: Minimum similarity score for results (0–1)
            max_results: Max number of chunks to return
        """
        self.similarity_threshold = similarity_threshold
        self.max_results = max_results

    # -------------------------
    # Embeddings
    # -------------------------
    def generate_query_embedding(self, query: str) -> List[float]:
        """
        Create a 1536-dim embedding using OpenAI text-embedding-3-small
        """
        resp = openai_client.embeddings.create(
            input=query,
            model="text-embedding-3-small",  # 1536-dim (matches vector(1536))
        )
        return resp.data[0].embedding

    # -------------------------
    # Search
    # -------------------------
    def search_documents(
        self,
        query: str,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        similarity_threshold: Optional[float] = None,
        max_results: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Calls public.match_documents via PostgREST RPC, then optionally filters by metadata
        """
        threshold = float(similarity_threshold if similarity_threshold is not None else self.similarity_threshold)
        limit = int(max_results if max_results is not None else self.max_results)

        q_emb = self.generate_query_embedding(query)

        # RPC: match_documents(query_embedding vector, match_threshold float, match_count int)
        resp = pg.rpc(
            "match_documents",
            {
                "query_embedding": q_emb,
                "match_threshold": threshold,
                "match_count": limit,
            },
                        ).execute()

        results: List[Dict[str, Any]] = resp.data or []

        # Optional metadata filters
        if category or subcategory:
            filtered = []
            for r in results:
                md = r.get("metadata", {}) or {}
                if category and md.get("category") != category:
                    continue
                if subcategory and md.get("subcategory") != subcategory:
                    continue
                filtered.append(r)
            results = filtered

        return results

    # -------------------------
    # Context building for LLM
    # -------------------------
    def get_context_for_query(
        self,
        query: str,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
    ) -> str:
        results = self.search_documents(query, category, subcategory)

        if not results:
            return "No relevant context found."

        parts: List[str] = []
        for i, r in enumerate(results, 1):
            md = r.get("metadata", {}) or {}
            content = r.get("content", "") or ""
            sim = r.get("similarity", 0.0) or 0.0

            source = f"Source: {md.get('filename', 'Unknown')}"
            if md.get("category"):
                seg = f" ({md['category']}"
                if md.get("subcategory"):
                    seg += f" > {md['subcategory']}"
                seg += ")"
                source += seg

            parts.append(
                f"[Document {i}] {source}\n"
                f"Relevance: {sim:.2%}\n"
                f"{content}\n"
            )

        return "\n---\n".join(parts)

    # -------------------------
    # Full RAG answer with LLM
    # -------------------------
    def query_with_llm(
        self,
        query: str,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        system_prompt: Optional[str] = None,
        model: str = "gpt-4o-mini",
        temperature: float = 0.3,
        max_tokens: int = 900,
    ) -> str:
        """
        Retrieve context then ask the LLM to answer grounded in that context.
        """
        context = self.get_context_for_query(query, category, subcategory)

        if system_prompt is None:
            system_prompt = (
                "You are a knowledgeable running coach assistant. "
                "Use ONLY the provided context from training documents to answer. "
                "Cite which document each key fact comes from (e.g., [Document 1]). "
                "If the context doesn't contain the answer, say so."
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
        ]

        resp = openai_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return resp.choices[0].message.content


# -------------------------
# CLI smoke test
# -------------------------
def test_rag_system():
    rag = RAGQueryEngine(similarity_threshold=0.7, max_results=3)

    test_queries = [
        "What are the best practices for preventing running injuries?",
        "How should I adapt my training for Singapore's heat and humidity?",
        "What is the 10% rule in running training?",
        "What are some good running routes in Singapore?",
    ]

    print("Testing RAG Query System\n" + "=" * 80)

    for q in test_queries:
        print(f"\nQuery: {q}")
        print("-" * 80)
        rows = rag.search_documents(q)
        if rows:
            print(f"Found {len(rows)} relevant chunks:\n")
            for i, r in enumerate(rows, 1):
                md = r.get("metadata", {}) or {}
                sim = r.get("similarity", 0.0) or 0.0
                print(f"{i}. {md.get('filename', 'Unknown')} "
                      f"({md.get('category', 'N/A')} > {md.get('subcategory', 'N/A')}) "
                      f"- Similarity: {sim:.2%}")
        else:
            print("No relevant documents found.")
        print("\n" + "=" * 80)


if __name__ == "__main__":
    test_rag_system()
