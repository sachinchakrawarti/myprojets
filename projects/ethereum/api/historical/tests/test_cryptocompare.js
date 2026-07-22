import { CryptoCompare } from "../providers/index.js";

async function main() {

    try {

        const data = await CryptoCompare.getDailyMarketData({
            fromSymbol: "ETH",
            toSymbol: "USD",
            limit: 5
        });

        console.table(data);

    } catch (error) {

        console.error(error);

    }

}

main();