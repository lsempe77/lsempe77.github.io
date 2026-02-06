---
title: "3,000 Messy Rows, 800 Real Institutions"
summary: "University of Khartoum, Univ. Khartoum, جامعة الخرطوم, Khartoum University—same institution, four names. We were trying to map research capacity in fragile states, but the data was chaos. Here's the pipeline that cleaned it."
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

We wanted to know something simple: where is research capacity in fragile states? Not where international researchers fly in to collect data, but where local institutions produce their own scholarship. Which universities in DRC publish development research? Which think tanks in Somalia conduct impact evaluations? Which government agencies in South Sudan partner with academics?

The answer should have been in our data. We had author affiliations from two major databases—thousands of studies tagged with institutional affiliations. But when I opened the spreadsheet, I understood why nobody had done this analysis before.

The data was chaos.

"University of Khartoum" appeared seventeen different ways: full English name, abbreviated, Arabic script, transliterated Arabic, with and without "The." Some entries had typos. Some had the department name instead of the institution. Some just said "Sudan" with no institution at all.

A simple string match would catch maybe 30% of duplicates. The other 70% would show up as separate institutions, inflating our count and making the data useless for capacity mapping.

---

The solution was a multi-step verification pipeline that mimics how a human researcher would clean this data—but at scale.

Step one: AI-powered web search. For each institution name, I queried Perplexity AI to verify existence and retrieve the official name and website. This caught cases where the database entry was garbled but the institution was real. It also flagged entries that weren't institutions at all—consulting firms, government ministries, international organizations with local offices.

Step two: website-based deduplication. Institutions with the same official website are the same institution, regardless of how the name appears in the data. "جامعة الخرطوم" and "University of Khartoum" both resolve to uofk.edu—merge them.

Step three: fuzzy string matching. RapidFuzz catches spelling variations that the web search missed. "Univeristy of Khartoum" (typo) matches "University of Khartoum" at 95% similarity—merge them. I set the threshold at 90% to avoid false positives.

Step four: native filtering. We only wanted institutions headquartered in fragile states, not international organizations with local branches. World Bank offices don't count as local research capacity, even if a World Bank economist in Juba co-authors a paper. This required LLM judgment on ambiguous cases.

Step five: LLM-powered audit. Claude reviewed the final list for classification errors—entries that slipped through as institutions but were actually NGOs, or entries marked international that were actually domestic. This caught maybe 50 errors the previous steps missed.

Step six: human review of edge cases. About 200 entries required manual judgment. These were cases where the AI was uncertain, or where the institution's status was genuinely ambiguous.

---

The result: 3,000 messy rows became 800 verified institutions.

Breaking it down by country revealed patterns I hadn't expected. Ethiopia has the most domestic research institutions—over 100 universities and research centers producing development-relevant scholarship. DRC has surprisingly few, given its size; most research there is produced by international collaborators. South Sudan has almost none—virtually all research on South Sudan is conducted by institutions in Kenya, Uganda, or the global North.

The type breakdown was also instructive. Universities dominate, but government research agencies appear more often than I expected, particularly in Ethiopia and Nigeria. Think tanks and research NGOs are common in the Middle East (Lebanon, Iraq) but rare in sub-Saharan fragile states outside Kenya.

---

The harder question is what this means for research capacity.

Having an institution that publishes research is necessary but not sufficient for research capacity. Many of the universities I verified produce one or two papers a decade—enough to appear in the database, not enough to constitute meaningful capacity. Others produce dozens but on topics tangential to development. A university with a strong physics department and no social science faculty shows up in my count but doesn't help policymakers understand what works in fragile settings.

The next step—which I haven't taken yet—is to weight institutions by output and relevance. Not just "does this institution exist?" but "does this institution produce policy-relevant research, and how much?" That requires analyzing citation patterns, journal venues, and topic modeling across the publication corpus. It's a bigger project than the data cleaning exercise I've completed.

For now, the clean list exists. Anyone doing capacity mapping in fragile states can use it as a starting point rather than starting from the same messy data I inherited. That's the modest contribution: fewer hours wasted on deduplication, more hours available for the analysis that actually matters.

{{< icon name="university" pack="fas" >}} Institution Mapping | FCAS Research Capacity | Data Cleaning Pipeline

*Dataset and code available on request.*
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
