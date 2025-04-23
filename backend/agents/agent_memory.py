import os
from mem0 import Memory
from config.model_config import MODEL_NAME, OLLAMA_API_URL

config = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "collection_name": "test",
            "host": "localhost",
            "port": 6333,
            "embedding_model_dims": 768,  # Change this according to your local model's dimensions
        },
    },
    "llm": {
        "provider": "ollama",
        "config": {
            "model": MODEL_NAME,
            "temperature": 0,
            "max_tokens": 2000,
            "ollama_base_url": OLLAMA_API_URL,
        },
    },
    "embedder": {
        "provider": "ollama",
        "config": {
            "model": "nomic-embed-text:latest",
            # Alternatively, you can use "snowflake-arctic-embed:latest"
            "ollama_base_url": OLLAMA_API_URL,
        },
    },
}

# Initialize Memory with the configuration
m = Memory.from_config(config)

# Add a memory
m.add("I'm visiting Paris", user_id="john")

# Retrieve memories
memories = m.get_all(user_id="john")