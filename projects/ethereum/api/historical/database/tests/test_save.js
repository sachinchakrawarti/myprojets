/**
 * Database Integration Test
 */

import {

    Binance,

    CoinGecko

} from "../../providers/index.js";

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
        console.log(" DATABASE SAVE TEST ");
        console.log("========================================\n");

        // ----------------------------------------
        // Binance
        // ----------------------------------------

        console.log("Fetching Binance...");

        const prices =
            await Binance.getDailyMarketData({

                symbol: "ETHUSDT",

                limit: 30

            });

        console.log(
            `✓ Binance : ${prices.length} rows`
        );

        // ----------------------------------------
        // CoinGecko
        // ----------------------------------------

        console.log("\nFetching CoinGecko...");

        const markets =
            await CoinGecko.getDailyMarketData(30);

        console.log(
            `✓ CoinGecko : ${markets.length} rows`
        );

        // ----------------------------------------
        // Normalize
        // ----------------------------------------

        console.log("\nNormalizing...");

        const historicalData =
            normalizeMany(

                prices,

                markets

            );

        console.log(
            `✓ Normalized : ${historicalData.length} rows`
        );

        // ----------------------------------------
        // Save
        // ----------------------------------------

        console.log("\nSaving...");

        await saveHistoricalData(

            historicalData

        );

        // ----------------------------------------
        // Verify
        // ----------------------------------------

        const rows = await findAll();

        console.log(
            `\nDatabase Rows : ${rows.length}`
        );

        console.table(

            rows.slice(0, 10)

        );

        const latest = await getLastDate();

        console.log(
            "\nLatest Date:",
            latest.last_date
        );

        console.log("\n========================================");
        console.log(" DATABASE TEST PASSED ");
        console.log("========================================");

    }

    catch (error) {

        console.log("\n========================================");
        console.log(" DATABASE TEST FAILED ");
        console.log("========================================\n");

        console.error(error);

    }

}

main();