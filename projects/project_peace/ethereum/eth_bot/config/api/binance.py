# ============================================================
# Binance API Configuration
# ============================================================

BASE_URL = "https://api.binance.com"

KLINES_ENDPOINT = "/api/v3/klines"

DEFAULT_SYMBOL = "ETHUSDT"
DEFAULT_INTERVAL = "1d"
DEFAULT_LIMIT = 1000

ORDERBOOK_ENDPOINT = "/api/v3/depth"

DEFAULT_ORDERBOOK_LIMIT = 100


def get_klines_url():
    return BASE_URL + KLINES_ENDPOINT