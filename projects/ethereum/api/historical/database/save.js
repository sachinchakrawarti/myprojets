/**
 * Save Service
 */

import {

    saveMarkets

} from "./repository.js";

/**
 * Save Historical Market Data
 *
 * @param {Array<Object>} data
 */
export async function saveHistoricalData(data) {

    if (!Array.isArray(data)) {

        throw new Error(
            "Expected an array of market data."
        );

    }

    if (data.length === 0) {

        console.log(
            "[Database] Nothing to save."
        );

        return;

    }

    await saveMarkets(data);

    console.log(
        `[Database] ${data.length} records saved successfully.`
    );

}

export default {

    saveHistoricalData

};