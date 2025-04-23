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
MODEL_NAME = "mistral:7b-instruct"  # Using mistral:7b-instruct for better instruction following

# Log the configuration
logger.info(f"Using Ollama API URL: {OLLAMA_API_URL}")
logger.info(f"Using model: {MODEL_NAME}")

# Set longer timeout for API requests - real estate analysis needs more time
REQUEST_TIMEOUT = 300.0  # Increase timeout to 300 seconds (5 minutes)

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

async def get_available_models():
    """Get list of available models from Ollama"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_API_URL}/tags")
            if response.status_code == 200:
                result = response.json()
                return [model["name"] for model in result.get("models", [])]
            return []
    except Exception as e:
        logger.error(f"Error getting available models: {str(e)}")
        return []

async def select_best_available_model():
    """Select the best available model from Ollama"""
    models = await get_available_models()
    logger.info(f"Available models: {models}")

    # Preferred models in order (best first)
    preferred_models = [
        "mistral:7b-instruct",  # Primary choice
        "mistral:instruct",
        "mistral:latest",
        "llama2:latest"
    ]

    for model in preferred_models:
        if model in models:
            logger.info(f"Selected model: {model}")
            return model

    # If no preferred model is available, return the first available model
    if models:
        logger.info(f"Using first available model: {models[0]}")
        return models[0]

    # Default fallback
    logger.warning(f"No models available, defaulting to {MODEL_NAME}")
    return MODEL_NAME
