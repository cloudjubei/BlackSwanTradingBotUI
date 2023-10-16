import ACache from "./ACache"
import TokenIndicatorsModel from "../indicators/TokenIndicatorsModel.dto"

export default class IndicatorsCache extends ACache<TokenIndicatorsModel>
{
    constructor()
    {
        super()
    }
    
    storeIndicators(value: TokenIndicatorsModel)
    {
        const latest = this.getLatest(value.tokenPair, value.interval)
        if (latest.timestamp < value.timestamp){
            super.store(value.tokenPair, value.interval, value)   
        }else{
            this.cache[value.tokenPair][value.interval][0] = value
        }
    }

    getLatest(tokenPair: string, interval: string) : TokenIndicatorsModel
    {
        return super.getLatest(tokenPair, interval) ?? new TokenIndicatorsModel(tokenPair, interval, '0', Date.now(), {})
  
    }
}
