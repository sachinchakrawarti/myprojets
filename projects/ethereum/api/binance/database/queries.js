const connect = require("./connection");


async function getCount(){

    const db = await connect();

    const result = await db.get(
        `
        SELECT COUNT(*) AS total
        FROM market_ohlcv
        `
    );

    return result.total;
}



async function getLatest(){

    const db = await connect();

    return await db.get(
        `
        SELECT *
        FROM market_ohlcv
        ORDER BY open_time DESC
        LIMIT 1
        `
    );
}



async function getLast7Days(){

    const db = await connect();

    return await db.all(
        `
        SELECT *
        FROM market_ohlcv
        ORDER BY open_time DESC
        LIMIT 7
        `
    );
}



async function getHighestPrice(){

    const db = await connect();

    return await db.get(
        `
        SELECT MAX(high) AS highest_price
        FROM market_ohlcv
        `
    );
}



async function getLowestPrice(){

    const db = await connect();

    return await db.get(
        `
        SELECT MIN(low) AS lowest_price
        FROM market_ohlcv
        `
    );
}



async function getAllCandles(){

    const db = await connect();


    return await db.all(
        `
        SELECT *
        FROM market_ohlcv
        ORDER BY open_time ASC
        `
    );

}
module.exports = {

    getCount,
    getLatest,
    getLast7Days,
    getHighestPrice,
    getLowestPrice

};


module.exports = {

    getCount,
    getLatest,
    getLast7Days,
    getHighestPrice,
    getLowestPrice,
    getAllCandles

};