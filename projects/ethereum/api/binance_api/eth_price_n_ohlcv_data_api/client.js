/**
 * Binance REST Client
 */

const CONFIG = require("./config");

async function request(endpoint) {

    const url = `${CONFIG.BASE_URL}${endpoint}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Binance API Error : ${response.status} ${response.statusText}`
        );
    }

    return await response.json();
}

/**
 * Fetch OHLC Candles
 */
async function fetchKlines(
    symbol = CONFIG.SYMBOL,
    interval = CONFIG.INTERVALS.ONE_DAY,
    limit = CONFIG.LIMIT,
    endTime = undefined
) {

    let endpoint =
        `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    if (endTime) {
        endpoint += `&endTime=${endTime}`;
    }

    return await request(endpoint);
}

/**
 * Latest Price
 */

async function fetchLatestPrice(symbol = CONFIG.SYMBOL) {

    return await request(`/api/v3/ticker/price?symbol=${symbol}`);
}

/**
 * 24hr Statistics
 */

async function fetch24Hr(symbol = CONFIG.SYMBOL) {

    return await request(`/api/v3/ticker/24hr?symbol=${symbol}`);
}

/**
 * Exchange Info
 */

async function fetchExchangeInfo() {

    return await request("/api/v3/exchangeInfo");
}

module.exports = {
    fetchKlines,
    fetchLatestPrice,
    fetch24Hr,
    fetchExchangeInfo
};