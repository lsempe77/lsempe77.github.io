---
title: "400 PDFs, One Question"
summary: "When keyword search fails and manual reading isn't feasible, semantic search changes how you interact with a research corpus. A practical RAG system for evidence synthesis."
date: 2025-11-05
authors:
  - admin
tags:
  - RAG
  - FAISS
  - Sentence Transformers
  - Vector Search
  - Python
  - Research Tools
image:
  caption: 'Semantic search over research documents'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - AI/ML
  - Research Tools
featured: false
draft: false
projects: []
---

*This was my first RAG experiment. It evolved into [DevChat](/blog/production-rag-devchat), a production system with hybrid retrieval, reranking, and proper observability. Code: [github.com/lsempe77/dev_chat](https://github.com/lsempe77/dev_chat)*

---

## The Vocabulary Mismatch Problem

"What does the evidence say about cash transfer effects on nutrition?" It's a simple question. We had 400 papers for an evidence map, and I knew at least a dozen were relevant. But when I searched for that exact phrase, I got nothing.

The problem is vocabulary mismatch. One study discusses "unconditional money transfers and dietary diversity." Another examines "social protection programs and food security." A third measures "monetary assistance effects on child anthropometrics." They're all answering my question, but none uses my words.

I spent an afternoon with Ctrl+F, opening each PDF, searching variations of my query, noting relevant passages. Four hours later I had seven studies. There were more—I found them later—but I'd missed them because my keyword variations didn't match their terminology.

This is the problem that retrieval-augmented generation solves. Not the generation part—that came later—but the retrieval. Semantic search finds documents by meaning, not keywords. "Cash transfer effects on nutrition" matches "unconditional money assistance and dietary outcomes" because the underlying concepts are similar, even though the words aren't.

---

## The Architecture

The architecture is conceptually simple. PDFs become text. Text becomes chunks. Chunks become vectors. Queries become vectors. You find chunks whose vectors are close to the query vector and return them. The LLM part—synthesizing an answer from the retrieved chunks—is almost an afterthought.

The devil is in the chunking. Cut too small and you lose context. Cut too big and the embedding averages over too many concepts, losing precision. Overlap matters because relevant passages don't respect your arbitrary split points. I settled on 500-word chunks with 50-word overlap after experimenting with different sizes.

Text extraction is the other hidden complexity. Research PDFs are messy—two-column layouts, footnotes, tables, equations. Basic extraction produces garbled text where columns interleave incorrectly. PyMuPDF handles layout analysis reasonably well, but some documents still need manual cleanup. I've found that garbage in definitely means garbage out; a single paper with badly extracted text can pollute search results for related queries.

---

## Choosing the Right Embedding Model

The embedding model matters more than I initially thought. I started with a general-purpose sentence transformer, and it worked—mostly. But it struggled with domain-specific terminology. "Propensity score matching" and "matched comparison design" should be nearly synonymous, but the general model treated them as only vaguely related.

Switching to an embedding model fine-tuned on academic text improved results noticeably. The retrieval became more precise for methodological queries. Authors' names started matching across papers. Citation formats stopped confusing the model.

FAISS handles the vector index efficiently. For 400 papers chunked into maybe 10,000 segments, it's overkill—SQLite with a brute-force cosine similarity would work fine. But FAISS scales, and I've since used the same architecture for much larger corpora where the efficiency matters.

---

## The Query Pipeline

The query pipeline is straightforward: embed the question, find the 10 nearest chunks, return them with their source documents. For most questions, this is enough. "Which studies measured effects on school enrollment?" returns the relevant passages directly.

The synthesis step—feeding those chunks to an LLM with a prompt like "answer the question based only on these passages"—adds convenience but isn't always necessary. Sometimes I just want the relevant paragraphs with citations. The LLM summary is helpful for complex questions that span multiple studies, less so for simple lookups.

What changed my workflow wasn't sophistication; it was coverage. I now find relevant studies I would have missed with keyword search. The four-hour manual search became a two-minute query. More importantly, I stopped being limited to my vocabulary—the system surfaces studies using terminology I didn't think to search for.

---

## Limitations

The system has clear limitations. It's read-only; you can't ask follow-up questions that depend on previous answers. It doesn't reason across documents—it retrieves relevant passages but doesn't synthesize relationships between studies. It occasionally retrieves irrelevant passages that happen to share vocabulary with the query.

For serious systematic review work, you still need structured extraction and formal quality assessment. This tool doesn't replace that. But for exploratory queries—"what exists on this topic?"—it's transformed how I interact with a research corpus.

The code is relatively simple: PyMuPDF for extraction, sentence-transformers for embedding, FAISS for indexing, OpenAI for synthesis. The complexity isn't in any individual component but in tuning the pipeline end-to-end: chunk size, overlap, embedding model choice, retrieval count, prompt design.

If you're building something similar, start with the retrieval and ignore the generation until retrieval works well. A good retrieval system with no LLM is useful. A fancy LLM on top of bad retrieval is just confidently wrong.

---

The deeper lesson from building this system is about the nature of search itself. Keyword search assumes you know what you're looking for. Semantic search assumes you know what you mean. These are different assumptions, and they fail in different ways.

For research synthesis, semantic search is usually what you want. You have a question; you need studies that address it, regardless of their terminology. But occasionally keyword search is right—when you're looking for a specific citation, a particular author, an exact phrase from a methodology section.

The production version of this system includes both: semantic search for conceptual queries, keyword search for exact matching, metadata filters for year, country, and methodology. The hybrid approach handles more query types than either alone.

---

## What Came Next

Building the system took a weekend. Tuning it to be actually useful took longer. Understanding when to use it versus other approaches took longer still.

This prototype taught me the fundamentals, but it had serious limitations: no reranking, no query expansion, no observability. Six months later, I rebuilt it from scratch as [DevChat](/blog/production-rag-devchat)—a production system with hybrid retrieval, Cohere reranking, and proper tracing.

If you're starting out with RAG, build something like this first. The simplicity teaches you what matters. Then read about what I learned scaling it up.
