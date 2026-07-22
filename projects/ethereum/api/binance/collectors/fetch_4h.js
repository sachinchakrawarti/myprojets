const { fetchKlines } = require("../client");

async function fetch4H(limit = 1000) {
    return await fetchKlines("ETHUSDT", "4h", limit);
}

module.exports = fetch4H;