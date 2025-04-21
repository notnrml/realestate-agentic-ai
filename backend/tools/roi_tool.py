 # Forecasts ROI based on historical/current rents
 
import pandas as pd

def forecast_roi(csv_path: str):
    df = pd.read_csv(csv_path)
    df['roi'] = ((df['annual_rent'] - df['expenses']) / df['purchase_price'])

    best = df.sort_values(by='roi', ascending=False).head(5)
    return {
        "top_properties": best.to_dict(orient='records'),
        "avg_roi": df['roi'].mean()
    }
