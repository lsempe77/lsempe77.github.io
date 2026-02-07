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
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Data Collection
  - Research Tools
featured: false
draft: false
projects: []
external_link: https://github.com/lsempe77/fcdo-scraper
---

The UK's Foreign, Commonwealth and Development Office publishes business cases for every development programme they fund. These are remarkable documents—30-50 pages each, spelling out the theory of change, expected outcomes, risk assessments, and budget justifications. If you want to study how donors think about development, how they predict impact, and how those predictions compare to reality, this is the source material.

The documents are public, sitting on the DevTracker website. But they're scattered across 555 individual programme pages, one PDF per page, with no bulk download option. Collecting them manually would mean 555 clicks, 555 downloads, and probably two days of mind-numbing work.

So I wrote a scraper. But I wanted to do it right.

---

## Being a Good Guest

"Polite" scraping is a term of art. It means: don't hammer the server. Government websites are often running on modest infrastructure, serving citizens who need the information more urgently than you do. If your scraper makes a thousand requests in a minute, you might degrade service for everyone else—or trigger rate limits that block you entirely.

The ethical baseline is: scrape at a pace a human could reasonably match. I enforced 2-second delays between requests. That's slower than necessary, but it means my entire scrape of 555 pages takes about 20 minutes rather than 30 seconds. The marginal time cost to me is trivial. The marginal load on their server is invisible.

I also sent proper User-Agent headers identifying the scraper as research software with a contact email. If an administrator notices unusual traffic and wants to reach me, they can. This isn't legally required, but it's the kind of transparency that builds trust between researchers and data providers. I'd rather they know I'm accessing data than have them wonder if it's a bot attack.

---

## The Three-Stage Pipeline

The scraper has three stages, each simple enough that debugging is straightforward.

**Stage one: discover all programme IDs.** The FCDO listing page is paginated—about 50 programmes per page, 12 pages total. I iterate through pages, extracting each programme ID and URL. If a page returns no programmes, I've reached the end. A 2-second delay between each page request keeps things polite.

**Stage two: find documents.** Not every programme has a business case document. Some have multiple documents—annual reviews, completion reports. I identify business case documents by keyword matching against titles:

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
        if any(keyword in link_text for keyword in DOCUMENT_KEYWORDS):
            documents.append({
                'programme_id': programme['id'],
                'title': link.text.strip(),
                'url': link['href'],
                'document_type': self.classify_document_type(link_text)
            })
    
    return documents
```

**Stage three: download the PDFs.** Each PDF gets saved with a filename based on the programme ID, so I can link it back to metadata later. Network failures happen, so I retry up to three times with exponential backoff before logging the failure and moving on:

```python
def download_document(self, doc, output_dir):
    """Download a document with retry logic."""
    for attempt in range(self.max_retries):
        try:
            response = self.session.get(doc['url'], timeout=60, stream=True)
            response.raise_for_status()
            
            programme_dir = os.path.join(output_dir, doc['programme_id'])
            os.makedirs(programme_dir, exist_ok=True)
            
            filename = doc['url'].split('/')[-1]
            filepath = os.path.join(programme_dir, filename)
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            return True
            
        except requests.RequestException as e:
            wait_time = (2 ** attempt) * self.delay
            self.logger.warning(f"Attempt {attempt + 1} failed: {e}. Waiting {wait_time}s")
            time.sleep(wait_time)
    
    return False
```

The entire pipeline produces a folder of 555 PDFs plus a metadata JSON file mapping programme IDs to document URLs, download timestamps, and any errors encountered.

---

## Handling the Mess

The trickiest part was handling inconsistency.

Some programme pages have one clearly labeled "Business Case" PDF. Others have documents titled "Project Overview" or "Programme Document" that contain business case content. Others have multiple versions—draft, final, revised. I erred on the side of over-inclusion: download anything that might be a business case, then filter later.

Some PDFs were actually Word documents with .pdf extensions. Some were scanned images rather than text. Some returned 404 errors even though the listing page showed them as available. Each of these edge cases required specific handling—mime type checking, OCR fallback, error logging.

By the time I finished debugging, the scraper was probably more robust than it needed to be. But robustness means I can run it again in six months to capture new programmes without babysitting:

```powershell
# Full scrape (20-30 minutes with polite delays)
python main.py

# Test with limited programmes
python main.py --max-programmes 10

# Include annual reviews for before/after analysis
python main.py --include-annual-reviews
```

---

## What 555 Business Cases Are Good For

The immediate use is a reference dataset. When I'm reviewing a FCDO-funded evaluation, I can pull the original business case and compare: what did they expect to happen, what actually happened? The theory of change in the business case is often more detailed than what appears in published evaluations.

The longer-term use is content analysis. What kinds of evidence do business cases cite? How do they handle uncertainty? What assumptions do they make about beneficiary behavior? I've started using LLMs to extract structured fields from the documents—predicted beneficiary numbers, cost-per-beneficiary, expected effect sizes—which could feed a meta-analysis of donor expectations versus results.

From 555 programmes, I ended up with:
- 234 business cases
- 198 addendums (modifications to original plans)
- 55 statements of need
- 312 programmes with at least one business case document

The data is public, so the scraped corpus is shareable. If anyone else wants to study UK development programme design, they can skip the scraping step and start with the analysis.

---

## The Real Point

There's a philosophical point here about open government data. FCDO publishes these documents, which is laudable. But publishing them in a way that makes bulk access tedious is a form of friction that limits research use. A proper API—or even a ZIP file of all current business cases—would serve researchers better than 555 individual PDF links.

I don't fault FCDO for this; they're not resourced to build researcher-friendly data infrastructure. But it means that researchers who want to use public data need to build their own collection tools. The scraping is trivial, but it's a barrier that filters out people who don't know Python.

If I were advising government data teams, I'd say: whatever you publish on individual web pages, also publish as bulk downloads. The marginal cost is minimal. The research benefit is substantial.

The tools exist. The data is public. The research is waiting. Sometimes the hardest part is being patient enough to collect 555 documents at a pace that respects the server hosting them.

*Scraper code on GitHub. Respect rate limits.*
