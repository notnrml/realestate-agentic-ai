 # Main agent logic (LangChain)
from langchain.agents import initialize_agent, Tool
from langchain.agents.agent_types import AgentType
from langchain_community.llms import ollama
from tools.trend_tool import analyze_trends
from tools.roi_tool import forecast_roi

llm = ollama(model="mistral")  # or 'mistral:instruct' for chat-style replies

# Define LangChain Tools
tools = [
    Tool(
        name="TrendSpotter",
        func=lambda _: str(analyze_trends("data/recent_listings.csv")),
        description="Identifies zip codes with rising rents and trends."
    ),
    Tool(
        name="ROIForecaster",
        func=lambda _: str(forecast_roi("data/recent_listings.csv")),
        description="Calculates ROI and yield predictions."
    )
]

# Initialize the agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

def run_agent(user_query: str):
    return agent.run(user_query)
