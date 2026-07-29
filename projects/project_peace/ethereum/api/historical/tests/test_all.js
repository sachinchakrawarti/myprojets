/**
 * Historical Providers Integration Test
 * --------------------------------------
 * Tests:
 * 1. Binance (30 Days OHLC + Volume)
 * 2. CoinGecko (30 Days Market Cap + Volume)
 */

import {
    Binance,
    CoinGecko
} from "../providers/index.js";

async function testBinance() {

    console.log("\n========================================");
    console.log("         BINANCE (30 DAYS)");
    console.log("========================================");

    const data = await Binance.getDailyMarketData({
        symbol: "ETHUSDT",
        limit: 30
    });

    console.log(`Records: ${data.length}\n`);

    console.table(data);

    return data;

}

async function testCoinGecko() {

    console.log("\n========================================");
    console.log("       COINGECKO (30 DAYS)");
    console.log("========================================");

    const data = await CoinGecko.getDailyMarketData(30);

    console.log(`Records: ${data.length}\n`);

    console.table(data);

    return data;

}

async function main() {

    try {

        console.clear();

        console.log("========================================");
        console.log("      HISTORICAL PROVIDERS TEST");
        console.log("========================================");

        const binance = await testBinance();

        const coingecko = await testCoinGecko();

        console.log("\n========================================");
        console.log("              SUMMARY");
        console.log("========================================");

        console.table([
            {
                Provider: "Binance",
                Records: binance.length,
                Data: "OHLC + Trading Volume"
            },
            {
                Provider: "CoinGecko",
                Records: coingecko.length,
                Data: "Market Cap + Total Volume"
            }
        ]);

        console.log("\n========================================");
        console.log("           ALL TESTS PASSED");
        console.log("========================================");

    } catch (error) {

        console.log("\n========================================");
        console.log("            TEST FAILED");
        console.log("========================================");

        console.error(error.message);

        if (error.response) {

            console.error("\nStatus:", error.response.status);

            console.dir(error.response.data, {
                depth: null
            });

        }

    }

}

main();