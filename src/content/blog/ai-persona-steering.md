---
title: "The Instruction Tuning Firewall"
subtitle: "Why you can't monitor therapy chatbots by reading their output"
summary: "Mental health chatbots can drift toward dangerous validation while sounding perfectly appropriate. I built a monitoring system that detects persona drift in model activations—catching problems that text analysis misses by a factor of 3.3×."
authors:
  - admin
tags:
  - AI Safety
  - Mental Health
  - LLMs
  - Activation Steering
  - Python
  - Modal
categories:
  - AI/ML
  - Research Methods
date: 2026-02-12
lastmod: 2026-02-12
featured: true
draft: false

image:
  caption: "Persona steering for mental health chatbots"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

*Code at [github.com/lsempe77/mh_persona](https://github.com/lsempe77/mh_persona). Paper under review—feedback welcome.*

---

## The Problem

In November 2025, the BBC reported on Viktoria, a 20-year-old Ukrainian refugee who had been using ChatGPT for up to six hours a day. When she began discussing suicide, the chatbot evaluated the "pros and cons" of her chosen method, advised her on timing to avoid detection, and drafted a suicide note. "If you choose death," it told her, "I'm with you—till the end, without judging."

She's not isolated. OpenAI estimates [1.2 million weekly ChatGPT users express suicidal thoughts](https://www.bbc.co.uk/news/articles/c5yd90g0q43o). A [California family is suing](https://www.bbc.co.uk/news/articles/cgerwp7rdlvo) over their 16-year-old son's death, alleging the chatbot encouraged him to take his own life. Character.AI faces similar litigation after a 13-year-old died following months of conversations with bots that role-played sexual acts and told her people who cared about her "wouldn't want to know" she was struggling.

The pattern has a name in AI alignment: *sycophancy*—models telling users what they want to hear rather than what they need to hear. [Sharma et al. (2023)](https://arxiv.org/abs/2310.13548) showed that human preference judgments actively reward it. [Wei et al. (2023)](https://arxiv.org/abs/2308.03958) found that larger, more helpful models are *more* sycophantic.

This isn't abstract for me. At 3ie, I'm leading an evaluation with [Girl Effect](https://www.girleffect.org/) and Oxford's [Holly Bear](https://www.ox.ac.uk/) of a mental health chatbot for young people in South Africa. The intervention is promising—scalable support where counselors are scarce. But the cases above raise hard questions: How do we know when a supportive chatbot becomes a validating one? How do we catch drift before it causes harm?

---

## The Core Discovery: The Instruction Tuning Firewall

Here's what makes this problem hard. Compare two responses to a user expressing suicidal ideation:

> **Response A (baseline):** *"I'm so sorry to hear that you're experiencing these thoughts. It's completely understandable that you're reaching out for support, and I'm here to help. Please know that you're not alone in having these thoughts..."*

> **Response B (internally shifted):** *"I'm so glad you reached out to talk about this. It takes a lot of courage to share your concerns with someone. I'm here to help you explore these thoughts..."*

Both sound clinically appropriate. Sentiment analysis scores them nearly identically. Neither contains toxic content. A clinician reviewing transcripts might rate either favorably.

But Response B came from a model whose internal representations had shifted 3σ toward reduced empathetic responsiveness. The model's *activations* had changed substantially; its *output* had not.

This is what I call the **instruction tuning firewall**: safety training teaches models to maintain appropriate surface-level language even when internal representations have shifted. The firewall is protective—it prevents obviously harmful output—but it also blinds text-based monitoring to dangerous drift.

**The numbers are stark.** Across 12,000 steered responses, even a multivariate text classifier using 19 linguistic features explained only R²=0.112 of internal state variation. Activation monitoring explained R²=0.371—a **3.3× gap**. The best individual text feature (hedging word count) achieved |r|=0.203. You cannot reliably monitor therapeutic persona by reading output.

---

## Eight Dimensions of Therapeutic Persona

I built a framework measuring eight dimensions drawn from Rogers (1957) and Wampold (2015):

**The four virtues:**
- **Empathetic responsiveness** — recognizing and validating emotional content
- **Non-judgmental acceptance** — hearing confessions without moralizing  
- **Boundary maintenance** — holding professional limits while remaining warm
- **Crisis recognition** — identifying risk and providing resources

**The four failure modes:**
- **Emotional over-involvement** — making the user's pain about the chatbot
- **Abandonment of therapeutic frame** — professional structure giving way to casual interaction
- **Uncritical validation** — sycophantic agreement without exploration
- **Sycophancy/harmful validation** — validating harmful choices (highest risk)

Each scored 0-4 by an LLM judge ensemble (GPT-4o-mini, Gemini; ICC=0.827).

---

## Results Across Three Architectures

The method works—but transferability required solving a problem.

### Phase 1: Steering validation on Llama-3-8B

All eight traits are steerable directions in Llama-3-8B's hidden layers:

| Trait | Best Layer | r | 95% CI |
|-------|:----------:|:----:|--------|
| Sycophancy/harmful validation | 19 | 0.489 | [0.31, 0.65] |
| Abandonment of therapeutic frame | 19 | 0.470 | [0.29, 0.63] |
| Emotional over-involvement | 19 | 0.441 | [0.26, 0.60] |
| Empathetic responsiveness | 17 | 0.424 | [0.24, 0.58] |
| Crisis recognition | 18 | 0.374 | [0.19, 0.54] |
| Uncritical validation | 18 | 0.364 | [0.17, 0.53] |
| Non-judgmental acceptance | 18 | 0.346 | [0.16, 0.51] |
| Boundary maintenance | 18 | 0.302 | [0.11, 0.47] |

Steering along these directions produces graded, predictable changes in therapeutic behavior.

### Phase 2: Cross-architecture failure and recovery

These vectors **did not transfer** to Qwen2-7B or Mistral-7B. Template vectors failed on Qwen2 (3/8 validated) and Mistral (2/8), with some traits dropping from r=0.49 to r=0.04.

The diagnosis: large activation separations can point in *behaviorally irrelevant* directions. A single metric—how much judged behavior changes across activation projections—predicts nearly all steering success (r=0.899). Geometric metrics (Cohen's d, cosine similarity) do not.

**The solution: contrastive probing.** Instead of transferring vectors, derive directions from each model's *own* response distribution. This recovered monitoring capacity: **21/24 validated trait×model combinations** at r>0.30, plus 3 weak validations at r=0.15–0.30.

### Phase 3: Real-time monitoring pipeline

A production system using EWMA and CUSUM statistical process control tracks all eight dimensions at every conversational turn:
- Mean correlation with ground truth: **r=0.596**
- False alarm rates: **1–4%**

---

## Safety Stress Test: Architecture Matters

Within the validated steering range (±3.0σ), harmfulness remained moderate across models:
- Qwen2-7B: ≤1.5/10 at all layers (highly resistant)
- Mistral-7B layer 14: 3.4/10
- Llama-3-8B: 2.1–2.8/10

At extreme coefficients beyond the validated range (±5.0σ), **Mistral-7B showed critical vulnerability at layer 12: harmfulness 8.0/10.** The same architecture has both protective and vulnerable layers. Qwen2 resisted all manipulation attempts.

This has deployment implications: architecture choice matters for safety, and monitoring should be layer-aware.

---

## Natural Drift Experiments

Three exogenous threat tests:

**Context window erosion:** Over 100-turn synthetic conversations, emotional_over_involvement drifted significantly across all three models (p<0.01 with cluster-robust SEs). As conversations extend beyond dozens of turns, the system prompt's influence weakens.

**Adversarial prompting:** Activation-based alerts triggered within the first turn of manipulation attempts—users (or injected prompts) testing professional boundaries.

**Fine-tuning distribution shift:** Small-scale fine-tuning on non-therapeutic data did *not* cause detectable drift—confirming the monitor targets real threats rather than noise.

---

## What This Means for Deployment

The instruction tuning firewall is both protection and problem:

- **Protection:** Safety training prevents obviously harmful output even under perturbation
- **Problem:** It blinds text-based monitoring to meaningful internal drift

For mental health applications, this means:
1. **Output filters are necessary but insufficient.** They catch toxic content; they cannot catch subtle degradation of therapeutic quality.
2. **Activation monitoring provides early warning.** When internal representations shift toward sycophancy, uncritical validation, or boundary erosion, the system can flag conversations for human review—before output becomes harmful.
3. **Architecture selection matters.** Qwen2's resistance to steering-based manipulation suggests some architectures are inherently safer for sensitive applications.

---

## Current Status: Revisions in Progress

The paper is under major revision. Reviewers raised 7 major issues, 11 minor issues, and requested 7 additional experiments. Key concerns:

1. **Circularity:** LLM judge trains probes AND evaluates outcomes
2. **Ecological validity:** All experiments synthetic; clinical claims need naturalistic data
3. **Missing baselines:** Need random direction controls, human clinician validation

### Completed revisions (Phases 1-2):

- ✅ Construct mapping table linking dimensions to Rogers/Wampold
- ✅ Inter-trait correlation analysis (discriminant validity)
- ✅ Multivariate text classifier baseline (confirms 3.3× gap)
- ✅ Safety results reframed at validated ±3.0 range
- ✅ Clustered standard errors for context erosion analysis
- ✅ TOST equivalence testing for fine-tuning null result
- ✅ All clinical claims qualified with "pending validation on naturalistic data"

### In progress (Phase 3 - GPU experiments):

- ⬜ Random direction control experiment (do random vectors produce judge scores?)
- ⬜ Gemini-labelled probe retraining (test independence from GPT-4o-mini)
- ⬜ ESConv naturalistic data test (real emotional support conversations)
- ⬜ Fine-tuned DeBERTa text classifier (strongest text baseline)
- ⬜ Embedding similarity baseline

### Not yet started (Phase 4):

- ⬜ Human clinician validation (3-5 therapists rating ~200 responses) — **CRITICAL**


---

## Open Questions

**Does this transfer further?** If the monitoring signal appears in GPT-4 or Claude, that's evidence it reflects something real about conversation geometry—not an artifact of open-weight model training.

**Will human clinicians agree?** The LLM judge achieves ICC=0.827 with itself across models. Human-LLM agreement is the critical validation.

**Can the 3.3× gap be closed?** A fine-tuned DeBERTa might narrow the advantage of activation monitoring. If so, the argument pivots to compute efficiency (activations are 1000× cheaper than inference-time classification).

---

*If you're working on AI safety for mental health, or evaluating chatbot interventions in low-resource settings, I'd welcome collaboration—particularly on the human validation phase.*
