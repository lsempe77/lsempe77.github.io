---
title: "The Capacity Gap"
subtitle: "What I found scoring 2,100 AI policies"
summary: "I scored 2,100+ AI policies across 70+ countries on implementation capacity. The headline isn't that rich countries do better—it's that the gap nearly vanishes once you account for documentation quality. The real story is what's happening within income groups."
authors:
  - admin
tags:
  - AI Governance
  - Policy
  - LLMs
  - OECD
  - Python
categories:
  - Policy Analysis
  - Research Methods
date: 2026-02-06
lastmod: 2026-02-06
featured: true
draft: false

image:
  caption: "Global AI governance capacity"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
external_link: https://github.com/lsempe77/ai-governance-capacity
---

This is the first book in a trilogy on global AI governance. The second examines ethics governance—whether countries operationalize principles like fairness and accountability. The third measures alignment with UNESCO's 2021 AI ethics framework. But everything starts here, with a more fundamental question: do governments have the institutional capacity to implement their AI policies at all?

I started this project skeptical of the AI governance boom. Between 2017 and 2025, governments produced over 2,200 AI policy initiatives catalogued in the OECD.AI Policy Observatory. Every week brings another national AI strategy, another sectoral guideline, another set of principles. The announcements sound impressive. But counting policies tells you nothing about whether they'll actually work.

Implementation science has a term for this: the "knowing-doing gap." Organizations can articulate sophisticated strategies while lacking the institutional infrastructure to execute them. A policy without resources is a wish. A policy without enforcement is a suggestion. A policy without accountability is a performance.

To find out where global AI governance actually stands, I built a scoring system. Three frontier LLMs (Claude Sonnet 4, GPT-4o, Gemini Flash 2.0) read each policy document and assessed it across five dimensions of implementation capacity. The results challenged my assumptions—not always in the direction I expected.

---

## The Framework

The five dimensions come from implementation science literature—the factors that predict whether policies translate into practice versus remaining aspirational documents.

Each policy is scored 0–4 on five dimensions:

**C1: Clarity & Specificity.** How precise are the objectives and targets? "Promote AI development" scores low—it could mean anything. "Train 10,000 AI specialists by 2025" scores high—you can measure whether it happened. This dimension distinguishes between policies that create genuine accountability (clear targets that can be evaluated) versus policies designed to sound good without committing to anything specific.

**C2: Resources & Budget.** Are financial, human, and technical resources specified? This is where most policies fail. They mention "adequate resources" or "sufficient investment" without numbers. Few commit to specific budget lines that would allow external observers to check whether funding materialized. A policy without resources is a wish list.

**C3: Authority & Enforcement.** Does the policy carry legal mandates? Can regulators compel compliance, conduct audits, impose penalties? Or is it guidance that companies can ignore? The difference between binding regulation and voluntary principles determines whether governance has teeth. Many "AI strategies" are actually coordination documents with no enforcement mechanism.

**C4: Accountability & M&E.** Are there oversight mechanisms, reporting requirements, review processes? Who monitors implementation? What happens when targets are missed? This dimension captures whether governments commit to transparent assessment of their own performance. Spoiler: most don't.

**C5: Coherence & Coordination.** Is there inter-agency coordination? Consistency with existing frameworks? AI governance touches health ministries, defense departments, transport authorities, financial regulators, data protection agencies—someone needs to coordinate. This dimension measures whether governments have addressed the multi-sectoral nature of AI or created siloed policies that may conflict.

Three models score each document independently. The median becomes the final score (reducing outlier influence). Inter-rater reliability is excellent (ICC = 0.827)—comparable to expert human agreement on governance assessment tasks.

---

## The Headline Finding

The average AI policy scores **0.83 out of 4.0** on implementation capacity. That's not a typo. On a scale where 2 means "described" and 4 means "comprehensively operationalized," global AI governance barely clears "mentioned."

The distribution is heavily right-skewed. Most policies cluster at or near zero on multiple dimensions. More than a quarter score exactly zero on the composite—they're announcements, press releases, statements of intent, not operational governance instruments with any chance of influencing behavior.

**But here's what surprised me:** the gap between high-income and developing countries is *small*. Cohen's d = 0.30. That's a real difference, but not the chasm you'd expect from development economics priors. And it gets smaller.

