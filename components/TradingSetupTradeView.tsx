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
  const statusText = isBuying ? "Buying" : status === TradingSetupTradeModelStatusEnum.BuyDone ? "Waiting to Sell" : status === TradingSetupTradeModelStatusEnum.Complete ? "Complete" : "Selling"
  
  const action = `${trade.currentAction.type} ${trade.currentAction.action === 0 ? 'DO NOTHING' : trade.currentAction.action > 0 ? 'BUY' : 'SELL'}`
  
  const entryPrice = trade.entryPriceAmount
  const startAmount = MathUtils.AddNumbers(MathUtils.MultiplyNumbers(trade.startingFirstAmount, entryPrice), trade.startingSecondAmount)
  const currentAmount = MathUtils.AddNumbers(MathUtils.MultiplyNumbers(trade.firstAmount, tradingSetup.currentPriceAmount), trade.secondAmount)
  const profitAmount = MathUtils.Shorten(MathUtils.SubtractNumbers(currentAmount, startAmount), 2)
  const profitPercentage = MathUtils.Shorten(MathUtils.DivideNumbers(profitAmount, startAmount), 3)
  const color = MathUtils.IsZero(profitAmount) ? "Black" : MathUtils.IsBiggerThanZero(profitAmount) ? "Green" : "Red"
 
  const takeProfitTriggerAmount =  MathUtils.Shorten(MathUtils.MultiplyNumbers(entryPrice, "" + (1.0 + (tradingSetup.config.takeProfit?.percentage ?? 0))))
  const hasTrailingTP = tradingSetup.config.takeProfit?.trailingStop !== undefined
  const isTrailingTPActivated = hasTrailingTP ? MathUtils.IsGreaterThanOrEqualTo(trade.highestPriceAmount, takeProfitTriggerAmount) : false
  const trailingTPActivation = isTrailingTPActivated ? MathUtils.Shorten(MathUtils.MultiplyNumbers(trade.highestPriceAmount, "" + (1.0 - (tradingSetup.config.takeProfit?.trailingStop?.deltaPercentage ?? 0)))) : "0"

  const stopLossTriggerAmount = tradingSetup.config.stopLoss != null ? MathUtils.Shorten(MathUtils.MultiplyNumbers(entryPrice, "" + (1.0 - (tradingSetup.config.stopLoss!.percentage ?? 0)))) : "0"
  
  return <div key={"trade-" + trade.id} className="trade">
    <div className="trade_section_title">Trade - {statusText} - {action}</div>
    <div className="trade_section_title">Start @ {`${new Date(trade.startTimestamp).toLocaleTimeString('en-gb', { timeStyle: 'short'})} ${new Date(trade.startTimestamp).toLocaleDateString('en-gb', { dateStyle:'short' })}`}</div>
    {!isBuying && <div className="trade_section">
      <div id={'current'} className="trade_item">
        <AttachMoney style={{color}}/>
        <span className="trade_item_name" style={{color}}>Total:</span>
        <span className="trade_item_value" style={{color}}>{profitAmount}<span>({profitPercentage}%)</span></span>
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