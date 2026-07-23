import axios from "axios";

export default axios.create({

    baseURL: "https://api.coingecko.com/api/v3",

    timeout: 15000,

    headers: {

        Accept: "application/json",

        "User-Agent": "ethereum-historical-api"

    }

});