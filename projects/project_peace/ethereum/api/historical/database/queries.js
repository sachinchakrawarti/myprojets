/**
 * SQL Queries
 */

export const INSERT_MARKET = `

INSERT OR REPLACE INTO historical_market (

    date,
    symbol,

    open,
    high,
    low,
    close,

    volume_eth,
    volume_usdt,

    number_of_trades,

    taker_buy_volume_eth,
    taker_buy_volume_usdt,

    market_cap_usd,
    total_volume_usd,

    circulating_supply,
    total_supply,
    max_supply,

    market_cap_rank

)

VALUES (

?,?,?,?,?,
?,
?,?,?,
?,
?,
?,
?,
?,
?,
?,
?

);

`;

export const SELECT_ALL = `

SELECT *

FROM historical_market

ORDER BY date;

`;

export const SELECT_LAST_DATE = `

SELECT MAX(date) AS last_date

FROM historical_market;

`;