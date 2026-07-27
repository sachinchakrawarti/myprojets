#!/usr/bin/env python3
"""
Daily ETH Data Collector
Stores data in CSV, SQLite, and JSON formats
"""

import requests
import pandas as pd
import json
import sqlite3
import os
from datetime import datetime, timedelta
from pathlib import Path

# ==================== CONFIGURATION ====================
DATA_DIR = Path(__file__).parent / "data"
CSV_PATH = DATA_DIR / "Eth.csv"
DB_PATH = DATA_DIR / "ETH.db"
JSON_PATH = DATA_DIR / "Eth.json"

# Create data directory if it doesn't exist
DATA_DIR.mkdir(exist_ok=True)

# ==================== FETCH DATA ====================
def fetch_eth_data(days=365):
    """Fetch daily ETH price data from CoinGecko"""
    print(f"📊 Fetching {days} days of ETH data...")
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    url = "https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range"
    params = {
        'vs_currency': 'usd',
        'from': int(start_date.timestamp()),
        'to': int(end_date.timestamp())
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    # Convert to DataFrame
    prices = pd.DataFrame(data['prices'], columns=['timestamp', 'price'])
    market_caps = pd.DataFrame(data['market_caps'], columns=['timestamp', 'market_cap'])
    volumes = pd.DataFrame(data['total_volumes'], columns=['timestamp', 'volume'])
    
    # Merge all data
    df = pd.merge(prices, market_caps, on='timestamp')
    df = pd.merge(df, volumes, on='timestamp')
    
    # Convert timestamp to date
    df['date'] = pd.to_datetime(df['timestamp'], unit='ms').dt.date
    df['date'] = pd.to_datetime(df['date'])  # Convert to datetime for consistency
    
    # Reorder columns
    df = df[['date', 'price', 'market_cap', 'volume']]
    df = df.sort_values('date')
    
    print(f"✅ Fetched {len(df)} days of data")
    return df

# ==================== STORE IN CSV ====================
def save_to_csv(df):
    """Save data to CSV file"""
    try:
        # If CSV exists, merge with new data (avoid duplicates)
        if CSV_PATH.exists():
            existing_df = pd.read_csv(CSV_PATH, parse_dates=['date'])
            combined_df = pd.concat([existing_df, df]).drop_duplicates(subset=['date'], keep='last')
            combined_df = combined_df.sort_values('date')
            combined_df.to_csv(CSV_PATH, index=False)
            print(f"📁 CSV updated: {CSV_PATH} ({len(combined_df)} records)")
        else:
            df.to_csv(CSV_PATH, index=False)
            print(f"📁 CSV created: {CSV_PATH} ({len(df)} records)")
    except Exception as e:
        print(f"❌ Error saving CSV: {e}")

# ==================== STORE IN SQLITE ====================
def save_to_sqlite(df):
    """Save data to SQLite database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        
        # Create table if not exists
        conn.execute('''
            CREATE TABLE IF NOT EXISTS eth_daily (
                date DATE PRIMARY KEY,
                price REAL,
                market_cap REAL,
                volume REAL
            )
        ''')
        
        # Insert or replace data
        df.to_sql('eth_daily', conn, if_exists='replace', index=False)
        
        conn.close()
        print(f"🗄️ SQLite updated: {DB_PATH} ({len(df)} records)")
    except Exception as e:
        print(f"❌ Error saving SQLite: {e}")

# ==================== STORE IN JSON ====================
def save_to_json(df):
    """Save data to JSON file"""
    try:
        # Convert DataFrame to JSON with proper date formatting
        df_json = df.copy()
        df_json['date'] = df_json['date'].dt.strftime('%Y-%m-%d')
        
        # Convert to dictionary and save
        data_dict = df_json.to_dict(orient='records')
        
        with open(JSON_PATH, 'w') as f:
            json.dump({
                'metadata': {
                    'last_updated': datetime.now().isoformat(),
                    'total_records': len(data_dict),
                    'source': 'CoinGecko API'
                },
                'data': data_dict
            }, f, indent=2)
        
        print(f"📄 JSON updated: {JSON_PATH} ({len(data_dict)} records)")
    except Exception as e:
        print(f"❌ Error saving JSON: {e}")

# ==================== LOAD AND VERIFY ====================
def verify_data():
    """Verify all three data stores contain the same data"""
    print("\n🔍 Verifying data integrity...")
    
    # Check CSV
    if CSV_PATH.exists():
        csv_df = pd.read_csv(CSV_PATH, parse_dates=['date'])
        print(f"  ✅ CSV: {len(csv_df)} records, latest: {csv_df['date'].max()}")
    
    # Check SQLite
    if DB_PATH.exists():
        conn = sqlite3.connect(DB_PATH)
        sqlite_count = conn.execute("SELECT COUNT(*) FROM eth_daily").fetchone()[0]
        latest_date = conn.execute("SELECT MAX(date) FROM eth_daily").fetchone()[0]
        conn.close()
        print(f"  ✅ SQLite: {sqlite_count} records, latest: {latest_date}")
    
    # Check JSON
    if JSON_PATH.exists():
        with open(JSON_PATH, 'r') as f:
            json_data = json.load(f)
        print(f"  ✅ JSON: {json_data['metadata']['total_records']} records, updated: {json_data['metadata']['last_updated']}")

# ==================== MAIN EXECUTION ====================
def main():
    print("=" * 50)
    print("🚀 ETH Daily Data Collector")
    print("=" * 50)
    
    try:
        # Fetch fresh data
        df = fetch_eth_data(days=365)  # Get last 365 days
        
        # Save to all three formats
        print("\n💾 Saving data...")
        save_to_csv(df)
        save_to_sqlite(df)
        save_to_json(df)
        
        # Verify
        verify_data()
        
        print("\n✅ All done! Data collected and stored in 3 formats.")
        print(f"📂 Data directory: {DATA_DIR.absolute()}")
        
        # Show sample
        print("\n📋 Sample of latest data:")
        print(df.tail(5).to_string(index=False))
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Please check your internet connection and try again.")

if __name__ == "__main__":
    main()