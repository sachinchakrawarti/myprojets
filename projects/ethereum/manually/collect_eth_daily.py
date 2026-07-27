#!/usr/bin/env python3
"""
Daily ETH Data Collector - Fixed Version
Stores data in CSV, SQLite, and JSON formats
"""

import requests
import pandas as pd
import json
import sqlite3
import os
from datetime import datetime, timedelta
from pathlib import Path
import traceback

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
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Check if data contains expected keys
        if 'prices' not in data or 'market_caps' not in data or 'total_volumes' not in data:
            raise ValueError("API response missing expected data fields")
        
        # Convert to DataFrame
        prices = pd.DataFrame(data['prices'], columns=['timestamp', 'price'])
        market_caps = pd.DataFrame(data['market_caps'], columns=['timestamp', 'market_cap'])
        volumes = pd.DataFrame(data['total_volumes'], columns=['timestamp', 'volume'])
        
        # Merge all data
        df = pd.merge(prices, market_caps, on='timestamp')
        df = pd.merge(df, volumes, on='timestamp')
        
        # Convert timestamp to date
        df['date'] = pd.to_datetime(df['timestamp'], unit='ms').dt.date
        df['date'] = pd.to_datetime(df['date'])
        
        # Reorder columns
        df = df[['date', 'price', 'market_cap', 'volume']]
        df = df.sort_values('date').reset_index(drop=True)
        
        print(f"✅ Fetched {len(df)} days of data")
        return df
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
        raise
    except Exception as e:
        print(f"❌ Error processing data: {e}")
        raise

# ==================== STORE IN CSV ====================
def save_to_csv(df):
    """Save data to CSV file with proper handling"""
    try:
        if df is None or len(df) == 0:
            print("⚠️ No data to save to CSV")
            return
            
        # Ensure CSV directory exists
        CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
        
        # If CSV exists, read and merge
        if CSV_PATH.exists() and CSV_PATH.stat().st_size > 0:
            try:
                existing_df = pd.read_csv(CSV_PATH, parse_dates=['date'])
                if not existing_df.empty:
                    combined_df = pd.concat([existing_df, df]).drop_duplicates(subset=['date'], keep='last')
                    combined_df = combined_df.sort_values('date').reset_index(drop=True)
                    combined_df.to_csv(CSV_PATH, index=False)
                    print(f"📁 CSV updated: {CSV_PATH} ({len(combined_df)} records)")
                    return
            except Exception as e:
                print(f"⚠️ Could not read existing CSV: {e}")
                # If can't read, overwrite with new data
                df.to_csv(CSV_PATH, index=False)
                print(f"📁 CSV overwritten: {CSV_PATH} ({len(df)} records)")
                return
        
        # If no existing CSV or it's empty, write new
        df.to_csv(CSV_PATH, index=False)
        print(f"📁 CSV created: {CSV_PATH} ({len(df)} records)")
        
    except Exception as e:
        print(f"❌ Error saving CSV: {e}")
        traceback.print_exc()

# ==================== STORE IN SQLITE ====================
def save_to_sqlite(df):
    """Save data to SQLite database"""
    try:
        if df is None or len(df) == 0:
            print("⚠️ No data to save to SQLite")
            return
            
        conn = sqlite3.connect(DB_PATH)
        
        # Create table if not exists
        conn.execute('''
            CREATE TABLE IF NOT EXISTS eth_daily (
                date TEXT PRIMARY KEY,
                price REAL,
                market_cap REAL,
                volume REAL
            )
        ''')
        
        # Convert date to string for SQLite
        df_sqlite = df.copy()
        df_sqlite['date'] = df_sqlite['date'].dt.strftime('%Y-%m-%d')
        
        # Insert or replace data
        df_sqlite.to_sql('eth_daily', conn, if_exists='replace', index=False)
        
        # Verify data was inserted
        count = conn.execute("SELECT COUNT(*) FROM eth_daily").fetchone()[0]
        conn.close()
        
        print(f"🗄️ SQLite updated: {DB_PATH} ({count} records)")
        
    except Exception as e:
        print(f"❌ Error saving SQLite: {e}")
        traceback.print_exc()

