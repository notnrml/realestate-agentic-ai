from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/my-portfolio",
    tags=["My Portfolio"]
)

@router.post("/create-health")
async def health_create_portfolio():
    return {"status": "Create endpoint is healthy"}

@router.get("/read-health")
async def health_read_portfolio():
    return {"status": "Read endpoint is healthy"}

@router.put("/update-health")
async def health_update_portfolio():
    return {"status": "Update endpoint is healthy"}

@router.delete("/delete-health")
async def health_delete_portfolio():
    return {"status": "Delete endpoint is healthy"}
