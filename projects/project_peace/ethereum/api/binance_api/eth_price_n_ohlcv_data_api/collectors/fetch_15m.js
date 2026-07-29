const { fetchKlines } = require("../client");

async function fetch15M(limit = 1000) {
    return await fetchKlines("ETHUSDT", "15m", limit);
}

module.exports = fetch15M;