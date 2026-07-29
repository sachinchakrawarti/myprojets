/**
 * Download complete historical data
 */

const fetchHistorical = require("../collectors/fetch_historical");
const { insertCandles } = require("../database/insert");

async function syncHistory() {

    console.log("Downloading historical candles...");

    const candles = await fetchHistorical();

    await insertCandles(candles);

    console.log("Historical synchronization completed.");
}

module.exports = syncHistory;