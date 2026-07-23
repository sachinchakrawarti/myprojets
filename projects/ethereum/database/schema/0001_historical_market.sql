/*
=========================================================
Migration : 0001_historical_market.sql
Database  : ethereum.db
Table     : historical_market
Description:
    Stores normalized daily historical market data
    merged from Binance + CoinGecko.

Author : Sachin Chakrawarti
=========================================================
*/

CREATE TABLE IF NOT EXISTS historical_market (

    -----------------------------------------------------
    -- Primary Key
    -----------------------------------------------------

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -----------------------------------------------------
    -- Market Information
    -----------------------------------------------------

    date TEXT NOT NULL,

    symbol TEXT NOT NULL,

    -----------------------------------------------------
    -- OHLC
    -----------------------------------------------------

    open REAL NOT NULL,

    high REAL NOT NULL,

    low REAL NOT NULL,

    close REAL NOT NULL,

    -----------------------------------------------------
    -- Trading Volume
    -----------------------------------------------------

    volume_eth REAL,

    volume_usdt REAL,

    number_of_trades INTEGER,

    taker_buy_volume_eth REAL,

    taker_buy_volume_usdt REAL,

    -----------------------------------------------------
    -- Market Cap
    -----------------------------------------------------

    market_cap_usd REAL,

    total_volume_usd REAL,

    circulating_supply REAL,

    total_supply REAL,

    max_supply REAL,

    market_cap_rank INTEGER,

    -----------------------------------------------------
    -- Metadata
    -----------------------------------------------------

    created_at DATETIME
        DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME
        DEFAULT CURRENT_TIMESTAMP,

    -----------------------------------------------------
    -- Constraints
    -----------------------------------------------------

    UNIQUE (

        date,

        symbol

    )

);

---------------------------------------------------------
-- Indexes
---------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_historical_market_date

ON historical_market(date);

CREATE INDEX IF NOT EXISTS idx_historical_market_symbol

ON historical_market(symbol);

CREATE INDEX IF NOT EXISTS idx_historical_market_date_symbol

ON historical_market(

    date,

    symbol

);

CREATE INDEX IF NOT EXISTS idx_historical_market_rank

ON historical_market(

    market_cap_rank

);