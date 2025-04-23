import nltk
import logging

logger = logging.getLogger(__name__)

def setup_nltk():
    """Download required NLTK data"""
    try:
        # Download punkt for sentence tokenization
        nltk.download('punkt', quiet=True)
        logger.info("Successfully downloaded NLTK punkt data")
        
        # Download wordnet for lemmatization
        nltk.download('wordnet', quiet=True)
        logger.info("Successfully downloaded NLTK wordnet data")
        
        # Download stopwords for text processing
        nltk.download('stopwords', quiet=True)
        logger.info("Successfully downloaded NLTK stopwords data")
        
        return True
    except Exception as e:
        logger.error(f"Failed to download NLTK data: {e}")
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Run setup
    success = setup_nltk()
    if success:
        print("NLTK setup completed successfully")
    else:
        print("NLTK setup failed")