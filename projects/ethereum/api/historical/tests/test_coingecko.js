import { CryptoCompare } from "../providers/index.js";

async function main() {

    try {

        console.log("==========================================");
        console.log("      CryptoCompare Provider Test");
        console.log("==========================================\n");

        const data = await CryptoCompare.getDailyMarketData({
            fromSymbol: "ETH",
            toSymbol: "USD",
            limit: 5
        });

        console.log(`Total Records: ${data.length}\n`);

        console.table(data);

        console.log("\nFirst Record:");
        console.dir(data[0], { depth: null });

        console.log("\nLast Record:");
        console.dir(data[data.length - 1], { depth: null });

    } catch (error) {

        console.error("\nTest Failed\n");

        console.error(error.message);

        if (error.response) {

            console.error("\nStatus:", error.response.status);

            console.error(error.response.data);

        }

    }

}

main();