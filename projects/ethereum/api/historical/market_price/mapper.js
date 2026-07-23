/**
 * Market Price Mapper
 *
 * Converts provider response
 * into internal market_price schema.
 */

export function mapMarketPrice(records = []) {

    return records.map(record => ({

        date: record.date,

        symbol: record.symbol,

        open: record.open,

        high: record.high,

        low: record.low,

        close: record.close,

        volume_eth: record.volume_eth,

        volume_usdt: record.volume_usdt,

        number_of_trades: record.number_of_trades,

        taker_buy_volume_eth: record.taker_buy_volume_eth,

        taker_buy_volume_usdt: record.taker_buy_volume_usdt,

        source: record.source

    }));

}

export default mapMarketPrice;