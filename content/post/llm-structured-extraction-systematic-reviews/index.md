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
categories:
  - Evidence Synthesis
  - AI/ML
featured: true
---

My first evidence map nearly broke me.

Not the searching—we had a librarian for that. Not the screening—we split it across three reviewers. The data extraction. Three hundred papers, each requiring forty fields: authors, year, country, methodology, sample size, intervention type, outcomes, effect sizes, risk of bias...

I spent three weeks filling in spreadsheets. My wrists hurt. My eyes hurt. I started making errors from fatigue—transposing digits, misremembering which paper I was coding. The quality control review found inconsistencies across my own coding sessions, let alone compared to other reviewers.

There had to be a better way. When GPT-4 came out, I tested it on extraction. The first attempts were a mess—hallucinated author names, inconsistent formats, fields that worked for some papers and failed for others. But with careful prompt engineering, I got it to reliably extract structured data from PDFs at about 90% accuracy.

That's good enough to use as a first pass, with human verification for the remaining 10%. What took three weeks now takes three hours plus a few hours of cleanup.

---

The trick is treating the LLM like a meticulous but literal-minded research assistant. You can't say "extract the metadata"—that's too vague. You have to specify exactly what you want, in what format, with examples of edge cases.

The prompt I use establishes an expert persona ("You are an academic evidence synthesis researcher with extensive experience in systematic reviews"), provides explicit formatting for every field ("Authors: Last name, First name; semicolon separated"), and includes examples for ambiguous cases ("If multiple data collection periods are mentioned, list all: '2018-2020; 2021'").

The output is JSON, because JSON is unambiguous and machine-parseable. Free-form text responses drift—one paper gets a paragraph summary, another gets bullet points. JSON forces consistency.

I also found that asking for reasoning improves accuracy. "Extract the study methodology and explain why you classified it this way" produces better classifications than "Extract the study methodology." The model's explanation reveals when it's uncertain, which flags cases for human review.

---

The pipeline runs in stages. First, PDF text extraction using PyMuPDF, which handles academic layouts better than simpler parsers. Second, chunking into sections—abstract, methods, results—so the model can process without exceeding context limits. Third, the extraction prompt, sent section by section with accumulated context. Fourth, validation against known fields (is the year a plausible four-digit number? is the country in the ISO list?). Fifth, output to SQLite for storage and CSV for analysis.

The chunking matters more than I expected. If you send the full paper as one block, the model loses track of which section mentions what. Asking "what's the sample size?" when the methods and results sections are concatenated sometimes returns the wrong number—the one mentioned in passing during literature review, not the actual study sample. Sending sections separately, with clear labels, fixes this.

I run everything through a local FAISS index as well, so I can later search across extracted metadata semantically. "Show me RCTs on cash transfers in East Africa" works because the methodology, intervention type, and country fields are all indexed.

---

Accuracy varies by field. Bibliographic metadata—authors, title, year—is near-perfect, around 98%. The model can read a header. Sample size is trickier, around 85%, because papers report multiple sample sizes (eligible, enrolled, analyzed) and the model sometimes picks the wrong one. Methodology classification (RCT vs. quasi-experimental vs. observational) is about 90%, with most errors being ambiguous cases that human coders would also struggle with.

The hardest fields are the interpretive ones: risk of bias assessments, intervention complexity ratings, outcome effect directions. These require reading between the lines in ways that current models do inconsistently. For those, I use the LLM to pre-fill a draft that human coders review and correct.

The economics work out clearly. A research assistant costs maybe $30/hour. Manual extraction of 40 fields from one complex paper takes about 45 minutes—so roughly $22 per paper. LLM extraction costs about $0.50 per paper in API calls, plus maybe 5 minutes of human verification ($2.50). That's $3 per paper instead of $22. For a review with 300 papers, you're saving $5,700.

---

I've shared the prompts and pipeline with a few colleagues doing their own reviews. The feedback is consistent: it works, but you have to trust-but-verify. The model is confident even when wrong. You need validation steps that catch errors before they propagate into your analysis.

The philosophical question is whether LLM-assisted extraction counts as "human coding" for the purposes of systematic review methodology. I think it does, as long as humans verify—you're using a tool to accelerate a human process, not replacing human judgment. But methodologists may disagree. The Cochrane guidance on AI tools is still being written.

