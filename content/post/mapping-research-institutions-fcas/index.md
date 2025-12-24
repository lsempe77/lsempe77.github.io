---
title: "Mapping Research Institutions in Fragile States Using AI"
summary: "Combining web search AI, fuzzy matching, and LLM-powered verification to map research capacity in conflict-affected regions."
date: 2025-11-05
authors:
  - admin
tags:
  - Research Mapping
  - FCAS
  - AI
  - Data Cleaning
  - Institution Verification
image:
  caption: 'Mapping research institutions in fragile states'
categories:
  - Research Methodology
  - AI Tools
featured: false
---

## The Challenge

Understanding research capacity in fragile and conflict-affected states (FCAS) is essential for strengthening evidence ecosystems and identifying research partners. But bibliographic databases contain messy, inconsistent institution names—the same university might appear under dozens of variations, transliterations, and abbreviations.

This project combined multiple AI-powered techniques to map research institutions across the Horn of Africa and Middle East, processing thousands of records into a verified, deduplicated directory.

## Data Sources

We combined two evidence databases:

| Source | Focus | Records |
|--------|-------|---------|
| Development Evidence Portal (DEP) | Impact evaluations and systematic reviews | Thousands |
| FCAS Evidence Map | Conflict-affected settings research | Hundreds |

Together, these provided broad coverage of development research with author affiliations in target countries.

## The Multi-Step Verification Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│              INSTITUTION VERIFICATION PIPELINE                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Web Search Verification                                │
│     └── Use Perplexity AI to verify existence and get          │
│         official names and websites                            │
│                                                                 │
│  Step 2: Website-Based Deduplication                            │
│     └── Merge institutions sharing the same official website   │
│                                                                 │
│  Step 3: Fuzzy String Matching                                  │
│     └── RapidFuzz algorithm to catch spelling variations       │
│                                                                 │
│  Step 4: Native Filtering                                       │
│     └── Exclude international organizations and branches       │
│                                                                 │
│  Step 5: LLM-Powered Audit                                      │
│     └── Claude reviews for classification errors               │
│                                                                 │
│  Step 6: Manual Review                                          │
│     └── Human verification of edge cases                       │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Step 1: AI-Powered Web Search

We used Perplexity AI for intelligent web searches:

```python
import requests
import json

def search_institution(institution_name, country):
    """Use Perplexity AI to verify institution and get official info."""
    
    query = f"""
    Find the official website and full name for this research institution:
    Institution: {institution_name}
    Country: {country}
    
    Return:
    1. Official institution name
    2. Institution type (University, Research Institute, Government, NGO, etc.)
    3. Official website URL
    4. Whether this is a native institution (headquartered in the country)
    """
    
    response = requests.post(
        "https://api.perplexity.ai/chat/completions",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "sonar-pro",
            "messages": [{"role": "user", "content": query}]
        }
    )
    
    return parse_institution_response(response.json())
```

## Step 2: Website-Based Deduplication

Institutions sharing the same website are clearly the same entity:

```python
def deduplicate_by_website(institutions):
    """Merge institutions with the same official website."""
    
    website_groups = {}
    
    for inst in institutions:
        website = normalize_url(inst.get('website', ''))
        if website:
            if website not in website_groups:
                website_groups[website] = []
            website_groups[website].append(inst)
    
    # Merge groups, keeping the most complete record
    deduplicated = []
    for website, group in website_groups.items():
        merged = merge_institution_records(group)
        deduplicated.append(merged)
    
    return deduplicated

def normalize_url(url):
    """Normalize URL for comparison."""
    url = url.lower().strip()
    url = re.sub(r'^https?://', '', url)
    url = re.sub(r'^www\.', '', url)
    url = url.rstrip('/')
    return url
```

## Step 3: Fuzzy String Matching

RapidFuzz catches near-duplicate names:

```python
from rapidfuzz import fuzz, process

def find_fuzzy_duplicates(institutions, threshold=85):
    """Find potential duplicates using fuzzy string matching."""
    
    names = [inst['name'] for inst in institutions]
    potential_duplicates = []
    
    for i, name in enumerate(names):
        # Compare with remaining institutions to avoid duplicate pairs
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
                'similarity': score,
                'country_1': institutions[i]['country'],
                'country_2': institutions[i + 1 + idx]['country']
            })
    
    return potential_duplicates
```

Example matches found:
| Name 1 | Name 2 | Similarity |
|--------|--------|------------|
| University of Tehran | Tehran University | 92% |
| Addis Ababa Univ. | Addis Ababa University | 95% |
| KEMRI | Kenya Medical Research Institute | 87% |

