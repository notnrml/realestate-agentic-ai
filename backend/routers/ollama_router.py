from fastapi import APIRouter, HTTPException
import subprocess
import os
import platform
import logging
import asyncio
import httpx
from backend.config.model_config import OLLAMA_API_URL

# Set up logging
logger = logging.getLogger("ollama_router")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

router = APIRouter(prefix="/ollama", tags=["Ollama Management"])

# Map OS to Ollama start commands
OLLAMA_COMMANDS = {
    "Windows": {
        "start": "start /B ollama serve",
        "check": "tasklist | findstr ollama",
    },
    "Darwin": {  # macOS
        "start": "open -a ollama",
        "check": "pgrep -x ollama",
    },
    "Linux": {
        "start": "ollama serve &",
        "check": "pgrep ollama",
    }
}

@router.post("/start")
async def start_ollama_service():
    """Start the Ollama service if it's not already running."""
    try:
        # First check if Ollama is already running
        is_running = await check_ollama_status()
        if is_running:
            return {"status": "already_running", "message": "Ollama is already running"}

        # Get OS-specific commands
        os_name = platform.system()
        if os_name not in OLLAMA_COMMANDS:
            logger.error(f"Unsupported operating system: {os_name}")
            raise HTTPException(status_code=500, detail=f"Unsupported operating system: {os_name}")

        start_command = OLLAMA_COMMANDS[os_name]["start"]

        # Start Ollama
        logger.info(f"Starting Ollama with command: {start_command}")

        if os_name == "Windows":
            # Use different approach for Windows
            subprocess.Popen(
                start_command,
                shell=True,
                creationflags=subprocess.CREATE_NEW_CONSOLE | subprocess.DETACHED_PROCESS
            )
        else:
            # Unix-based systems
            subprocess.Popen(
                start_command,
                shell=True,
                stdin=None,
                stdout=None,
                stderr=None,
                close_fds=True,
                start_new_session=True
            )

        # Wait briefly for startup
        await asyncio.sleep(2)

        # Check if it's now running
        is_running = await check_ollama_status()
        if is_running:
            return {"status": "started", "message": "Ollama service has been started"}
        else:
            # It didn't start immediately, which is normal
            return {"status": "starting", "message": "Ollama service is starting. This may take a moment."}

    except Exception as e:
        logger.error(f"Error starting Ollama: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting Ollama: {str(e)}")

@router.get("/status")
async def check_ollama_running():
    """Check if Ollama is running and responding to API calls."""
    try:
        status = await check_ollama_status()
        return {"status": "running" if status else "stopped"}
    except Exception as e:
        logger.error(f"Error checking Ollama status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking Ollama status: {str(e)}")

async def check_ollama_status():
    """Check if Ollama API is responsive."""
    try:
        # Try to connect to the Ollama API
        base_url = OLLAMA_API_URL.rstrip("/api")  # Remove "/api" if present
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/api/tags", timeout=2.0)
            return response.status_code == 200
    except Exception as e:
        logger.info(f"Ollama check failed: {str(e)}")
        return False
