/**
 * Market Price Validator
 */

const REQUIRED_FIELDS = [

    "date",
    "symbol",

    "open",
    "high",
    "low",
    "close",

    "volume_eth",
    "volume_usdt",

    "number_of_trades",

    "taker_buy_volume_eth",
    "taker_buy_volume_usdt"

];

export function validateMarketPrice(records = []) {

    if (!Array.isArray(records)) {

        throw new Error(
            "Market Price must be an array."
        );

    }

    if (records.length === 0) {

        throw new Error(
            "No Market Price records found."
        );

    }

    records.forEach((record, index) => {

        for (const field of REQUIRED_FIELDS) {

            if (!(field in record)) {

                throw new Error(

                    `Record ${index} missing field: ${field}`

                );

            }

        }

    });

    return true;

}

export default validateMarketPrice;