import React, { useMemo } from "react"
import { AttachMoney, AttachMoneySharp, Bolt, BuildCircle, CurrencyBitcoin, CurrencyExchange, Dangerous, Error, History, LocalAtm, Money, Paid, Sell, Timeline, TripOrigin } from '@mui/icons-material'
import { TradingSetupModel, TradingSetupStatusType, TradingSetupTradeModel, TradingSetupTradeModelStatusEnum, TradingTransactionModel } from "../src/api/gen"
import MathUtils from "../src/commons/lib/mathUtils"

interface Props {
  tradingSetup: TradingSetupModel,
  trade: TradingSetupTradeModel,
}

export const TradingSetupTradeView = ({ tradingSetup, trade }: Props) =>
{
  const status = trade.status
  const isBuying = status === TradingSetupTradeModelStatusEnum.BuyPending
  const isSelling = status === TradingSetupTradeModelStatusEnum.SellPending || status === TradingSetupTradeModelStatusEnum.SellPartiallyDone
  const statusText = isBuying ? "Buying" : status === TradingSetupTradeModelStatusEnum.BuyDone ? "Waiting to Sell" : status === TradingSetupTradeModelStatusEnum.Complete ? "Complete" : "Selling"
  
  const action = `${trade.currentAction.type} ${trade.currentAction.action === 0 ? 'DO NOTHING' : trade.currentAction.action > 0 ? 'BUY' : 'SELL'}`
  
  const entryPrice = trade.entryPriceAmount
  const startAmount = MathUtils.AddNumbers(MathUtils.MultiplyNumbers(trade.startingFirstAmount, tradingSetup.currentPriceAmount), trade.startingSecondAmount)
  const currentAmount = MathUtils.AddNumbers(MathUtils.MultiplyNumbers(trade.firstAmount, tradingSetup.currentPriceAmount), trade.secondAmount)

  const profitAmount = MathUtils.Shorten(MathUtils.SubtractNumbers(currentAmount, startAmount), 2)
  const profitPercentage = MathUtils.Shorten(MathUtils.DivideNumbers(profitAmount, startAmount), 3)
  const color = MathUtils.IsZero(profitAmount) ? "Black" : MathUtils.IsBiggerThanZero(profitAmount) ? "Green" : "Red"
 
  const takeProfitTriggerAmount =  MathUtils.Shorten(MathUtils.MultiplyNumbers(entryPrice, "" + (1.0 + (tradingSetup.config.takeProfit?.percentage ?? 0))))
  const hasTrailingTP = tradingSetup.config.takeProfit?.trailingStop !== undefined
  const isTrailingTPActivated = hasTrailingTP ? MathUtils.IsGreaterThanOrEqualTo(trade.highestPriceAmount, takeProfitTriggerAmount) : false
  const trailingTPActivation = isTrailingTPActivated ? MathUtils.Shorten(MathUtils.MultiplyNumbers(trade.highestPriceAmount, "" + (1.0 - (tradingSetup.config.takeProfit?.trailingStop?.deltaPercentage ?? 0)))) : "0"

  
  const stopLossThresholdAmount = tradingSetup.config.stopLoss?.isBasedOnMaxPrice ? trade.highestPriceAmount : entryPrice
  const stopLossTriggerAmount = tradingSetup.config.stopLoss != null ? MathUtils.Shorten(MathUtils.MultiplyNumbers(stopLossThresholdAmount, "" + (1.0 - (tradingSetup.config.stopLoss!.percentage ?? 0)))) : "0"
  
  const sellTransactionPending = useMemo(() => {
    //TODO:
    return <></>
  }, [trade.sellTransactionPending])

  const sellTransactionsComplete = useMemo(() => {
    return (trade.sellTransactionsComplete.map(transaction => {
      const isFullyCancelled = transaction.canceled && MathUtils.IsZero(transaction.firstAmount)
      const firstTitle = isFullyCancelled ? "Sell Canceled" : "Sold" + (transaction.canceled ? " + Cancelled " : "")
      const firstAmount = isFullyCancelled ? transaction.offeredAmount : transaction.firstAmount

      const secondTitle = isFullyCancelled ? "Wanted" : "Got"
      const secondAmount = isFullyCancelled ? MathUtils.Shorten(MathUtils.MultiplyNumbers(transaction.offeredAmount, transaction.wantedPriceAmount), 2) : transaction.secondAmount
      return <div className='trade_section'>
          <div id={'sell_token'} className="trade_item">
            <AttachMoney style={{color: "Blue"}}/>
            <span className="trade_item_name" style={{color: "Blue"}}>{firstTitle}</span>
            <span className="trade_item_value" style={{color: "Blue"}}>{firstAmount} {tradingSetup.config.firstToken}</span>
          </div>
          <div id={'sell_price'} className="trade_item">
            <AttachMoney style={{color: "Blue"}}/>
            <span className="trade_item_name" style={{color: "Blue"}}>{secondTitle} {secondAmount} {tradingSetup.config.secondToken}</span>
            <span className="trade_item_value" style={{color: "Blue"}}>@ ${transaction.wantedPriceAmount}</span>
          </div>
      </div>
    }))
  }, [trade.sellTransactionsComplete])

  return <div key={"trade-" + trade.id} className="trade">
    <div className="trade_section_title">Trade - {statusText} - {action}</div>
    <div className="trade_section_title">Start @ {`${new Date(trade.startTimestamp).toLocaleTimeString('en-gb', { timeStyle: 'short'})} ${new Date(trade.startTimestamp).toLocaleDateString('en-gb', { dateStyle:'short' })}`}</div>
    {isBuying && <div className="trade_section">
      <div id={'buy_token'} className="trade_item">
        <AttachMoney style={{color: 'Green'}}/>
        <span className="trade_item_name" style={{color: 'Green'}}>{tradingSetup.config.firstToken}</span>
        <span className="trade_item_value" style={{color: 'Green'}}>Trying to buy</span>
      </div>
      <div id={'buy_price'} className="trade_item">
        <AttachMoney style={{color: 'Green'}}/>
        <span className="trade_item_name" style={{color: 'Green'}}>Offering {MathUtils.Shorten(trade.buyTransaction.offeredAmount, 2)} {tradingSetup.config.secondToken}</span>
        <span className="trade_item_value" style={{color: 'Green'}}>@ ${trade.buyTransaction.wantedPriceAmount}</span>
      </div>
    </div>}
    {!isBuying && !isSelling && <div className="trade_section">
      <div id={'current'} className="trade_item">
        <AttachMoney style={{color}}/>
        <span className="trade_item_name" style={{color}}>Total:</span>
        <span className="trade_item_value" style={{color}}>{profitAmount}<span>({MathUtils.MultiplyNumbers("100", profitPercentage)}%)</span></span>
      </div>
      <div id={'currentTradeEntry'} className="trade_item">
        <AttachMoneySharp/>
        <span className="trade_item_name">Entry Price:</span>
        <span className="trade_item_value">{MathUtils.Shorten(entryPrice, 2)}</span>
      </div>
      <div id={'takeProfit'} className="trade_item">
        <AttachMoneySharp style={{color:"Orange"}}/>
        <span className="trade_item_name" style={{color:"Orange"}}>TP Activates at:</span>
        <span className="trade_item_value" style={{color:"Orange"}}>{takeProfitTriggerAmount}</span>
      </div>
      {isTrailingTPActivated &&
      <div id={'takeProfitTrailing'} className="trade_item">
        <AttachMoneySharp style={{color:"Orange"}}/>
        <span className="trade_item_name" style={{color:"Orange"}}>Trailing will sell at:</span>
        <span className="trade_item_value" style={{color:"Orange"}}>{trailingTPActivation}</span>
      </div>}
      {MathUtils.IsBiggerThanZero(stopLossTriggerAmount) && 
      <div id={'takeProfit'} className="trade_item">
        <AttachMoneySharp style={{color:"Purple"}}/>
        <span className="trade_item_name" style={{color:"Purple"}}>Stop Loss Activates at:</span>
        <span className="trade_item_value" style={{color:"Purple"}}>{stopLossTriggerAmount}</span>
      </div>}
    </div>}
    {sellTransactionPending}
    {sellTransactionsComplete}
    <div className="trade_section_title">Tokens</div>
    <div className="trade_section">
      <div id={'firstToken'} className="trade_item">
        <CurrencyBitcoin/>
        <span className="trade_item_name">{tradingSetup.config.firstToken} Amount:</span>
        <span className="trade_item_value">{MathUtils.Max("0", isBuying ? trade.startingFirstAmount : trade.firstAmount)}</span>
      </div>
      <div id={'secondToken'} className="trade_item">
        <Money/>
        <span className="trade_item_name">{tradingSetup.config.secondToken} Amount:</span>
        <span className="trade_item_value">{MathUtils.Shorten(MathUtils.Max("0", isBuying ? trade.startingSecondAmount : trade.secondAmount))}</span>
      </div>
    </div>
  </div>
}