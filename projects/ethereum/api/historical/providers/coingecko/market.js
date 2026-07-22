/**
 * CoinGecko Market API
 * -----------------------------------
 * Fetch Ethereum market information.
 */

import client from "./client.js";
import config from "./config.js";

/**
 * Fetch Ethereum market data.
 *
 * @returns {Promise<Object>}
 */
export async function getMarketData() {

    const response = await client.get(
        config.endpoints.market,
        {
            params: {
                localization: false,
                tickers: false,
                market_data: true,
                community_data: false,
                developer_data: false,
                sparkline: false
            }
        }
    );

    return response.data;

}