When I restrict the analysis to well-documented policies (≥500 words of extractable text), the income gap nearly vanishes: **d = 0.04**. Statistically insignificant. What looked like a capacity divide turned out to be largely a *documentation* divide.

The mechanism is straightforward: rich countries produce longer PDFs. Longer PDFs give the LLM scorers more evidence to work with. A comprehensive French strategy with 50 pages of detail will score higher than a brief Senegalese announcement—not necessarily because France has more capacity, but because the French document provides more text to extract signals from. The measurement artifact swamps the substantive difference.

This doesn't mean documentation doesn't matter for governance. Clear, detailed policy documents *are* a form of capacity—they signal serious institutional effort and create external accountability. But it does mean we should be cautious about interpreting raw score gaps as capacity gaps.

---

## The Real Story: Within-Group Variation

Here's the finding that reframes everything: **98% of the variation in governance capacity sits *within* income groups, not between them.**

The Theil decomposition makes this stark. If I gave you a country's income classification and asked you to predict its AI governance capacity, you'd barely do better than random. The between-group component explains 2% of variance. The within-group component explains 98%.

What does this mean concretely? The variation between Luxembourg's sophisticated framework and Malta's minimal AI governance is larger than the average gap between all high-income countries and all developing countries. The spread among African nations—from Rwanda's focused institutional effort to other countries' near-zero engagement—dwarfs any North-South divide.

**Some developing countries consistently outperform their GDP predictions:**

- **Brazil** has built substantial AI governance infrastructure despite economic constraints. Its national AI strategy includes specific timelines, designated implementing agencies, and explicit coordination mechanisms.

- **Kenya** punches above its weight on clarity and coordination. The Kenyan approach focuses on realistic targets within resource constraints rather than aspirational declarations.

- **Rwanda** demonstrates what's possible with limited resources but focused institutional commitment. Its AI policy scores above many EU member states on operational specificity.

- **Tunisia** shows similar patterns—governance capacity isn't about wealth, it's about institutional effort.

Meanwhile, some wealthy countries underperform. I won't name them to avoid diplomatic complications, but several high-income jurisdictions have AI policies that amount to little more than press releases. Having money doesn't automatically translate to governance capacity—you have to decide to build the institutions, allocate the resources, and commit to accountability.

---

## Dimension-Level Patterns

The five dimensions reveal a consistent global pattern—where AI governance is strongest and where it's weakest:

| Dimension | Mean | Interpretation |
|:---|---:|:---|
| C5 Coherence | 1.07 | Coordination mechanisms exist |
| C3 Authority | 1.04 | Legal frameworks often present |
| C1 Clarity | 0.94 | Objectives stated, targets rare |
| C2 Resources | 0.68 | Usually unspecified |
| C4 Accountability | 0.48 | Oversight rarely defined |

The ordering is revealing. Governments are more than twice as likely to establish coordination mechanisms (C5) as to specify accountability structures (C4). They articulate what they intend to do and how agencies should work together *before* committing to transparent oversight of whether any of it is working.

**This is a warning sign.** Accountability is the dimension that catches implementation failures. Without monitoring and evaluation, without reporting requirements, without review processes, policies become performative documents. They create the appearance of governance without the substance. Nobody checks whether targets are met because nobody defined measurable targets. Nobody evaluates whether resources were deployed because nobody specified what resources were committed.

The resource dimension (C2) is also troublingly low. Policy after policy mentions "adequate funding" or "sufficient investment" without numbers. Budget specificity is politically costly—it creates accountability, it constrains future decisions, it makes failure visible. Most governments prefer the flexibility of vague commitments.

Authority (C3) scores higher because many AI policies take the form of regulations or laws with formal legal status. But legal authority without enforcement capacity is hollow. A regulation nobody monitors is less binding than a guideline someone checks.

---

## Policy Diffusion: Horizontal, Not Vertical

One finding challenged my priors about how governance norms spread globally. The standard development narrative assumes a cascade pattern: wealthy nations develop sophisticated frameworks, international organizations codify best practices, developing countries adopt them with a lag. Technology transfer, capacity building, North-to-South diffusion.

That's not what the data show.

Policy diffusion runs *horizontally within income groups* rather than trickling down from wealthy nations. Middle-income countries learn from middle-income peers. Developing countries adapt frameworks from other developing countries facing similar resource constraints. The successful developing-country policies don't look like simplified versions of the EU AI Act—they look like adaptations of what worked in Kenya, Rwanda, or Brazil.

