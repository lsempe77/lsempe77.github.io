---
title: "Talking to Your Evidence Base"
summary: "What if you could ask your research library a question out loud and get a spoken answer grounded in actual studies? A retrieval-augmented system with voice interface makes research synthesis conversational."
date: 2026-01-20
authors:
  - admin
tags:
  - RAG
  - Voice AI
  - Gradio
  - Research Synthesis
  - LLMs
  - FAISS
image:
  caption: 'Voice interface for research Q&A'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - AI Applications
  - Research Tools
featured: true
draft: false
projects: []
external_link: https://github.com/lsempe77/fcas_chatbot_podcast
---

Colleagues at 3ie and FCDO have struggled with identifying robust research in FCAS(Fragile and Conflict-affected settings). They wanted to give one step back and a broader question: what type of research people do in conflict settings?" 

We produced a very long document, but we though we could bring this closer to policy makers. So we created a RAG that tells exactly which studies support each claim, and that can speak the answer back to me while I'm walking or driving or doing something else with my hands.
---

## The Architecture

The system combines retrieval-augmented generation with text-to-speech. You ask a question—by typing or by speaking. The system embeds your query using Gemini's embedding model, searches a FAISS index of research chunks, retrieves the most relevant passages, and synthesizes an answer that's explicitly grounded in those passages. Then it converts the answer to speech using Gemini's multi-speaker TTS.

Every claim cites a specific study. The system refuses to answer questions outside its domain. And everything—queries, syntheses, audio files—is logged for auditing.

The interface is built in Gradio, which means it's a web app that works on any device. Ask your question, get a spoken answer, see the sources.

---

## Why Retrieval-First Matters

The temptation with language models is to just ask them things. They're good at sounding authoritative. But for research synthesis, sounding authoritative isn't enough. You need to be right, and you need to show your work.

Retrieval-first architecture addresses this by constraining what the model can say. The LLM never sees its own training data—it only sees the chunks I've retrieved from my curated corpus. If the evidence isn't in my database, the system can't cite it. If the query is off-topic, the system rejects it before the LLM ever engages.

This makes the system far more defensible than free-form LLM calls. You can audit every answer, trace every claim to a source, and verify that the system is synthesizing rather than fabricating.

---

## Domain Gating

One of the first lessons was that people will ask anything. "What's the weather?" "Write me a poem." "What's the capital of France?" If you send those to the LLM with your research context, you get weird answers and wasted API calls.

The solution is domain gating—a filter that runs before retrieval, checking whether the query is actually research-related. Non-research patterns ("write me", "what's the weather", "tell me a joke") are rejected immediately with a polite redirect. The query analyzer also scores relevance numerically, so edge cases can be handled with appropriate uncertainty.

This keeps the system focused. It's not a general assistant. It's a research synthesis tool that happens to speak.

---

## Voice as Interface

The text-to-speech layer isn't just a gimmick. It changes how people interact with research.

Reading requires attention. You sit down, you focus, you parse text. Speaking allows multitasking. You can listen to a research synthesis while commuting, exercising, or cooking. For busy practitioners who want to stay current on evidence but don't have time for deep reading, voice is genuinely useful.

The system uses Gemini's multi-speaker TTS, which produces natural-sounding audio. I chose a neutral, professional voice—the system should sound like a research briefing, not an audiobook.

---

## Rich Metadata Analysis

Beyond Q&A, the system provides metadata exploration across the corpus. You can query:

- **Geographic coverage**: Where has research been conducted? Interactive maps show concentration and gaps.
- **Methodological breakdown**: What proportion of studies use RCTs vs. quasi-experimental methods?
- **Quality metrics**: Rigor scores, validation status, replication attempts.
- **Sector analysis**: World Bank sectors and subsectors represented in the evidence.

This makes the system useful not just for answering specific questions but for understanding the shape of the literature. Where are the evidence gaps? What methods dominate? Which regions are under-studied?

---

## The Debugging That Ate My Weekend

**Latency matters.** If the system takes ten seconds to respond, the conversational feel breaks. I optimized retrieval and synthesis to hit sub-5-second response times for most queries.

**Citation formatting is harder than it sounds.** Academic citations have many formats, and LLMs don't naturally produce them consistently. I added explicit format instructions to the synthesis prompt and post-processing to standardize output.

**Logging is essential.** When a user reports a wrong answer, you need to trace exactly what happened: what was the query, what chunks were retrieved, what similarity scores were used, what the model generated. Without comprehensive logging, debugging is guesswork.

---

## What's Still Broken

The current system works on a pre-built corpus. I want dynamic corpus updates—drop new PDFs into a folder, and they're automatically chunked, embedded, and indexed. Haven't built that yet.

Each query is also independent right now. True dialogue—"tell me more about that second study"—would make the interaction more natural. That's harder than it sounds.

The system runs on my machine or on HuggingFace Spaces. For organizational use, it would need proper authentication, rate limiting, and cost management. Whether I have time to build that is an open question.

*The code is on [GitHub](https://github.com/lsempe77/fcas_chatbot_podcast).*
