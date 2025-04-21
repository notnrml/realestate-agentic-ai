from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

@router.post("/create-health")
async def health_create_chatbot():
    return {"status": "Create endpoint is healthy"}

@router.get("/read-health")
async def health_read_chatbot():
    return {"status": "Read endpoint is healthy"}

@router.put("/update-health")
async def health_update_chatbot():
    return {"status": "Update endpoint is healthy"}

@router.delete("/delete-health")
async def health_delete_chatbot():
    return {"status": "Delete endpoint is healthy"}
