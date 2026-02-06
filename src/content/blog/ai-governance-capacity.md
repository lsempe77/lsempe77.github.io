---
title: "The Capacity Gap"
subtitle: "Measuring who can actually govern AI"
summary: "Countries are racing to regulate AI. But regulation is only as good as enforcement—and most countries lack the technical staff, institutional authority, and resources to implement what they've promised. This project measures that gap."
authors:
  - admin
tags:
  - AI Governance
  - Policy
  - Data Collection
  - OECD
  - Python
  - Web Scraping
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
---

In 2023, the government of Rwanda published a National Artificial Intelligence Policy. It was a professional document—35 pages, proper ministerial signatures, six strategic objectives, a three-year implementation roadmap. It committed Rwanda to establishing an AI governance framework, building ethical AI guidelines, and developing a "skilled AI workforce."

Two years later, I tried to find evidence of implementation. I found no new AI-specific regulations. No designated AI authority within government. No enforcement actions. No visible budget allocation. The policy document still lived on the Ministry of ICT website, unchanged since publication. Rwanda had announced an AI governance framework without, as far as I could tell, building the capacity to implement one.

This is not a criticism of Rwanda specifically. Rwanda is simply one example of a pattern I've observed across dozens of jurisdictions: the gap between *announced* AI policy and *implemented* AI governance. The gap matters because it creates false confidence. Citizens believe they're protected when they're not. Researchers cite policy databases that track documents, not outcomes. International comparisons rank countries by policy activity rather than policy effectiveness.

This project is an attempt to measure the gap—to go beyond cataloguing what countries say and assess what they can actually do.

---

The theoretical framing comes from public administration scholarship on "state capacity." A state can pass any law it wants; whether that law is enforced depends on institutional machinery—bureaucrats, budgets, expertise, coordination mechanisms. Developing countries often have formal legal frameworks that look like developed-country frameworks on paper but function entirely differently in practice.

The same logic applies to AI governance. The EU AI Act is 400 pages of detailed requirements: conformity assessments, post-market surveillance, regulatory sandboxes, high-risk classifications. Implementing it requires technical staff who can evaluate machine learning systems, lawyers who can interpret risk categories, inspectors who can audit algorithmic compliance, and coordination mechanisms across national authorities. Does Malta have this capacity? Does Bulgaria? Does Portugal?

Nobody has systematically measured it. We have excellent databases of AI policies—OECD.AI catalogs over 1,000 AI-related initiatives across 70+ countries, Stanford's AI Index tracks national strategies, IAPP maintains a legislation tracker. But these are inventories of *outputs* (documents), not *outcomes* (implementation). A country can have 47 "AI initiatives" and still lack a single person who can conduct an algorithmic audit.

---

The framework I've developed has five dimensions of governance capacity:

**Institutional architecture.** Is there a dedicated AI unit within government? Is there a coordination mechanism across ministries (since AI touches everything from health to defense)? Are there AI-specific regulatory instruments, or just general data protection applied to AI by analogy?

**Legal authority.** Do regulators have enforcement powers over AI systems? Can they require disclosure, mandate audits, impose penalties? Or is their authority limited to issuing non-binding guidance?

**Technical expertise.** What's the qualification profile of regulatory staff? Does the country participate in international standards bodies (ISO, IEEE) where technical norms are developed? Are there formal partnerships between government and technical institutions—universities, research labs, industry?

**Resources.** What's the budget allocation for AI governance functions? How many FTEs work on AI-related policy? This is often the hardest data to find: most countries don't break out AI spending in their budget documents.

**Implementation evidence.** Has the regulator taken enforcement actions? Has it issued binding guidance? Is there a functioning complaint mechanism for AI-related harms? Have there been audits?

For each dimension, I'm developing 2-4 indicators, each scored 0-3 based on documented evidence. The goal is a composite index that's transparent, replicable, and useful for comparative research.

---

The data collection pipeline is where the project gets technical.

Some of what I need is publicly available but scattered. Annual reports from data protection authorities sometimes mention AI-specific activities. Budget documents occasionally include AI line items. Press releases announce enforcement actions. Government websites list staff with biographies. All of this requires systematic scraping and extraction.

