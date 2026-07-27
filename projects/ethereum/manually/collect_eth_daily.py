from pycoingecko import CoinGeckoAPI
import pandas as pd
from datetime import datetime, timedelta

cg = CoinGeckoAPI()

# Get daily data for the last 365 days
eth_data = cg.get_coin_market_chart_range(
    id='ethereum',
    vs_currency='usd',
    from_timestamp=int((datetime.now() - timedelta(days=365)).timestamp()),
    to_timestamp=int(datetime.now().timestamp())
)

# Convert to DataFrame and clean
prices = pd.DataFrame(eth_data['prices'], columns=['timestamp', 'price'])
volumes = pd.DataFrame(eth_data['total_volumes'], columns=['timestamp', 'volume'])

df = pd.merge(prices, volumes, on='timestamp')
df['date'] = pd.to_datetime(df['timestamp'], unit='ms').dt.date
df = df[['date', 'price', 'volume']]

# Save to CSV
df.to_csv('eth_daily_data.csv', index=False)
print(f"Saved {len(df)} days of data to eth_daily_data.csv")