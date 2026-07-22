/**
 * CryptoCompare Mapper
 * -----------------------------------
 * Converts CryptoCompare response into
 * application's normalized market object.
 */

/**
 * Convert one historical candle.
 *
 * @param {Object} candle
 * @returns {Object}
 */
export function mapHistory(candle) {

    return {

        date: new Date(candle.time * 1000)
            .toISOString()
            .split("T")[0],

        symbol: "ETH",

        open: candle.open,

        high: candle.high,

        low: candle.low,

        close: candle.close,

        volume_eth: candle.volumefrom,

        volume_usd: candle.volumeto,

        source: "cryptocompare"

    };

}

/**
 * Convert multiple candles.
 *
 * @param {Array<Object>} history
 * @returns {Array<Object>}
 */
export function mapHistoryList(history) {

    return history.map(mapHistory);

}