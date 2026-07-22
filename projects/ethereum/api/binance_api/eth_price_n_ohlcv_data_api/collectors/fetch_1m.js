const { fetchKlines } = require("../client");

async function fetch1M(limit = 1000) {
    return await fetchKlines("ETHUSDT", "1m", limit);
}

module.exports = fetch1M;