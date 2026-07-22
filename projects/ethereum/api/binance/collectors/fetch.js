const { fetchKlines } = require("../client");

async function fetch(interval, limit = 1000) {
    return await fetchKlines("ETHUSDT", interval, limit);
}

module.exports = fetch;