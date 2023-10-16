
export default class ConfigSignalInputModel
{
    port: number
    tokens: string[]
    intervals: string[]

    constructor(port: number, tokens: string[], intervals: string[]){
        this.port = port
        this.tokens = tokens
        this.intervals = intervals
    }
}