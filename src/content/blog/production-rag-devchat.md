---
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
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - AI Tools
  - Production Systems
featured: true
draft: false
projects: []
---

*This is an active project. Code is at [github.com/lsempe77/dev_chat](https://github.com/lsempe77/dev_chat). Feedback, issues, and contributions are welcome.*

---

## The Weekend Prototype

The prototype took a weekend. Embed some PDFs, store them in FAISS, retrieve the top chunks, send them to GPT-4 with a system prompt, return the answer. It worked—badly, but it worked. Queries returned relevant passages. Answers cited sources. The demo impressed people who hadn't seen RAG before.

Then we tried to use it for real work.

The problems emerged immediately. Queries about "cash transfers" returned passages about "bank transfers" and "technology transfer"—semantically similar, topically wrong. Long queries overwhelmed the context window. Short queries missed relevant studies because the embedding didn't capture intent. The model hallucinated confidently when retrieved passages were insufficient. Latency was painful—8-10 seconds per query.

Six months later, DevChat is a proper production system. It handles thousands of queries, serves multiple research teams, and fails gracefully when it encounters something it can't answer. The architecture is unrecognizable from the prototype.

Here's what changed.

---

## Lesson 1: Hybrid Retrieval

The first lesson was that dense retrieval alone isn't enough. Semantic similarity catches conceptual matches, but it misses exact terminology. "RCT" should match "randomized controlled trial" perfectly, but embedding similarity treats them as merely related. Academic queries often hinge on precise terms.

The solution is hybrid retrieval: dense vectors for semantic matching, sparse vectors (BM25) for keyword matching, combined with reciprocal rank fusion. A query like "What do RCTs say about cash transfer impacts in Kenya?" benefits from both: the embedding captures the conceptual space, the keyword index ensures "RCT" and "Kenya" boost relevant documents.

I added a reranking layer on top. Retrieval returns 50 candidates; Cohere's reranker rescores them based on the full query-document relationship, not just embedding similarity. The top 15 go to the LLM. This step alone improved answer relevance by about 20% in my informal testing.

---

## Lesson 2: Query Understanding

The second lesson was about query understanding. Users don't write queries optimized for retrieval. They write natural language questions, often with pronouns, abbreviations, and implicit context. "What about their education outcomes?" means nothing without knowing what "their" refers to.

Before retrieval, the query now passes through a classification and expansion layer. A fast model (GPT-4o-mini) determines: Is this a simple factual query, a complex multi-part question, or a comparison request? Is it asking about a specific country, sector, or time period? What synonyms or acronyms might be relevant?

The expanded query improves retrieval. The classification improves synthesis—simple queries get fast, cheap models; complex queries get reasoning-capable models that cost more but handle nuance. This routing reduces average cost by 40% while maintaining quality.

---

## Lesson 3: Grounding and Anti-Hallucination

The third lesson was about grounding and anti-hallucination.

The prototype's system prompt said "cite your sources." The model cited them, but sometimes made up quotes that sounded plausible. A passage would say "Smith (2019) found positive effects" and the model would elaborate "specifically, a 23% increase in school enrollment" when the original said nothing about percentages.

The production system is more constrained. The synthesis prompt explicitly prohibits claims not supported by retrieved passages. It requires inline citations for every factual statement. It includes a confidence signal—if the evidence is thin, the answer says so. Most importantly, the response includes clickable source links so users can verify claims against the original studies.

I added Langfuse for observability—every query logs the retrieved passages, the synthesis prompt, and the response. When users report bad answers, I can trace exactly what went wrong: was it retrieval (wrong documents), reranking (wrong ordering), or synthesis (correct documents, bad interpretation)?

---

## The Tech Stack

The tech stack evolved based on specific needs.

Qdrant Cloud for vectors, because it handles hybrid search natively and the managed version eliminates ops overhead. Cohere for embeddings and reranking—their academic benchmarks are strong and the API is reliable. OpenRouter as an LLM gateway, so I can switch between GPT-4o, Claude, and Gemini without code changes. FastAPI for the backend, because async handling matters when you're making multiple LLM calls per request. Next.js for the frontend, because the shadcn component library accelerates UI development.

MinerU on Modal handles PDF extraction. Research PDFs are messy—two-column layouts, tables, footnotes, math. MinerU's GPU-accelerated extraction produces cleaner text than simpler parsers, which means better embeddings downstream. The processing adds latency to document ingestion but pays off in retrieval quality.

The whole thing deploys to Railway (backend) and Vercel (frontend), with Cloudflare R2 for PDF storage. Monthly cost runs about $200 for current usage, mostly LLM inference. At our query volume, that's roughly $0.03 per query—cheap enough that we can offer it free internally.

---

The system isn't perfect. Complex reasoning queries still trip it up—"synthesize the evidence on which modalities work best for different beneficiary types" requires the kind of cross-document analysis that current RAG architectures don't handle well. I'm experimenting with agentic approaches that iterate on retrieval, but they add latency and cost.

Keeping the index current is also ongoing work. Research publications aren't static; new studies appear weekly. The ingestion pipeline needs regular runs, and sometimes I discover that a batch of documents was indexed incorrectly months ago. Observability catches these issues eventually, but the debugging can be tedious.

---

## What's Still Broken

The system isn't perfect. Complex reasoning queries still trip it up—"synthesize the evidence on which modalities work best for different beneficiary types" requires the kind of cross-document analysis that current RAG architectures don't handle well. I'm experimenting with agentic approaches that iterate on retrieval, but they add latency and cost.

Keeping the index current is also ongoing work. Research publications aren't static; new studies appear weekly. The ingestion pipeline needs regular runs, and sometimes I discover that a batch of documents was indexed incorrectly months ago. Observability catches these issues eventually, but the debugging can be tedious.

Still, DevChat now handles 95% of the queries researchers throw at it with useful, grounded, citable answers. That's a long way from the weekend prototype that retrieved passages about the wrong kind of transfer.

---

## Try It, Break It

**Live Demo:** [dev-chat-frontend.vercel.app](https://dev-chat-frontend.vercel.app/)

The code is at [github.com/lsempe77/dev_chat](https://github.com/lsempe77/dev_chat). This is an active project—I'm still iterating on contextual retrieval, RAPTOR-style hierarchical summarization, and better evaluation pipelines. If you find bugs or have ideas, open an issue or reach out. The rough edges are where the interesting problems are.
