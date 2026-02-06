---
title: "400 PDFs, One Question"
summary: "When keyword search fails and manual reading isn't feasible, semantic search changes how you interact with a research corpus. A practical RAG system for evidence synthesis."
date: 2025-11-05
authors:
  - admin
tags:
  - RAG
  - FAISS
  - Sentence Transformers
  - Vector Search
  - Python
  - Research Tools
image:
  caption: 'Semantic search over research documents'
categories:
  - AI/ML
  - Research Tools
featured: false
---

"What does the evidence say about cash transfer effects on nutrition?" It's a simple question. We had 400 papers for an evidence map, and I knew at least a dozen were relevant. But when I searched for that exact phrase, I got nothing.

The problem is vocabulary mismatch. One study discusses "unconditional money transfers and dietary diversity." Another examines "social protection programs and food security." A third measures "monetary assistance effects on child anthropometrics." They're all answering my question, but none uses my words.

I spent an afternoon with Ctrl+F, opening each PDF, searching variations of my query, noting relevant passages. Four hours later I had seven studies. There were more—I found them later—but I'd missed them because my keyword variations didn't match their terminology.

This is the problem that retrieval-augmented generation solves. Not the generation part—that came later—but the retrieval. Semantic search finds documents by meaning, not keywords. "Cash transfer effects on nutrition" matches "unconditional money assistance and dietary outcomes" because the underlying concepts are similar, even though the words aren't.

---

The architecture is conceptually simple. PDFs become text. Text becomes chunks. Chunks become vectors. Queries become vectors. You find chunks whose vectors are close to the query vector and return them. The LLM part—synthesizing an answer from the retrieved chunks—is almost an afterthought.

The devil is in the chunking. Cut too small and you lose context. Cut too big and the embedding averages over too many concepts, losing precision. Overlap matters because relevant passages don't respect your arbitrary split points. I settled on 500-word chunks with 50-word overlap after experimenting with different sizes.

Text extraction is the other hidden complexity. Research PDFs are messy—two-column layouts, footnotes, tables, equations. Basic extraction produces garbled text where columns interleave incorrectly. PyMuPDF handles layout analysis reasonably well, but some documents still need manual cleanup. I've found that garbage in definitely means garbage out; a single paper with badly extracted text can pollute search results for related queries.

---

The embedding model matters more than I initially thought. I started with a general-purpose sentence transformer, and it worked—mostly. But it struggled with domain-specific terminology. "Propensity score matching" and "matched comparison design" should be nearly synonymous, but the general model treated them as only vaguely related.

Switching to an embedding model fine-tuned on academic text improved results noticeably. The retrieval became more precise for methodological queries. Authors' names started matching across papers. Citation formats stopped confusing the model.

FAISS handles the vector index efficiently. For 400 papers chunked into maybe 10,000 segments, it's overkill—SQLite with a brute-force cosine similarity would work fine. But FAISS scales, and I've since used the same architecture for much larger corpora where the efficiency matters.

---

The query pipeline is straightforward: embed the question, find the 10 nearest chunks, return them with their source documents. For most questions, this is enough. "Which studies measured effects on school enrollment?" returns the relevant passages directly.

The synthesis step—feeding those chunks to an LLM with a prompt like "answer the question based only on these passages"—adds convenience but isn't always necessary. Sometimes I just want the relevant paragraphs with citations. The LLM summary is helpful for complex questions that span multiple studies, less so for simple lookups.

What changed my workflow wasn't sophistication; it was coverage. I now find relevant studies I would have missed with keyword search. The four-hour manual search became a two-minute query. More importantly, I stopped being limited to my vocabulary—the system surfaces studies using terminology I didn't think to search for.

---

The system has clear limitations. It's read-only; you can't ask follow-up questions that depend on previous answers. It doesn't reason across documents—it retrieves relevant passages but doesn't synthesize relationships between studies. It occasionally retrieves irrelevant passages that happen to share vocabulary with the query.

For serious systematic review work, you still need structured extraction and formal quality assessment. This tool doesn't replace that. But for exploratory queries—"what exists on this topic?"—it's transformed how I interact with a research corpus.

The code is relatively simple: PyMuPDF for extraction, sentence-transformers for embedding, FAISS for indexing, OpenAI for synthesis. The complexity isn't in any individual component but in tuning the pipeline end-to-end: chunk size, overlap, embedding model choice, retrieval count, prompt design.

