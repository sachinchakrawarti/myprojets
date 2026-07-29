/**
 * Update Today's Candle
 */

const connect = require("./connection");

async function updateCandle(candle) {

    const db = await connect();

    const sql = `

        UPDATE market_ohlcv

        SET

            open = ?,
            high = ?,
            low = ?,
            close = ?,
            volume = ?,
            close_time = ?,
            quote_asset_volume = ?,
            trades = ?,
            taker_buy_base_volume = ?,
            taker_buy_quote_volume = ?

        WHERE

            open_time = ?

    `;

    await db.run(sql, [

        candle[1],
        candle[2],
        candle[3],
        candle[4],
        candle[5],
        candle[6],
        candle[7],
        candle[8],
        candle[9],
        candle[10],
        candle[0]

    ]);
}

module.exports = {

    updateCandle
};