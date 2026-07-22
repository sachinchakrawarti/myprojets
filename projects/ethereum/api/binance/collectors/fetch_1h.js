const { fetchKlines } = require("../client");

async function fetch1H(limit = 1000) {
    return await fetchKlines("ETHUSDT", "1h", limit);
}

module.exports = fetch1H;