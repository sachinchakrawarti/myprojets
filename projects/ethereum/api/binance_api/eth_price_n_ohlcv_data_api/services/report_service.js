/**
 * Daily Ethereum Report Generator
 */


const fs = require("fs");
const path = require("path");


const calculateIndicators =
require("./indicator_service");


const {
    getLatest
} = require("../database/queries");



async function generateReport(){


    const candle =
        await getLatest();


    const indicators =
        await calculateIndicators();



    const date =
        new Date()
        .toISOString()
        .split("T")[0];



    const report = `

# Ethereum Daily Report

Date: ${date}


## Market

Symbol: ETHUSDT


Open:
${candle.open}


High:
${candle.high}


Low:
${candle.low}


Close:
${candle.close}


Volume:
${candle.volume}



# Indicators


SMA 20:
${indicators.sma20}


EMA 20:
${indicators.ema20}


EMA 50:
${indicators.ema50}


RSI 14:
${indicators.rsi14}



## Analysis


RSI:

${
indicators.rsi14 > 70
?
"Overbought"
:
indicators.rsi14 < 30
?
"Oversold"
:
"Neutral"
}


`;


    const folder =
    path.join(
        __dirname,
        "../../../reports/daily"
    );


    fs.mkdirSync(
        folder,
        {
            recursive:true
        }
    );


    const file =
    path.join(
        folder,
        `${date}.md`
    );


    fs.writeFileSync(
        file,
        report
    );


    console.log(
        "Report created:",
        file
    );

}


module.exports =
generateReport;