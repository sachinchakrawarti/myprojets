/**
 * Binance Provider
 * -----------------------------------
 * Public interface for Binance historical daily market data.
 */

import { getDailyKlines } from "./klines.js";
import { mapKlines } from "./mapper.js";

/**
 * Get normalized daily market data.
 *
 * @param {Object} options
 * @param {string} options.symbol
 * @param {string} options.interval
 * @param {number} options.limit
 * @param {number|null} options.startTime
 * @param {number|null} options.endTime
 *
 * @returns {Promise<Array<Object>>}
 */
export async function getDailyMarketData(options = {}) {

    try {

        const rawKlines = await getDailyKlines(options);

        return mapKlines(rawKlines);

    } catch (error) {

        console.error("[Binance Provider] Failed to fetch daily market data.");

        throw error;

    }

}

/**
 * Default export
 */
export default {
    getDailyMarketData
};