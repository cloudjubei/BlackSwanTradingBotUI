
export default class PriceModel
{
    tokenPair: string
    interval: string
    price: string = "0"
    timestamp: number = 0

    constructor(tokenPair: string, interval: string, price: string = "0", timestamp: number = 0)
    {
        this.tokenPair = tokenPair
        this.interval = interval
        this.price = price
        this.timestamp = timestamp
    }
}