import sys
import os
import http.client
import json

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

def test_rag_query():
    conn = http.client.HTTPConnection("localhost", 8000)
    headers = {"Content-Type": "application/json"}
    data = {
        "query": "What are the most expensive properties in Dubai?",
        "max_results": 5
    }
    
    try:
        conn.request("POST", "/rag/query", body=json.dumps(data), headers=headers)
        response = conn.getresponse()
        print(f"Status Code: {response.status}")
        
        response_data = response.read().decode()
        print(f"Response: {response_data}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    test_rag_query() 