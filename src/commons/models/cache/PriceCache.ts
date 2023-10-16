import ACache from "./ACache"
import PriceModel from "../price/PriceModel.dto"

export default class PriceCache extends ACache<PriceModel>
{
    setupValues(token: string, interval: string, prices: PriceModel[])
    {
        this.cache[token][interval] = prices.reverse()
    }
    
    storePrice(value: PriceModel)
    {
        const latest = this.getLatest(value.tokenPair, value.interval)
        if (latest.timestamp < value.timestamp){
            super.store(value.tokenPair, value.interval, value)   
        }else{
            this.cache[value.tokenPair][value.interval][0] = value
        }
    }

    getLatest(tokenPair: string, interval: string) : PriceModel
    {
        return super.getLatest(tokenPair, interval) ?? new PriceModel(tokenPair, interval)
    }
}
