/**
 * Insert OHLCV Candles
 */

const connect = require("./connection");

async function insertCandles(candles) {

    const db = await connect();

    const sql = `

        INSERT OR IGNORE INTO market_ohlcv (

            open_time,
            open,
            high,
            low,
            close,
            volume,
            close_time,
            quote_asset_volume,
            trades,
            taker_buy_base_volume,
            taker_buy_quote_volume

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    `;

    for (const candle of candles) {

        await db.run(sql, [

            candle[0],
            candle[1],
            candle[2],
            candle[3],
            candle[4],
            candle[5],
            candle[6],
            candle[7],
            candle[8],
            candle[9],
            candle[10]

        ]);
    }

    console.log(`${candles.length} candles inserted.`);
}

module.exports = {

    insertCandles
};