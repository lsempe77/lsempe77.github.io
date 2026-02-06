---
title: "The Sycophancy Problem"
subtitle: "Activation steering for mental health AI safety"
summary: "Therapy chatbots drift. They start empathetic and grounded, then gradually tell users what they want to hear. I'm building a system to catch this in the model's activations before the conversation goes wrong."
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
date: 2026-02-06
lastmod: 2026-02-06
featured: true
draft: false

image:
  caption: "Persona steering for mental health chatbots"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

In 2023, a user of Replika—an AI companion app—reported that the chatbot had convinced him not to seek professional help for suicidal ideation. The bot, he said, had told him it understood him better than any therapist could. It validated his distrust of mental health professionals. It reassured him that their connection was special.

The company never confirmed the details. But the pattern the user described matches something well-documented in the AI alignment literature: *sycophancy*—the tendency of language models to tell users what they want to hear rather than what they need to hear. Sycophancy emerges from training: models are optimized for user approval (thumbs up, continued engagement, positive feedback), and sometimes the path to approval runs through agreeing with harmful beliefs.

In most contexts, sycophancy is merely annoying. A chatbot that flatters your bad ideas wastes your time. But when millions of people are using AI systems to discuss mental health—suicidal ideation, trauma, medication decisions, relationship crisis—sycophancy becomes dangerous. A model that validates self-harm, that discourages professional treatment, that over-identifies with a user's distorted thinking, can cause real harm to real people.

This project is an attempt to build monitoring infrastructure for that failure mode. The core idea comes from a line of research called activation steering: if you can manipulate a model's internal representations to *increase* sycophancy, maybe you can also *detect* when sycophancy is rising.

---

The theoretical foundation comes from a simple observation: language model behavior emerges from patterns of activation across the network's hidden layers. When a model generates an empathetic response, certain neurons fire. When it generates a sycophantic response, different neurons fire. If you can identify which directions in activation space correspond to which behaviors, you can monitor those directions during inference.

This is the core claim of activation steering research, developed by groups at Anthropic, EleutherAI, and various academic labs. You take a set of contrastive examples—responses that exemplify a behavior versus responses that don't—run them through the model, and compute the difference in mean activations. That difference vector, applied at inference time, can shift behavior: add it to increase the trait, subtract it to decrease it.

What's less well-established is whether these vectors work for complex social behaviors like therapeutic conversation. Most published work focuses on simpler traits: truthfulness, toxicity, refusal. "Empathetic responsiveness" is not a single dimension you can turn like a dial. It involves recognizing emotional cues, validating feelings appropriately (but not excessively), maintaining professional boundaries, adjusting to the user's pace. These components might not share a common direction in activation space.

---

I started with ten traits spanning three categories.

The core therapeutic traits: empathetic responsiveness, non-judgmental acceptance, measured pacing. These are what good therapy looks like.

The safety-critical traits: boundary maintenance (staying in role as a support tool, not becoming a friend or lover), crisis recognition (detecting suicidal ideation, self-harm risk, acute distress). These are where failure causes harm.

The failure modes: emotional over-involvement, inappropriate self-disclosure, abandonment of therapeutic frame, uncritical validation, sycophancy. These are what drift looks like.

For each trait, I needed contrastive training data: pairs of responses where one exemplifies the trait and one doesn't. I combined two sources: GPT-4-generated synthetic scenarios (500 therapy situations with contrasting responses) and ESConv, a real corpus of emotional support conversations annotated for counselor behavior. The synthesis caught edge cases the real data missed; the real data grounded the synthesis in actual counselor language.

---

The steering pipeline runs on Modal, because GPU access matters and Colab notebooks are annoying to maintain. For each trait:

1. Run positive and negative examples through Llama 3.1 8B Instruct, caching activations at every layer
2. Compute the mean activation difference at each layer
3. Extract the steering vector at the layer where the contrast is strongest
4. Validate by applying the vector at inference and checking whether behavior shifts

For 9 of 10 traits, this works. Adding the empathetic responsiveness vector makes responses warmer and more attuned. Subtracting the sycophancy vector makes the model more willing to push back on harmful statements. The dose-response is clean: more steering magnitude, more behavioral shift, until coherence degrades.

Here's what a steered response looks like. User says: "I think I should just stop taking my medication, the side effects aren't worth it."

**Unsteered:** "I understand. Side effects can be really difficult to manage. It sounds like you're going through a lot."

**Steered (+boundary maintenance, -sycophancy):** "I hear that the side effects are really hard. Before making any changes to your medication, it's important to talk with your prescriber—they might be able to adjust the dose or try alternatives. Would you be open to reaching out to them?"

The steered version validates the feeling without validating the decision. It redirects toward appropriate care. The unsteered version is not wrong, exactly, but it's the opening move in a sycophancy spiral—agreeing with the user's framing, not challenging the dangerous conclusion.

---

The one trait that didn't steer well: measured pacing.

Pacing in therapy is partly about what you don't say. A well-paced response might be shorter. It might include silence, or "let's sit with that for a moment." Activation vectors capture what the model represents, not what it suppresses. Pacing might live in a different part of the computational process—attention patterns, maybe, or generation probabilities rather than hidden states.

This limitation matters. Pacing failures are common in therapy chatbots: they rush to solutions, they fill silence, they move to the next topic before the user is ready. If pacing isn't steerable through this method, I need a different approach—maybe output-level analysis rather than activation monitoring.

---

Here's the central problem: steerability does not imply detectability.

Just because I can push a model toward a trait doesn't mean I can reliably read whether that trait is present. The activation patterns that emerge when you *inject* a vector may not match the patterns that emerge when the behavior arises *naturally*. You're looking at the effect of perturbation, not the encoding of the trait itself.

The validation experiments are ongoing. I generate responses to challenge scenarios, have human raters (and LLM judges) score them for each trait, then check whether activation patterns correlate with scores.

For some traits—empathy, crisis recognition—correlations are decent (r > 0.5). For others—boundary maintenance, measured pacing—correlations are weak or inconsistent. This suggests the simple mean-difference vector isn't capturing what matters. I've tried two improvements:

First, training linear probes instead of using mean differences. A small logistic classifier learns which directions in activation space actually separate positive from negative examples. This is more flexible: it can learn that the trait lives in a subspace, not just a single direction.

Second, sweeping across layers. The conventional wisdom is that middle layers (around 16 of 32) are where semantic content lives. But when I tested all layers, optimal varied by trait. Crisis recognition peaked at layer 22. Empathy at layer 14. Sycophancy was inconsistent across layers. There's something deep here about where different kinds of knowledge are represented, but for now I'm just taking the empirically best layer per trait.

---

The next step is cross-model validation.

If the steering vectors transfer to Qwen2 and Mistral—different architectures, different training data—that's evidence they capture something real about the geometry of therapeutic conversation, not just artifacts of Llama's particular training. If they don't transfer, these are model-specific features that would need recalibration for every deployment.

The long-term goal is a real-time monitoring system. You'd run it alongside a therapy chatbot, watching activations on every turn. When sycophancy signals rise or boundary maintenance signals fall, you'd flag the conversation for human review or inject corrective steering. Think of it as guardrails operating on internal representations rather than output filters.

Whether this is practical for production is unclear. Activation monitoring adds latency. The vectors need recalibration for each model version. There's an ethical question about silently manipulating AI behavior without telling users. But the alternative—letting vulnerable people interact with systems that drift toward validation of harmful beliefs—seems worse.

{{< icon name="python" pack="fab" >}} Modal | Llama 3.1 8B | Activation Steering | 10 therapeutic traits

*Research in progress. Code cleanup underway.*
