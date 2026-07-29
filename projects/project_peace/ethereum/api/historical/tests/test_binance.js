import { Binance } from "../providers/index.js";

async function main() {

    try {

        const data = await Binance.getDailyMarketData({
            symbol: "ETHUSDT",
            limit:30
        });

        console.table(data);

    } catch (error) {

        console.error(error);

    }

}

main();