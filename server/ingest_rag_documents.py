"""
RAG Document Ingestion Script (PostgREST version)
- Recursively reads markdown files under RAG_Docs/
- Chunks with LangChain RecursiveCharacterTextSplitter
- Embeds with OpenAI text-embedding-3-small (1536-dim)
- Inserts rows into Supabase (public.documents) via PostgREST
"""

import os
from pathlib import Path
from typing import List, Dict, Any

from dotenv import load_dotenv
from postgrest import SyncPostgrestClient
from openai import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter

# =========================
# Environment & Clients
# =========================
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")                  # e.g. https://xxxx.supabase.co
SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_KEY")          # service role key (secret!)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SERVICE_KEY or not OPENAI_API_KEY:
    raise RuntimeError("Missing one of SUPABASE_URL / SUPABASE_SERVICE_KEY / OPENAI_API_KEY in .env")

# PostgREST client points to /rest/v1. We bypass auth/realtime layers entirely.
pg =SyncPostgrestClient(
    f"{SUPABASE_URL}/rest/v1",
    headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Accept-Profile": "public",
        "Content-Profile": "public",
        "Prefer": "return=representation",  # return inserted rows
    },
)

oai = OpenAI(api_key=OPENAI_API_KEY)

# =========================
# Processing
# =========================
class DocumentProcessor:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Args:
            chunk_size: Max characters per chunk
            chunk_overlap: Overlap between chunks (chars)
        """
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""],
        )

    def extract_metadata_from_path(self, file_path: Path) -> Dict[str, Any]:
        """
        Create lightweight metadata from path structure under RAG_Docs/.
        """
        parts = file_path.parts
        md = {"source": str(file_path), "file_extension": file_path.suffix, "filename": file_path.stem}
        try:
            i = parts.index("RAG_Docs")
            md["category"] = parts[i + 1] if len(parts) > i + 1 else None
            md["subcategory"] = parts[i + 2] if len(parts) > i + 2 else None
        except ValueError:
            pass
        return md

    def read_markdown_file(self, file_path: Path) -> str:
        """
        Read a markdown file with UTF-8, fallback to latin-1 if needed.
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="latin-1") as f:
                return f.read()

    def chunk_document(self, content: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Split content into chunks and attach per-chunk metadata.
        """
        chunks = self.text_splitter.split_text(content)
        out: List[Dict[str, Any]] = []
        total = len(chunks)
        for idx, chunk in enumerate(chunks):
            md = dict(metadata)
            md["chunk_index"] = idx
            md["total_chunks"] = total
            out.append({"content": chunk, "metadata": md})
        return out

    def embed_text(self, text: str) -> List[float]:
        """
        Generate OpenAI embeddings (1536-dim) for a single chunk.
        """
        resp = oai.embeddings.create(
            model="text-embedding-3-small",  # 1536-dim
            input=text,
        )
        return resp.data[0].embedding

    def process_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """
        Read, chunk, embed one markdown file -> list of rows ready to insert.
        """
        print(f"Processing: {file_path}")
        content = self.read_markdown_file(file_path)
        metadata = self.extract_metadata_from_path(file_path)
        chunks = self.chunk_document(content, metadata)

        rows: List[Dict[str, Any]] = []
        for c in chunks:
            emb = self.embed_text(c["content"])
            rows.append({
                "content": c["content"],
                "metadata": c["metadata"],    # jsonb
                "embedding": emb,             # list[float] -> pgvector
            })
        return rows

    def process_directory(self, directory_path: Path) -> List[Dict[str, Any]]:
        """
        Process all *.md files recursively under directory_path.
        """
        md_files = list(directory_path.rglob("*.md"))
        print(f"Found {len(md_files)} markdown files")
        all_rows: List[Dict[str, Any]] = []
        for fp in md_files:
            try:
                rows = self.process_file(fp)
                all_rows.extend(rows)
                print(f"  ✓ {fp.name}: {len(rows)} chunks")
            except Exception as e:
                print(f"  ✗ Error processing {fp}: {e}")
        return all_rows

# =========================
# Upload (batch insert)
# =========================
def upload_rows(rows: List[Dict[str, Any]], batch_size: int = 100) -> None:
    """
    Insert rows into public.documents in batches via PostgREST.
    Each row must have keys: content (text), metadata (json), embedding (list[float]).
    """
    if not rows:
        print("No rows to upload.")
        return

    print(f"\nUploading {len(rows)} chunks to Supabase (batches of {batch_size})...")
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        try:
            _ = pg.table("documents").insert(batch).execute()
            print(f"  ✓ Uploaded batch {i // batch_size + 1} ({len(batch)} chunks)")
        except Exception as e:
            print(f"  ✗ Upload failed for batch {i // batch_size + 1}: {e}")
            # Optional: retry once
            # _ = pg.table("documents").insert(batch).execute()

    print("Upload complete!")

# =========================
# Main
# =========================
def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    rag_docs_dir = project_root / "RAG_Docs"

    if not rag_docs_dir.exists():
        print(f"Error: RAG_Docs directory not found at {rag_docs_dir}")
        return

    print(f"Starting RAG document ingestion from: {rag_docs_dir}\n")
    processor = DocumentProcessor(chunk_size=1000, chunk_overlap=200)

    rows = processor.process_directory(rag_docs_dir)
    print(f"\nTotal chunks generated: {len(rows)}")

    if rows:
        upload_rows(rows, batch_size=100)
    else:
        print("No chunks to upload!")

    print("\n✓ Ingestion complete!")

if __name__ == "__main__":
    main()
