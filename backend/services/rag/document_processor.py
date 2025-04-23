from typing import List, Dict, Any
import pandas as pd
import numpy as np
from pathlib import Path
import json
import logging
from bs4 import BeautifulSoup
import re
import tiktoken

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
        
    def process_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks"""
        # Clean text
        text = self._clean_text(text)
        
        # Simple sentence splitting if NLTK is not available
        sentences = text.split('. ')
        sentences = [s.strip() + '.' for s in sentences if s.strip()]
        
        # Create chunks
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_tokens = len(self.tokenizer.encode(sentence))
            
            if current_size + sentence_tokens > self.chunk_size:
                # Save current chunk
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                
                # Start new chunk with overlap
                overlap_size = 0
                current_chunk = []
                
                # Add sentences from previous chunk for overlap
                for prev_sentence in current_chunk[-3:]:  # Use last 3 sentences for overlap
                    if overlap_size + len(self.tokenizer.encode(prev_sentence)) <= self.chunk_overlap:
                        current_chunk.append(prev_sentence)
                        overlap_size += len(self.tokenizer.encode(prev_sentence))
                
                current_size = overlap_size
            
            current_chunk.append(sentence)
            current_size += sentence_tokens
        
        # Add final chunk
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        # Normalize quotes and dashes
        text = text.replace('"', '"').replace('"', '"').replace('–', '-')
        
        return text.strip()
    
    def process_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """Process CSV file into documents"""
        df = pd.read_csv(file_path)
        documents = []
        
        for _, row in df.iterrows():
            # Combine relevant columns into text
            text = " ".join(str(val) for val in row.values if pd.notna(val))
            
            # Split into chunks if needed
            chunks = self.process_text(text)
            
            # Create document for each chunk
            for i, chunk in enumerate(chunks):
                documents.append({
                    "text": chunk,
                    "metadata": {
                        "source": file_path,
                        "row_index": _,
                        "chunk_index": i,
                        **row.to_dict()  # Include original data as metadata
                    }
                })
        
        return documents
    
    def process_html(self, file_path: str) -> List[Dict[str, Any]]:
        """Process HTML file into documents"""
        with open(file_path, 'r') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        
        # Remove scripts and styles
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Split into chunks
        chunks = self.process_text(text)
        
        # Create documents
        documents = []
        for i, chunk in enumerate(chunks):
            documents.append({
                "text": chunk,
                "metadata": {
                    "source": file_path,
                    "chunk_index": i
                }
            })
        
        return documents