const { fetchKlines } = require("../client");

async function fetchDaily(limit = 1000) {
    return await fetchKlines("ETHUSDT", "1d", limit);
}

module.exports = fetchDaily;