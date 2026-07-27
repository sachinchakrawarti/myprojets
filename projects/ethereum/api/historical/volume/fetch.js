/**
 * Volume Data Fetcher
 * Fetches volume data from multiple providers
 */

import axios from 'axios';
import config from '../database/config.js';
import logger from '../../binance_api/eth_price_n_ohlcv_data_api/utils/logger.js';

class VolumeFetcher {
    constructor() {
        this.providers = {
            binance: this.fetchBinanceVolume.bind(this),
            coingecko: this.fetchCoinGeckoVolume.bind(this),
            cryptocompare: this.fetchCryptoCompareVolume.bind(this)
        };
    }

    /**
     * Fetch volume data from all providers
     */
    async fetchAll(symbol = 'ETH', date = null) {
        const results = {};
        const errors = [];

        for (const [provider, fetchFn] of Object.entries(this.providers)) {
            try {
                logger.debug(`Fetching volume from ${provider}...`);
                const data = await fetchFn(symbol, date);
                results[provider] = data;
                logger.debug(`Successfully fetched volume from ${provider}`);
            } catch (error) {
                logger.error(`Failed to fetch volume from ${provider}:`, error.message);
                errors.push({ provider, error: error.message });
            }
        }

        return { results, errors };
    }

    /**
     * Fetch volume data from Binance
     */
    async fetchBinanceVolume(symbol = 'ETH', date = null) {
        try {
            const url = `${config.providers.binance.baseURL}/api/v3/ticker/24hr`;
            const params = {
                symbol: `${symbol}USDT`
            };

            const response = await axios.get(url, { 
                params,
                timeout: config.providers.binance.timeout 
            });

            return this.mapBinanceResponse(response.data, date);
        } catch (error) {
            logger.error('Binance volume fetch error:', error.message);
            throw error;
        }
    }

    /**
     * Fetch volume data from CoinGecko
     */
    async fetchCoinGeckoVolume(symbol = 'ETH', date = null) {
        try {
            const url = `${config.providers.coingecko.baseURL}/coins/${symbol.toLowerCase()}/market_chart`;
            const params = {
                vs_currency: 'usd',
                days: 'max',
                interval: 'daily'
            };

            const response = await axios.get(url, { 
                params,
                timeout: config.providers.coingecko.timeout 
            });

            return this.mapCoinGeckoResponse(response.data, date);
        } catch (error) {
            logger.error('CoinGecko volume fetch error:', error.message);
            throw error;
        }
    }

    /**
     * Fetch volume data from CryptoCompare
     */
    async fetchCryptoCompareVolume(symbol = 'ETH', date = null) {
        try {
            const url = `${config.providers.cryptocompare.baseURL}/data/v2/histoday`;
            const params = {
                fsym: symbol,
                tsym: 'USD',
                limit: 1,
                toTs: date ? new Date(date).getTime() / 1000 : undefined
            };

            const response = await axios.get(url, { 
                params,
                timeout: config.providers.cryptocompare.timeout 
            });

            return this.mapCryptoCompareResponse(response.data, date);
        } catch (error) {
            logger.error('CryptoCompare volume fetch error:', error.message);
            throw error;
        }
    }

    /**
     * Fetch 24h volume for multiple symbols
     */
    async fetchMultipleVolumes(symbols = ['ETH', 'BTC']) {
        const results = {};
        const errors = [];

        for (const symbol of symbols) {
            try {
                const data = await this.fetchAll(symbol);
                results[symbol] = data;
            } catch (error) {
                errors.push({ symbol, error: error.message });
            }
        }

        return { results, errors };
    }

    /**
     * Map Binance response
     */
    mapBinanceResponse(data, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        return {
            date: targetDate,
            symbol: data.symbol.replace('USDT', ''),
            volume_24h: parseFloat(data.volume),
            volume_change_24h: parseFloat(data.quoteVolume) || 0,
            avg_volume_7d: parseFloat(data.volume) * 7,
            avg_volume_30d: parseFloat(data.volume) * 30,
            source: 'binance',
            raw: data
        };
    }

    /**
     * Map CoinGecko response
     */
    mapCoinGeckoResponse(data, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        let volumeData = null;
        if (data.total_volumes) {
            const idx = data.total_volumes.findIndex(([timestamp]) => {
                const d = new Date(timestamp);
                return d.toISOString().split('T')[0] === targetDate;
            });
            
            if (idx !== -1) {
                volumeData = data.total_volumes[idx][1];
            } else if (data.total_volumes.length > 0) {
                volumeData = data.total_volumes[data.total_volumes.length - 1][1];
            }
        }

        return {
            date: targetDate,
            symbol: 'ETH',
            volume_24h: volumeData || 0,
            volume_change_24h: 0,
            avg_volume_7d: 0,
            avg_volume_30d: 0,
            source: 'coingecko',
            raw: data
        };
    }

    /**
     * Map CryptoCompare response
     */
    mapCryptoCompareResponse(data, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        let volumeData = null;
        if (data.Data && data.Data.Data && data.Data.Data.length > 0) {
            const item = data.Data.Data[0];
            volumeData = {
                volume_24h: item.volumeto || 0,
                volume_eth: item.volumefrom || 0
            };
        }

        return {
            date: targetDate,
            symbol: 'ETH',
            volume_24h: volumeData?.volume_24h || 0,
            volume_change_24h: 0,
            avg_volume_7d: 0,
            avg_volume_30d: 0,
            source: 'cryptocompare',
            raw: data
        };
    }
}

export default new VolumeFetcher();