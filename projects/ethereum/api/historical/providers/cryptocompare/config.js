/**
 * CryptoCompare API Configuration
 * -----------------------------------
 * Centralized configuration for CryptoCompare API.
 */

const config = {
    baseURL: "https://min-api.cryptocompare.com",

    endpoints: {
        histoday: "/data/v2/histoday"
    },

    defaultFromSymbol: "ETH",

    defaultToSymbol: "USD",

    defaultLimit: 2000,

    timeout: 10000
};

export default config;