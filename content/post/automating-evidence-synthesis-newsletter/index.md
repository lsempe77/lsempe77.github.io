---
title: "Automating Your Evidence Synthesis Newsletter with AI"
subtitle: "How I built a pipeline that scans academic databases and generates weekly research digests using LLMs"
summary: "A practical guide to building an automated newsletter system that monitors the latest research on LLMs in evidence synthesis, using OpenAlex, PubMed, arXiv, and an AI editor."
authors:
  - admin
tags:
  - AI
  - LLMs
  - Evidence Synthesis
  - Automation
  - Newsletter
  - Research Monitoring
categories:
  - Tutorials
  - AI Tools
date: 2025-12-23
lastmod: 2025-12-23
featured: false
draft: false

image:
  caption: "Automated Newsletter Pipeline"
  focal_point: "Center"
  placement: 2
  preview_only: false
---

## The Problem: Information Overload

The intersection of **Large Language Models (LLMs)** and **Evidence Synthesis** is exploding. New tools, methodologies, and benchmarks appear weekly across:

- PubMed
- arXiv
- OpenAlex
- GitHub
- Preprint servers

Manually tracking this is impossible. I needed an automated system.

## The Solution: AI-Powered Newsletter Generator

I built a pipeline that:

1. **Fetches** the latest research from multiple sources
2. **Deduplicates** by DOI to avoid repeats
3. **Finds** open access PDFs via Unpaywall
4. **Uses an AI Editor** to write practitioner-focused summaries
5. **Outputs** a ready-to-publish Markdown newsletter

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Source Ingestion                        │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│ OpenAlex │  PubMed  │ Crossref │  arXiv   │  GitHub  │  Google  │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
     │          │          │          │          │          │
     └──────────┴──────────┴────┬─────┴──────────┴──────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Deduplication (DOI)  │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Unpaywall (PDF URLs) │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │      AI Editor        │
                    │  - Headlines          │
                    │  - Summaries          │
                    │  - Categories         │
                    │  - Model extraction   │
                    │  - Relevance scoring  │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Markdown Output     │
                    │  newsletter_draft.md  │
                    └───────────────────────┘
```

## The AI Editor

The heart of the system is an LLM agent (via OpenRouter/OpenAI) that:

### 1. Writes Catchy, Practitioner-Focused Headlines

Instead of academic titles like:
> "A Systematic Evaluation of Large Language Model Performance in Risk of Bias Assessment Tasks"

It generates:
> "ChatGPT-4o Shows Promise for Data Extraction, Struggles with Bias Assessment"

### 2. Summarizes the "So What?" for Evidence Synthesis

Not just what the paper does, but why it matters:

> "This tool could reduce screening workload by 36-72% while maintaining high sensitivity—a game-changer for living systematic reviews."

### 3. Categorizes Items

- **New Tool/App**: Software you can use today
- **Methodology**: New approaches to synthesis tasks
- **Benchmark**: Evaluation studies
- **Case Study**: Applied examples

### 4. Extracts Mentioned Models

Automatically identifies: GPT-4, Claude, Llama, Mistral, Gemini, etc.

### 5. Scores Relevance

Filters out noise—only high-relevance items make the newsletter.

## Example Output

Here's what a generated newsletter looks like:

---

### New Tool/App

#### MetaBeeAI: Modular Pipeline for Systematic Reviews
**Models:** GPT-4, BioBERT | **Relevance:** 9/10

MetaBeeAI is an open-source pipeline that automates data extraction from full-text PDFs, achieving 85% accuracy compared to human reviewers. It includes an intuitive interface for human oversight. Evaluated on 924 papers.

🔗 [DOI](https://doi.org/10.1101/2025.11.24.690154) | [PDF](https://...)

---

### Methodology

#### Programmable Framework for Automated Risk-of-Bias Assessment
**Models:** Mistral Small 3.1, Claude 3.5 Sonnet | **Relevance:** 8/10

Uses DSPy's GEPA module to replace manual prompt design with code-based optimization. GEPA-generated prompts outperformed manual prompts by 30-40% in accuracy for RoB assessment.

🔗 [arXiv](https://arxiv.org/abs/2512.01452v1)

---

## Configuration

The system is configured via YAML:

```yaml
# config/settings.yaml
sources:
  openalex:
    enabled: true
    email: your-email@example.com
  pubmed:
    enabled: true
  arxiv:
    enabled: true
    categories: ["cs.CL", "cs.IR"]
  github:
    enabled: true
    token: ${GITHUB_TOKEN}

llm:
  provider: openrouter
  model: anthropic/claude-3-sonnet
  api_key: ${OPENROUTER_API_KEY}

unpaywall:
  email: your-email@example.com
```

## Running the Pipeline

```bash
# Install dependencies
pip install -r requirements.txt

# Run the pipeline
python main.py

# Output: newsletter_draft.md
```

## Key Features

| Feature | Benefit |
|---------|---------|
| **Multi-source ingestion** | Never miss relevant papers |
| **Smart deduplication** | No duplicate entries |
| **Open access discovery** | Direct PDF links when available |
| **AI-generated summaries** | Practitioner-focused, not academic jargon |
| **Relevance filtering** | Only high-quality items |
| **Markdown output** | Ready for Substack, Ghost, or any platform |

## Lessons Learned

1. **OpenAlex is underrated**—free, comprehensive, great API
2. **Deduplication by DOI is essential**—same paper appears on multiple platforms
3. **Unpaywall saves hours**—automatic PDF discovery
4. **LLM summaries need constraints**—specify word limits and format
5. **Relevance scoring prevents noise**—not everything is worth including

## Use Cases

- **Personal research monitoring**: Stay current in your field
- **Team newsletters**: Share relevant papers with colleagues
- **Living systematic reviews**: Track new evidence continuously
- **Grant writing**: Quickly survey recent literature

## What's Next?

I'm exploring:
- **Substack integration**: Auto-publish directly
- **Citation network analysis**: Track which papers cite which
- **Trend detection**: Identify emerging topics over time

---

{{% callout note %}}
This tool was developed to support evidence synthesis work at 3ie. The weekly newsletter tracks developments in LLMs for systematic reviews, meta-analyses, and evidence mapping.
{{% /callout %}}
