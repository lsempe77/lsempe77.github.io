---
title: "Where AI Actually Helps in Systematic Reviews"
subtitle: "A practical map of what works, what's risky, and what's still hype"
summary: "After two years of experimenting with AI tools across a dozen evidence projects, I've learned what works at each stage of the systematic review pipeline. This is the guide I wish I'd had when I started."
authors:
  - admin
tags:
  - AI
  - LLMs
  - Systematic Reviews
  - Evidence Synthesis
  - Research Methods
categories:
  - Research Methods
date: 2025-12-22
lastmod: 2025-12-22
featured: false
draft: false

image:
  caption: "LLMs in the Systematic Review Pipeline"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

*Code for screening and extraction pipelines is at [github.com/lsempe77/paper-screening-pipeline](https://github.com/lsempe77/paper-screening-pipeline). For a deep dive on data extraction specifically, see [The Spreadsheet That Filled Itself](/blog/llm-structured-extraction-systematic-reviews).*

---

## The Honest Answer

"Can AI do systematic reviews now?"

I get this question constantly. The honest answer is: AI can accelerate parts of the pipeline dramatically, make other parts marginally easier, and will actively hurt you in a few places if you trust it blindly. The nuance matters, and most overviews I've seen either oversell ("AI will replace reviewers!") or undersell ("AI is too error-prone for serious research").

After using these tools on about a dozen evidence synthesis projects—some successfully, some not—I have a practical sense of where they fit. This is the map I wish someone had given me two years ago.

---

The systematic review pipeline has roughly twelve stages. At each stage, the question is: what can AI do, what's the risk, and is it worth the overhead?

**Defining the research question.** This is fundamentally a human task, but LLMs make useful sparring partners. Describe your topic in plain language and ask Claude or GPT-4 to help structure it as PICO (Population, Intervention, Comparison, Outcome). The model will surface framings you hadn't considered. It's brainstorming, not automation. Risk is low because you're not taking the output as final—you're using it to think.

**Writing the protocol.** LLMs can draft protocol sections from templates, especially the boilerplate (data management, dissemination plans). They can check your draft against the PRISMA-P checklist and flag missing elements. I wouldn't trust an LLM to write the methods unsupervised, but for generating a first draft that humans then refine, it saves time.

**Developing the search strategy.** This is where I've seen both successes and disasters. LLMs are good at generating synonyms and related terms—ask for "all the ways researchers might describe cash transfer programs" and you'll get a useful list. They're reasonably good at constructing Boolean syntax. But they hallucinate database-specific operators, invent field codes that don't exist, and confidently produce searches that look correct but miss swathes of literature. Use them for ideation, then have a librarian or information specialist validate.

---

**Retrieving references.** AI doesn't help here. You're just running queries against databases. This is plumbing.

**Screening titles and abstracts.** This is the killer app. Screening 10,000 abstracts manually takes 200-400 person-hours. AI-assisted screening can reduce workload by 50-80% while maintaining high sensitivity, if you set it up correctly.

The key is using AI as a filter, not a decision-maker. Train a model (or use a tool like ASReview) on your first few hundred screened records, then let it prioritize the remaining records by predicted relevance. Screen the high-probability records first. Stop when you hit a threshold of consecutive irrelevant records—by then, you've likely seen all the relevant ones.

The risk is false negatives: the AI excludes a relevant study that you never see. This is why you need validation—sample from the AI's exclusions and check. If you're finding relevant studies in the excluded pile, your threshold was wrong.

**Retrieving full texts.** AI doesn't help much here either. You're clicking through library systems and emailing authors. Some tools automate the clicking, but that's not AI—it's scraping.

---

**Extracting data.** This is my second favorite use case. Extracting structured fields from hundreds of papers is tedious and error-prone. LLMs can do it faster and more consistently, with the right prompting.

The trick is specificity. Don't ask "extract the metadata"—ask "extract the sample size, specifying whether it's the enrolled sample, analyzed sample, or intent-to-treat sample, and provide the page number where you found it." JSON output format, explicit examples for edge cases, and a request for the model's reasoning all improve accuracy.

I see about 85-90% accuracy on most fields, higher for bibliographic data, lower for interpretive judgments. Use it as a first pass that humans verify.

**Critical appraisal.** This is risky. Risk-of-bias assessment requires reading between the lines—understanding what "adequate" randomization means, detecting selective reporting, judging whether blinding was plausible. LLMs are inconsistent here. They'll confidently mark a study as "low risk" when the allocation concealment is ambiguous.

Use LLMs to pre-fill the assessment form with citations to relevant text, but have humans make the final judgment. Don't automate this stage.

---

**Synthesis and meta-analysis.** For narrative synthesis, LLMs can help structure the argument and ensure you've addressed all included studies. For meta-analysis, they're useless—you need specialized statistical software, not a language model.

The risk in narrative synthesis is that the LLM smooths over contradictions. If your studies disagree, a good synthesis highlights and explains the disagreement. An LLM might produce a fluent paragraph that papers over the conflict. Always compare the LLM's synthesis to your own reading of the primary studies.

**Writing and editing.** LLMs are excellent editors. Paste in your draft; ask for clarity improvements, jargon reduction, or structural suggestions. I use Claude for this constantly. The output isn't final copy, but it surfaces issues I'd otherwise miss.

**Dissemination.** Creating plain-language summaries, policy briefs, social media threads—LLMs handle this well. They're good at register shifts. A technical finding becomes an accessible explanation. Just verify that the simplification didn't introduce inaccuracy.

---

The meta-point is that AI tools are amplifiers, not replacements. They make good reviewers faster. They don't make bad reviewers good. If you don't understand methodology, you can't verify the LLM's methodology extraction. If you don't know what a rigorous search strategy looks like, you can't catch the LLM's hallucinated operators.

I've seen projects where AI tools saved 60% of time with no loss in quality. I've also seen projects where over-reliance on AI produced reviews with systematic errors that took months to fix. The difference wasn't the tools—it was whether the humans using them understood the task well enough to verify the output.

Start with the stages where risk is low (protocol drafting, literature monitoring, writing assistance) before moving to higher-risk stages (screening, extraction). Build confidence in the tools' failure modes. And never submit anything an LLM produced without human verification.

---

## Stage 1: Define Research Question

Defining a precise research question is the hardest part of any review. AI tools can act as a sparring partner here, helping to translate vague natural language ideas into structured PICO (Population, Intervention, Comparison, Outcome) frameworks. Beyond just refinement, they can help identify existing systematic reviews on the same topic—saving you from duplicating work that’s already been done.

### Tools & Resources
| Tool | Use Case |
|------|----------|
| ChatGPT/Claude | Brainstorm and refine PICO elements |
| Consensus.app | Search for existing reviews on your topic |
| PROSPERO | Check for registered protocols |

### Example Prompt
```
I want to study the effects of cash transfer programs on poverty 
reduction in Sub-Saharan Africa. Help me define:
- Population (P)
- Intervention (I)  
- Comparison (C)
- Outcomes (O)
```

---

## Stage 2: Write Protocol & Register

Once the question is set, writing the protocol ensures transparency and rigor. LLMs are excellent at drafting standard protocol sections based on templates and checking your draft against the PRISMA-P checklist for completeness. However, never let an AI write the methodology unsupervised—use it to generate drafts that you refine and validate carefully.

### Tools & Resources
| Tool | Use Case |
|------|----------|
| ChatGPT/Claude | Draft protocol sections |
| PROSPERO | Protocol registration |
| PRISMA-P Checklist | Ensure completeness |

### Best Practice
Always have humans review AI-generated protocol text. Use AI for first drafts, not final versions.

---

## Stage 3: Develop Search Strategy

### What AI Can Do
- Generate search terms and synonyms
- Build Boolean logic strings
- Translate searches across databases (PubMed → Scopus → Web of Science)

### Tools & Resources
| Tool | Use Case |
|------|----------|
| ChatGPT/Claude | Generate search terms, Boolean strings |
| Polyglot Search | Translate searches across databases |
| PubMed MeSH Browser | Identify controlled vocabulary |

### Example Prompt
```
Generate a comprehensive search strategy for PubMed to find 
studies on "school feeding programs" and "academic achievement" 
in low-income countries. Include:
- MeSH terms
- Free text synonyms
- Boolean operators
```

---

## Stage 4: Retrieve References

### What AI Can Do
- Automate reference downloads from multiple databases
- Deduplicate across sources
- Enrich metadata (add abstracts, DOIs)

### Tools & Resources
| Tool | Use Case |
|------|----------|
| OpenAlex API | Free, comprehensive reference retrieval |
| Europe PMC API | Open access full texts |
| Unpaywall | Find open access versions |
| ASReview | Import and manage references |

### Pro Tip
Use OpenAlex's free API for comprehensive coverage—it includes Crossref, PubMed, and more.

---

## Stage 5: Screen Titles & Abstracts ⭐

### What AI Can Do
- **Priority screening**: Rank references by relevance
- **Dual screening replacement**: AI as second reviewer
- **Stopping rules**: Determine when to stop screening

### Tools & Resources
| Tool | Use Case | AI Model |
|------|----------|----------|
| **ASReview** | Active learning for screening | Multiple |
| **Rayyan** | Collaborative screening | Proprietary |
| **Abstrackr** | Machine learning screening | ML-based |
| **Nested Knowledge** | AI-assisted screening | Proprietary |
| **Covidence** | End-to-end review platform | ML-based |

### The State of the Art

Recent research shows:
- AI can reduce screening workload by **36-72%** while maintaining sensitivity
- Dual screening with AI achieves comparable accuracy to human-human
- **Stopping rules** help determine when you've found enough (see my other post on this!)

> **Validation is essential!** Always validate AI screening on a random sample before full deployment. See my tutorial on [Why Fixed-Sample AI Screening Validation Fails](/blog/ai-screening-validation).

---

## Stage 6: Retrieve Full Texts

### What AI Can Do
- Automatically find PDFs from DOIs and URLs
- Extract text from PDFs for downstream processing
- Identify supplementary materials

### Tools & Resources
| Tool | Use Case |
|------|----------|
| Unpaywall API | Find open access PDFs |
| CORE API | Repository full texts |
| Sci-Hub | (Use with caution, ethical considerations) |
| PyMuPDF/pdfplumber | Extract text from PDFs |

---

## Stage 7: Extract Data ⭐

### What AI Can Do
- Extract structured data from full-text articles
- Identify PICO elements, sample sizes, effect sizes
- Handle tables and figures

### Tools & Resources
| Tool | Use Case |
|------|----------|
| **GROBID** | Structure extraction from PDFs |
| **RobotReviewer** | RCT data extraction |
| **MetaBeeAI** | Full pipeline for bio-reviews |
| ChatGPT/Claude | Custom extraction prompts |

### Example Prompt
```
Extract the following from this study:
- Study design (RCT, quasi-experimental, observational)
- Sample size (total, treatment, control)
- Country/setting
- Intervention description
- Primary outcomes and effect sizes
- Follow-up duration

Format as JSON.
```

### Accuracy Benchmarks
Recent evaluations show:
- **Data extraction**: >84% accuracy, F1 >90%
- **Study characteristics**: Generally reliable
- **Effect sizes**: Requires verification

---

## Stage 8: Critical Appraisal

### What AI Can Do
- Assess risk of bias using standard tools (RoB 2, ROBINS-I)
- Flag potential quality issues
- Suggest domain-specific concerns

### Tools & Resources
| Tool | Use Case |
|------|----------|
| RobotReviewer | Automated RoB assessment |
| ChatGPT/Claude | RoB domain evaluation |
| Custom prompts | Tool-specific assessment |

### Current Limitations
- **Interpretive tasks** are challenging for AI
- RoB assessment often requires judgment, not just extraction
- **Recommendation**: Use AI as first-pass, human verification essential

---

## Stage 9: Synthesis of Results

### What AI Can Do
- Summarize findings across studies
- Identify patterns and themes
- Generate narrative synthesis drafts

### Tools & Resources
| Tool | Use Case |
|------|----------|
| ChatGPT/Claude | Narrative synthesis drafts |
| Custom RAG systems | Grounded synthesis from your evidence |
| Elicit | Research assistant for synthesis |

### Best Practice
Build a **Retrieval-Augmented Generation (RAG)** system for synthesis. This grounds the LLM in your actual evidence, reducing hallucinations. See my [tutorial on building a RAG system for research](/post/building-ai-research-qa-system/).

---

## Stage 10: Meta-Analysis (Optional)

### What AI Can Do
- Suggest appropriate statistical methods
- Help with R/Python code for meta-analysis
- Interpret heterogeneity and sensitivity analyses

### Tools & Resources
| Tool | Use Case |
|------|----------|
| R (meta, metafor) | Statistical analysis |
| Python (PythonMeta) | Alternative to R |
| ChatGPT Code Interpreter | Generate and debug analysis code |

### Example Prompt
```
I have effect sizes (standardized mean differences) from 15 RCTs 
on educational interventions. Help me:
1. Conduct a random-effects meta-analysis in R
2. Create a forest plot
3. Assess heterogeneity (I², Q-statistic)
4. Run publication bias tests (funnel plot, Egger's test)
```

---

## Stage 11: Write Results

### What AI Can Do
- Draft methods and results sections
- Generate PRISMA flow diagrams
- Format references consistently

### Tools & Resources
| Tool | Use Case |
|------|----------|
| ChatGPT/Claude | Draft writing |
| PRISMA 2020 | Flow diagram generator |
| Zotero/Mendeley | Reference management |

---

## Stage 12: Dissemination

### What AI Can Do
- Generate plain-language summaries
- Create social media content
- Translate findings for different audiences

### Tools & Resources
| Tool | Use Case |
|------|----------|
| ChatGPT/Claude | Plain-language summaries |
| Podcast generation | Audio summaries (experimental) |
| Infographic tools | Visual summaries |

---

## Summary: AI Readiness by Stage

| Stage | AI Readiness | Recommendation |
|-------|--------------|----------------|
| Define Question | 🟢 High | Use freely with human review |
| Write Protocol | 🟡 Medium | Draft assistance only |
| Search Strategy | 🟢 High | Excellent for term generation |
| Retrieve References | 🟢 High | Fully automatable |
| **Screen Abstracts** | 🟢 High | Major time-saver, validate! |
| Retrieve Full Texts | 🟢 High | Fully automatable |
| **Extract Data** | 🟡 Medium | Good accuracy, verify numbers |
| Critical Appraisal | 🔴 Low | Human judgment essential |
| Synthesis | 🟡 Medium | Use RAG for grounding |
| Meta-Analysis | 🟡 Medium | Code assistance helpful |
| Write Results | 🟡 Medium | Draft assistance only |
| Dissemination | 🟢 High | Excellent for summaries |

---

## Key Takeaways

1. **Screening is the biggest win**—AI can reduce workload by 50-70%
2. **Extraction is promising**—but verify critical numbers
3. **Appraisal needs humans**—interpretive tasks remain challenging
4. **Synthesis needs grounding**—use RAG, not free-form LLMs
5. **Validate everything**—AI errors can propagate through the review

---

## Resources

The screening and extraction pipeline code is at [github.com/lsempe77/paper-screening-pipeline](https://github.com/lsempe77/paper-screening-pipeline). For a deep dive on the extraction stage, see [The Spreadsheet That Filled Itself](/blog/llm-structured-extraction-systematic-reviews).

*This guide is based on my experience leading systematic reviews at 3ie and developing AI tools for evidence synthesis. For questions or collaboration, please reach out.*
