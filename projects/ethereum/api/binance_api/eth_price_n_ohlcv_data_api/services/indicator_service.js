/**
 * Indicator Service
 * 
 * Calculates:
 * - SMA
 * - EMA
 * - RSI
 */

const {
    getLast7Days,
    getAllCandles
} = require("../database/queries");



function calculateSMA(values, period){

    if(values.length < period){
        return null;
    }


    const slice = values.slice(-period);


    const sum = slice.reduce(
        (a,b)=>a+b,
        0
    );


    return Number(
        (sum / period).toFixed(2)
    );
}



function calculateEMA(values, period){

    if(values.length < period){
        return null;
    }


    const multiplier =
        2 / (period + 1);


    let ema =
        values
        .slice(0,period)
        .reduce((a,b)=>a+b,0)
        /
        period;


    for(
        let i = period;
        i < values.length;
        i++
    ){

        ema =
            (values[i]-ema)
            *
            multiplier
            +
            ema;
    }


    return Number(
        ema.toFixed(2)
    );
}



function calculateRSI(values, period = 14){

    if(values.length <= period){
        return null;
    }


    let gains = 0;
    let losses = 0;


    for(
        let i=1;
        i<=period;
        i++
    ){

        const change =
            values[i]-values[i-1];


        if(change >=0)
            gains += change;
        else
            losses += Math.abs(change);

    }


    const avgGain =
        gains / period;


    const avgLoss =
        losses / period;


    if(avgLoss === 0)
        return 100;


    const rs =
        avgGain / avgLoss;


    return Number(
        (100 - (100/(1+rs)))
        .toFixed(2)
    );

}



async function calculateIndicators(){

    const candles =
        await getAllCandles();



    const closes =
        candles.map(
            c=>Number(c.close)
        );


    const result = {


        candles:
            candles.length,


        latest_price:
            closes.at(-1),


        sma20:
            calculateSMA(
                closes,
                20
            ),


        ema20:
            calculateEMA(
                closes,
                20
            ),


        ema50:
            calculateEMA(
                closes,
                50
            ),


        rsi14:
            calculateRSI(
                closes
            )

    };


    console.table(result);


    return result;

}



module.exports =
    calculateIndicators;