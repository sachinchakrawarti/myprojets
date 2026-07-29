#!/usr/bin/env node

const OptionsCollector = require('./collector');
const OptionsScheduler = require('./scheduler');
const OptionsDatabase = require('./database');
require('dotenv').config();

const main = async () => {
    const args = process.argv.slice(2);
    const command = args[0] || 'collect';
    
    const config = {
        apiKey: process.env.BINANCE_API_KEY,
        apiSecret: process.env.BINANCE_API_SECRET,
        testnet: process.env.USE_TESTNET === 'true',
        dbPath: process.env.DB_PATH || 'database/ethereum.db',
        underlying: 'ETH'
    };
    
    const collector = new OptionsCollector(config);
    const scheduler = new OptionsScheduler(config);
    const db = new OptionsDatabase(config.dbPath);
    
    switch (command) {
        case 'collect':
            console.log('Collecting options data...');
            await collector.collectFullChain();
            break;
            
        case 'schedule':
            console.log('Starting scheduler...');
            scheduler.start();
            break;
            
        case 'chain':
            const expiry = args[1] ? parseInt(args[1]) : null;
            const chain = await collector.collectOptionsChain(expiry);
            console.log(`Collected ${chain.marketData.length} options with market data`);
            break;
            
        case 'history':
            const symbol = args[1];
            const interval = args[2] || '1h';
            const days = parseInt(args[3]) || 30;
            if (!symbol) {
                console.error('Please provide a symbol');
                console.log('Usage: node index.js history ETH-30JUN24-3000-C 1h 30');
                process.exit(1);
            }
            await collector.collectHistoricalKlines(symbol, interval, days);
            break;
            
        case 'query':
            const queryType = args[1] || 'chain';
            if (queryType === 'chain') {
                const chainData = await db.getOptionsChain('ETH');
                console.log(`Options Chain: ${chainData.length} options`);
                console.log(JSON.stringify(chainData.slice(0, 5), null, 2));
            } else if (queryType === 'oi') {
                const oiData = await db.getOpenInterestByExpiry('ETH');
                console.log('Open Interest by Expiry:');
                console.table(oiData);
            }
            break;
            
        default:
            console.log(`
Usage:
  node index.js collect                - Collect full options chain data
  node index.js schedule               - Start automated data collection
  node index.js chain [expiry]         - Collect options chain for specific expiry
  node index.js history <symbol> [interval] [days] - Collect historical K-lines
  node index.js query [chain|oi]      - Query stored data
  
Examples:
  node index.js collect
  node index.js chain 1719657600
  node index.js history ETH-30JUN24-3000-C 1h 30
  node index.js query chain
            `);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    process.exit(0);
});

// Run the main function
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

module.exports = {
    OptionsCollector,
    OptionsScheduler,
    OptionsDatabase,
    BinanceOptionsClient: require('./client')
};