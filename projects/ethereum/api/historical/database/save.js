/**
 * Save Service
 */

import { saveMarkets } from "./repository.js";

export async function saveHistoricalData(data) {

    saveMarkets(data);

    console.log(
        `${data.length} records saved successfully.`
    );

}