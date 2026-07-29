/**
 * providers/coingecko/market.js
 * -----------------------------------------
 * CoinGecko Historical Market Data
 */

import client from "./client.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getMarketData(days = 30) {

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

            console.log(
                `[CoinGecko] GET /coins/ethereum/market_chart (Attempt ${attempt})`
            );

            const response = await client.get(
                "/coins/ethereum/market_chart",
                {
                    params: {
                        vs_currency: "usd",
                        days,
                        interval: "daily"
                    }
                }
            );

            console.log(
                `[CoinGecko] Status: ${response.status}`
            );

            console.log(
                `[CoinGecko] Records: ${response.data.market_caps.length}`
            );

            return response.data;

        }

        catch (error) {

            const status = error.response?.status ?? "NO_RESPONSE";

            console.error(
                `[CoinGecko] Attempt ${attempt} failed`
            );

            console.error(
                "Status:",
                status
            );

            console.error(
                "Message:",
                error.message
            );

            if (error.response) {

                console.error(
                    "Response Body:"
                );

                console.dir(
                    error.response.data,
                    { depth: null }
                );

            }

            if (attempt === MAX_RETRIES) {

                throw error;

            }

            console.log(
                "Retrying in 2 seconds...\n"
            );

            await sleep(2000);

        }

    }

}