---
title: "Building a RAG System for Research Document Search"
summary: "Implementing a Retrieval-Augmented Generation system with FAISS, sentence transformers, and SQLite to query hundreds of research PDFs with semantic search."
date: 2024-11-05
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

## Why RAG for Research?

When working with hundreds of research papers, finding relevant content becomes challenging. Traditional keyword search misses semantic relationships. RAG (Retrieval-Augmented Generation) solves this by:

1. Converting text chunks to embeddings
2. Storing embeddings in a vector index
3. Finding semantically similar content
4. Optionally generating answers with LLMs

This post shows how to build a complete RAG system for querying research documents.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      RAG ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    │
│  │    PDFs     │───►│ Text Extract │───►│    Chunking     │    │
│  └─────────────┘    └──────────────┘    └────────┬────────┘    │
│                                                   │              │
│                           ┌───────────────────────┤              │
│                           ▼                       ▼              │
│               ┌─────────────────┐    ┌─────────────────────┐    │
│               │  Sentence       │    │  SQLite Database    │    │
│               │  Transformer    │    │  (metadata)         │    │
│               └────────┬────────┘    └─────────────────────┘    │
│                        │                         ▲              │
│                        ▼                         │              │
│               ┌─────────────────┐                │              │
│               │  FAISS Index    │◄───────────────┘              │
│               │  (vectors)      │                               │
│               └────────┬────────┘                               │
│                        │                                        │
│       ┌────────────────┴────────────────┐                       │
│       ▼                                 ▼                       │
│  ┌─────────┐                     ┌─────────────┐               │
│  │  Query  │                     │ LLM Answer  │               │
│  │ Results │                     │ Generation  │               │
│  └─────────┘                     └─────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Text Extraction and Chunking

```python
import pymupdf  # PyMuPDF
import os
from typing import List, Dict

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF using PyMuPDF"""
    doc = pymupdf.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping chunks"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    
    return chunks

def process_pdfs(pdf_folder: str) -> List[Dict]:
    """Process all PDFs in folder into chunks with metadata"""
    all_chunks = []
    
    for filename in os.listdir(pdf_folder):
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
