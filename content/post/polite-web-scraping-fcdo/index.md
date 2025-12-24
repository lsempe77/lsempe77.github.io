---
title: "Polite Web Scraping for Development Research: FCDO Business Cases"
summary: "Building an ethical web scraper to collect UK development programme documents for research and accountability analysis."
date: 2025-11-15
authors:
  - admin
tags:
  - Web Scraping
  - Python
  - Development Research
  - Open Data
  - FCDO
image:
  caption: 'Web scraping for development research'
categories:
  - Data Collection
  - Research Tools
featured: false
---

## The Research Need

The UK Foreign, Commonwealth and Development Office (FCDO) publishes business cases for development programmes through the [UK Development Tracker](https://devtracker.fcdo.gov.uk/). These documents contain valuable information about programme design, expected outcomes, and theory of change—essential for research on development effectiveness.

However, manually downloading documents from 555+ programmes is impractical. This post describes building a "polite" web scraper that respects server resources while systematically collecting these documents.

## Ethical Scraping Principles

Before writing any code, we established key principles:

1. **Rate Limiting**: 2-second delays between requests
2. **Identification**: Proper User-Agent headers identifying our research purpose
3. **Graceful Failure**: Retry logic with exponential backoff
4. **Respect for Resources**: Don't overwhelm the server
5. **Compliance**: Adhere to open data licensing

```python
class FCDOScraper:
    def __init__(self):
        self.delay = 2  # seconds between requests
        self.max_retries = 3
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'ResearchBot/1.0 (Academic research on development effectiveness; contact@example.org)'
        })
```

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    SCRAPING WORKFLOW                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stage 1: Programme Discovery                                   │
│     └── Scrape FCDO department page for all programme IDs      │
│     └── Handle pagination (555+ programmes)                    │
│                                                                 │
│  Stage 2: Document Identification                               │
│     └── Visit each programme's documents page                  │
│     └── Find business case documents by keyword matching       │
│                                                                 │
│  Stage 3: Document Download                                     │
│     └── Download with proper error handling                    │
│     └── Organize by programme ID                               │
│                                                                 │
│  Stage 4: Metadata Generation                                   │
│     └── Save metadata in JSON format                           │
│     └── Generate summary statistics                            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Programme Discovery

The first challenge is collecting all programme IDs from the paginated listing:

```python
def scrape_programmes(self):
    """Scrape the list of all FCDO programmes with pagination."""
    base_url = "https://devtracker.fcdo.gov.uk/department/GB-GOV-1/projects"
    programmes = []
    page = 1
    
    while True:
        url = f"{base_url}?page={page}"
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find programme links
            project_links = soup.find_all('a', href=re.compile(r'/projects/GB-'))
            
            if not project_links:
                break  # No more programmes
            
            for link in project_links:
                programme_id = self.extract_programme_id(link['href'])
                programmes.append({
                    'id': programme_id,
                    'title': link.text.strip(),
                    'url': f"https://devtracker.fcdo.gov.uk{link['href']}",
                    'documents_url': f"https://devtracker.fcdo.gov.uk/projects/{programme_id}/documents"
                })
            
            page += 1
            time.sleep(self.delay)
            
        except requests.RequestException as e:
            self.logger.warning(f"Error on page {page}: {e}")
            break
    
    return programmes
```

## Document Identification

We identify business cases using keyword matching:

```python
DOCUMENT_KEYWORDS = [
    'business case',
    'addendum to the business case',
    'statement of need',
    'business case and summary',
    'project business case',
    'programme business case'
]

def identify_business_cases(self, programme):
    """Find business case documents for a programme."""
    documents = []
    
    response = self.session.get(programme['documents_url'], timeout=30)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    for link in soup.find_all('a', href=True):
        link_text = link.text.lower().strip()
        
        # Check if this looks like a business case
        if any(keyword in link_text for keyword in DOCUMENT_KEYWORDS):
            doc_url = link['href']
            
            # Determine document type
            doc_type = self.classify_document_type(link_text)
            
            documents.append({
                'programme_id': programme['id'],
                'title': link.text.strip(),
                'url': doc_url,
                'document_type': doc_type,
                'publication_date': self.extract_date(link)
            })
    
    return documents
```

## Robust Download with Retry Logic

Network operations need robust error handling:

```python
def download_document(self, doc, output_dir):
    """Download a document with retry logic."""
    
    for attempt in range(self.max_retries):
        try:
            response = self.session.get(doc['url'], timeout=60, stream=True)
            response.raise_for_status()
            
            # Create programme directory
            programme_dir = os.path.join(output_dir, doc['programme_id'])
            os.makedirs(programme_dir, exist_ok=True)
            
            # Extract filename from URL
            filename = doc['url'].split('/')[-1]
            filepath = os.path.join(programme_dir, filename)
            
            # Write file in chunks
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            doc['downloaded'] = True
            doc['filename'] = filename
            return True
            
        except requests.RequestException as e:
            wait_time = (2 ** attempt) * self.delay  # Exponential backoff
            self.logger.warning(f"Attempt {attempt + 1} failed: {e}. Waiting {wait_time}s")
            time.sleep(wait_time)
    
    doc['downloaded'] = False
    return False
```

## Command-Line Interface

The scraper provides flexible CLI options:

```powershell
# Full scrape (30-60 minutes)
python main.py

# Test with limited programmes
python main.py --max-programmes 10

# Skip programme list if already scraped
python main.py --skip-programmes

# Metadata only (no downloads)
python main.py --no-download

# Include annual reviews for before/after analysis
python main.py --include-annual-reviews
```

## Output Organization

Documents are organized by programme ID:

```
fcdo-business-case-scraper/
├── data/
│   ├── fcdo_programmes.json           # All programme metadata
│   ├── business_cases_metadata.json   # Document metadata
│   ├── scraping_summary.json          # Statistics
│   └── scraper_20241115_103045.log    # Detailed log
└── documents/
    ├── GB-1-204324/
    │   ├── D0006484.odt               # Business case
    │   └── 4221301.odt                # Addendum
    ├── GB-GOV-1-300801/
    │   └── ...
    └── ...
```

## Metadata Output

Rich metadata enables downstream analysis:

```json
{
  "programme_id": "GB-1-204324",
  "title": "Addendum to the Business Case (D0006484) 204324",
  "url": "https://iati.fcdo.gov.uk/iati_documents/D0006484.odt",
  "filename": "D0006484.odt",
  "publication_date": "January 2025",
  "document_type": "Addendum to Business Case",
  "downloaded": true
}
```

## Summary Statistics

The scraper generates useful statistics:

```json
{
  "total_documents": 487,
  "downloaded": 485,
  "documents_by_type": {
    "Business Case": 234,
    "Addendum to Business Case": 198,
    "Statement of Need": 55
  },
  "programmes_with_business_cases": 312,
  "avg_docs_per_programme": 1.56
}
```

## Research Applications

This dataset enables several research applications:

### Programme Design Analysis
- How do business cases vary by sector?
- What theories of change are most common?
- How detailed are results frameworks?

### Accountability Research
- Are expected outcomes realistic?
- How do addendums modify original plans?
- What assumptions prove problematic?

### Before/After Studies
- By linking business cases to annual reviews (using `--include-annual-reviews`), researchers can compare planned outcomes with actual results.

## Lessons Learned

1. **Patience Pays**: Slow, polite scraping completes successfully; aggressive scraping gets blocked
2. **Expect Inconsistency**: Document naming conventions vary widely
3. **Log Everything**: Detailed logs are essential for debugging
4. **Checkpoint Progress**: Save frequently to enable resume
5. **Validate Downloads**: Check file integrity, not just HTTP status

## Ethical Considerations

This tool is designed for:
- ✅ Academic research
- ✅ Transparency and accountability analysis
- ✅ Policy research
- ✅ Non-commercial use

Users should:
- Comply with UK Government Open Data Licence
- Respect FCDO website terms of use
- Use rate limiting to avoid server strain

## Technical Stack

- **Python 3.7+**: Core language
- **Requests**: HTTP operations with session management
- **BeautifulSoup4**: HTML parsing
- **JSON/Logging**: Metadata and audit trails

---

Systematic collection of government documents enables research that would otherwise be impossible. With ethical design, web scraping becomes a powerful tool for transparency and evidence-based policy research.
