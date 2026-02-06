p---
title: "From Weekend Prototype to Research Workbench"
summary: "DevChat began as 'can we chat with a few PDFs?' Six months later, it queries 3ie's entire evidence portal with hybrid retrieval, adaptive synthesis, and proper observability. Here's what I learned building a production RAG system."
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

The prototype took a weekend. Embed some PDFs, store them in FAISS, retrieve the top chunks, send them to GPT-4 with a system prompt, return the answer. It worked—badly, but it worked. Queries returned relevant passages. Answers cited sources. The demo impressed people who hadn't seen RAG before.

Then we tried to use it for real work.

The problems emerged immediately. Queries about "cash transfers" returned passages about "bank transfers" and "technology transfer"—semantically similar, topically wrong. Long queries overwhelmed the context window. Short queries missed relevant studies because the embedding didn't capture intent. The model hallucinated confidently when retrieved passages were insufficient. Latency was painful—8-10 seconds per query.

Six months later, DevChat is a proper production system. It handles thousands of queries, serves multiple research teams, and fails gracefully when it encounters something it can't answer. The architecture is unrecognizable from the prototype.

Here's what changed.

---

The first lesson was that dense retrieval alone isn't enough. Semantic similarity catches conceptual matches, but it misses exact terminology. "RCT" should match "randomized controlled trial" perfectly, but embedding similarity treats them as merely related. Academic queries often hinge on precise terms.

The solution is hybrid retrieval: dense vectors for semantic matching, sparse vectors (BM25) for keyword matching, combined with reciprocal rank fusion. A query like "What do RCTs say about cash transfer impacts in Kenya?" benefits from both: the embedding captures the conceptual space, the keyword index ensures "RCT" and "Kenya" boost relevant documents.

I added a reranking layer on top. Retrieval returns 50 candidates; Cohere's reranker rescores them based on the full query-document relationship, not just embedding similarity. The top 15 go to the LLM. This step alone improved answer relevance by about 20% in my informal testing.

---

The second lesson was about query understanding. Users don't write queries optimized for retrieval. They write natural language questions, often with pronouns, abbreviations, and implicit context. "What about their education outcomes?" means nothing without knowing what "their" refers to.

Before retrieval, the query now passes through a classification and expansion layer. A fast model (GPT-4o-mini) determines: Is this a simple factual query, a complex multi-part question, or a comparison request? Is it asking about a specific country, sector, or time period? What synonyms or acronyms might be relevant?

The expanded query improves retrieval. The classification improves synthesis—simple queries get fast, cheap models; complex queries get reasoning-capable models that cost more but handle nuance. This routing reduces average cost by 40% while maintaining quality.

---

The third lesson was about grounding and anti-hallucination.

The prototype's system prompt said "cite your sources." The model cited them, but sometimes made up quotes that sounded plausible. A passage would say "Smith (2019) found positive effects" and the model would elaborate "specifically, a 23% increase in school enrollment" when the original said nothing about percentages.

The production system is more constrained. The synthesis prompt explicitly prohibits claims not supported by retrieved passages. It requires inline citations for every factual statement. It includes a confidence signal—if the evidence is thin, the answer says so. Most importantly, the response includes clickable source links so users can verify claims against the original studies.

I added Langfuse for observability—every query logs the retrieved passages, the synthesis prompt, and the response. When users report bad answers, I can trace exactly what went wrong: was it retrieval (wrong documents), reranking (wrong ordering), or synthesis (correct documents, bad interpretation)?

---

The tech stack evolved based on specific needs.

Qdrant Cloud for vectors, because it handles hybrid search natively and the managed version eliminates ops overhead. Cohere for embeddings and reranking—their academic benchmarks are strong and the API is reliable. OpenRouter as an LLM gateway, so I can switch between GPT-4o, Claude, and Gemini without code changes. FastAPI for the backend, because async handling matters when you're making multiple LLM calls per request. Next.js for the frontend, because the shadcn component library accelerates UI development.

MinerU on Modal handles PDF extraction. Research PDFs are messy—two-column layouts, tables, footnotes, math. MinerU's GPU-accelerated extraction produces cleaner text than simpler parsers, which means better embeddings downstream. The processing adds latency to document ingestion but pays off in retrieval quality.

The whole thing deploys to Railway (backend) and Vercel (frontend), with Cloudflare R2 for PDF storage. Monthly cost runs about $200 for current usage, mostly LLM inference. At our query volume, that's roughly $0.03 per query—cheap enough that we can offer it free internally.

---

The system isn't perfect. Complex reasoning queries still trip it up—"synthesize the evidence on which modalities work best for different beneficiary types" requires the kind of cross-document analysis that current RAG architectures don't handle well. I'm experimenting with agentic approaches that iterate on retrieval, but they add latency and cost.

Keeping the index current is also ongoing work. Research publications aren't static; new studies appear weekly. The ingestion pipeline needs regular runs, and sometimes I discover that a batch of documents was indexed incorrectly months ago. Observability catches these issues eventually, but the debugging can be tedious.

Still, DevChat now handles 95% of the queries researchers throw at it with useful, grounded, citable answers. That's a long way from the weekend prototype that retrieved passages about the wrong kind of transfer.

**Live Demo:** [dev-chat-frontend.vercel.app](https://dev-chat-frontend.vercel.app/)

{{< icon name="robot" pack="fas" >}} Production RAG | Hybrid Retrieval | Adaptive Synthesis | Live System

*Architecture and code on GitHub. Happy to discuss the rough edges.*
    
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
