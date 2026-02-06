---
title: "555 PDFs Without Crashing Their Server"
summary: "FCDO publishes business cases for every development programme—gold for accountability research. The catch: they're scattered across 555 web pages. I wrote a scraper that took three days to run, because being fast would have been rude."
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

The UK's Foreign, Commonwealth and Development Office publishes business cases for every development programme they fund. These are remarkable documents—30-50 pages each, spelling out the theory of change, expected outcomes, risk assessments, and budget justifications. If you want to study how donors think about development, how they predict impact, and how those predictions compare to reality, this is the source material.

The documents are public, sitting on the DevTracker website. But they're scattered across 555 individual programme pages, one PDF per page, with no bulk download option. Collecting them manually would mean 555 clicks, 555 downloads, and probably two days of mind-numbing work.

So I wrote a scraper. But I wanted to do it right.

---

"Polite" scraping is a term of art. It means: don't hammer the server. Government websites are often running on modest infrastructure, serving citizens who need the information more urgently than you do. If your scraper makes a thousand requests in a minute, you might degrade service for everyone else—or trigger rate limits that block you entirely.

The ethical baseline is: scrape at a pace a human could reasonably match. I enforced 2-second delays between requests. That's slower than necessary, but it means my entire scrape of 555 pages takes about 20 minutes rather than 30 seconds. The marginal time cost to me is trivial. The marginal load on their server is invisible.

I also sent proper User-Agent headers identifying the scraper as research software with a contact email. If an administrator notices unusual traffic and wants to reach me, they can. This isn't legally required, but it's the kind of transparency that builds trust between researchers and data providers. I'd rather they know I'm accessing data than have them wonder if it's a bot attack.

---

The scraper itself has three stages.

Stage one: discover all programme IDs. The FCDO listing page is paginated—about 50 programmes per page, 12 pages total. I iterate through pages, extracting each programme ID and URL. If a page returns no programmes, I've reached the end.

Stage two: for each programme, find its documents page. Not every programme has a business case document. Some have multiple documents (annual reviews, completion reports). I identify business case documents by keyword matching against titles and filenames.

Stage three: download the PDFs. Each PDF gets saved with a filename based on the programme ID, so I can link it back to metadata later. Error handling catches network failures and retries up to three times before logging the failure and moving on.

The entire pipeline produces a folder of 555 PDFs plus a metadata JSON file mapping programme IDs to document URLs, download timestamps, and any errors encountered.

---

The trickiest part was handling inconsistency.

Some programme pages have one clearly labeled "Business Case" PDF. Others have documents titled "Project Overview" or "Programme Document" that contain business case content. Others have multiple versions—draft, final, revised. I erred on the side of over-inclusion: download anything that might be a business case, then filter later.

Some PDFs were actually Word documents with .pdf extensions. Some were scanned images rather than text. Some returned 404 errors even though the listing page showed them as available. Each of these edge cases required specific handling—mime type checking, OCR fallback, error logging.

By the time I finished debugging, the scraper was probably more robust than it needed to be. But robustness means I can run it again in six months to capture new programmes without babysitting.

---

What do you do with 555 business cases?

The immediate use is a reference dataset. When I'm reviewing a FCDO-funded evaluation, I can pull the original business case and compare: what did they expect to happen, what actually happened? The theory of change in the business case is often more detailed than what appears in published evaluations.

The longer-term use is content analysis. What kinds of evidence do business cases cite? How do they handle uncertainty? What assumptions do they make about beneficiary behavior? I've started using LLMs to extract structured fields from the documents—predicted beneficiary numbers, cost-per-beneficiary, expected effect sizes—which could feed a meta-analysis of donor expectations versus results.

The data is public, so the scraped corpus is shareable. If anyone else wants to study UK development programme design, they can skip the scraping step and start with the analysis.

---

There's a philosophical point here about open government data. FCDO publishes these documents, which is laudable. But publishing them in a way that makes bulk access tedious is a form of friction that limits research use. A proper API—or even a ZIP file of all current business cases—would serve researchers better than 555 individual PDF links.

I don't fault FCDO for this; they're not resourced to build researcher-friendly data infrastructure. But it means that researchers who want to use public data need to build their own collection tools. The scraping is trivial, but it's a barrier that filters out people who don't know Python.

If I were advising government data teams, I'd say: whatever you publish on individual web pages, also publish as bulk downloads. The marginal cost is minimal. The research benefit is substantial.

{{< icon name="spider" pack="fas" >}} Polite Scraping | FCDO DevTracker | 555 Business Cases | Python

*Scraper code on GitHub. Respect rate limits.*
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
