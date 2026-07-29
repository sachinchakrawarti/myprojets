/**
 * Historical Data Normalizer
 * -----------------------------------------
 * Public interface for merging and validating
 * historical market data.
 */

import {
    mergeMarket,
    mergeMarkets
} from "./merge.js";

import {
    validatePrice,
    validateMarketCap,
    validateMerged
} from "./validator.js";

import priority, {
    getPriority,
    isPreferred
} from "./priority.js";

import marketSchema from "./market_schema.js";

/**
 * Normalize a single day's market data.
 *
 * @param {Object} price
 * @param {Object} market
 * @returns {Object}
 */
export function normalize(price, market) {

    validatePrice(price);

    validateMarketCap(market);

    const merged = mergeMarket(price, market);

    validateMerged(merged);

    return merged;

}

/**
 * Normalize multiple days of market data.
 *
 * @param {Array<Object>} prices
 * @param {Array<Object>} markets
 * @returns {Array<Object>}
 */
export function normalizeMany(prices, markets) {

    const merged = mergeMarkets(
        prices,
        markets
    );

    merged.forEach(validateMerged);

    return merged;

}

export {

    marketSchema,

    priority,

    getPriority,

    isPreferred,

    validatePrice,

    validateMarketCap,

    validateMerged,

    mergeMarket,

    mergeMarkets

};

export default {

    normalize,

    normalizeMany,

    marketSchema,

    priority

};