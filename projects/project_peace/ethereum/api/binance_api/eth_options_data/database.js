const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

class OptionsDatabase {
    constructor(dbPath = 'database/ethereum.db') {
        this.dbPath = dbPath;
        this.initTables();
    }

    /**
     * Get database connection
     */
    getConnection() {
        return new sqlite3.Database(this.dbPath);
    }

    /**
     * Initialize tables from schema file
     */
    initTables() {
        const db = this.getConnection();
        
        // Try to load schema from file
        const schemaPath = path.join(__dirname, '../../database/schema/0013_options.sql');
        let schemaSQL;
        
        try {
            if (fs.existsSync(schemaPath)) {
                schemaSQL = fs.readFileSync(schemaPath, 'utf8');
            } else {
                console.warn(`Schema file not found at ${schemaPath}, using inline schema`);
                schemaSQL = this.getInlineSchema();
            }
        } catch (error) {
            console.warn('Error reading schema file, using inline schema:', error.message);
            schemaSQL = this.getInlineSchema();
        }

        db.exec(schemaSQL, (err) => {
            if (err) {
                console.error('Error initializing database tables:', err);
            } else {
                console.log('Options tables initialized successfully');
            }
            db.close();
        });
    }

    /**
     * Inline schema definition (fallback)
     */
    getInlineSchema() {
        return `
            CREATE TABLE IF NOT EXISTS option_instruments (
                symbol TEXT PRIMARY KEY,
                underlying TEXT NOT NULL,
                strike_price DECIMAL(20,8) NOT NULL,
                expiry_date INTEGER NOT NULL,
                option_type TEXT NOT NULL,
                contract_multiplier DECIMAL(10,2),
                min_qty DECIMAL(20,8),
                max_qty DECIMAL(20,8),
                tick_size DECIMAL(20,8),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

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
                timestamp INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (symbol) REFERENCES option_instruments(symbol)
            );

            CREATE TABLE IF NOT EXISTS option_klines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                interval TEXT NOT NULL,
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

            CREATE TABLE IF NOT EXISTS option_open_interest (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                underlying TEXT NOT NULL,
                expiry INTEGER NOT NULL,
                open_interest DECIMAL(20,8),
                timestamp INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(underlying, expiry, timestamp)
            );

            CREATE INDEX IF NOT EXISTS idx_market_symbol ON option_market_data(symbol);
            CREATE INDEX IF NOT EXISTS idx_market_timestamp ON option_market_data(timestamp);
            CREATE INDEX IF NOT EXISTS idx_klines_symbol ON option_klines(symbol);
            CREATE INDEX IF NOT EXISTS idx_klines_time ON option_klines(open_time);
            CREATE INDEX IF NOT EXISTS idx_oi_expiry ON option_open_interest(expiry);
        `;
    }

