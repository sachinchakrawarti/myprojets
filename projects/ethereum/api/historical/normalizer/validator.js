/**
 * Market Validator
 * -----------------------------------------
 */

import marketSchema from "./market_schema.js";

/**
 * Validate Binance Market Price Object
 */
export function validatePrice(price) {

    if (!price) {

        throw new Error("Price object is required.");

    }

    const required = [

        "date",

        "symbol",

        "open",

        "high",

        "low",

        "close",

        "volume_eth",

        "volume_usdt"

    ];

    for (const field of required) {

        if (!(field in price)) {

            throw new Error(
                `Price validation failed. Missing field: ${field}`
            );

        }

    }

    return true;

}

/**
 * Validate CoinGecko Market Cap Object
 */
export function validateMarketCap(market) {

    if (!market) {

        throw new Error("Market Cap object is required.");

    }

    const required = [

        "date",

        "symbol",

        "market_cap_usd",

        "total_volume_usd"

    ];

    for (const field of required) {

        if (!(field in market)) {

            throw new Error(
                `Market Cap validation failed. Missing field: ${field}`
            );

        }

    }

    return true;

}

/**
 * Validate Final Merged Object
 */
export function validateMerged(data) {

    if (!data) {

        throw new Error("Merged object is required.");

    }

    for (const field in marketSchema) {

        if (!(field in data)) {

            throw new Error(
                `Merged object missing field: ${field}`
            );

        }

    }

    return true;

}