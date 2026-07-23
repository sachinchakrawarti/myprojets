/**
 * Market Cap Validator
 */

const REQUIRED_FIELDS = [

    "date",

    "symbol",

    "market_cap_usd",

    "total_volume_usd",

    "circulating_supply",

    "total_supply",

    "max_supply",

    "market_cap_rank"

];

export function validateMarketCap(records = []) {

    if (!Array.isArray(records)) {

        throw new Error(
            "Market Cap data must be an array."
        );

    }

    if (records.length === 0) {

        throw new Error(
            "No Market Cap records found."
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

        if (typeof record.market_cap_usd !== "number") {

            throw new Error(
                `Invalid market_cap_usd at record ${index}`
            );

        }

        if (typeof record.total_volume_usd !== "number") {

            throw new Error(
                `Invalid total_volume_usd at record ${index}`
            );

        }

    });

    return true;

}

export default validateMarketCap;