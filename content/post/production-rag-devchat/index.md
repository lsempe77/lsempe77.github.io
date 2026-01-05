---
title: "Building a Production RAG System for Development Research"
summary: "Architecture and lessons learned from DevChat, a state-of-the-art retrieval-augmented generation system for exploring 3ie's Development Evidence Portal."
date: 2025-12-10
authors:
  - admin
tags:
  - RAG
  - LLMs
  - Production Systems
  - FastAPI
  - Next.js
  - Vector Database
image:
  caption: 'Production RAG architecture for research'
categories:
  - AI Tools
  - Production Systems
featured: true
---

## From Prototype to Production

DevChat began as a simple experiment—a basic chatbot prototype designed to see if we could chat with a few PDFs. However, as we scaled it up to ingest thousands of studies from 3ie's Development Evidence Portal, it quickly evolved into a full-fledged **Research Workbench**. Navigating the transition from a weekend prototype to a production-grade system required solving complex challenges in retrieval accuracy, hallucination control, and user interface design. This post breaks down the architectural decisions we made, the specific implementation details that mattered, and the hard-won lessons we learned along the way.

**Live Demo:** [dev-chat-frontend.vercel.app](https://dev-chat-frontend.vercel.app/)

## Architecture Overview

To handle the complexity of academic queries, we couldn't rely on a simple "retrieve and generate" loop. Instead, the system implements a modern, sophisticated RAG pipeline that employs multiple retrieval strategies and an adaptive synthesis layer. This ensures that whether a user asks a simple factual question or requires a complex cross-study comparison, the system routes and processes the query effectively.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER QUERY                                 │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                    QUERY UNDERSTANDING LAYER                         │
│  • Classification (simple/complex/comparison)                        │
│  • Query Expansion (synonyms, acronyms, domain terms)                │
│  • Metadata Extraction (year, sector, country filters)               │
│  • Model: GPT-4o-mini via OpenRouter (fast)                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
   │ DENSE SEARCH │       │SPARSE SEARCH │       │METADATA FILTER│
   │ Cohere v4    │       │ BM25/SPLADE  │       │ Year, Sector │
   └──────┬───────┘       └──────┬───────┘       └──────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                    FUSION + RERANKING                                │
│  • Reciprocal Rank Fusion (RRF)                                      │
│  • Cohere Rerank v3.5 (top 50 → top 15)                              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                    ADAPTIVE SYNTHESIS                                │
│  Simple queries  → GPT-4o-mini (fast, cheap)                         │
│  Complex queries → GPT-4o (reasoning, nuance)                        │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                    RESPONSE + CITATIONS                              │
└─────────────────────────────────────────────────────────────────────┘
```

## Tech Stack Decisions

| Component | Technology | Why |
|-----------|------------|-----|
| **LLM Provider** | OpenRouter | Unified API for all models |
| **LLM (Fast)** | GPT-4o-mini | Query processing, simple Q&A |
| **LLM (Reasoning)** | GPT-4o | Complex synthesis |
| **Embeddings** | Cohere embed-v4 | 1536 dims, SOTA retrieval |
| **Reranking** | Cohere Rerank v3.5 | 15-20% accuracy boost |
| **Vector DB** | Qdrant Cloud | Dense vectors + metadata |
| **PDF Processing** | MinerU on Modal | GPU extraction |
| **Storage** | Cloudflare R2 | S3-compatible |
| **API** | FastAPI | Async, typed |
| **UI** | Next.js 15 + shadcn/ui | Research Workbench |
| **Hosting** | Railway + Vercel | Backend + Frontend |
| **Observability** | Langfuse | Tracing & analytics |

## Key Implementation Details

### 1. Hybrid Retrieval

We combine dense and sparse search with metadata filtering:

```python
class HybridRetriever:
    def __init__(self, qdrant_client, collection_name: str):
        self.client = qdrant_client
        self.collection = collection_name
        self.embedder = CohereEmbeddings(model="embed-v4.0")
    
    async def retrieve(
        self, 
        query: str, 
        filters: dict, 
        top_k: int = 50
    ) -> list[Document]:
        # Dense search with query embedding
        query_vector = await self.embedder.embed(query)
        
        # Build Qdrant filter from metadata
        qdrant_filter = self._build_filter(filters)
        
        # Search with both vector and filter
        results = self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            query_filter=qdrant_filter,
            limit=top_k,
            with_payload=True
        )
        
        return [self._to_document(r) for r in results]
