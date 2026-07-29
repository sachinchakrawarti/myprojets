/**
 * Scheduler
 */

const syncToday = require("./sync_today");

function startScheduler() {

    console.log("Scheduler started.");

    setInterval(async () => {

        console.log("Running scheduled synchronization...");

        await syncToday();

    }, 60 * 60 * 1000); // every hour
}

module.exports = startScheduler;