/**
 * Binance Daily Klines API
 * -----------------------------------
 * Fetches historical daily OHLCV data.
 */

import client from "./client.js";
import config from "./config.js";

/**
 * Fetch daily klines.
 *
 * @param {Object} options
 * @param {string} options.symbol
 * @param {string} options.interval
 * @param {number} options.limit
 * @param {number|null} options.startTime
 * @param {number|null} options.endTime
 *
 * @returns {Promise<Array>}
 */
export async function getDailyKlines({
    symbol = config.defaultSymbol,
    interval = config.defaultInterval,
    limit = config.defaultLimit,
    startTime = null,
    endTime = null
} = {}) {

    const params = {
        symbol,
        interval,
        limit
    };

    if (startTime) {
        params.startTime = startTime;
    }

    if (endTime) {
        params.endTime = endTime;
    }

    const response = await client.get(
        config.endpoints.klines,
        {
            params
        }
    );

    return response.data;
}