/**
 * Binance Ethereum CLI
 */

const fetchLatest = require("./collectors/fetch_latest");
const fetchDaily = require("./collectors/fetch_daily");

const syncHistory = require("./services/sync_history");
const syncToday = require("./services/sync_today");
const generateReport = require("./services/report_service");
const backupDatabase = require("./services/backup_service");
const calculateIndicators = require("./services/indicator_service");


async function main() {

    const command = process.argv[2];


    console.log("====================================");
    console.log(" Binance Ethereum System");
    console.log(" Command :", command || "none");
    console.log("====================================");


    switch(command) {


        case "latest":

            const price = await fetchLatest();

            console.table(price);

            break;



        case "daily":

            const candles = await fetchDaily(5);

            console.table(candles);

            break;



        case "history":

            await syncHistory();

            break;



        case "today":

            await syncToday();

            break;



        case "report":

            await generateReport();

            break;



        case "backup":

            await backupDatabase();

            break;



        case "indicators":

            await calculateIndicators();

            break;


        default:

            console.log(`

Available Commands:

node api/binance/index.js latest

node api/binance/index.js daily

node api/binance/index.js history

node api/binance/index.js today

node api/binance/index.js report

node api/binance/index.js backup

node api/binance/index.js indicators

            `);

    }

}


main()
.catch(error => {

    console.error(error);

});