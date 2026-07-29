const BinanceOptionsClient = require('./client');
const OptionsDatabase = require('./database');

class OptionsCollector {
    constructor(config = {}) {
        this.client = new BinanceOptionsClient(config);
        this.db = new OptionsDatabase(config.dbPath);
        this.underlying = config.underlying || 'ETH';
        this.batchSize = config.batchSize || 50;
        this.concurrency = config.concurrency || 5;
    }

    /**
     * Sleep function for rate limiting
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Process items in batches with concurrency control
     */
    async processBatch(items, processor, batchSize = null, concurrency = null) {
        const bSize = batchSize || this.batchSize;
        const cConcurrency = concurrency || this.concurrency;
        
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 0; i < items.length; i += bSize) {
            const batch = items.slice(i, i + bSize);
            
            // Process batch with concurrency
            const promises = batch.map(item => 
                processor(item).catch(error => ({
                    error: true,
                    item,
                    message: error.message
                }))
            );
            
            const batchResults = await Promise.all(promises);
            
            for (const result of batchResults) {
                if (result && result.error) {
                    results.failed++;
                    results.errors.push(result);
                } else {
                    results.success++;
                }
            }
            
            // Rate limiting between batches
            if (i + bSize < items.length) {
                await this.sleep(1000);
            }
        }
        
        return results;
    }

    /**
     * Collect all option instruments
     */
    async collectInstruments() {
        console.log(`Collecting ${this.underlying} option instruments...`);
        
        const instruments = await this.client.getInstruments(this.underlying);
        await this.db.insertInstruments(instruments);
        
        console.log(`Collected ${instruments.length} instruments`);
        return instruments;
    }

    /**
     * Collect market data for multiple symbols
     */
    async collectMarketData(symbols) {
        console.log(`Collecting market data for ${symbols.length} symbols...`);
        
        const results = await this.processBatch(
            symbols,
            async (symbol) => {
                const data = await this.client.getMarkPrice(symbol);
                await this.db.insertMarketData(symbol, data);
                return { symbol, data };
            }
        );
        
        console.log(`Market data: ${results.success} success, ${results.failed} failed`);
        return results;
    }

    /**
     * Collect K-line data for multiple symbols
     */
    async collectKlines(symbols, interval = '1h', limit = 100) {
        console.log(`Collecting K-lines for ${symbols.length} symbols...`);
        
        const results = await this.processBatch(
            symbols,
            async (symbol) => {
                const klines = await this.client.getKlines(symbol, interval, limit);
                await this.db.insertKlines(symbol, interval, klines);
                return { symbol, count: klines.length };
            },
            10, // smaller batch for K-lines
            3   // lower concurrency
        );
        
        console.log(`K-lines: ${results.success} success, ${results.failed} failed`);
        return results;
    }

    /**
     * Collect open interest for all expiries
     */
    async collectOpenInterest(expiries) {
        console.log(`Collecting open interest for ${expiries.length} expiries...`);
        
        const results = await this.processBatch(
            expiries,
            async (expiry) => {
                const data = await this.client.getOpenInterest(
                    this.underlying,
                    expiry
                );
                const openInterest = data.openInterest || 0;
                await this.db.insertOpenInterest(
                    this.underlying,
                    expiry,
                    openInterest
                );
                return { expiry, openInterest };
            },
            20,
            5
        );
        
        console.log(`Open interest: ${results.success} success, ${results.failed} failed`);
        return results;
    }

    /**
     * Collect complete options chain
     */
    async collectFullChain() {
        const startTime = Date.now();
        console.log(`Starting full options chain collection at ${new Date().toISOString()}`);
        
        try {
            // Step 1: Collect instruments
            const instruments = await this.collectInstruments();
            const symbols = instruments.map(i => i.symbol);
            
            // Step 2: Collect market data
            const marketResults = await this.collectMarketData(symbols);
            
            // Step 3: Get unique expiries
            const expiries = [...new Set(instruments.map(i => i.expiryDate))].sort();
            
            // Step 4: Collect open interest
            const oiResults = await this.collectOpenInterest(expiries);
            
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            
            console.log(`Full options chain collection completed in ${duration}s`);
            
            return {
                timestamp: Math.floor(startTime / 1000),
                duration,
                instruments_count: instruments.length,
                symbols_count: symbols.length,
                expiries_count: expiries.length,
                market_data: marketResults,
                open_interest: oiResults
            };
        } catch (error) {
            console.error('Full chain collection failed:', error);
            throw error;
        }
    }

    /**
     * Collect specific option chain for analysis
     */
    async collectOptionsChain(expiry = null) {
        const instruments = await this.db.getInstruments(this.underlying);
        
        let filteredInstruments = instruments;
        if (expiry) {
            filteredInstruments = instruments.filter(i => i.expiry_date === expiry);
        }
        
        const symbols = filteredInstruments.map(i => i.symbol);
        
        if (symbols.length === 0) {
            console.log('No instruments found for the specified criteria');
            return { instruments: [], marketData: [] };
        }
        
        // Collect market data for filtered instruments
        const marketData = [];
        for (const symbol of symbols) {
            try {
                const data = await this.client.getMarkPrice(symbol);
                marketData.push({ symbol, ...data });
                await this.db.insertMarketData(symbol, data);
                await this.sleep(100); // Rate limiting
            } catch (error) {
                console.error(`Failed to collect ${symbol}:`, error.message);
            }
        }
        
        return {
            instruments: filteredInstruments,
            marketData
        };
    }

    /**
     * Collect historical K-lines for a specific option
     */
    async collectHistoricalKlines(symbol, interval = '1h', daysBack = 30) {
        const endTime = Date.now();
        const startTime = endTime - (daysBack * 24 * 60 * 60 * 1000);
        
        console.log(`Collecting historical K-lines for ${symbol} from ${new Date(startTime).toISOString()}`);
        
        const chunkLimit = 1000;
        let allKlines = [];
        let currentStart = startTime;
        
        while (currentStart < endTime) {
            const klines = await this.client.getKlines(
                symbol,
                interval,
                chunkLimit,
                currentStart,
                endTime
            );
            
            if (!klines || klines.length === 0) break;
            
            allKlines = allKlines.concat(klines);
            currentStart = klines[klines.length - 1][0] + 1;
            
            // Rate limiting
            await this.sleep(500);
        }
        
        await this.db.insertKlines(symbol, interval, allKlines);
        console.log(`Collected ${allKlines.length} K-lines for ${symbol}`);
        
        return allKlines;
    }
}

module.exports = OptionsCollector;