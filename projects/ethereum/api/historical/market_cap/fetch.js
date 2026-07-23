/**
 * Fetch Historical Market Cap
 *
 * Source:
 * CoinGecko
 */

import { CoinGecko } from "../providers/index.js";

export async function fetchMarketCap(options = {}) {

    const {

        days = 30

    } = options;

    return await CoinGecko.getDailyMarketData({

        days

    });

}

export default fetchMarketCap;