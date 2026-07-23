/**
 * CoinGecko Market Chart API
 * -----------------------------------
 * Fetch historical market cap and volume.
 */

import client from "./client.js";

export async function getMarketData(days = 30) {

    const response = await client.get(
        "/coins/ethereum/market_chart",
        {
            params: {
                vs_currency: "usd",
                days,
                interval: "daily"
            }
        }
    );

    return response.data;

}