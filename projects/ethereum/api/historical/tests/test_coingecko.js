import { CoinGecko } from "../providers/index.js";

async function main() {

    try {

        const data = await CoinGecko.getDailyMarketData();

        console.table(data);

    } catch (error) {

        console.error(error);

    }

}

main();