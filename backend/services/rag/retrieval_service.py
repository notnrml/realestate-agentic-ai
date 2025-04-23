from typing import List, Dict, Any
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models
import logging
from rank_bm25 import BM25Okapi
import re

logger = logging.getLogger(__name__)

class RetrievalService:
    def __init__(self, embedding_service):
        self.embedding_service = embedding_service
        self.qdrant = QdrantClient(":memory:")  # In-memory Qdrant
        
        # Initialize BM25 for hybrid search
        self.bm25 = None
        self.documents = []
    
    def index_documents(self, documents: List[Dict[str, Any]], collection_name: str):
        """Index documents in Qdrant and prepare BM25"""
        try:
            # Prepare texts and embeddings
            texts = [doc["text"] for doc in documents]
            embeddings = self.embedding_service.get_embeddings(texts)
            
            # Create or recreate collection
            self.qdrant.recreate_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=embeddings.shape[1],
                    distance=models.Distance.COSINE
                )
            )
            
            # Index documents
            self.qdrant.upsert(
                collection_name=collection_name,
                points=[
                    models.PointStruct(
                        id=i,
                        vector=embedding.tolist(),
                        payload={"text": doc["text"], **doc["metadata"]}
                    )
                    for i, (doc, embedding) in enumerate(zip(documents, embeddings))
                ]
            )
            
            # Prepare BM25
            tokenized_texts = [self._tokenize(text) for text in texts]
            self.bm25 = BM25Okapi(tokenized_texts)
            self.documents = documents
            
        except Exception as e:
            logger.error(f"Failed to index documents: {e}")
            raise
    
    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization without NLTK"""
        # Convert to lowercase and split on whitespace
        words = text.lower().split()
        # Remove punctuation
        words = [re.sub(r'[^\w\s]', '', word) for word in words]
        # Remove empty strings
        return [word for word in words if word]
    
    async def hybrid_search(
        self,
        query: str,
        collection_name: str,
        limit: int = 5,
        semantic_weight: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword search"""
        try:
            # Get semantic search results
            query_vector = self.embedding_service.get_embedding(query)
            semantic_results = self.qdrant.search(
                collection_name=collection_name,
                query_vector=query_vector.tolist(),
                limit=limit * 2  # Get more results for reranking
            )
            
            # Get BM25 results if initialized
            if self.bm25 is not None:
                tokenized_query = self._tokenize(query)
                bm25_scores = self.bm25.get_scores(tokenized_query)
                
                # Normalize BM25 scores
                bm25_scores = (bm25_scores - np.min(bm25_scores)) / (np.max(bm25_scores) - np.min(bm25_scores))
                
                # Combine scores
                combined_results = []
                for hit, bm25_score in zip(semantic_results, bm25_scores):
                    combined_score = (
                        semantic_weight * hit.score +
                        (1 - semantic_weight) * bm25_score
                    )
                    combined_results.append((hit.payload, combined_score))
                
                # Sort by combined score
                combined_results.sort(key=lambda x: x[1], reverse=True)
                
                # Return top results
                return [result[0] for result in combined_results[:limit]]
            
            # Fallback to semantic search only
            return [hit.payload for hit in semantic_results[:limit]]
            
        except Exception as e:
            logger.error(f"Failed to perform hybrid search: {e}")
            return []