    /**
     * Execute a query with parameters
     */
    async executeQuery(sql, params = []) {
        const db = this.getConnection();
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                db.close();
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    /**
     * Execute a query and return all rows
     */
    async queryAll(sql, params = []) {
        const db = this.getConnection();
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                db.close();
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    /**
     * Insert or update option instruments
     */
    async insertInstruments(instruments) {
        const sql = `
            INSERT OR REPLACE INTO option_instruments 
            (symbol, underlying, strike_price, expiry_date, option_type,
             contract_multiplier, min_qty, max_qty, tick_size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const db = this.getConnection();
        const stmt = db.prepare(sql);
        
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                for (const instrument of instruments) {
                    stmt.run([
                        instrument.symbol,
                        instrument.underlying,
                        instrument.strikePrice,
                        instrument.expiryDate,
                        instrument.optionType,
                        instrument.contractMultiplier,
                        instrument.minQty,
                        instrument.maxQty,
                        instrument.tickSize
                    ]);
                }
                stmt.finalize((err) => {
                    db.close();
                    if (err) reject(err);
                    else resolve({ count: instruments.length });
                });
            });
        });
    }

    /**
     * Insert market data for an option
     */
    async insertMarketData(symbol, marketData) {
        const sql = `
            INSERT INTO option_market_data 
            (symbol, mark_price, bid_price, ask_price, delta, gamma, theta, vega,
             implied_volatility, open_interest, volume_24h, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const timestamp = marketData.timestamp || Math.floor(Date.now() / 1000);
        
        return this.executeQuery(sql, [
            symbol,
            marketData.markPrice || marketData.markPrice,
            marketData.bidPrice || marketData.bidPrice,
            marketData.askPrice || marketData.askPrice,
            marketData.delta,
            marketData.gamma,
            marketData.theta,
            marketData.vega,
            marketData.impliedVolatility,
            marketData.openInterest,
            marketData.volume24h,
            timestamp
        ]);
    }

    /**
     * Insert K-line data
     */
    async insertKlines(symbol, interval, klines) {
        const sql = `
            INSERT OR REPLACE INTO option_klines 
            (symbol, interval, open_time, open, high, low, close, volume,
             close_time, quote_volume, trades, taker_buy_volume, taker_buy_quote_volume)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const db = this.getConnection();
        const stmt = db.prepare(sql);
        
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                for (const kline of klines) {
                    stmt.run([
                        symbol,
                        interval,
                        kline[0],  // open_time
                        kline[1],  // open
                        kline[2],  // high
                        kline[3],  // low
                        kline[4],  // close
                        kline[5],  // volume
                        kline[6],  // close_time
                        kline[7],  // quote_volume
                        kline[8],  // trades
                        kline[9],  // taker_buy_volume
                        kline[10]  // taker_buy_quote_volume
                    ]);
                }
                stmt.finalize((err) => {
                    db.close();
                    if (err) reject(err);
                    else resolve({ count: klines.length });
                });
            });
        });
    }

    /**
     * Insert open interest data
     */
    async insertOpenInterest(underlying, expiry, openInterest, timestamp = null) {
        if (!timestamp) {
            timestamp = Math.floor(Date.now() / 1000);
        }
        
        const sql = `
            INSERT OR REPLACE INTO option_open_interest 
            (underlying, expiry, open_interest, timestamp)
            VALUES (?, ?, ?, ?)
        `;
        
        return this.executeQuery(sql, [underlying, expiry, openInterest, timestamp]);
    }

    /**
     * Get all instruments for an underlying asset
     */
    async getInstruments(underlying = 'ETH') {
        const sql = `
            SELECT * FROM option_instruments 
            WHERE underlying = ?
            ORDER BY expiry_date, strike_price
        `;
        return this.queryAll(sql, [underlying]);
    }

    /**
     * Get latest market data for a symbol
     */
    async getLatestMarketData(symbol) {
        const sql = `
            SELECT * FROM option_market_data 
            WHERE symbol = ?
            ORDER BY timestamp DESC 
            LIMIT 1
        `;
        const rows = await this.queryAll(sql, [symbol]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Get latest open interest grouped by expiry
     */
    async getOpenInterestByExpiry(underlying = 'ETH') {
        const sql = `
            SELECT expiry, underlying, open_interest, timestamp
            FROM option_open_interest oi1
            WHERE underlying = ?
            AND timestamp = (
                SELECT MAX(timestamp) 
                FROM option_open_interest oi2
                WHERE oi2.underlying = oi1.underlying 
                AND oi2.expiry = oi1.expiry
            )
            ORDER BY expiry
        `;
        return this.queryAll(sql, [underlying]);
    }

    /**
     * Get market data for all options by expiry
     */
    async getOptionsChain(underlying = 'ETH', expiry = null) {
        let sql = `
            SELECT 
                i.symbol,
                i.strike_price,
                i.option_type,
                i.expiry_date,
                m.mark_price,
                m.bid_price,
                m.ask_price,
                m.delta,
                m.gamma,
                m.theta,
                m.vega,
                m.implied_volatility,
                m.open_interest,
                m.volume_24h,
                m.timestamp
            FROM option_instruments i
            LEFT JOIN option_market_data m ON i.symbol = m.symbol
            WHERE i.underlying = ?
        `;
        const params = [underlying];
        
        if (expiry) {
            sql += ` AND i.expiry_date = ?`;
            params.push(expiry);
        }
        
        sql += ` ORDER BY i.expiry_date, i.strike_price, i.option_type`;
        
        return this.queryAll(sql, params);
    }
}

module.exports = OptionsDatabase;