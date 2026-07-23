import { getMarketData } from "./market.js";
import { mapMarket } from "./mapper.js";

export async function getDailyMarketData(days = 30) {

    const raw = await getMarketData(days);

    return mapMarket(raw);

}

export default {
    getDailyMarketData
};