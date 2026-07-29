-- Table for option instruments
CREATE TABLE IF NOT EXISTS option_instruments (
    symbol TEXT PRIMARY KEY,
    underlying TEXT NOT NULL,
    strike_price DECIMAL(20,8) NOT NULL,
    expiry_date INTEGER NOT NULL,  -- Unix timestamp
    option_type TEXT NOT NULL,      -- 'CALL' or 'PUT'
    contract_multiplier DECIMAL(10,2),
    min_qty DECIMAL(20,8),
    max_qty DECIMAL(20,8),
    tick_size DECIMAL(20,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for market data (mark prices, Greeks)
CREATE TABLE IF NOT EXISTS option_market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    mark_price DECIMAL(20,8),
    bid_price DECIMAL(20,8),
    ask_price DECIMAL(20,8),
    delta DECIMAL(10,8),
    gamma DECIMAL(10,8),
    theta DECIMAL(10,8),
    vega DECIMAL(10,8),
    implied_volatility DECIMAL(10,8),
    open_interest DECIMAL(20,8),
    volume_24h DECIMAL(20,8),
    timestamp INTEGER NOT NULL,  -- Unix timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (symbol) REFERENCES option_instruments(symbol)
);

-- Table for historical OHLCV data (K-lines)
CREATE TABLE IF NOT EXISTS option_klines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    interval TEXT NOT NULL,  -- '1m', '5m', '1h', etc.
    open_time INTEGER NOT NULL,
    open DECIMAL(20,8),
    high DECIMAL(20,8),
    low DECIMAL(20,8),
    close DECIMAL(20,8),
    volume DECIMAL(20,8),
    close_time INTEGER,
    quote_volume DECIMAL(20,8),
    trades INTEGER,
    taker_buy_volume DECIMAL(20,8),
    taker_buy_quote_volume DECIMAL(20,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, interval, open_time)
);

-- Table for open interest by expiry
CREATE TABLE IF NOT EXISTS option_open_interest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    underlying TEXT NOT NULL,
    expiry INTEGER NOT NULL,
    open_interest DECIMAL(20,8),
    timestamp INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(underlying, expiry, timestamp)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_symbol ON option_market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_timestamp ON option_market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_klines_symbol ON option_klines(symbol);
CREATE INDEX IF NOT EXISTS idx_klines_time ON option_klines(open_time);
CREATE INDEX IF NOT EXISTS idx_oi_expiry ON option_open_interest(expiry);