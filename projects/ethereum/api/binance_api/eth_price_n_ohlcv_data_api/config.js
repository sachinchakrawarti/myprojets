/**
 * Binance Configuration
 */

const CONFIG = {
    BASE_URL: "https://api.binance.com",
    WS_URL: "wss://stream.binance.com:9443/ws",

    SYMBOL: "ETHUSDT",

    LIMIT: 1000,

    INTERVALS: {
        ONE_MINUTE: "1m",
        FIVE_MINUTES: "5m",
        FIFTEEN_MINUTES: "15m",
        ONE_HOUR: "1h",
        FOUR_HOURS: "4h",
        ONE_DAY: "1d"
    }
};

module.exports = CONFIG;