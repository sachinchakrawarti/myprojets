/**
 * Backfill Historical Data
 *
 * Downloads only missing daily records
 * between the latest database date
 * and today.
 */

import { Binance, CoinGecko } from "../providers/index.js";

import { normalizeMany } from "../normalizer/index.js";

import { getLastDate } from "../database/repository.js";

import { saveHistoricalData } from "../database/save.js";

/**
 * Calculate missing days
 */
function getMissingDays(lastDate) {

    if (!lastDate) {

        return 365; // first run

    }

    const last = new Date(lastDate);

    const today = new Date();

    const diff = today - last;

    return Math.floor(

        diff / (1000 * 60 * 60 * 24)

    );

}

/**
 * Backfill Database
 */
export async function backfill() {

    console.log("\n====================================");
    console.log(" HISTORICAL BACKFILL");
    console.log("====================================\n");

    // -----------------------------------
    // Latest database date
    // -----------------------------------

    const latest = await getLastDate();

    const lastDate = latest?.last_date ?? null;

    console.log("Last Database Date :", lastDate);

    // -----------------------------------
    // Missing Days
    // -----------------------------------

    const missingDays = getMissingDays(lastDate);

    console.log("Missing Days :", missingDays);

    if (missingDays <= 0) {

        console.log("\nDatabase already up-to-date.\n");

        return;

    }

    // -----------------------------------
    // Binance
    // -----------------------------------

    console.log("\nDownloading Binance...");

    const prices = await Binance.getDailyMarketData({

        symbol: "ETHUSDT",

        limit: missingDays

    });

    console.log(

        `Downloaded ${prices.length} OHLC records`

    );

    // -----------------------------------
    // CoinGecko
    // -----------------------------------

    console.log("\nDownloading CoinGecko...");

    const caps = await CoinGecko.getDailyMarketData(

        missingDays

    );

    console.log(

        `Downloaded ${caps.length} Market Cap records`

    );

    // -----------------------------------
    // Normalize
    // -----------------------------------

    console.log("\nNormalizing...");

    const merged = normalizeMany(

        prices,

        caps

    );

    console.log(

        `${merged.length} normalized records`

    );

    // -----------------------------------
    // Save
    // -----------------------------------

    console.log("\nSaving...");

    await saveHistoricalData(

        merged

    );

    console.log("\nBackfill Completed Successfully.");

}

export default backfill;