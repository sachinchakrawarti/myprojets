/**
 * Daily Synchronization
 *
 * Fetches today's market data
 * and stores it into the database.
 */

import { Binance, CoinGecko } from "../providers/index.js";

import { normalizeMany } from "../normalizer/index.js";

import { saveHistoricalData } from "../database/save.js";

export async function dailySync() {

    console.log("\n====================================");
    console.log(" DAILY MARKET SYNC");
    console.log("====================================\n");

    // -----------------------------------
    // Binance
    // -----------------------------------

    console.log("Fetching Binance...");

    const prices = await Binance.getDailyMarketData({

        symbol: "ETHUSDT",

        limit: 1

    });

    // -----------------------------------
    // CoinGecko
    // -----------------------------------

    console.log("Fetching CoinGecko...");

    const caps = await CoinGecko.getDailyMarketData(

        1

    );

    // -----------------------------------
    // Normalize
    // -----------------------------------

    const merged = normalizeMany(

        prices,

        caps

    );

    // -----------------------------------
    // Save
    // -----------------------------------

    await saveHistoricalData(

        merged

    );

    console.log("\nToday's data saved successfully.");

}

export default dailySync;