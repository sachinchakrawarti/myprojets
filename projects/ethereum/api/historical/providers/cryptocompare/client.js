/**
 * CryptoCompare HTTP Client
 * -----------------------------------
 * Axios client configured for CryptoCompare REST API.
 */

import axios from "axios";
import config from "./config.js";

const client = axios.create({

    baseURL: config.baseURL,

    timeout: config.timeout,

    headers: {

        Accept: "application/json",

        "Content-Type": "application/json"

    }

});

/**
 * Request Logger
 */
client.interceptors.request.use((request) => {

    console.log(
        `[CryptoCompare] ${request.method?.toUpperCase()} ${request.baseURL}${request.url}`
    );

    return request;

});

/**
 * Response Logger
 */
client.interceptors.response.use(

    (response) => {

        console.log(
            `[CryptoCompare] Status: ${response.status}`
        );

        return response;

    },

    (error) => {

        if (error.response) {

            console.error(
                `[CryptoCompare] Error ${error.response.status}:`,
                error.response.data
            );

        } else {

            console.error(
                "[CryptoCompare] Network Error:",
                error.message
            );

        }

        return Promise.reject(error);

    }

);

export default client;