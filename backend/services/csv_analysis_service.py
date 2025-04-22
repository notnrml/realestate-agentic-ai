import pandas as pd
import os
from typing import List, Dict, Any, Optional
import json
from ..config.model_config import get_ollama_client, MODEL_NAME

class CSVAnalysisService:
    def __init__(self):
        self.ollama_client = get_ollama_client()
        self.model_name = MODEL_NAME
        
    async def analyze_csv(self, file_path: str, analysis_type: str = "general") -> Dict[str, Any]:
        """
        Analyze a CSV file using the Ollama model and return insights.
        
        Args:
            file_path: Path to the CSV file
            analysis_type: Type of analysis to perform (e.g., "general", "market_trends", "price_analysis")
            
        Returns:
            Dictionary containing the analysis results
        """
        try:
            # Read the CSV file
            df = pd.read_csv(file_path)
            
            # Convert DataFrame to JSON for model input
            data_json = df.to_json(orient='records')
            
            # Prepare the prompt based on analysis type
            prompt = self._prepare_prompt(data_json, analysis_type)
            
            # Get model response
            response = await self.ollama_client.chat(
                model=self.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a real estate market analyst. Analyze the provided data and give insights."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Parse the response
            analysis_result = self._parse_response(response)
            
            return {
                "success": True,
                "analysis": analysis_result,
                "data_summary": {
                    "rows": len(df),
                    "columns": list(df.columns),
                    "file_name": os.path.basename(file_path)
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _prepare_prompt(self, data_json: str, analysis_type: str) -> str:
        """Prepare the prompt for the model based on analysis type."""
        base_prompt = f"Here is some real estate data in JSON format: {data_json}\n\n"
        
        if analysis_type == "market_trends":
            return base_prompt + """
            Please analyze this data and provide:
            1. Key market trends
            2. Price movements
            3. Area popularity
            4. Investment opportunities
            Format your response as a JSON object with these keys.
            """
        elif analysis_type == "price_analysis":
            return base_prompt + """
            Please analyze this data and provide:
            1. Price statistics
            2. Price trends by area
            3. Price comparisons
            4. Value for money insights
            Format your response as a JSON object with these keys.
            """
        else:
            return base_prompt + """
            Please analyze this data and provide:
            1. Key insights
            2. Notable patterns
            3. Recommendations
            4. Potential risks
            Format your response as a JSON object with these keys.
            """
    
    def _parse_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse the model response into a structured format."""
        try:
            # Extract the content from the response
            content = response.get('message', {}).get('content', '{}')
            
            # Try to parse as JSON
            return json.loads(content)
        except json.JSONDecodeError:
            # If not valid JSON, return as text
            return {
                "raw_analysis": content
            } 