For now, I'm just glad I never have to fill in another spreadsheet cell by cell. The robot does the tedious part. I do the part that requires judgment. That's a division of labor I can live with.

{{< icon name="robot" pack="fas" >}} GPT-4 | Structured Extraction | Evidence Synthesis | Python

*Prompt templates available on request.*

10. Extract study country/countries (semicolon separated)
    Example: "Kenya; Tanzania; Uganda"

11. Extract sub-national regions
    Example: "Nairobi County; Kisumu County"

12. Extract main study population
    Example: "Women entrepreneurs" or "School children aged 6-12"

13. Extract sample size
    Example: "1,500 participants" or "450 households"

14. Extract data type with justification:
    - Primary: list techniques with page numbers
    - Secondary: name the dataset
    - Both: describe each

15. Extract whether quantitative, qualitative, or mixed methods

16. List all data analysis methods with categories:
    - DESCRIPTIVE: frequencies, means, cross-tabs
    - STATISTICAL TESTS: t-tests, chi-square, ANOVA
    - REGRESSION: OLS, logistic, multilevel, fixed effects
    - CAUSAL INFERENCE: IV, RDD, DID, matching, RCT
    - QUALITATIVE: thematic analysis, content analysis
    - ADVANCED: ML, SEM, meta-analysis

Respond with ONLY valid JSON:

{{
    "authors": "...",
    "publication_year": "...",
    "first_author_country": "...",
    "first_author_organisation": "...",
    "data_collection_year": "...",
    "summary": "...",
    "world_bank_sector": "...",
    "world_bank_subsector": "...",
    "sdg": "...",
    "study_countries": "...",
    "study_regions": "...",
    "population": "...",
    "sample_size": "...",
    "data_type": "...",
    "methodology": "...",
    "analysis_methods": "..."
}}

