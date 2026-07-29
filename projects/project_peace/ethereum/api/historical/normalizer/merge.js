/**
 * Merge Binance + CoinGecko
 * -----------------------------------------
 */

import marketSchema from "./market_schema.js";

import {
    validatePrice,
    validateMarketCap
} from "./validator.js";

/**
 * Merge one day's data.
 *
 * @param {Object} price
 * @param {Object} market
 * @returns {Object}
 */
export function mergeMarket(price, market) {

    validatePrice(price);

    validateMarketCap(market);

    return {

        ...marketSchema,

        date: price.date,

        symbol: price.symbol,

        // Price

        open: price.open,

        high: price.high,

        low: price.low,

        close: price.close,

        // Binance Volume

        volume_eth: price.volume_eth,

        volume_usdt: price.volume_usdt,

        number_of_trades: price.number_of_trades,

        taker_buy_volume_eth:
            price.taker_buy_volume_eth,

        taker_buy_volume_usdt:
            price.taker_buy_volume_usdt,

        // CoinGecko

        market_cap_usd:
            market.market_cap_usd,

        total_volume_usd:
            market.total_volume_usd,

        circulating_supply:
            market.circulating_supply,

        total_supply:
            market.total_supply,

        max_supply:
            market.max_supply,

        market_cap_rank:
            market.market_cap_rank,

        // Sources

        source: {

            price: price.source,

            market_cap: market.source

        }

    };

}

/**
 * Merge multiple days.
 *
 * Matches by date.
 *
 * @param {Array<Object>} prices
 * @param {Array<Object>} markets
 * @returns {Array<Object>}
 */
export function mergeMarkets(prices, markets) {

    const marketMap = new Map();

    for (const market of markets) {

        marketMap.set(
            market.date,
            market
        );

    }

    const merged = [];

    for (const price of prices) {

        const market = marketMap.get(
            price.date
        );

        if (!market) {

            console.warn(
                `No CoinGecko data for ${price.date}`
            );

            continue;

        }

        merged.push(
            mergeMarket(price, market)
        );

    }

    return merged;

}

export default {

    mergeMarket,

    mergeMarkets

};