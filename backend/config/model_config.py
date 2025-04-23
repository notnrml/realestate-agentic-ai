"""
Configuration settings for the Ollama API integration
"""
import httpx
import logging

# Setup logging for config module
logger = logging.getLogger("model_config")
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

# Ollama API configuration
OLLAMA_API_URL = "http://localhost:11434/api"
MODEL_NAME = "mistral:7b-instruct"

# Log the configuration
logger.info(f"Using Ollama API URL: {OLLAMA_API_URL}")
logger.info(f"Using model: {MODEL_NAME}")

# Set timeout for API requests
REQUEST_TIMEOUT = 60.0  # Increase timeout to 60 seconds

# Default model parameters
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 2048

# API settings
API_TITLE = "Real Estate Analysis API"
API_DESCRIPTION = "API for real estate data analysis using Mistral 7B Instruct"
API_VERSION = "0.1.0"

def get_ollama_client():
    """
    Returns an httpx client for asynchronous communication with Ollama API
    """
    base_url = OLLAMA_API_URL.rsplit('/api', 1)[0]
    logger.debug(f"Creating Ollama client with base URL: {base_url}")
    return httpx.AsyncClient(base_url=base_url)

async def test_ollama_connection():
    """
    Test the connection to Ollama API
    """
    try:
        async with httpx.AsyncClient() as client:
            logger.debug(f"Testing connection to Ollama API at: {OLLAMA_API_URL}/tags")
            response = await client.get(f"{OLLAMA_API_URL}/tags")
            if response.status_code == 200:
                logger.info("Successfully connected to Ollama API")
                models = response.json().get("models", [])
                logger.info(f"Available models: {models}")
                if not any(MODEL_NAME in model['name'] for model in models):
                    logger.warning(f"Model {MODEL_NAME} not found in available models")
                return True, "Connection successful"
            else:
                logger.error(f"Failed to connect to Ollama API: {response.status_code} - {response.text}")
                return False, f"Failed with status {response.status_code}"
    except Exception as e:
        logger.error(f"Error testing connection to Ollama API: {str(e)}")
        return False, str(e)
