---
title: "Teaching an AI to Read 400 Papers"
subtitle: "Building a RAG-powered Q&A system for fragile state research"
summary: "Policymakers need answers from thousands of studies. Manual search is slow. Keyword search misses context. Free-form LLMs hallucinate. RAG gives you something in between: grounded synthesis with citations, if you build it right."
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
  - Research Tools
  - AI
date: 2025-12-24
lastmod: 2025-12-24
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

A FCDO advisor asked me a question last year: "What does the evidence say about education interventions in active conflict zones?"

I had access to our evidence map—400+ studies on fragile and conflict-affected settings. I knew the answer was in there somewhere. But finding it meant Ctrl+F through dozens of PDFs, reading abstracts, cross-referencing methodologies, and mentally synthesizing findings across studies that used different outcome measures and contexts.

It took me four hours to produce a two-paragraph answer with citations.

The advisor needed to ask this kind of question weekly. We both knew that wasn't sustainable. So I built a system that does in seconds what I was doing in hours: ingest the full corpus, understand the question semantically, retrieve the relevant passages, and synthesize an answer with proper citations.

The system is live now. It works. But the path to "works" was paved with hallucinations.

---

The core problem with giving LLMs access to research evidence is that they lie confidently. Ask GPT-4 about cash transfers in Somalia, and it will produce a fluent paragraph citing studies that don't exist, with authors whose names it invented, reporting findings that were never measured. The fluency makes the fabrication invisible unless you check every claim.

Retrieval-Augmented Generation solves this by constraining the model's knowledge. Instead of asking "what does the evidence say?", you ask "given these specific passages from these specific studies, what can you conclude?" The model can only cite what you give it. It can still misinterpret, but it can't fabricate sources.

The architecture is a pipeline: user query → domain gating → semantic search → LLM synthesis → cited answer. Each stage reduces the risk of garbage output.

Domain gating rejects queries outside the system's competence. If someone asks about the weather or cryptocurrency, the system declines rather than hallucinating an answer from irrelevant passages. This sounds obvious but required explicit implementation—without it, the model would retrieve whatever was vaguely similar and pretend it was relevant.

Semantic search replaces keyword matching with meaning. "Impact of cash assistance on food security" should match studies about "unconditional transfers" and "nutrition outcomes" even if those exact words don't appear. I use Gemini embeddings with FAISS for fast vector lookup over the chunked corpus.

---

The anti-hallucination strategies took the most iteration.

First, the synthesis prompt explicitly requires citations. Every claim must be attributed to (Author, Year). The model can't make unsupported statements because the prompt forbids it and I validate outputs. This doesn't eliminate errors, but it makes them checkable.

Second, I implemented similarity thresholds. If the best-matching passage has a cosine similarity below 0.6, the system admits ignorance rather than stretching a weak match. "I don't have strong evidence on that topic" is a better answer than a confabulated synthesis of tangentially related studies.

Third, I added metadata quality boosts in the ranking. Studies with complete methods sections, sample sizes, and explicit validation get ranked higher than abstracts-only or grey literature. This doesn't exclude weaker sources, but it weights the synthesis toward more credible evidence.

The result isn't perfect. I estimate about 85% of answers are accurate and useful. Another 10% are accurate but incomplete—missing relevant studies that didn't rank highly. About 5% contain errors, usually subtle mischaracterizations of study findings rather than outright fabrications.

For a policymaker who needs to survey the literature quickly and then verify the key studies manually, that's good enough. For a systematic reviewer who needs exhaustive coverage, it's a starting point, not an endpoint.

---

The live demo is on HuggingFace Spaces. It's free to use, but rate-limited to keep my API costs manageable. The interface lets you ask natural language questions and returns synthesized answers with clickable citations that link to source studies.

What I learned building this: RAG is not a silver bullet. The quality depends entirely on the corpus (garbage in, garbage out), the chunking strategy (too small loses context, too large loses precision), and the prompt engineering (vague prompts produce vague answers). The underlying models are impressive, but the system around them is where the work lives.

{{< icon name="robot" pack="fas" >}} RAG | FAISS | Gemini | 400+ studies | Live demo available

*Try it: [huggingface.co/spaces/lsempe77/fcas](https://huggingface.co/spaces/lsempe77/fcas)*
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