**This has practical implications for technical assistance:**

The instinct among international organizations is to export EU or US models to the Global South. Send experts to explain the AI Act. Provide templates based on NIST frameworks. Assume that what works for well-resourced regulatory agencies will work everywhere.

But the successful developing-country frameworks are often structurally different—simpler, more focused, realistic about resource constraints, integrated with existing institutions rather than creating new ones. Rwanda doesn't need to replicate the EU's risk categorization system. It needs models from Kenya, Tunisia, and Brazil that show how to build meaningful governance with limited budgets.

The peer learning channels are already active. African Union coordination, regional policy forums, South-South exchanges. The question is whether international assistance supports these horizontal networks or continues trying to impose vertical models that don't transfer well.

---

## The Method

Building this dataset required solving several technical problems. Policy documents don't come in convenient formats.

**Stage 1: Retrieval.** The OECD.AI Observatory provides metadata and links, but links break. I built a cascade retrieval system: try direct download first, then follow embedded links, then check the Wayback Machine, then search DuckDuckGo for alternative URLs, and finally use Claude's web search as a last resort. This achieved 94% document recovery—2,100+ full texts from 2,200+ metadata records.

**Stage 2: Extraction.** PDF extraction is harder than it looks. Government documents come in scanned images, weird encodings, password protection, corrupt files. PyMuPDF handles most cases; trafilatura extracts text from HTML alternatives. Quality tiering by word count: 43% "good" (≥500 words of clean text), 36% "thin" (100–499 words), 21% "stub" (<100 words or extraction failure).

**Stage 3: Scoring.** Three frontier LLMs score each document against the five-dimension rubric. The prompt includes detailed scoring criteria with examples. Each model returns structured JSON with dimension scores and brief justifications. 6,641 API calls total (three models × 2,100+ documents, plus retries for parsing failures).

**Stage 4: Analysis.** The modeling strategy accounts for the data structure: OLS for baseline estimates, multilevel models with country random effects, quantile regression to examine different parts of the distribution, Tobit models to handle floor effects (many scores at zero). Theil decomposition for variance partitioning. K-means clustering to identify policy archetypes.

All code is on [GitHub](https://github.com/lsempe77/ai-governance-capacity)—the retrieval pipeline, extraction scripts, scoring prompts, and analysis notebooks. The rubrics are documented in enough detail that others can replicate, challenge, or improve the methodology. Reproducibility isn't optional for this kind of work.

---

## What This Means

The policy implications aren't what you'd expect from the headline "developing countries have lower AI governance capacity." The story is more interesting than that.

**1. Documentation ≠ capacity.** The measured gap between rich and poor countries largely reflects how they write about governance, not how they do it. Long PDFs signal institutional resources for document production; they don't necessarily signal implementation capacity. Before concluding that a country lacks governance capability, check whether you're comparing comprehensive national strategies against brief ministerial announcements.

**2. Learn from peers, not from Brussels.** Brazil, Kenya, and Rwanda offer more transferable lessons for other developing countries than the EU AI Act does. They demonstrate what's achievable with realistic resources and existing institutions. International technical assistance should support these South-South learning networks rather than trying to transplant European frameworks that assume regulatory infrastructures that don't exist.

**3. Accountability is the universal gap.** Across every income group, oversight mechanisms are the weakest governance dimension. This isn't a development problem—it's a governance design problem. Rich countries avoid accountability commitments too. Every jurisdiction should ask: who reviews whether our AI policies are working? What happens when targets are missed? Who's responsible when implementation fails? If you can't answer these questions, your AI strategy is a press release.

**4. Within-group variation dominates.** The North-South framing obscures more than it reveals. Income classification explains 2% of capacity variance. The interesting question isn't "do rich countries have more capacity?" It's "why do some countries—at any income level—build serious governance infrastructure while others produce empty announcements?" That's a political economy question, not a development economics question.

---

The full research is published as a [Quarto book](https://github.com/lsempe77/ai-governance-capacity) with complete methodology, robustness checks, and country-level data. Books 2 and 3—on ethics governance and UNESCO alignment—use the same corpus and methodology.

*This research is part of my work on AI governance at 3ie.*
