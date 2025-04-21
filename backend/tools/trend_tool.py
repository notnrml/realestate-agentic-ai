  # Detects emerging rental shifts
  
import pandas as pd

def analyze_trends(csv_path: str):
    df = pd.read_csv(csv_path)

    # Example logic: find top zip codes by rent increase
    df['rent_growth'] = df['current_rent'] - df['previous_rent']
    trend_data = df.groupby('zip')['rent_growth'].mean().sort_values(ascending=False).head(5)

    return {
        "rising_zips": trend_data.index.tolist(),
        "growth": trend_data.to_dict()
    }
