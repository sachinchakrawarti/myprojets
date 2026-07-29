import axios from "axios";
import { BASE_URL } from "./config.js";

const client = axios.create({

    baseURL: BASE_URL,

    timeout: 15000,

    headers: {

        Accept: "application/json",

        "Content-Type": "application/json",

        "User-Agent": "Ethereum-Historical/1.0"

    }

});

export default client;

