---
title: "The Principles-to-Practice Gap in AI Ethics"
subtitle: "Global measurement reveals ethics governance is more talk than action"
summary: "Everyone agrees on AI ethics principles. The problem is nobody operationalizes them. I measured ethics governance depth across 2,100+ policies and found 99% of variation happens within income groups—not between rich and poor countries."
authors:
  - admin
tags:
  - AI
  - AI Governance
  - Ethics
  - Global Observatory
  - Policy Analysis
categories:
  - Research
date: 2025-12-26
lastmod: 2025-12-26
featured: true
draft: false

image:
  caption: "AI Ethics Governance"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

As part of the Global Observatory of AI Governance, I've been building a systematic measurement of how countries actually govern artificial intelligence—not what they say in press releases, but what their policies commit them to do. The first book examined governance capacity. This second book tackles the harder question: ethics.

The AI ethics field has an unusual problem. Everyone agrees on the principles—fairness, transparency, accountability, human oversight. Jobin and colleagues documented this convergence back in 2019, cataloguing 84 guidelines that all circled the same values. But agreement on principles masks a deeper failure: almost nobody specifies how to operationalize them.

What does "fairness" mean when a government procures an algorithm to allocate social benefits? Who's accountable when that algorithm fails? How do you enforce "transparency" requirements? These operational questions remain largely unanswered.

I spent the past year measuring this gap across 2,100+ AI policies worldwide. The results are both worse and better than I expected.

---

## From Principles to Governance

Here's the distinction that matters: *principles* articulate values (fairness, accountability, transparency). *Governance* translates values into actionable requirements, compliance mechanisms, and enforcement procedures. Most AI ethics policies remain stuck on principles.

I built a five-dimension framework to measure ethics governance depth:

| Dimension | What It Captures |
|:---|:---|
| **E1 Framework Depth** | Specificity of principles, coherent ethical vision |
| **E2 Rights Protection** | Privacy, non-discrimination, human oversight, due process |
| **E3 Participatory Governance** | Public consultation, multi-stakeholder processes |
| **E4 Operationalisation** | Concrete requirements, compliance mechanisms, enforcement |
| **E5 Inclusion** | Representation of marginalized groups, accessibility |

Each scored 0–4. A score of 2 means "mentioned"; a score of 4 means "comprehensive operationalization with concrete mechanisms."

The LLM ensemble (Claude Sonnet 4, GPT-4o, Gemini Flash 2.0) achieved ICC = 0.827—excellent inter-rater reliability, comparable to expert human agreement.

---

## The Numbers Are Grim

**Mean ethics score: 0.61 out of 4.0.** That's barely above "mentioned." Median is 0.40.

36.3% of policies score exactly zero on ethics. They address AI through purely technical lenses—procurement specs, interoperability standards—without engaging normative questions at all.

The Operationalisation dimension (E4) scores lowest. Policies invoke "fairness" and "accountability" without specifying what fairness means in public procurement, who's accountable when an algorithm fails, or how compliance gets enforced.

What Selbst and colleagues called "fairness gerrymandering"—proclaiming commitment without operational definitions—characterizes most of global AI ethics governance.

---

## The Income Gap That Isn't

This is where it gets interesting. Conventional wisdom says wealthy countries have more sophisticated ethics governance. The naive analysis supports this: high-income countries average 0.65 on ethics; developing countries average 0.49. Effect size d = 0.20, statistically significant.

But the variance decomposition tells a different story. **99% of variation occurs within income groups.** Tunisia, Brazil, and Canada all achieve high scores. The UK and some wealthy Asian economies score lower than their GDP would predict.

And when you control for documentation quality—restricting to policies with at least 500 words of substantive text—the income gap doesn't just shrink. It reverses sign. Developing countries with adequate documentation slightly outperform wealthy countries (d = -0.09, not significant).

The apparent gap in the full sample is a measurement artifact. Developing country policies often exist as brief announcements or summaries. When text is available, their ethics commitments match or exceed wealthy nations.

---

## The Convergence Story

Ethics gaps are narrowing faster than capacity gaps. The diffusion pattern is horizontal—regional peer learning rather than North-South technology transfer. African countries increasingly develop indigenous frameworks rather than importing Western principles. Brazil and Colombia have built sophisticated ethics governance with limited resources.

UNESCO's 2021 AI Ethics Recommendation created opportunity for convergence. Whether countries took it up is a different question (spoiler: partially—see the companion blog).

---

## What This Means

Three implications stand out:

**Ethics governance doesn't require wealth.** Countries at any income level can embed rights protections, establish participatory mechanisms, and operationalize ethical principles. The binding constraint is political commitment, not fiscal resources.

**Operationalisation is the bottleneck.** Convergence on principles means little without compliance mechanisms and enforcement capacity. Most policies are stuck at the "aspirational declaration" stage.

**Documentation matters for measurement.** Before claiming developing countries lag on ethics, check whether you're comparing comprehensive national strategies against brief press releases.

---

## Code and Data

The full analysis is documented in Book 2 of the Global Observatory of AI Governance: [github.com/lsempe77/ai-governance-capacity](https://github.com/lsempe77/ai-governance-capacity).

The five ethics dimensions join five capacity dimensions (from Book 1) to create a 10-dimension framework for assessing AI governance quality globally. Both datasets are CC BY 4.0 licensed.

---

*Ethics governance ultimately reflects political commitment to translate values into enforceable requirements—building infrastructure that makes principles meaningful. The encouraging news is that this doesn't require being rich. The discouraging news is that most countries haven't started.*
