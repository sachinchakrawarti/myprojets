/**
 * CoinGecko API Configuration
 * -----------------------------------
 * Centralized configuration for CoinGecko API.
 */

const config = {
    baseURL: "https://api.coingecko.com/api/v3",

    endpoints: {
        market: "/coins/ethereum"
    },

    timeout: 10000,

    vsCurrency: "usd"
};

export default config;