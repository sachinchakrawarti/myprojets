/**
 * Market Price Service
 *
 * Workflow:
 * Fetch
 *  -> Validate
 *      -> Map
 */

import fetchMarketPrice from "./fetch.js";
import validateMarketPrice from "./validator.js";
import mapMarketPrice from "./mapper.js";

export async function getMarketPrice(options = {}) {

    const records = await fetchMarketPrice(options);

    validateMarketPrice(records);

    return mapMarketPrice(records);

}

export default {

    getMarketPrice

};