/**
 * Database Repository
 */

import getDatabase from "./connection.js";

import {

    INSERT_MARKET,

    SELECT_ALL,

    SELECT_LAST_DATE

} from "./queries.js";

/**
 * Save One Record
 */
export async function saveMarket(data) {

    const db = await getDatabase();

    return db.run(

        INSERT_MARKET,

        [

            data.date,

            data.symbol,

            data.open,
            data.high,
            data.low,
            data.close,

            data.volume_eth,
            data.volume_usdt,

            data.number_of_trades,

            data.taker_buy_volume_eth,
            data.taker_buy_volume_usdt,

            data.market_cap_usd,
            data.total_volume_usd,

            data.circulating_supply,
            data.total_supply,
            data.max_supply,

            data.market_cap_rank

        ]

    );

}

/**
 * Save Multiple Records
 */
export async function saveMarkets(records) {

    const db = await getDatabase();

    await db.exec("BEGIN TRANSACTION");

    try {

        for (const record of records) {

            await db.run(

                INSERT_MARKET,

                [

                    record.date,

                    record.symbol,

                    record.open,
                    record.high,
                    record.low,
                    record.close,

                    record.volume_eth,
                    record.volume_usdt,

                    record.number_of_trades,

                    record.taker_buy_volume_eth,
                    record.taker_buy_volume_usdt,

                    record.market_cap_usd,
                    record.total_volume_usd,

                    record.circulating_supply,
                    record.total_supply,
                    record.max_supply,

                    record.market_cap_rank

                ]

            );

        }

        await db.exec("COMMIT");

    }

    catch (error) {

        await db.exec("ROLLBACK");

        throw error;

    }

}

/**
 * Get All Records
 */
export async function findAll() {

    const db = await getDatabase();

    return db.all(

        SELECT_ALL

    );

}

/**
 * Latest Saved Date
 */
export async function getLastDate() {

    const db = await getDatabase();

    return db.get(

        SELECT_LAST_DATE

    );

}

export default {

    saveMarket,

    saveMarkets,

    findAll,

    getLastDate

};