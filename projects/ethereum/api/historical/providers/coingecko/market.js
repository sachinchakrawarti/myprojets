/**
 * CoinGecko Market Chart API
 */

import client from "./client.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getMarketData(days = 30) {

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {

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

            return response.data;

        } catch (error) {

            const status = error.response?.status;

            console.log(
                `[CoinGecko] Attempt ${attempt}/${MAX_RETRIES} failed (${status})`
            );

            if (attempt === MAX_RETRIES) {
                throw error;
            }

            await sleep(2000);

        }

    }

}