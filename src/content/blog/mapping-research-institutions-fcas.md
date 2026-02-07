---
title: "3,000 Messy Rows, 800 Real Institutions"
summary: "University of Khartoum, Univ. Khartoum, جامعة الخرطوم, Khartoum University—same institution, four names. For FCDO's Humanitarian R&D programme, we needed to map research capacity in fragile states. But first we had to clean the data."
date: 2025-11-05
authors:
  - admin
tags:
  - Research Mapping
  - FCAS
  - AI
  - Data Cleaning
  - Institution Verification
  - FCDO
image:
  caption: 'Mapping research institutions in fragile states'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Research Methodology
  - AI Tools
featured: false
draft: false
projects: []
---

*This work was conducted for FCDO's Humanitarian Research and Development programme as part of the [evidence mapping on social science methods in FCAS](https://www.grtd.fcdo.gov.uk/research/evidence-mapping-ofsocial-sciences-methodsused-in-fragile-andconflict-affectedsettings-fcas2015-2025/).*

---

We wanted to know something simple: where is research capacity in fragile states? Not where international researchers fly in to collect data, but where local institutions produce their own scholarship. Which universities in DRC publish development research? Which think tanks in Somalia conduct impact evaluations? Which government agencies in South Sudan partner with academics?

The answer should have been in our data. We had author affiliations from two major databases—thousands of studies tagged with institutional affiliations. But when I opened the spreadsheet, I understood why nobody had done this analysis before.

The data was chaos.

"University of Khartoum" appeared seventeen different ways: full English name, abbreviated, Arabic script, transliterated Arabic, with and without "The." Some entries had typos. Some had the department name instead of the institution. Some just said "Sudan" with no institution at all.

A simple string match would catch maybe 30% of duplicates. The other 70% would show up as separate institutions, inflating our count and making the data useless for capacity mapping.

---

## The Verification Pipeline

The solution was a multi-step verification pipeline that mimics how a human researcher would clean this data—but at scale.

**Step one: AI-powered web search.** For each institution name, I queried Perplexity AI to verify existence and retrieve the official name and website. This caught cases where the database entry was garbled but the institution was real. It also flagged entries that weren't institutions at all—consulting firms, government ministries, international organizations with local offices.

**Step two: website-based deduplication.** Institutions with the same official website are the same institution, regardless of how the name appears in the data. "جامعة الخرطوم" and "University of Khartoum" both resolve to uofk.edu—merge them. This turned out to be the most reliable deduplication key.

**Step three: fuzzy string matching.** RapidFuzz catches spelling variations that the web search missed:

```python
from rapidfuzz import fuzz, process

def find_fuzzy_duplicates(institutions, threshold=85):
    """Find potential duplicates using fuzzy string matching."""
    names = [inst['name'] for inst in institutions]
    potential_duplicates = []
    
    for i, name in enumerate(names):
        matches = process.extract(
            name, 
            names[i+1:], 
            scorer=fuzz.token_sort_ratio,
            score_cutoff=threshold
        )
        for match, score, idx in matches:
            potential_duplicates.append({
                'name_1': name,
                'name_2': match,
                'similarity': score
            })
    
    return potential_duplicates
```

"Univeristy of Khartoum" (typo) matches "University of Khartoum" at 95% similarity—merge them. I set the threshold at 90% to avoid false positives, but even then some high-similarity pairs were actually different institutions.

**Step four: native filtering.** We only wanted institutions headquartered in fragile states, not international organizations with local branches. World Bank offices don't count as local research capacity, even if a World Bank economist in Juba co-authors a paper. This required LLM judgment on ambiguous cases.

**Step five: LLM-powered audit.** Claude reviewed the final list for classification errors—entries that slipped through as institutions but were actually NGOs, or entries marked international that were actually domestic. This caught about 50 errors the previous steps missed.

**Step six: human review of edge cases.** About 200 entries required manual judgment. These were cases where the AI was uncertain, or where the institution's status was genuinely ambiguous—sub-units of larger institutions, government ministries with research departments, institutions that had merged or closed.

---

## What the Data Revealed

The result: 3,000 messy rows became 800 verified institutions across 16 countries. Breaking it down revealed patterns I hadn't expected.

**Ethiopia has the most domestic research institutions**—over 100 universities and research centers producing development-relevant scholarship. This reflects decades of investment in higher education, even through periods of political instability.

**DRC has surprisingly few, given its size.** Most research on DRC is produced by international collaborators or institutions in neighboring countries. The Congolese research infrastructure that existed before the wars has largely not been rebuilt.

**South Sudan has almost none.** Virtually all research on South Sudan is conducted by institutions in Kenya, Uganda, or the global North. The country is studied but doesn't study itself.

The type breakdown was also instructive. Universities dominate (about 75% of institutions), but government research agencies appear more often than I expected, particularly in Ethiopia and Nigeria. Think tanks and research NGOs are common in the Middle East (Lebanon, Iraq) but rare in sub-Saharan fragile states outside Kenya.

---

## The Harder Question

Having an institution that publishes research is necessary but not sufficient for research capacity. Many of the universities I verified produce one or two papers a decade—enough to appear in the database, not enough to constitute meaningful capacity. Others produce dozens but on topics tangential to development. A university with a strong physics department and no social science faculty shows up in my count but doesn't help policymakers understand what works in fragile settings.

The next step—which I haven't taken yet—is to weight institutions by output and relevance. Not just "does this institution exist?" but "does this institution produce policy-relevant research, and how much?" That requires analyzing citation patterns, journal venues, and topic modeling across the publication corpus. It's a bigger project than the data cleaning exercise I've completed.

For now, the clean list exists. Anyone doing capacity mapping in fragile states can use it as a starting point rather than starting from the same messy data I inherited. That's the modest contribution: fewer hours wasted on deduplication, more hours available for the analysis that actually matters.

*This work is part of the [FCDO evidence mapping on social science methods in FCAS](https://www.grtd.fcdo.gov.uk/research/evidence-mapping-ofsocial-sciences-methodsused-in-fragile-andconflict-affectedsettings-fcas2015-2025/).*