## Step 4: Native Institution Filtering

We exclude international organizations:

```python
INTERNATIONAL_INDICATORS = [
    'world bank', 'united nations', 'unicef', 'undp', 'who',
    'imf', 'oxford', 'harvard', 'mit', 'london school',
    'world health organization', 'international'
]

def is_native_institution(institution):
    """Determine if institution is native to the country."""
    
    name_lower = institution['name'].lower()
    
    # Check for international organization indicators
    for indicator in INTERNATIONAL_INDICATORS:
        if indicator in name_lower:
            return False
    
    # Check if headquarters match country
    if institution.get('headquarters_country'):
        return institution['headquarters_country'] == institution['affiliation_country']
    
    return True  # Default to native if unclear
```

## Step 5: LLM-Powered Cross-Validation

Claude provides a second opinion on classifications:

```python
def audit_with_llm(institutions_batch):
    """Use Claude to audit institution classifications."""
    
    prompt = f"""
    Review these institution records for potential issues:
    
    {json.dumps(institutions_batch, indent=2)}
    
    For each institution, check:
    1. Is the institution type correct?
    2. Is this truly a native institution (not international)?
    3. Are there obvious data quality issues?
    4. Should any be merged as duplicates?
    
    Return a JSON list of issues found.
    """
    
    response = anthropic.messages.create(
        model="claude-3-5-sonnet-20241022",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return parse_audit_issues(response.content)
```

## Step 6: Manual Review Workflow

Edge cases go to human reviewers:

```python
def flag_for_manual_review(institution, reason):
    """Flag institution for human review."""
    
    review_record = {
        'institution_id': institution['id'],
        'institution_name': institution['name'],
        'country': institution['country'],
        'reason': reason,
        'current_type': institution.get('type'),
        'current_website': institution.get('website'),
        'ai_suggestion': institution.get('ai_suggested_action'),
        'reviewed': False,
        'reviewer_decision': None
    }
    
    save_to_review_queue(review_record)
```

Common reasons for manual review:
- Sub-units of larger institutions
- Government ministries vs. research departments
- Unclear native vs. international status
- Merged or closed institutions

## Results Summary

The verification process produced impressive results:

| Metric | Value |
|--------|-------|
| Initial institution entries | 2,500+ |
| After deduplication | 847 |
| Verified unique institutions | 400+ |
| Countries represented | 16 |
| With verified websites | 92% |

## Geographic Distribution

Research capacity varies significantly across regions:

```
Horn of Africa (60% of records):
├── Ethiopia: 35%
├── Kenya: 20%
└── Others: 5%

Middle East (40% of records):
├── Iran: 25%
├── Jordan: 8%
└── Others: 7%
```

## Institution Types

Universities dominate research production:

| Type | Institutions | % of Records |
|------|-------------|--------------|
| University | 280 | 75% |
| Research Institute | 65 | 15% |
| Government | 35 | 6% |
| NGO/Think Tank | 20 | 4% |

## Output: Research Institution Directory

The final output is a verified directory:

```csv
institution_name,institution_country,institution_type,institution_website
Addis Ababa University,Ethiopia,University,https://www.aau.edu.et
University of Tehran,Iran,University,https://ut.ac.ir
Kenya Medical Research Institute,Kenya,Research Institute,https://www.kemri.go.ke
...
```

## Lessons Learned

1. **AI Search Beats Pattern Matching**: Perplexity found institutions that keyword searches missed
2. **Websites Are Ground Truth**: Official URLs are the most reliable deduplication key
3. **Fuzzy Matching Needs Review**: High similarity doesn't always mean same institution
4. **LLM Audit Catches Mistakes**: Claude found classification errors humans missed
5. **Some Cases Need Humans**: Edge cases (sub-departments, mergers) require judgment

## Research Applications

This directory enables:

- **Partnership Identification**: Find potential local research collaborators
- **Capacity Mapping**: Understand where research capacity exists
- **Longitudinal Tracking**: Monitor changes in research ecosystems
- **Network Analysis**: Study collaboration patterns

## Technical Stack

- **Python**: Core data processing
- **R/Quarto**: Report generation
- **Perplexity AI**: Web search verification
- **Claude**: Cross-validation audit
- **RapidFuzz**: Fuzzy string matching
- **Pandas**: Data manipulation

---

Mapping research institutions in challenging contexts requires combining multiple data sources and verification techniques. AI tools—from web search to fuzzy matching to LLM auditing—make this feasible at scale, but human judgment remains essential for edge cases.
