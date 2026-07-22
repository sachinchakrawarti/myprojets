const { fetchKlines } = require("../client");

async function fetchHistorical() {

    let allCandles = [];
    let endTime = Date.now();

    while (true) {

        const candles = await fetchKlines(
            "ETHUSDT",
            "1d",
            1000,
            endTime
        );

        if (!candles.length) break;

        allCandles = [...candles, ...allCandles];

        endTime = candles[0][0] - 1;

        console.log(`Downloaded ${allCandles.length} candles`);

        if (candles.length < 1000) break;
    }

    return allCandles;
}

module.exports = fetchHistorical;