import {
    Binance,
    CoinGecko
} from "../providers/index.js";

async function main() {

    try {

        console.log("========================================");
        console.log("      HISTORICAL PROVIDERS TEST");
        console.log("========================================\n");

        // -------------------------------
        // Binance
        // -------------------------------

        console.log("========== BINANCE ==========\n");

        const binance = await Binance.getDailyMarketData({
            symbol: "ETHUSDT",
            limit: 2
        });

        console.log(`Records: ${binance.length}\n`);

        console.table(binance);

        // -------------------------------
        // CoinGecko
        // -------------------------------

        console.log("\n========== COINGECKO ==========\n");

        const gecko = await CoinGecko.getDailyMarketData();

        console.table([gecko]);

        console.log("\n========================================");
        console.log("          ALL TESTS PASSED");
        console.log("========================================");

    } catch (error) {

        console.error("\n========================================");
        console.error("            TEST FAILED");
        console.error("========================================");

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