If you're building something similar, start with the retrieval and ignore the generation until retrieval works well. A good retrieval system with no LLM is useful. A fancy LLM on top of bad retrieval is just confidently wrong.

---

The deeper lesson from building this system is about the nature of search itself. Keyword search assumes you know what you're looking for. Semantic search assumes you know what you mean. These are different assumptions, and they fail in different ways.

For research synthesis, semantic search is usually what you want. You have a question; you need studies that address it, regardless of their terminology. But occasionally keyword search is right—when you're looking for a specific citation, a particular author, an exact phrase from a methodology section.

The production version of this system includes both: semantic search for conceptual queries, keyword search for exact matching, metadata filters for year, country, and methodology. The hybrid approach handles more query types than either alone.

Building the system took a weekend. Tuning it to be actually useful took longer. Understanding when to use it versus other approaches took longer still.

*Code available on GitHub. The architecture has since evolved into DevChat, described in a separate post.*
        if filename.endswith('.pdf'):
            pdf_path = os.path.join(pdf_folder, filename)
            text = extract_text_from_pdf(pdf_path)
            chunks = chunk_text(text)
            
            for i, chunk in enumerate(chunks):
                all_chunks.append({
                    'text': chunk,
                    'pdf_path': pdf_path,
                    'pdf_name': filename,
                    'chunk_index': i
                })
    
    return all_chunks
```

## Step 2: Create Embeddings and FAISS Index

```python
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

EMBEDDING_MODEL = "all-MiniLM-L6-v2"

def create_index(chunks: List[Dict], index_path: str = "faiss_index.index"):
    """Create FAISS index from text chunks"""
    
    # Load embedding model
    embedder = SentenceTransformer(EMBEDDING_MODEL)
    print(f"Loaded embedding model: {EMBEDDING_MODEL}")
    
    # Extract texts
    texts = [chunk['text'] for chunk in chunks]
    
    # Create embeddings
    print(f"Creating embeddings for {len(texts)} chunks...")
    embeddings = embedder.encode(texts, show_progress_bar=True)
    
    # Create FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)  # L2 distance
    index.add(embeddings.astype('float32'))
    
    # Save index
    faiss.write_index(index, index_path)
    print(f"Saved FAISS index with {index.ntotal} vectors to {index_path}")
    
    return index
```

## Step 3: Store Metadata in SQLite

```python
import sqlite3

def create_database(chunks: List[Dict], db_path: str = "pdfs.db"):
    """Store chunk metadata in SQLite"""
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chunk_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            pdf_path TEXT,
            pdf_name TEXT,
            chunk_index INTEGER
        )
    """)
    
    # Insert chunks
    for chunk in chunks:
        cursor.execute("""
            INSERT INTO chunk_metadata (text, pdf_path, pdf_name, chunk_index)
            VALUES (?, ?, ?, ?)
        """, (chunk['text'], chunk['pdf_path'], chunk['pdf_name'], chunk['chunk_index']))
    
    conn.commit()
    conn.close()
    print(f"Saved {len(chunks)} chunks to {db_path}")
```

## Step 4: The Complete RAG Query System

```python
class CompleteRAGQuery:
    def __init__(self, index_path: str, db_path: str):
        """Initialize RAG query system with proper alignment"""
        
        # Load FAISS index
        self.index = faiss.read_index(index_path)
        print(f"Loaded FAISS index with {self.index.ntotal:,} vectors")
        
        # Load embedding model
        self.embedder = SentenceTransformer(EMBEDDING_MODEL)
        
        # Connect to database
        self.conn = sqlite3.connect(db_path)
        
        # Check alignment
        self._check_alignment()
    
    def _check_alignment(self):
        """Handle FAISS/Database alignment"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM chunk_metadata")
        db_count = cursor.fetchone()[0]
        
        print(f"FAISS vectors: {self.index.ntotal:,}")
        print(f"Database chunks: {db_count:,}")
        
        if self.index.ntotal != db_count:
            print(f"Warning: {abs(self.index.ntotal - db_count)} difference")
            # Create alignment mapping
            cursor.execute("SELECT id FROM chunk_metadata ORDER BY id")
            valid_ids = [row[0] for row in cursor.fetchall()]
            self.faiss_to_db_id = {
                i: valid_ids[i] 
                for i in range(min(self.index.ntotal, len(valid_ids)))
            }
        else:
            self.faiss_to_db_id = {i: i+1 for i in range(self.index.ntotal)}
    
    def search(self, query: str, top_k: int = 5, min_score: float = 0.0):
        """
        Search for similar content
        
        Args:
            query: Search question
            top_k: Number of results
            min_score: Minimum similarity score (0.0 to 1.0)
        
        Returns:
            List of results with text, source, and scores
        """
        # Embed query
        query_embedding = self.embedder.encode([query])
        
        # Search FAISS
        search_k = min(top_k * 5, self.index.ntotal)
        distances, indices = self.index.search(
            query_embedding.astype('float32'),
            search_k
        )
        
        results = []
        cursor = self.conn.cursor()
        
        for distance, faiss_idx in zip(distances[0], indices[0]):
            if faiss_idx in self.faiss_to_db_id:
                db_id = self.faiss_to_db_id[faiss_idx]
                
                cursor.execute("""
                    SELECT text, pdf_path, pdf_name
                    FROM chunk_metadata
                    WHERE id = ?
                """, (db_id,))
                
                result = cursor.fetchone()
                if result:
                    text, pdf_path, pdf_name = result
                    
                    # Convert distance to similarity score
                    similarity_score = 1 / (1 + distance)
                    
                    if similarity_score >= min_score:
                        results.append({
                            'rank': len(results) + 1,
                            'text': text,
                            'pdf_name': pdf_name,
                            'pdf_path': pdf_path,
                            'similarity_score': similarity_score,
                            'distance': distance
                        })
                        
                        if len(results) >= top_k:
                            break
        
        return results
