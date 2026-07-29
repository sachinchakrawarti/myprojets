/**
 * Convert CoinGecko Market Chart response.
 */

export function mapMarket(data) {

    return data.market_caps.map((marketCap, index) => ({

        date: new Date(marketCap[0])
            .toISOString()
            .split("T")[0],

        symbol: "ETH",

        market_cap_usd: marketCap[1],

        total_volume_usd: data.total_volumes[index][1],

        source: "coingecko"

    }));

}