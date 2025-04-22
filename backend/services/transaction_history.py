import os
import requests

# Direct CSV URL
csv_url = "https://www.dubaipulse.gov.ae/dataset/00768c45-f014-4cc6-937d-2b17dcab53fb/resource/765b5a69-ca16-4bfd-9852-74612f3c4ea6/download/rent_contracts.csv"

# Define the path to save the CSV file
save_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'Rent_Contracts.csv')

# Make sure the directory exists
os.makedirs(os.path.dirname(save_path), exist_ok=True)

# Download and save
response = requests.get(csv_url)
response.raise_for_status()
with open(save_path, 'wb') as f:
    f.write(response.content)

print(f"CSV downloaded to: {save_path}")
