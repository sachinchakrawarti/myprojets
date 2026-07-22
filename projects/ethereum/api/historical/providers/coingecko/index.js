/**
 * CoinGecko Mapper
 * -----------------------------------
 * Convert CoinGecko response into
 * application's standard object.
 */

/**
 * Convert CoinGecko response.
 *
 * @param {Object} data
 * @returns {Object}
 */
export function mapMarket(data) {

    const market = data.market_data;

    return {

        date: new Date(data.last_updated)
            .toISOString()
            .split("T")[0],

        symbol: data.symbol.toUpperCase(),

        market_cap_usd:
            market.market_cap.usd,

        total_volume_usd:
            market.total_volume.usd,

        circulating_supply:
            market.circulating_supply,

        total_supply:
            market.total_supply,

        max_supply:
            market.max_supply,

        market_cap_rank:
            data.market_cap_rank,

        source: "coingecko"

    };

}

/**
 * Alias
 */
export function map(data) {

    return mapMarket(data);

}