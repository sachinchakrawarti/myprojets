/**
 * Binance WebSocket Client
 */

const CONFIG = require("./config");

function connect() {

    const symbol = CONFIG.SYMBOL.toLowerCase();

    const socket = new WebSocket(
        `${CONFIG.WS_URL}/${symbol}@trade`
    );

    socket.onopen = () => {

        console.log("Connected to Binance WebSocket");
    };

    socket.onmessage = (event) => {

        const data = JSON.parse(event.data);

        console.clear();

        console.log("Live Ethereum Price");
        console.log("----------------------------");

        console.log("Symbol :", data.s);
        console.log("Price  :", data.p);
        console.log("Quantity :", data.q);
        console.log("Trade Time :", new Date(data.T));

    };

    socket.onerror = (error) => {

        console.error(error);
    };

    socket.onclose = () => {

        console.log("Disconnected");
    };
}

connect();