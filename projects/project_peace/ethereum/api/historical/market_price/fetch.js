/**
 * Fetch Historical Market Price
 *
 * Source:
 * Binance Spot API
 */

import { Binance } from "../providers/index.js";

export async function fetchMarketPrice(options = {}) {

    const {

        symbol = "ETHUSDT",

        limit = 30

    } = options;

    return await Binance.getDailyMarketData({

        symbol,

        limit

    });

}

export default fetchMarketPrice;