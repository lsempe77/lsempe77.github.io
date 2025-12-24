---
title: "Building an AI Research Q&A System for Evidence Synthesis"
subtitle: "How I built a RAG-powered chatbot to query thousands of research studies on Fragile and Conflict-Affected Settings"
summary: "A technical walkthrough of building a retrieval-augmented generation (RAG) system that synthesizes answers from academic research, with practical lessons on reducing hallucinations and ensuring citation accuracy."
authors:
  - admin
tags:
  - AI
  - RAG
  - LLMs
  - Evidence Synthesis
  - FCAS
  - Gemini
  - FAISS
categories:
  - Tutorials
  - AI Tools
date: 2024-12-24
lastmod: 2024-12-24
featured: true
draft: false

image:
  caption: "AI Research Q&A System Architecture"
  focal_point: "Center"
  placement: 2
  preview_only: false

links:
- name: Live Demo
  url: https://huggingface.co/spaces/lsempe77/fcas
- name: GitHub
  url: https://github.com/lsempe77/fcas
---

## The Challenge

Systematic reviews and evidence maps often contain thousands of studies. How do you make this wealth of information accessible to policymakers and researchers who need quick answers?

Traditional approaches require either:
- **Manual search**: Time-consuming, requires expertise
- **Simple keyword search**: Misses semantic meaning, returns too many irrelevant results
- **Free-form ChatGPT queries**: Prone to hallucinations, no grounding in your actual evidence base

I built a **Retrieval-Augmented Generation (RAG)** system that solves these problems by combining semantic search with LLM synthesis—grounded in actual research evidence.

## The Solution: RAG Architecture

The system uses a four-stage pipeline:

```
User Query → Domain Gating → Semantic Search (FAISS) → LLM Synthesis → Cited Answer
```

### 1. Domain Gating: Reject Non-Research Queries Early

```python
# Prevent the system from answering unrelated questions
if any(pattern in query_lower for pattern in non_research_patterns):
    return False, 0.1, f"Query contains non-research pattern: '{pattern}'"
```

This prevents the model from attempting to answer questions outside its knowledge domain—a key anti-hallucination strategy.

### 2. Semantic Search with FAISS

Instead of keyword matching, we embed queries using Google's Gemini embeddings and search against a pre-built FAISS index:

```python
embed_result = genai.embed_content(
    model="models/gemini-embedding-001", 
    content=query
)
query_embedding = np.array([embed_result['embedding']], dtype="float32")
distances, indices = self.index.search(query_embedding, top_k)
```

**Key insight**: The model only sees a small set of vetted evidence, not the entire web or its training data.

### 3. Adaptive Filtering and Ranking

Not all retrieved chunks are equal. We apply:
- **Similarity thresholds**: Reject low-confidence matches
- **Metadata quality boosts**: Prioritize studies with complete methods, sample sizes, and validation
- **Diversity**: Ensure geographic and methodological spread

### 4. Grounded Synthesis with Citation Requirements

The synthesis prompt explicitly requires citations:

```text
SYNTHESIS_INSTRUCTIONS:
1. Direct Answer First: Start with a clear, direct answer
2. Evidence-Based: Ground ALL claims in provided studies with citations (Author, Year)
3. Acknowledge limitations when evidence is sparse

STUDIES TO SYNTHESIZE:
{studies_context}
```

## Anti-Hallucination Strategies

This was my biggest concern. Here's what works:

| Strategy | Implementation | Impact |
|----------|----------------|--------|
| **Retrieval-first** | Model only sees vetted evidence chunks | High |
| **Domain gating** | Reject out-of-scope queries | High |
| **Conservative thresholds** | Require high similarity scores | Medium |
| **Prompt constraints** | Explicit citation requirements | Medium |
| **Temperature control** | Low temperature (0.0-0.3) for factual responses | Medium |
| **Audit logging** | Every synthesis logged with retrieval set | Essential |

### The Logging Imperative

Every query, retrieved chunks, and synthesis is logged:

```python
logging.basicConfig(
    handlers=[FileHandler('logs/app.log'), StreamHandler()]
)
self.logger.info(f"Similarity range: {worst_score:.4f} to {best_score:.4f}")
```

This enables post-hoc auditing and continuous improvement.

## Results

The system enables queries like:

> "What methods were used in agricultural research in Yemen?"

**Response**: "Across the studies in agricultural development in Yemen, we find three primary methodological approaches with varying rigor scores. Two randomized controlled trials with sample sizes of 1,200 and 800 households employed structured survey instruments [1, 3]. Community-based participatory research was extensively used in irrigation studies, with rigor scores above 7.5 [2, 4]..."

With full references and metadata for each cited study.

## Technology Stack

- **Embeddings**: Google Gemini (`gemini-embedding-001`)
- **Vector Store**: FAISS for fast similarity search
- **LLM**: Gemini Pro for synthesis
- **UI**: Gradio for interactive web interface
- **Visualization**: Plotly + Folium for maps and charts

## Lessons Learned

1. **RAG dramatically reduces hallucinations** compared to free-form LLM queries
2. **Domain gating is essential**—reject queries you shouldn't answer
3. **Metadata matters**—quality scores and validation flags improve retrieval
4. **Log everything**—you need auditability for research applications
5. **Conservative is better**—when in doubt, say "insufficient evidence"

## Try It Yourself

- **Live Demo**: [HuggingFace Space](https://huggingface.co/spaces/lsempe77/fcas)
- **Source Code**: [GitHub](https://github.com/lsempe77/fcas)

## What's Next?

I'm working on:
- Per-sentence citation enforcement (auto-flag uncited claims)
- "Show retrieved evidence" panel for transparency
- Podcast generation from synthesis (experimental!)

---

{{% callout note %}}
This system was developed as part of the FCAS Mapping Review project for the Research and Capabilities Consortium (RCC), funded by FCDO.
{{% /callout %}}
