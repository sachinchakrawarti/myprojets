import { getMarketCap } from "../index.js";

async function main() {

    console.log("\n========================================");
    console.log("      MARKET CAP TEST");
    console.log("========================================\n");

    try {

        const records = await getMarketCap({

            days: 30

        });

        console.log(`Fetched ${records.length} records\n`);

        console.table(records);

        console.log("\nLatest Record\n");

        console.table([

            records[records.length - 1]

        ]);

        console.log("\n========================================");
        console.log("      MARKET CAP TEST PASSED");
        console.log("========================================\n");

    }

    catch (error) {

        console.log("\n========================================");
        console.log("      MARKET CAP TEST FAILED");
        console.log("========================================\n");

        console.error(error);

    }

}

main();