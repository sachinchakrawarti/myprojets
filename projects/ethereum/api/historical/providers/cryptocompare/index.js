/**
 * CryptoCompare Provider
 * -----------------------------------
 * Public interface for historical daily market data.
 */

import { getHistoricalData } from "./histoday.js";
import { mapHistoryList } from "./mapper.js";

/**
 * Fetch normalized historical market data.
 *
 * @param {Object} options
 * @param {string} options.fromSymbol
 * @param {string} options.toSymbol
 * @param {number} options.limit
 * @param {number|null} options.toTs
 *
 * @returns {Promise<Array<Object>>}
 */
export async function getDailyMarketData(options = {}) {

    try {

        const rawHistory = await getHistoricalData(options);

        return mapHistoryList(rawHistory);

    } catch (error) {

        console.error(
            "[CryptoCompare Provider] Failed to fetch historical market data."
        );

        throw error;

    }

}

/**
 * Default Export
 */
export default {

    getDailyMarketData

};