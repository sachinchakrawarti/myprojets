import { CoinGecko } from "../providers/index.js";

async function main() {

    try {

        const data = await CoinGecko.getDailyMarketData(30);

        console.log(`Records: ${data.length}`);

        console.table(data);

    } catch (error) {

        console.error(error);

    }

}

main();