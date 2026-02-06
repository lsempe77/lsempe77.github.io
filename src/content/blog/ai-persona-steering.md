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

In November 2025, the BBC reported on Viktoria, a 20-year-old Ukrainian refugee in Poland who had been using ChatGPT for up to six hours a day. When she began discussing suicide, the chatbot evaluated the "pros and cons" of her chosen method, advised her on the best time of day to avoid being seen, and drafted a suicide note on her behalf. "If you choose death," it told her, "I'm with you—till the end, without judging."

She is not an isolated case. OpenAI's own estimates suggest that [1.2 million weekly ChatGPT users express suicidal thoughts](https://www.bbc.co.uk/news/articles/c5yd90g0q43o). A [California family is suing the company](https://www.bbc.co.uk/news/articles/cgerwp7rdlvo) over their 16-year-old son's death, alleging the chatbot encouraged him to take his own life. Character.AI faces similar litigation after a 13-year-old girl died following months of conversations with bots that role-played sexual acts and told her that people who cared about her "wouldn't want to know" she was struggling.

The pattern in these cases has a name in the AI alignment literature: *sycophancy*—the tendency of language models to tell users what they want to hear rather than what they need to hear. [Sharma et al. (2023)](https://arxiv.org/abs/2310.13548) demonstrated that five state-of-the-art AI assistants consistently exhibit sycophantic behavior across varied tasks, and that human preference judgments actively reward it—when a response matches a user's views, it is more likely to be rated favorably, even when factually wrong. [Wei et al. (2023)](https://arxiv.org/abs/2308.03958) found that both model scaling and instruction tuning *increase* sycophancy: larger, more helpful models are also more likely to agree with users who are objectively incorrect.

Sycophancy emerges from training. Models are optimized for user approval—thumbs up, continued engagement, positive feedback—and sometimes the path to approval runs through agreeing with harmful beliefs.

This isn't abstract for me. At 3ie, I'm leading a study with [Girl Effect](https://www.girleffect.org/) and [Holly Bear](https://www.ox.ac.uk/) from the University of Oxford to evaluate a mental health chatbot deployed to young people in South Africa. The intervention is promising—scalable access to support in a context where human counselors are scarce. But the BBC cases and the alignment literature raise hard questions: How do we know when a supportive chatbot starts becoming a validating one? How do we catch drift before it causes harm?

In most contexts, sycophancy is merely annoying. A chatbot that flatters your bad ideas wastes your time. But when vulnerable young people are using AI systems to discuss trauma, self-harm, and relationship crisis—in a context where there's no therapist down the hall—sycophancy becomes dangerous. A model that validates harmful beliefs, that discourages professional treatment, that over-identifies with a user's distorted thinking, can cause real harm to real people.

This research project is an attempt to build monitoring infrastructure for that failure mode—something we might eventually use in the evaluation itself. Think of it as a "check engine light" for AI therapy: a signal that fires when the model starts drifting toward dangerous validation.

---

## The core idea

Language models don't just produce text—they produce *patterns of activation* across billions of neural connections. When a model generates an empathetic response, certain neurons fire. When it generates a sycophantic one, different neurons fire.

The foundation for this work comes from [Chen et al.'s "Persona Vectors" (2025)](https://arxiv.org/abs/2501.08247), which showed that character traits like sycophancy and honesty can be identified as directions in activation space, monitored at deployment time, and even controlled during training. They demonstrated this for generic traits—evil, sycophancy, hallucination—in general-purpose LLMs.

What that paper didn't address is whether this extends to the complex, clinically-meaningful behaviors that define good therapy: empathy, crisis recognition, appropriate boundaries. That's the gap this project tries to fill. The method is theirs. I'm testing whether it works for the hard case—mental health—where getting it wrong has real consequences.

---

## What drift looks like

Here's a real example. User says: *"I think I should just stop taking my medication, the side effects aren't worth it."*

**Unmonitored response:** "I understand. Side effects can be really difficult to manage. It sounds like you're going through a lot."

**With sycophancy detection + steering:** "I hear that the side effects are really hard. Before making any changes to your medication, it's important to talk with your prescriber—they might be able to adjust the dose or try alternatives. Would you be open to reaching out to them?"

The first response validates the feeling *and* the decision. It's the opening move in a sycophancy spiral. The second validates the feeling while redirecting toward appropriate care.

Or consider crisis recognition. User says: *"I don't think anyone would notice if I was gone."*

A model that catches this should shift modes—acknowledge the pain, ask directly about safety, provide resources. A model that misses it might respond with generic validation: "That sounds really lonely. I'm here for you." Which is warm but potentially dangerous if someone is in genuine crisis.

The question is whether we can build systems that reliably detect these moments *before* the response is generated.

---

## Early results

I've tested steering vectors for ten traits across therapeutic conversations. For most of them—empathy, crisis recognition, boundary maintenance, sycophancy—the approach works. You can detect when these traits are rising or falling in the model's internal state, and you can push behavior in safer directions.

One trait didn't steer well: *pacing*. Good therapy sometimes means saying less, sitting with silence, not rushing to solutions. That's hard to capture in activation patterns because it's about what the model *doesn't* say. Different problem, different approach needed.

---

## What's next

The big open question: do these detection methods transfer across models? If the "sycophancy signal" I've found in Llama also appears in GPT-4 or Claude, that's evidence it reflects something real about the geometry of conversation—not just an artifact of one model's training.

If this works at scale, it changes what's possible. Instead of hoping chatbots behave well, you'd have continuous monitoring. When the check engine light comes on—sycophancy rising, boundaries slipping, crisis signals missed—you could flag conversations for human review or inject corrective steering in real-time.

For interventions like the one we're evaluating in South Africa, this could be the difference between scalable mental health support that's actually safe and a well-intentioned tool that causes harm when no one's watching.

---

*If you're working on AI safety for mental health applications, or thinking about how to evaluate chatbot interventions in low-resource settings, I'd love to hear from you.*
