/**
 * Market Cap Service
 *
 * Workflow:
 * Fetch
 *  -> Validate
 *      -> Map
 */

import fetchMarketCap from "./fetch.js";
import validateMarketCap from "./validator.js";
import mapMarketCap from "./mapper.js";

export async function getMarketCap(options = {}) {

    const records = await fetchMarketCap(options);

    validateMarketCap(records);

    return mapMarketCap(records);

}

export default {

    getMarketCap

};