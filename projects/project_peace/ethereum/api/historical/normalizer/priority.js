/**
 * Provider Priority
 * -----------------------------------------
 * Defines which provider has priority
 * when multiple providers supply the same field.
 */

const priority = {

    price: [
        "binance"
    ],

    volume: [
        "binance"
    ],

    market_cap: [
        "coingecko"
    ],

    circulating_supply: [
        "coingecko"
    ]

};

/**
 * Get priority list for a category.
 *
 * @param {string} category
 * @returns {Array<string>}
 */
export function getPriority(category) {

    return priority[category] || [];

}

/**
 * Check if provider is preferred.
 *
 * @param {string} category
 * @param {string} provider
 * @returns {boolean}
 */
export function isPreferred(category, provider) {

    return getPriority(category)[0] === provider;

}

export default priority;