# ==================== STORE IN JSON ====================
def save_to_json(df):
    """Save data to JSON file"""
    try:
        if df is None or len(df) == 0:
            print("⚠️ No data to save to JSON")
            return
            
        # Convert DataFrame to JSON with proper date formatting
        df_json = df.copy()
        df_json['date'] = df_json['date'].dt.strftime('%Y-%m-%d')
        
        # Convert to dictionary and save
        data_dict = df_json.to_dict(orient='records')
        
        # Create JSON with metadata
        json_data = {
            'metadata': {
                'last_updated': datetime.now().isoformat(),
                'total_records': len(data_dict),
                'source': 'CoinGecko API',
                'currency': 'USD'
            },
            'data': data_dict
        }
        
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        print(f"📄 JSON updated: {JSON_PATH} ({len(data_dict)} records)")
        
    except Exception as e:
        print(f"❌ Error saving JSON: {e}")
        traceback.print_exc()

# ==================== LOAD AND VERIFY ====================
def verify_data():
    """Verify all three data stores contain the same data"""
    print("\n🔍 Verifying data integrity...")
    
    try:
        # Check CSV
        if CSV_PATH.exists() and CSV_PATH.stat().st_size > 0:
            csv_df = pd.read_csv(CSV_PATH, parse_dates=['date'])
            print(f"  ✅ CSV: {len(csv_df)} records, latest: {csv_df['date'].max()}")
        else:
            print("  ⚠️ CSV: File is empty or doesn't exist")
        
        # Check SQLite
        if DB_PATH.exists() and DB_PATH.stat().st_size > 0:
            conn = sqlite3.connect(DB_PATH)
            try:
                sqlite_count = conn.execute("SELECT COUNT(*) FROM eth_daily").fetchone()[0]
                latest_date = conn.execute("SELECT MAX(date) FROM eth_daily").fetchone()[0]
                print(f"  ✅ SQLite: {sqlite_count} records, latest: {latest_date}")
            except:
                print("  ⚠️ SQLite: Table exists but might be empty")
            finally:
                conn.close()
        else:
            print("  ⚠️ SQLite: Database file doesn't exist or is empty")
        
        # Check JSON
        if JSON_PATH.exists() and JSON_PATH.stat().st_size > 0:
            with open(JSON_PATH, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            print(f"  ✅ JSON: {json_data['metadata']['total_records']} records, updated: {json_data['metadata']['last_updated']}")
        else:
            print("  ⚠️ JSON: File is empty or doesn't exist")
            
    except Exception as e:
        print(f"  ❌ Verification error: {e}")

# ==================== MAIN EXECUTION ====================
def main():
    print("=" * 50)
    print("🚀 ETH Daily Data Collector")
    print("=" * 50)
    
    try:
        # Fetch fresh data
        df = fetch_eth_data(days=365)
        
        if df is None or len(df) == 0:
            print("❌ No data fetched. Please check your internet connection.")
            return
        
        # Show sample of fetched data
        print(f"\n📊 Data range: {df['date'].min()} to {df['date'].max()}")
        print(f"📊 Latest price: ${df['price'].iloc[-1]:.2f}")
        
        # Save to all three formats
        print("\n💾 Saving data...")
        save_to_csv(df)
        save_to_sqlite(df)
        save_to_json(df)
        
        # Verify
        verify_data()
        
        print("\n✅ All done! Data collected and stored in 3 formats.")
        print(f"📂 Data directory: {DATA_DIR.absolute()}")
        
        # Show sample of latest data
        print("\n📋 Last 5 days of data:")
        print(df.tail(5).to_string(index=False))
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        traceback.print_exc()
        print("\n💡 Troubleshooting tips:")
        print("  1. Check your internet connection")
        print("  2. Try running with: python collect_eth_daily.py")
        print("  3. Make sure data directory is writable")

if __name__ == "__main__":
    main()