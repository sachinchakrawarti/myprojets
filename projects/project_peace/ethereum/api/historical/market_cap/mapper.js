/**
 * Market Cap Mapper
 *
 * Converts CoinGecko response
 * into internal market_cap schema.
 */

export function mapMarketCap(records = []) {

    return records.map(record => ({

        date: record.date,

        symbol: record.symbol,

        market_cap_usd: record.market_cap_usd,

        total_volume_usd: record.total_volume_usd,

        circulating_supply: record.circulating_supply,

        total_supply: record.total_supply,

        max_supply: record.max_supply,

        market_cap_rank: record.market_cap_rank,

        source: record.source

    }));

}

export default mapMarketCap;