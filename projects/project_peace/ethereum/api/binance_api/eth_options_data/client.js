const axios = require('axios');
const crypto = require('crypto');

class BinanceOptionsClient {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.BINANCE_API_KEY;
        this.apiSecret = config.apiSecret || process.env.BINANCE_API_SECRET;
        this.baseURL = config.testnet ? 
            'https://testnet.binanceops.com' : 
            'https://eapi.binance.com';
        this.timeout = config.timeout || 10000;
    }

    /**
     * Sign request with HMAC SHA256
     */
    signRequest(params) {
        if (!this.apiKey || !this.apiSecret) return params;

        const timestamp = Date.now();
        params.timestamp = timestamp;
        params.recvWindow = 5000;

        const queryString = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        const signature = crypto
            .createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');

        params.signature = signature;
        return params;
    }

    /**
     * Make API request with retry logic
     */
    async makeRequest(endpoint, params = {}, method = 'GET') {
        const url = `${this.baseURL}${endpoint}`;
        
        // Sign request if it's a private endpoint
        const isPrivate = endpoint.includes('/eapi/v1/') && 
                         !['/eapi/v1/exchangeInfo', '/eapi/v1/mark', 
                           '/eapi/v1/depth', '/eapi/v1/klines', 
                           '/eapi/v1/openInterest', '/eapi/v1/volume'].includes(endpoint);
        
        const headers = {};
        if (this.apiKey && (isPrivate || params.apiKey)) {
            headers['X-MBX-APIKEY'] = this.apiKey;
        }

        const signedParams = this.signRequest({...params});
        
        try {
            const response = await axios({
                method,
                url,
                params: signedParams,
                headers,
                timeout: this.timeout
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error(`API Error ${error.response.status}:`, 
                            error.response.data);
                throw new Error(`Binance API Error: ${error.response.data.msg || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get exchange info and all option symbols
     */
    async getExchangeInfo() {
        return this.makeRequest('/eapi/v1/exchangeInfo');
    }

    /**
     * Get all option instruments for a given underlying
     */
    async getInstruments(underlying = 'ETH') {
        const exchangeInfo = await this.getExchangeInfo();
        const symbols = exchangeInfo.optionSymbols || [];
        
        // Filter by underlying asset
        return symbols.filter(s => s.underlying === underlying);
    }

    /**
     * Get mark price and Greeks for a specific option
     */
    async getMarkPrice(symbol) {
        return this.makeRequest('/eapi/v1/mark', { symbol });
    }

    /**
     * Get order book for a specific option
     */
    async getOrderBook(symbol, limit = 100) {
        return this.makeRequest('/eapi/v1/depth', { symbol, limit });
    }

    /**
     * Get K-line (candlestick) data
     */
    async getKlines(symbol, interval = '1h', limit = 100, startTime = null, endTime = null) {
        const params = { symbol, interval, limit };
        if (startTime) params.startTime = startTime;
        if (endTime) params.endTime = endTime;
        return this.makeRequest('/eapi/v1/klines', params);
    }

    /**
     * Get open interest for underlying asset
     */
    async getOpenInterest(underlying = 'ETH', expiry = null) {
        const params = { underlying };
        if (expiry) params.expiry = expiry;
        return this.makeRequest('/eapi/v1/openInterest', params);
    }

    /**
     * Get 24h volume for a specific option
     */
    async getVolume(symbol) {
        return this.makeRequest('/eapi/v1/volume', { symbol });
    }

    /**
     * Get exercise history for a specific option
     */
    async getExerciseHistory(symbol, startTime = null) {
        const params = { symbol };
        if (startTime) params.startTime = startTime;
        return this.makeRequest('/eapi/v1/exerciseHistory', params);
    }
}

module.exports = BinanceOptionsClient;