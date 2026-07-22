from load_data import load_ohlcv
from indicator_pipeline import apply_indicators

import os


# Load database data
df = load_ohlcv()


# Apply indicators
df = apply_indicators(df)


# Show result
print(df.tail())


# Project root
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)


# Dataset path
DATASET_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "ethereum_indicators.csv"
)


# Create folder if missing
os.makedirs(
    os.path.dirname(DATASET_PATH),
    exist_ok=True
)


# Save CSV
df.to_csv(
    DATASET_PATH
)


print()
print("Indicators completed")
print("Saved:")
print(DATASET_PATH)