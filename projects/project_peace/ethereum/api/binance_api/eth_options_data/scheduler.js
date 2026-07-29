const OptionsCollector = require('./collector');
const cron = require('node-cron');

class OptionsScheduler {
    constructor(config = {}) {
        this.collector = new OptionsCollector(config);
        this.isRunning = false;
        
        // Schedule configuration
        this.schedules = {
            // Full chain collection every hour
            fullChain: config.fullChainSchedule || '0 * * * *',
            // Market data every 5 minutes
            marketData: config.marketDataSchedule || '*/5 * * * *',
            // K-lines every hour for selected symbols
            klines: config.klinesSchedule || '0 * * * *',
            // Open interest every 15 minutes
            openInterest: config.openInterestSchedule || '*/15 * * * *'
        };
    }

    /**
     * Start the scheduler
     */
    start() {
        if (this.isRunning) {
            console.log('Scheduler is already running');
            return;
        }

        console.log('Starting options data scheduler...');
        this.isRunning = true;

        // Schedule full chain collection
        cron.schedule(this.schedules.fullChain, async () => {
            console.log(`[${new Date().toISOString()}] Running full chain collection`);
            try {
                await this.collector.collectFullChain();
            } catch (error) {
                console.error('Full chain collection failed:', error);
            }
        });

        // Schedule market data collection
        cron.schedule(this.schedules.marketData, async () => {
            console.log(`[${new Date().toISOString()}] Running market data collection`);
            try {
                const instruments = await this.collector.db.getInstruments('ETH');
                const symbols = instruments.map(i => i.symbol);
                await this.collector.collectMarketData(symbols);
            } catch (error) {
                console.error('Market data collection failed:', error);
            }
        });

        // Schedule K-lines collection for top 10 active options
        cron.schedule(this.schedules.klines, async () => {
            console.log(`[${new Date().toISOString()}] Running K-lines collection`);
            try {
                const instruments = await this.collector.db.getInstruments('ETH');
                // Get top 10 by volume (you might want to track this)
                const topSymbols = instruments.slice(0, 10).map(i => i.symbol);
                await this.collector.collectKlines(topSymbols);
            } catch (error) {
                console.error('K-lines collection failed:', error);
            }
        });

        // Schedule open interest collection
        cron.schedule(this.schedules.openInterest, async () => {
            console.log(`[${new Date().toISOString()}] Running open interest collection`);
            try {
                const instruments = await this.collector.db.getInstruments('ETH');
                const expiries = [...new Set(instruments.map(i => i.expiryDate))];
                await this.collector.collectOpenInterest(expiries);
            } catch (error) {
                console.error('Open interest collection failed:', error);
            }
        });

        console.log('Scheduler started successfully');
    }

    /**
     * Stop the scheduler
     */
    stop() {
        console.log('Stopping scheduler...');
        this.isRunning = false;
        // Cron jobs will continue until process exits
        // For graceful shutdown, you'd need to store cron task references
    }

    /**
     * Run one-time full collection
     */
    async runOnce() {
        console.log(`[${new Date().toISOString()}] Running one-time collection`);
        return this.collector.collectFullChain();
    }
}

module.exports = OptionsScheduler;