I started with the OECD.AI database—the most comprehensive index of AI policy documents. But OECD.AI is built on JavaScript rendering, so I needed Playwright for browser automation. The scraping pulls policy documents, extracts structured metadata (country, date, type, implementing body), and downloads the underlying PDFs. Rate limiting requires careful delays to avoid overloading their servers. Caching prevents re-downloading 1,000+ documents on every pipeline run.

The second stage enriches the OECD data with other sources: IAPP's enforcement tracker, government budget documents, international standards participation records (ISO publishes member lists). For some indicators—particularly technical expertise and budget allocation—the data simply doesn't exist in standardized form. I'm filling gaps through manual research and, eventually, freedom of information requests.

The third stage—still under development—uses GPT-4 to score indicators based on collected evidence, with human validation for a calibration sample. The LLM reads a dossier of documents for each country and produces structured scores with justifications. This isn't reliable enough to run unattended, but it accelerates what would otherwise be months of manual coding.

---

The pilot dataset covers 12 jurisdictions: China, the US, the UK, France, Germany, Japan, South Korea, Singapore, Brazil, Kenya, UAE, and the EU as a supranational entity. The composite scores range from 87 (China) to 7 (Kenya).

Some observations from the pilot:

**High income correlates with capacity, but not perfectly.** Singapore and South Korea punch above their GDP weight—small populations but concentrated technical expertise and well-funded regulators. The US scores lower than expected because the federal government has limited regulatory authority over AI; most capacity sits in states like California, which aren't yet in my dataset.

**The EU is hard to score** because governance is split between Brussels and member states. The Commission has capacity: DG CNECT employs technical staff, the AI Office was established specifically for AI Act implementation, there's a visible budget. Whether that Brussels capacity translates to enforcement in Romania or Bulgaria is a different question.

**Emerging economies have strategies but not implementation machinery.** Kenya's AI Task Force published a report in 2024. I found no evidence it led to staffing, budget allocation, or regulatory activity. Brazil's LGPD (data protection law) nominally covers AI, but the ANPD (data protection authority) has fewer than 100 staff covering all data protection issues, not AI specifically.

**The gap between policy and capacity is widest for complex requirements.** Take algorithmic impact assessments—a requirement showing up in legislation everywhere. The EU AI Act requires them. Canada's proposed AIDA would require them. But an impact assessment is only as good as the people conducting and reviewing it. How many jurisdictions have staff who can evaluate whether a facial recognition system's training data is representative? I count maybe eight that could actually implement this at scale.

---

The research questions I want to answer with the complete dataset:

**What predicts capacity?** Income is obviously important, but does regime type matter? Prior experience with technology regulation? International integration? Geographic region? These are tractable questions once you have cross-country data.

**Does capacity predict effectiveness?** Countries with higher scores should, in theory, have better outcomes—fewer algorithmic scandals, more responsive regulatory adaptation. But measuring outcomes is its own data collection challenge. I'd need incident databases, sentiment analysis of AI coverage, expert surveys.

**Are there capacity traps?** This is the most policy-relevant question. Maybe countries that adopt ambitious AI legislation without building capacity create worse outcomes than countries that do nothing. You pass a law you can't enforce, companies ignore it because enforcement never comes, the law's existence gives citizens false confidence that protections exist. I suspect this is happening in several middle-income countries, but proving it requires counterfactual reasoning I don't have clean identification for.

---

The immediate outputs will be a working paper and an open dataset. The methodology paper will document the indicators, scoring rubrics, and data sources in enough detail that others can extend the coverage or challenge the scoring. The dataset itself will be on GitHub—country-level scores with supporting evidence files.

Longer term, I want this to become a living monitoring project. The OECD updates its policy database regularly; capacity indicators could be layered on top. Whether I have resources to maintain this beyond the initial research phase is unclear. Dataset maintenance is unglamorous work that doesn't produce publications.

But the core finding is already clear: the global AI governance landscape is defined as much by capacity gaps as by policy choices. Understanding what countries have promised requires reading their policy documents. Understanding what countries can deliver requires looking at their institutions. The two are not the same.

{{< icon name="python" pack="fab" >}} Python | Playwright | PostgreSQL | 80+ jurisdictions (target) | 5 dimensions, 15 indicators

*Pilot complete. Full dataset forthcoming.*
