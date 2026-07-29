/**
 * Binance Kline Mapper
 * -----------------------------------
 * Converts Binance response into
 * a normalized object used by the application.
 */

/**
 * Convert one Binance kline.
 *
 * @param {Array} kline
 * @returns {Object}
 */
export function mapKline(kline) {

    return {

        date: new Date(kline[0])
            .toISOString()
            .split("T")[0],

        symbol: "ETHUSDT",

        open: Number(kline[1]),

        high: Number(kline[2]),

        low: Number(kline[3]),

        close: Number(kline[4]),

        volume_eth: Number(kline[5]),

        close_time: kline[6],

        volume_usdt: Number(kline[7]),

        number_of_trades: Number(kline[8]),

        taker_buy_volume_eth: Number(kline[9]),

        taker_buy_volume_usdt: Number(kline[10]),

        source: "binance"

    };

}

/**
 * Convert multiple Binance klines.
 *
 * @param {Array<Array>} klines
 * @returns {Array<Object>}
 */
export function mapKlines(klines) {

    return klines.map(mapKline);

}