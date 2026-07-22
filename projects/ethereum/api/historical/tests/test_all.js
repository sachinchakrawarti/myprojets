import {
    Binance,
    CoinGecko,

} from "../providers/index.js";

async function main() {

    try {

        console.log("\n========== BINANCE ==========\n");

        const binance = await Binance.getDailyMarketData({
            symbol: "ETHUSDT",
            limit: 2
        });

        console.table(binance);

        console.log("\n========== COINGECKO ==========\n");

        const gecko = await CoinGecko.getDailyMarketData();

        console.table([gecko]);


    } catch (error) {

        console.error(error);

    }

}

main();