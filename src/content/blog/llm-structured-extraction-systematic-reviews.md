---
title: "The Spreadsheet That Filled Itself"
summary: "Data extraction is the systematic review task nobody warns you about. After manually coding 300 PDFs once, I swore never again. GPT-4 can do it reliably—if you prompt it right."
date: 2025-11-20
authors:
  - admin
tags:
  - LLMs
  - Systematic Reviews
  - Data Extraction
  - GPT-4
  - Python
  - Evidence Synthesis
image:
  caption: 'Automated structured extraction from research papers'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Evidence Synthesis
  - AI/ML
featured: true
draft: false
projects: []
---

*Code for the extraction pipeline is at [github.com/lsempe77/paper-screening-pipeline](https://github.com/lsempe77/paper-screening-pipeline). For the bigger picture of where extraction fits in the systematic review workflow, see [Where AI Actually Helps in Systematic Reviews](/blog/llms-systematic-review-pipeline).*

---

## The Problem

My first evidence map nearly broke me.

Not the searching—we had a librarian for that. Not the screening—we split it across three reviewers. The data extraction. Three hundred papers, each requiring forty fields: authors, year, country, methodology, sample size, intervention type, outcomes, effect sizes, risk of bias...

I spent three weeks filling in spreadsheets. My wrists hurt. My eyes hurt. I started making errors from fatigue—transposing digits, misremembering which paper I was coding. The quality control review found inconsistencies across my own coding sessions, let alone compared to other reviewers.

There had to be a better way. When GPT-4 came out, I tested it on extraction. The first attempts were a mess—hallucinated author names, inconsistent formats, fields that worked for some papers and failed for others. But with careful prompt engineering, I got it to reliably extract structured data from PDFs at about 90% accuracy.

That's good enough to use as a first pass, with human verification for the remaining 10%. What took three weeks now takes three hours plus a few hours of cleanup.

---

## The Prompt Engineering

The trick is treating the LLM like a meticulous but literal-minded research assistant. You can't say "extract the metadata"—that's too vague. You have to specify exactly what you want, in what format, with examples of edge cases.

The prompt I use establishes an expert persona ("You are an academic evidence synthesis researcher with extensive experience in systematic reviews"), provides explicit formatting for every field ("Authors: Last name, First name; semicolon separated"), and includes examples for ambiguous cases ("If multiple data collection periods are mentioned, list all: '2018-2020; 2021'").

The output is JSON, because JSON is unambiguous and machine-parseable. Free-form text responses drift—one paper gets a paragraph summary, another gets bullet points. JSON forces consistency.

I also found that asking for reasoning improves accuracy. "Extract the study methodology and explain why you classified it this way" produces better classifications than "Extract the study methodology." The model's explanation reveals when it's uncertain, which flags cases for human review.

---

## The Pipeline

The pipeline runs in stages. First, PDF text extraction using PyMuPDF, which handles academic layouts better than simpler parsers. Second, chunking into sections—abstract, methods, results—so the model can process without exceeding context limits. Third, the extraction prompt, sent section by section with accumulated context. Fourth, validation against known fields (is the year a plausible four-digit number? is the country in the ISO list?). Fifth, output to SQLite for storage and CSV for analysis.

The chunking matters more than I expected. If you send the full paper as one block, the model loses track of which section mentions what. Asking "what's the sample size?" when the methods and results sections are concatenated sometimes returns the wrong number—the one mentioned in passing during literature review, not the actual study sample. Sending sections separately, with clear labels, fixes this.

I run everything through a local FAISS index as well, so I can later search across extracted metadata semantically. "Show me RCTs on cash transfers in East Africa" works because the methodology, intervention type, and country fields are all indexed.

---

## Accuracy by Field

Accuracy varies by field. Bibliographic metadata—authors, title, year—is near-perfect, around 98%. The model can read a header. Sample size is trickier, around 85%, because papers report multiple sample sizes (eligible, enrolled, analyzed) and the model sometimes picks the wrong one. Methodology classification (RCT vs. quasi-experimental vs. observational) is about 90%, with most errors being ambiguous cases that human coders would also struggle with.

The hardest fields are the interpretive ones: risk of bias assessments, intervention complexity ratings, outcome effect directions. These require reading between the lines in ways that current models do inconsistently. For those, I use the LLM to pre-fill a draft that human coders review and correct.

The economics work out clearly. A research assistant costs maybe $30/hour. Manual extraction of 40 fields from one complex paper takes about 45 minutes—so roughly $22 per paper. LLM extraction costs about $0.50 per paper in API calls, plus maybe 5 minutes of human verification ($2.50). That's $3 per paper instead of $22. For a review with 300 papers, you're saving $5,700.

---

I've shared the prompts and pipeline with a few colleagues doing their own reviews. The feedback is consistent: it works, but you have to trust-but-verify. The model is confident even when wrong. You need validation steps that catch errors before they propagate into your analysis.

The philosophical question is whether LLM-assisted extraction counts as "human coding" for the purposes of systematic review methodology. I think it does, as long as humans verify—you're using a tool to accelerate a human process, not replacing human judgment. But methodologists may disagree. The Cochrane guidance on AI tools is still being written.

For now, I'm just glad I never have to fill in another spreadsheet cell by cell. The robot does the tedious part. I do the part that requires judgment. That's a division of labor I can live with.

---

## Try It

The extraction pipeline code is at [github.com/lsempe77/paper-screening-pipeline](https://github.com/lsempe77/paper-screening-pipeline). It includes the prompt templates, caching logic, and validation checks described here.

For context on where extraction fits in the broader systematic review workflow, see my companion post: [Where AI Actually Helps in Systematic Reviews](/blog/llms-systematic-review-pipeline).

*Developed to support evidence synthesis work at 3ie.*
