const { fetchLatestPrice } = require("../client");

async function fetchLatest() {
    return await fetchLatestPrice("ETHUSDT");
}

module.exports = fetchLatest;