from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.market_trends_router import router as market_router
from backend.routers.my_portfolio_router import router as portfolio_router
from backend.routers.chatbot_router import router as chatbot_router
from backend.routers.advisor_router import router as advisor_router
from backend.routers.message_router import router as model_router

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is working!"}


app.include_router(model_router)
app.include_router(market_router)
app.include_router(portfolio_router)
app.include_router(chatbot_router)
app.include_router(advisor_router)


"""
SAMPLE APP STRUCTURE

from fastapi import FastAPI
from pydantic import BaseModel
from agents.core_agent import run_agent

app = FastAPI()

class Query(BaseModel):
    message: str

@app.post("/analyze")
def analyze(query: Query):
    response = run_agent(query.message)
    return {"response": response}

"""