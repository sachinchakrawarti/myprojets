/**
 * Repository
 */

import db from "./connection.js";
import {
    INSERT_MARKET,
    SELECT_ALL,
    SELECT_LAST_DATE
} from "./queries.js";

const insert = db.prepare(INSERT_MARKET);

const selectAll = db.prepare(SELECT_ALL);

const lastDate = db.prepare(SELECT_LAST_DATE);

export function saveMarket(data) {

    return insert.run(

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

    );

}

export function saveMarkets(list) {

    const transaction = db.transaction((rows) => {

        for (const row of rows) {

            saveMarket(row);

        }

    });

    transaction(list);

}

export function findAll() {

    return selectAll.all();

}

export function getLastDate() {

    return lastDate.get();

}