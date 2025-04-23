from typing import List, Dict, Any
import logging
from .rag.document_processor import DocumentProcessor
from .rag.embedding_service import EmbeddingService
from .rag.retrieval_service import RetrievalService
from .rag.generation_service import GenerationService
import os

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class RAGService:
    def __init__(self):
        logger.debug("Initializing RAG Service components...")
        self.document_processor = DocumentProcessor()
        self.embedding_service = EmbeddingService()
        self.retrieval_service = RetrievalService(self.embedding_service)
        self.generation_service = GenerationService()
        logger.debug("RAG Service components initialized")
        
    async def process_and_index_data(self):
        """Process and index all data sources"""
        try:
            logger.debug("Starting data processing and indexing...")
            # Get the current directory (backend)
            current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_dir = os.path.join(current_dir, 'data')
            logger.debug(f"Data directory: {data_dir}")
            
            # Process CSV files
            logger.debug("Processing CSV files...")
            listings = self.document_processor.process_csv(os.path.join(data_dir, 'bayut_listings_enriched.csv'))
            logger.debug(f"Processed {len(listings)} listings")
            
            market_data = self.document_processor.process_csv(os.path.join(data_dir, 'area_stats.csv'))
            logger.debug(f"Processed {len(market_data)} market data entries")
            
            historical = self.document_processor.process_csv(os.path.join(data_dir, 'historical_data.csv'))
            logger.debug(f"Processed {len(historical)} historical entries")
            
            # Process HTML files
            logger.debug("Processing HTML files...")
            page1 = self.document_processor.process_html(os.path.join(data_dir, 'page_1_bs4.html'))
            logger.debug(f"Processed page 1 with {len(page1)} chunks")
            
            page2 = self.document_processor.process_html(os.path.join(data_dir, 'page_2_bs4.html'))
            logger.debug(f"Processed page 2 with {len(page2)} chunks")
            
            # Combine all documents
            all_documents = listings + market_data + historical + page1 + page2
            logger.debug(f"Total documents to index: {len(all_documents)}")
            
            # Index documents
            logger.debug("Indexing documents in Qdrant...")
            self.retrieval_service.index_documents(all_documents, "real_estate_knowledge")
            logger.debug("Document indexing completed")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to process and index data: {e}", exc_info=True)
            return False
    
    async def query(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """Query the RAG system"""
        try:
            logger.debug(f"Processing query: {query}")
            # Get relevant documents
            logger.debug("Retrieving relevant documents...")
            context = await self.retrieval_service.hybrid_search(
                query=query,
                collection_name="real_estate_knowledge",
                limit=limit
            )
            logger.debug(f"Retrieved {len(context)} relevant documents")
            
            # Generate response
            logger.debug("Generating response...")
            response = await self.generation_service.generate_response(
                query=query,
                context=context
            )
            logger.debug("Response generated successfully")
            
            return {
                "response": response,
                "context": context
            }
            
        except Exception as e:
            logger.error(f"Failed to process query: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered an error processing your query.",
                "context": []
            }