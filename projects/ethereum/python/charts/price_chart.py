import sys
import os


# =====================================
# Python folder path
# =====================================

PYTHON_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.append(PYTHON_DIR)



import matplotlib.pyplot as plt

from analysis.load_data import load_ohlcv



# =====================================
# Load Data
# =====================================

df = load_ohlcv()



# =====================================
# Create Chart
# =====================================

plt.figure(figsize=(14, 6))


plt.plot(
    df.index,
    df["close"]
)


plt.title(
    "Ethereum ETHUSDT Historical Price"
)


plt.xlabel(
    "Date"
)


plt.ylabel(
    "Price USDT"
)


plt.grid(True)


plt.tight_layout()



# =====================================
# Save inside ethereum/charts/daily
# =====================================

# python/charts/price_chart.py
#          |
#          ../../charts/daily

PROJECT_DIR = os.path.dirname(
    PYTHON_DIR
)


OUTPUT_DIR = os.path.join(
    PROJECT_DIR,
    "charts",
    "daily"
)


os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


OUTPUT_FILE = os.path.join(
    OUTPUT_DIR,
    "eth_price_history.png"
)



plt.savefig(
    OUTPUT_FILE,
    dpi=300,
    bbox_inches="tight"
)


plt.close()



print("==============================")
print(" ETH PRICE CHART GENERATED")
print("==============================")
print("Saved:")
print(OUTPUT_FILE)