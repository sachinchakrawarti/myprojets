/**
 * CryptoCompare Histoday API
 * -----------------------------------
 * Fetch historical daily OHLCV data.
 */

import client from "./client.js";
import config from "./config.js";

/**
 * Fetch daily historical market data.
 *
 * @param {Object} options
 * @param {string} options.fromSymbol
 * @param {string} options.toSymbol
 * @param {number} options.limit
 * @param {number|null} options.toTs
 *
 * @returns {Promise<Array>}
 */
export async function getHistoricalData({

    fromSymbol = config.defaultFromSymbol,

    toSymbol = config.defaultToSymbol,

    limit = config.defaultLimit,

    toTs = null

} = {}) {

    const params = {

        fsym: fromSymbol,

        tsym: toSymbol,

        limit

    };

    if (toTs) {

        params.toTs = toTs;

    }

    const response = await client.get(

        config.endpoints.histoday,

        {

            params

        }

    );

    return response.data.Data.Data;

}