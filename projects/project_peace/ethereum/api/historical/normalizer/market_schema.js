/**
 * Market Schema
 * -----------------------------------------
 * Standard market object used throughout
 * the Ethereum historical data pipeline.
 */

const marketSchema = {

    date: "",

    symbol: "",

    // Price
    open: null,
    high: null,
    low: null,
    close: null,

    // Binance Volume
    volume_eth: null,
    volume_usdt: null,

    number_of_trades: null,

    taker_buy_volume_eth: null,

    taker_buy_volume_usdt: null,

    // CoinGecko
    market_cap_usd: null,

    total_volume_usd: null,

    circulating_supply: null,

    total_supply: null,

    max_supply: null,

    market_cap_rank: null,

    // Metadata
    source: {

        price: null,

        market_cap: null

    }

};

export default marketSchema;