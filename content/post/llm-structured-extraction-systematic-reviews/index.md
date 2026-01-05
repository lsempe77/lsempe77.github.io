---
title: "LLM-Powered Structured Data Extraction for Systematic Reviews"
summary: "Building a production pipeline to extract structured metadata from hundreds of research PDFs using GPT-4 and local LLMs with carefully crafted prompts."
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

## The Extraction Nightmare

Data extraction is the part of systematic reviews that nobody warns you about. You're staring at 300 PDFs, filling in the same spreadsheet columns over and over: authors, year, sample size, methodology, country...

After doing this manually for our first evidence map, I swore never again. GPT-4 had just come out, and I wondered: could it extract structured data from papers reliably?

Turns out, yes—with the right prompting. Here's the pipeline that now handles extraction for most of our projects.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTRACTION PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PDFs ──► Text Extraction ──► Chunking ──► LLM Extraction       │
│                                    │              │              │
│                                    ▼              ▼              │
│                              FAISS Index    Structured JSON      │
│                                    │              │              │
│                                    └──────┬───────┘              │
│                                           ▼                      │
│                                    SQLite Database               │
│                                           │                      │
│                                           ▼                      │
│                                    CSV for Analysis              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## The Extraction Prompt

Reliable data extraction hinges on a carefully engineered prompt that acts less like a query and more like a detailed protocol for a research assistant. We structure the prompt to establish an expert persona, providing explicit formatting instructions and concrete examples for every single field. By forcing the model to output strict JSON and giving it the context of a systematic review, we significantly reduce hallucinations and ensure the output is machine-readable and ready for immediate analysis.

```python
def build_prompt(record_id, text_block):
    """Build extraction prompt with expert instructions"""
    
    prompt = f"""
DOCUMENT ID: {record_id}
TIMESTAMP: {int(time.time())}

You are an expert academic evidence synthesis researcher with extensive 
experience in systematic reviews, meta-analyses, and research methodology.

Your task is to carefully read and analyze the following academic paper 
and extract key information with precision and scholarly rigor.

EXTRACTION INSTRUCTIONS:

1. Extract all authors with format: Last name, First name (semicolon separated)
   Example: "Smith, John; Garcia, Maria; Johnson, Sarah"

2. Extract the year of publication
   Example: "2023"

3. Extract first author country affiliation
   Example: "United States" or "Not Specified"

4. Extract first author organisational affiliation
   Example: "Harvard University" or "World Bank"

5. Extract data collection year(s)
   Example: "2020" or "2018-2021"

6. Provide a three sentence summary:
   - Sentence 1: Topic and setting
   - Sentence 2: Methods, data type, sample size
   - Sentence 3: FCAS relevance (if any)

7. Extract World Bank sector
   Example: "Education" or "Health" or "Social Protection"

8. Extract World Bank sub-sector
   Example: "Primary Education" or "Rural Health"

9. Extract most relevant SDG with justification
   Example: "SDG 4: Quality Education. This study examines..."

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
