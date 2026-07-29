CREATE TABLE IF NOT EXISTS market_ohlcv (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    symbol TEXT DEFAULT 'ETHUSDT',

    interval TEXT DEFAULT '1d',

    open_time INTEGER UNIQUE,

    open REAL,

    high REAL,

    low REAL,

    close REAL,

    volume REAL,

    close_time INTEGER,

    quote_asset_volume REAL,

    trades INTEGER,

    taker_buy_base_volume REAL,

    taker_buy_quote_volume REAL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);