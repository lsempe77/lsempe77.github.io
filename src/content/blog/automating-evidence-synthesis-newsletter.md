---
title: "I Got Tired of Missing Papers"
subtitle: "Automating a weekly evidence synthesis newsletter with AI"
summary: "Three papers on LLMs for systematic reviews dropped last week. I found out about them a month later. So I built a pipeline that scans academic databases and writes practitioner-focused summaries while I sleep."
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
  - Research Tools
  - AI
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

The field moves faster than I can read.

Every week, someone publishes a new benchmark comparing LLMs for title-abstract screening. A startup releases a tool claiming 80% workload reduction. An arXiv preprint introduces a novel approach to data extraction that might actually work. And I find out about it three weeks later, when a colleague mentions it in passing, and I feel like an idiot for not knowing.

I tried setting up Google Scholar alerts. They're too noisy—hundreds of tangentially related papers burying the few that matter. I tried RSS feeds from key journals. The important papers often show up on preprint servers first. I tried checking Twitter daily. That way lies madness.

So I automated it. Now a script runs every Sunday night, pulls from five academic sources, deduplicates by DOI, and sends the results to an LLM that writes the kind of summaries I actually want to read. Monday morning I get a newsletter draft in my inbox. I review it in fifteen minutes, publish it, and know I haven't missed anything important.

---

The architecture is simpler than it sounds. Five data sources feed into a pipeline that converges on a single output:

OpenAlex provides the broadest coverage—170 million papers indexed, with decent metadata and open access links. PubMed catches the biomedical angle that OpenAlex sometimes misses. arXiv gives me preprints before they hit journals. Crossref fills gaps where OpenAlex metadata is incomplete. GitHub surfaces tools and codebases that never make it to academic databases.

Each source has its own quirks. PubMed's API returns XML that needs parsing. arXiv's OAI-PMH interface is slow but comprehensive. OpenAlex is fast but sometimes returns duplicates across affiliation variations. The first version of the pipeline crashed constantly because I assumed all APIs would return consistent formats. They don't.

The deduplication stage matches on DOI where available, falling back to fuzzy title matching for preprints without DOIs. This catches about 95% of duplicates. The remaining 5%—papers with slightly different titles across versions—I catch during manual review.

---

The interesting part is the AI editor.

Academic titles are written for search algorithms, not humans. "A Systematic Evaluation of Large Language Model Performance in Risk of Bias Assessment Tasks for Randomized Controlled Trials" communicates nothing about why you should care. The AI rewrites it: "GPT-4 Shows Promise for Bias Assessment, Struggles with Complex Domains."

More importantly, the AI generates what I call "So What?" summaries. Not just what the paper does, but why it matters for practitioners. "This tool could reduce screening workload by 40% while maintaining 95% sensitivity—worth evaluating for living reviews with limited resources."

The prompt engineering took longer than the rest of the pipeline. Early versions produced corporate-speak ("leveraging cutting-edge AI capabilities") or buried the lede ("This paper, building on extensive prior work in the field, presents..."). I iterated until the outputs sounded like something I'd write if I had time to write it.

The model also categorizes each item—new tool, methodology paper, benchmark study, case study—and extracts any specific models mentioned (GPT-4, Claude, Gemini). This makes the newsletter scannable. Readers can jump to the section they care about.

---

The whole thing runs on a cron job. Sunday 11pm: fetch from all sources. Monday 12am: deduplicate and fetch PDFs where available. Monday 1am: run through the AI editor. Monday 6am: email me the draft.

Total cost per week is about $2 in API calls—mostly the LLM summarization. The academic APIs are free. Running it myself would take 4-5 hours of searching, reading abstracts, and writing summaries. I've been doing this for six months now, which works out to about 100 hours saved for $50.

The newsletter has a few hundred subscribers, mostly evidence synthesis practitioners and research librarians. The feedback I get most often: "How do you find time to read all this?" The honest answer is that I don't—I outsourced the reading to a machine that doesn't get tired.

---

The code is messy but functional. If you want to build something similar, the hard parts are: (1) handling API rate limits gracefully, (2) getting the deduplication right without false negatives, and (3) writing prompts that produce consistently useful output. Everything else is plumbing.

I've thought about making it a proper product—multi-topic support, customizable sources, subscriber management. But that would mean maintaining it, and I already have too many side projects. For now it just runs, every Sunday night, pulling papers I'd otherwise miss and turning them into something I can actually use.

{{< icon name="envelope" pack="fas" >}} Newsletter automation | OpenAlex | PubMed | arXiv | LLM editing

*The newsletter is free. Subscribe link in my bio.*

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