```

## Step 5: Adding LLM Answer Generation

```python
import requests

def generate_answer(query: str, context_chunks: List[Dict], 
                    model: str = "mistral") -> str:
    """Generate answer using retrieved context"""
    
    # Build context from retrieved chunks
    context = "\n\n---\n\n".join([
        f"Source: {c['pdf_name']}\n{c['text']}" 
        for c in context_chunks
    ])
    
    prompt = f"""Based on the following research document excerpts, 
answer the question. Cite the source documents when possible.

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""
    
    # Query Ollama
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.3}
        }
    )
    
    return response.json()["response"]
```

## Usage Example

```python
# Initialize system
rag = CompleteRAGQuery("faiss_index.index", "pdfs.db")

# Search for content
query = "What methods are used to evaluate education interventions in conflict zones?"
results = rag.search(query, top_k=5, min_score=0.3)

# Print results
for r in results:
    print(f"#{r['rank']} | {r['pdf_name']} (score: {r['similarity_score']:.3f})")
    print(f"   {r['text'][:200]}...")
    print()

# Generate synthesized answer
answer = generate_answer(query, results)
print("Generated Answer:")
print(answer)
```

## Advanced: Filtered Search

```python
def search_with_filters(self, query: str, top_k: int = 5, 
                        pdf_filter: List[str] = None,
                        year_filter: tuple = None):
    """Search with additional filters"""
    
    # Get more candidates than needed
    candidates = self.search(query, top_k=top_k * 3)
    
    filtered = []
    for result in candidates:
        # Apply PDF filter
        if pdf_filter:
            if not any(f in result['pdf_name'] for f in pdf_filter):
                continue
        
        # Apply year filter (requires year in filename)
        if year_filter:
            import re
            year_match = re.search(r'20\d{2}', result['pdf_name'])
            if year_match:
                year = int(year_match.group())
                if not (year_filter[0] <= year <= year_filter[1]):
                    continue
        
        filtered.append(result)
        if len(filtered) >= top_k:
            break
    
    return filtered
```

## Performance Optimization

For large document collections:

```python
# Use IVF index for faster search
def create_ivf_index(embeddings, nlist=100):
    """Create IVF index for large collections"""
    dimension = embeddings.shape[1]
    
    # Quantizer
    quantizer = faiss.IndexFlatL2(dimension)
    
    # IVF index
    index = faiss.IndexIVFFlat(quantizer, dimension, nlist)
    
    # Train on data
    index.train(embeddings.astype('float32'))
    index.add(embeddings.astype('float32'))
    
    # Set search parameters
    index.nprobe = 10  # Number of clusters to search
    
    return index
```

## Results

| Metric | Value |
|--------|-------|
| Documents indexed | 523 PDFs |
| Total chunks | 42,156 |
| Index size | 186 MB |
| Avg query time | 45ms |
| Embedding model | all-MiniLM-L6-v2 |

---

This RAG system enables semantic search across hundreds of research documents, finding relevant content even when exact keywords don't match. Combined with LLM generation, it provides synthesized answers with source citations.
