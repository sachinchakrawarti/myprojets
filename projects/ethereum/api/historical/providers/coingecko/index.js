/**
 * CoinGecko Provider
 * -----------------------------------
 * Public interface for CoinGecko historical market data.
 */

import { getMarketData } from "./market.js";
import { mapMarket } from "./mapper.js";

/**
 * Get normalized market data.
 *
 * @returns {Promise<Object>}
 */
export async function getDailyMarketData() {

    try {

        const rawData = await getMarketData();

        return mapMarket(rawData);

    } catch (error) {

        console.error(
            "[CoinGecko Provider] Failed to fetch market data."
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