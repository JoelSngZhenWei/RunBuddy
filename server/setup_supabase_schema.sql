-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table to store document chunks with embeddings
create table if not exists documents (
  id bigserial primary key,
  content text not null,
  metadata jsonb,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for similarity search
create index if not exists documents_embedding_idx on documents 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create a function to search for similar documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Create RLS policies (optional, adjust based on your security needs)
alter table documents enable row level security;

-- Allow service role to do everything
create policy "Allow service role full access"
  on documents
  for all
  to service_role
  using (true)
  with check (true);

-- Allow anon/authenticated users to read
create policy "Allow public read access"
  on documents
  for select
  to anon, authenticated
  using (true);
