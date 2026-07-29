/**
 * Binance API Configuration
 * -----------------------------------
 * Centralized configuration for all Binance API requests.
 */

const config = {
    baseURL: "https://api.binance.com/api/v3",

    endpoints: {
        klines: "/klines"
    },

    defaultSymbol: "ETHUSDT",

    defaultInterval: "1d",

    defaultLimit: 1000,

    timeout: 10000
};

export default config;