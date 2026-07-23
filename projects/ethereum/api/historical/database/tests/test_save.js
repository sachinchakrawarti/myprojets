/**
 * Database Save Test
 * -----------------------------------------
 * Flow:
 * Binance
 *      +
 * CoinGecko
 *      ↓
 * Normalizer
 *      ↓
 * SQLite
 */

import { Binance, CoinGecko } from "../../providers/index.js";

import {
    normalizeMany
} from "../../normalizer/index.js";

import {
    saveHistoricalData
} from "../save.js";

import {
    findAll,
    getLastDate
} from "../repository.js";

async function main() {

    try {

        console.clear();

        console.log("========================================");
        console.log("      DATABASE SAVE TEST");
        console.log("========================================\n");

        // ---------------------------------
        // Fetch
        // ---------------------------------

        console.log("Fetching Binance...");

        const prices =
            await Binance.getDailyMarketData({

                symbol: "ETHUSDT",

                limit: 30

            });

        console.log(
            `✓ Binance Records : ${prices.length}`
        );

        console.log("\nFetching CoinGecko...");

        const markets =
            await CoinGecko.getDailyMarketData(30);

        console.log(
            `✓ CoinGecko Records : ${markets.length}`
        );

        // ---------------------------------
        // Normalize
        // ---------------------------------

        console.log("\nNormalizing Data...");

        const historicalData =
            normalizeMany(
                prices,
                markets
            );

        console.log(
            `✓ Normalized : ${historicalData.length}`
        );

        // ---------------------------------
        // Save
        // ---------------------------------

        console.log("\nSaving To SQLite...");

        await saveHistoricalData(
            historicalData
        );

        console.log(
            "✓ Save Complete"
        );

        // ---------------------------------
        // Verify
        // ---------------------------------

        const rows = findAll();

        console.log(
            `\nDatabase Rows : ${rows.length}`
        );

        console.table(
            rows.slice(0, 5)
        );

        const lastDate =
            getLastDate();

        console.log(
            "\nLatest Date:",
            lastDate.last_date
        );

        console.log("\n========================================");

        console.log(
            "DATABASE TEST PASSED"
        );

        console.log("========================================");

    }

    catch (error) {

        console.log("\n========================================");

        console.log(
            "DATABASE TEST FAILED"
        );

        console.log("========================================\n");

        console.error(error);

    }

}

main();