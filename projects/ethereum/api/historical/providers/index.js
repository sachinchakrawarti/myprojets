/**
 * Historical Providers
 * ------------------------------------------------
 * Central export for all historical data providers.
 */

import * as Binance from "./binance/index.js";
import * as CoinGecko from "./coingecko/index.js";
import * as CryptoCompare from "./cryptocompare/index.js";

/**
 * Named Exports
 */
export {

    Binance,

    CoinGecko,

    CryptoCompare

};

/**
 * Default Export
 */
export default {

    Binance,

    CoinGecko,

    CryptoCompare

};