/**
 * Historical Data Scheduler
 *
 * Runs:
 * 1. Backfill on startup
 * 2. Daily Sync every 24 hours
 */

import backfill from "./backfill.js";
import dailySync from "./daily_sync.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Start Scheduler
 */
export async function startScheduler() {

    console.log("\n====================================");
    console.log(" HISTORICAL DATA SCHEDULER");
    console.log("====================================\n");

    try {

        // First startup
        await backfill();

        // Every 24 hours
        setInterval(async () => {

            console.log("\nRunning Daily Sync...\n");

            try {

                await dailySync();

            }

            catch (error) {

                console.error(
                    "[Scheduler] Daily Sync Failed"
                );

                console.error(error);

            }

        }, ONE_DAY);

        console.log("\nScheduler Started.");

    }

    catch (error) {

        console.error(
            "[Scheduler] Startup Failed"
        );

        console.error(error);

    }

}

export default startScheduler;