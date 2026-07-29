import axios from "axios";

try {

    const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/ethereum/market_chart",
        {
            params: {
                vs_currency: "usd",
                days: 30,
                interval: "daily"
            }
        }
    );

    console.log(response.status);
    console.log(response.data.market_caps.length);

}
catch (err) {

    console.log(err.response?.status);
    console.log(err.response?.data);

}