TEXT:
{text_block}
"""
    return prompt
```

## Processing with GPT-4

The extraction function handles API calls with caching and retry logic:

```python
import hashlib
import pickle
import json
from openai import OpenAI

class StructuredExtractor:
    def __init__(self, model="gpt-4o-mini", cache_file="extraction_cache.pkl"):
        self.client = OpenAI()
        self.model = model
        self.cache_file = cache_file
        self.cache = self._load_cache()
        self.lock = threading.Lock()
    
    def _load_cache(self):
        """Load cache from disk"""
        if os.path.exists(self.cache_file):
            with open(self.cache_file, 'rb') as f:
                return pickle.load(f)
        return {}
    
    def _save_cache(self):
        """Save cache to disk"""
        with open(self.cache_file, 'wb') as f:
            pickle.dump(self.cache, f)
    
    def _get_cache_key(self, text):
        """Generate cache key from text hash"""
        return hashlib.md5(text.encode()).hexdigest()
    
    def extract(self, record_id, text, max_retries=3):
        """Extract structured data with caching"""
        cache_key = self._get_cache_key(text)
        
        # Check cache
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        prompt = build_prompt(record_id, text)
        
        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are an expert research analyst."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,  # Low temperature for consistency
                    max_tokens=2000,
                    response_format={"type": "json_object"}
                )
                
                result = json.loads(response.choices[0].message.content)
                result['record_id'] = record_id
                
                # Cache result
                with self.lock:
                    self.cache[cache_key] = result
                    self._save_cache()
                
                return result
                
            except json.JSONDecodeError:
                logger.warning(f"JSON parse error for {record_id}, attempt {attempt+1}")
                continue
            except Exception as e:
                logger.error(f"API error for {record_id}: {e}")
                time.sleep(2 ** attempt)  # Exponential backoff
        
        return None
```

## Parallel Processing

For hundreds of PDFs, parallel processing is essential:

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

def process_all_documents(documents, max_workers=5):
    """Process all documents in parallel with progress tracking"""
    
    extractor = StructuredExtractor()
    results = []
    failed = []
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_doc = {
            executor.submit(
                extractor.extract, 
                doc['record_id'], 
                doc['text']
            ): doc 
            for doc in documents
        }
        
        # Process results as they complete
        with tqdm(total=len(documents), desc="Extracting") as pbar:
            for future in as_completed(future_to_doc):
                doc = future_to_doc[future]
                try:
                    result = future.result()
                    if result:
                        results.append(result)
                    else:
                        failed.append(doc['record_id'])
                except Exception as e:
                    logger.error(f"Error processing {doc['record_id']}: {e}")
                    failed.append(doc['record_id'])
                pbar.update(1)
    
    logger.info(f"Completed: {len(results)}, Failed: {len(failed)}")
    return results, failed
```

## Local LLM Alternative with Ollama

For cost savings or data privacy, use local models:

```python
import requests

def query_ollama(prompt, model="mistral", temperature=0.1):
    """Query local Ollama instance"""
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": 2000
        }
    }
    
    response = requests.post(
        "http://localhost:11434/api/generate",
        json=payload,
        timeout=120
    )
    response.raise_for_status()
    
    return response.json()["response"]
```

## Data Analysis Methods Classification

The prompt includes specific categories for methods to ensure consistent coding:

```python
ANALYSIS_CATEGORIES = {
    "DESCRIPTIVE": [
        "frequencies", "means", "medians", "cross-tabulations",
        "standard deviations", "percentiles"
    ],
    "STATISTICAL_TESTS": [
        "t-test", "chi-square", "ANOVA", "Mann-Whitney",
        "Kruskal-Wallis", "correlation"
    ],
    "REGRESSION": [
        "OLS", "logistic", "multinomial", "probit", "tobit",
        "multilevel", "hierarchical", "fixed effects", "random effects",
        "panel data", "Poisson", "negative binomial"
    ],
    "CAUSAL_INFERENCE": [
        "instrumental variables", "IV", "regression discontinuity", "RDD",
        "difference-in-differences", "DID", "propensity score matching",
        "randomized controlled trial", "RCT", "synthetic control"
    ],
    "QUALITATIVE": [
        "thematic analysis", "content analysis", "grounded theory",
        "narrative analysis", "discourse analysis", "case study"
    ],
    "ADVANCED": [
        "machine learning", "structural equation modeling", "SEM",
        "meta-analysis", "Bayesian", "spatial analysis"
    ]
}
```

## Output to SQLite

Store results in a structured database:

```python
import sqlite3
import pandas as pd

def save_to_database(results, db_path="extracted_data.db"):
    """Save extraction results to SQLite database"""
    
    conn = sqlite3.connect(db_path)
    
    # Convert to DataFrame
    df = pd.DataFrame(results)
    
    # Create table and insert data
    df.to_sql('extractions', conn, if_exists='replace', index=False)
    
    # Create indices for common queries
    cursor = conn.cursor()
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_country ON extractions(study_countries)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sector ON extractions(world_bank_sector)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_year ON extractions(publication_year)")
    conn.commit()
    
    conn.close()
    logger.info(f"Saved {len(results)} records to {db_path}")
```

## Quality Assurance

Implement validation checks:

```python
def validate_extraction(result):
    """Validate extracted data quality"""
    
    issues = []
    
    # Required fields
    required = ['authors', 'publication_year', 'study_countries', 'methodology']
    for field in required:
        if not result.get(field) or result[field] == "Not Specified":
            issues.append(f"Missing: {field}")
    
    # Year validation
    year = result.get('publication_year', '')
    if year and not (year.isdigit() and 1990 <= int(year) <= 2025):
        issues.append(f"Invalid year: {year}")
    
    # Sample size should be numeric or structured
    sample = result.get('sample_size', '')
    if sample and not any(c.isdigit() for c in sample):
        issues.append(f"Sample size not numeric: {sample}")
    
    return issues
```

## Results

Processing 500+ research papers:

| Metric | Value |
|--------|-------|
| Papers processed | 523 |
| Successful extractions | 498 (95.2%) |
| Average processing time | 8.3 seconds/paper |
| Cache hit rate | 23% (re-runs) |
| Total API cost | ~$45 (GPT-4o-mini) |

## Key Learnings

1. **Prompt engineering is critical** - Specific examples and exact format instructions dramatically improve consistency

2. **JSON mode is essential** - Using `response_format={"type": "json_object"}` eliminates parsing errors

3. **Caching saves money** - Hash-based caching avoids reprocessing unchanged documents

4. **Local models work** - Mistral/Llama via Ollama provide 80%+ of GPT-4 quality for many fields

5. **Human review still needed** - Especially for nuanced fields like methodology classification

---

LLMs transform systematic review data extraction from weeks of manual work to hours of automated processing, while maintaining quality through careful prompt engineering and validation.
