from typing import List, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
from pathlib import Path
import json
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', cache_dir: str = None):
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)
        self.cache_dir = Path(cache_dir) if cache_dir else None
        
        # Enable GPU if available
        if torch.cuda.is_available():
            self.model = self.model.to('cuda')
    
    @lru_cache(maxsize=10000)
    def get_embedding(self, text: str) -> np.ndarray:
        """Get embedding for a single text with caching"""
        return self.model.encode(text)
    
    def get_embeddings(self, texts: List[str], batch_size: int = 32) -> np.ndarray:
        """Get embeddings for multiple texts with batching"""
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = self.model.encode(batch)
            embeddings.extend(batch_embeddings)
        
        return np.array(embeddings)
    
    def save_embeddings(self, texts: List[str], file_name: str):
        """Save embeddings to disk"""
        if not self.cache_dir:
            return
        
        embeddings = self.get_embeddings(texts)
        
        cache_file = self.cache_dir / f"{file_name}.npz"
        np.savez_compressed(
            cache_file,
            embeddings=embeddings,
            texts=texts
        )
    
    def load_embeddings(self, file_name: str) -> Dict[str, np.ndarray]:
        """Load embeddings from disk"""
        if not self.cache_dir:
            return None
        
        cache_file = self.cache_dir / f"{file_name}.npz"
        if not cache_file.exists():
            return None
        
        data = np.load(cache_file)
        return {
            'embeddings': data['embeddings'],
            'texts': data['texts']
        }