```

### 2. Cohere Reranking

Reranking provides 15-20% precision improvement:

```python
class CohereReranker:
    def __init__(self, model: str = "rerank-v3.5"):
        self.client = cohere.Client(api_key=COHERE_API_KEY)
        self.model = model
    
    async def rerank(
        self, 
        query: str, 
        documents: list[Document], 
        top_n: int = 15
    ) -> list[Document]:
        # Prepare documents for reranking
        texts = [doc.text for doc in documents]
        
        # Call Cohere rerank API
        response = self.client.rerank(
            model=self.model,
            query=query,
            documents=texts,
            top_n=top_n,
            return_documents=False
        )
        
        # Reorder by rerank score
        reranked = []
        for result in response.results:
            doc = documents[result.index]
            doc.rerank_score = result.relevance_score
            reranked.append(doc)
        
        return reranked
```

### 3. Adaptive Model Routing

Route queries to appropriate models based on complexity:

```python
class QueryRouter:
    async def classify(self, query: str) -> QueryType:
        """Classify query complexity."""
        response = await self.llm.generate(
            model="openai/gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": """Classify this research query:
                - SIMPLE: Direct factual question
                - COMPLEX: Multi-step reasoning needed
                - COMPARISON: Comparing studies/interventions
                """
            }, {
                "role": "user",
                "content": query
            }]
        )
        return QueryType(response.content)
    
    def select_model(self, query_type: QueryType) -> str:
        """Select LLM based on query complexity."""
        if query_type == QueryType.SIMPLE:
            return "openai/gpt-4o-mini"  # Fast, cheap
        else:
            return "openai/gpt-4o"  # Reasoning
```

### 4. Smart Metadata Resolution

PDFs often lack structured metadata. We built a multi-source resolution pipeline:

```
PDF Upload → Extract DOI → CrossRef/OpenAlex → LLM Gap Fill → User Review
```

```python
class MetadataResolver:
    async def resolve(self, pdf_path: str) -> DocumentMetadata:
        # Step 1: Extract DOI from PDF
        doi = await self.doi_extractor.extract(pdf_path)
        
        if doi:
            # Step 2a: Lookup in academic APIs
            metadata = await self.crossref_client.get(doi)
            if not metadata:
                metadata = await self.openalex_client.get(doi)
        else:
            # Step 2b: LLM extracts title/authors from first page
            first_page = await self.pdf_reader.get_first_page(pdf_path)
            extracted = await self.llm_extractor.extract(first_page)
            
            # Fuzzy search OpenAlex
            metadata = await self.openalex_client.search_fuzzy(
                title=extracted.title,
                authors=extracted.authors
            )
        
        # Step 3: LLM fills domain-specific gaps
        if metadata.country is None:
            metadata.country = await self.llm_extractor.extract_country(
                metadata.abstract
            )
        
        return metadata
```

### 5. Page-Aware Chunking for Citations

Each chunk preserves page numbers, enabling clickable citations:

```python
def chunk_with_pages(content_list: list[ContentBlock]) -> list[Chunk]:
    """Create chunks that preserve page information."""
    chunks = []
    current_chunk = []
    current_pages = set()
    current_length = 0
    
    for block in content_list:
        if current_length + len(block.text) > CHUNK_SIZE:
            # Save current chunk
            chunks.append(Chunk(
                text="\n".join(current_chunk),
                page_start=min(current_pages),
                page_end=max(current_pages),
                pages=sorted(current_pages)
            ))
            current_chunk = []
            current_pages = set()
            current_length = 0
        
        current_chunk.append(block.text)
        current_pages.add(block.page_idx)
        current_length += len(block.text)
    
    return chunks
```

## Research Workbench UI

The UI is designed for serious evidence exploration, not just chat:

```
┌───────────────────────────────────────────────────────────────────────┐
│  Active filters: [Kenya ✕] [RCT ✕] [2018-2024 ✕]            [+ Add]   │
├───────────────────────────────────────────────────────────────────────┤
│  🔍 What are the effects of cash transfers on food security?          │
├─────────────────────────────┬─────────────────────────────────────────┤
│                             │                                         │
│     💬 ANSWER PANEL         │     📚 EVIDENCE PANEL                   │
│                             │                                         │
│  Structured response with   │  Study cards ranked by relevance        │
│  inline [1] [2] citations   │                                         │
│                             │  ┌───────────────────────────────────┐  │
│  Click [1] → highlights     │  │ [1] Smith et al. (2023)           │  │
│  snippet on right           │  │ Kenya | RCT | High confidence     │  │
│                             │  │ "35% increase in food security..."│  │
│  ─────────────────────────  │  │ [Open PDF] [Compare] [Exclude]    │  │
│                             │  └───────────────────────────────────┘  │
│  📊 Evidence Health         │                                         │
│  • 6 studies used           │                                         │
│  • ⚠️ No studies from Asia  │                                         │
│                             │                                         │
│  💡 Try next:               │                                         │
│  • Narrow to SSA?           │                                         │
│  • Compare CCT vs UCT?      │                                         │
└─────────────────────────────┴─────────────────────────────────────────┘
```

Key features:
- **Split layout**: Answer + evidence always visible
- **Citation linking**: Click citations to jump to source
- **Study comparison**: Side-by-side table view
- **Evidence health**: Coverage gaps and date ranges
- **Faceted filtering**: Country, methodology, year

## Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Railway       │────▶│   Qdrant Cloud  │
│   (Next.js UI)  │     │   (FastAPI)     │     │   (Vectors)     │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │  Modal    │ │ Cloudflare│ │ Langfuse  │
            │ (MinerU)  │ │ R2 (PDFs) │ │ (Tracing) │
            └───────────┘ └───────────┘ └───────────┘
```

## Lessons Learned

### 1. Reranking is Non-Negotiable
Cohere rerank provided a consistent 15-20% precision improvement. It's cheap and fast—always use it.

### 2. Query Classification Saves Money
Routing simple queries to GPT-4o-mini vs. complex ones to GPT-4o cut costs by ~60% without quality loss.

### 3. Metadata is Hard
Academic PDFs have inconsistent metadata. Build a robust resolution pipeline with multiple fallbacks.

### 4. Page Numbers Enable Trust
Users want to verify AI answers. Page-aware chunking with clickable citations builds trust.

### 5. Observability from Day One
Langfuse tracing saved hours of debugging. Instrument everything from the start.

## Performance Results

| Metric | Target | Achieved |
|--------|--------|----------|
| Retrieval Recall@10 | 80% | ~85% |
| Citation Accuracy | 80% | ~85% |
| Latency (p50) | <5s | 2-4s |
| Cost per query | <$0.05 | ~$0.02 |

## Future Roadmap

Based on current SOTA techniques:

1. **Contextual Retrieval** - Prepend document context to chunks (+49% recall)
2. **RAPTOR Trees** - Hierarchical summarization for multi-hop reasoning
3. **ColBERTv2** - Late interaction for token-level matching
4. **RAGAS in CI** - Automated quality evaluation

---

Building a production RAG system requires attention to retrieval quality, user experience, and operational concerns. The architecture patterns here are applicable to any domain where users need to explore document collections with natural language.
