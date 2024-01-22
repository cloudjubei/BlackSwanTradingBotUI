import React, { useMemo } from "react"
import { AccessTime, AttachMoney, AttachMoneySharp, Bolt, BuildCircle, CurrencyBitcoin, CurrencyExchange, Dangerous, Error, History, LocalAtm, Money, Paid, Sell, Timeline, TripOrigin } from '@mui/icons-material'
import { TradingSetupModel, TradingSetupStatusType, TradingSetupTradeModel, TradingSetupTradeModelStatusEnum, TradingTransactionModel } from "../src/api/gen"
import MathUtils from "../src/commons/lib/mathUtils"

interface Props {
  tradingSetup: TradingSetupModel,
  trade: TradingSetupTradeModel,
}

export const TradingSetupTradeHistoryView = ({ tradingSetup, trade }: Props) =>
{
  const status = trade.status === TradingSetupTradeModelStatusEnum.Cancelled ? "CANCELLED" : "COMPLETE"
  const statusColor = trade.status === TradingSetupTradeModelStatusEnum.Cancelled ? 'Red' : 'Green'

  const action = `${trade.currentAction.action === 0 ? 'DO NOTHING' : trade.currentAction.action > 0 ? 'BUY' : 'SELL'}`
  const actionColor = trade.currentAction.action > 0 ? 'Green' : trade.currentAction.action < 0 ? 'Red' : 'Black'
  
  if (trade.status === TradingSetupTradeModelStatusEnum.Cancelled){
    return <div key={"trade-" + trade.id} className="trade">
    <div className="trade_section_title" style={{color: statusColor}}>{status} @ {`${new Date(trade.updateTimestamp).toLocaleTimeString('en-gb', { timeStyle: 'short'})} ${new Date(trade.updateTimestamp).toLocaleDateString('en-gb', { dateStyle:'short' })}`}</div>
      <div className="trade_section_title" style={{color: statusColor}}>{trade.currentAction.type} - Wanted To Buy:</div>
      <div className="trade_section_title" style={{color: statusColor}}>{tradingSetup.config.firstToken} @ ${trade.buyTransaction.wantedPriceAmount}</div>
      <div className="trade_section_title" style={{color: statusColor}}>For {trade.startingSecondAmount} {tradingSetup.config.secondToken}</div>
    </div>
  }


  const startingPrice = trade.buyTransaction.priceAmount
  const startingFirstAmount = trade.buyTransaction.firstAmount
  const startingFirstTotal = MathUtils.MultiplyNumbers(startingFirstAmount, startingPrice)
  const startAmount = MathUtils.AddNumbers(MathUtils.MultiplyNumbers(trade.startingFirstAmount, startingPrice), trade.startingSecondAmount)
  // const startingSecondAmount = trade.buyTransaction.secondAmount //COST

  const hasSellTransactions = trade.sellTransactionsComplete.length > 0
  const finalFirstAmount = hasSellTransactions ? MathUtils.SubtractNumbers(trade.buyTransaction.firstAmount, MathUtils.AddManyNumbers(trade.sellTransactionsComplete.map(t => t.firstAmount))) : '0'
  const finalFirstAmountInSecond = hasSellTransactions ? MathUtils.MultiplyNumbers(finalFirstAmount, trade.sellTransactionsComplete[trade.sellTransactionsComplete.length-1].priceAmount) : '0'
  const finalSecondAmount = hasSellTransactions ? MathUtils.AddManyNumbers(trade.sellTransactionsComplete.map(t => t.secondAmount)) : '0'
  const finalAmount = hasSellTransactions ? MathUtils.AddNumbers(finalFirstAmountInSecond, finalSecondAmount) : '0'

  const profitAmount = MathUtils.Shorten(MathUtils.SubtractNumbers(finalAmount, startAmount), 2)
  const profitPercentage = MathUtils.Shorten(MathUtils.DivideNumbers(profitAmount, startAmount), 4)
  const color = MathUtils.IsZero(profitAmount) ? "Black" : MathUtils.IsBiggerThanZero(profitAmount) ? "Green" : "Red"

  const sellTransactions = useMemo(() => {
    if (!hasSellTransactions) { return <></> }
		return trade.sellTransactionsComplete.map(transaction => {
				return <div className="trade_section">
          <div id={'sellEntry'} className="trade_item">
            <AttachMoneySharp/>
            <span className="trade_item_name">Price:</span>
            <span className="trade_item_value">${MathUtils.Shorten(transaction.priceAmount, 3)}</span>
          </div>
          <div id={'currentTradeEntry'} className="trade_item">
            <AttachMoneySharp/>
            <span className="trade_item_name">Sold {transaction.firstAmount} {tradingSetup.config.firstToken} for:</span>
            <span className="trade_item_value"> {MathUtils.Shorten(transaction.secondAmount, 2)} {tradingSetup.config.secondToken}</span>
          </div>
        </div>
			})
  }, [trade.sellTransactionsComplete])
 
  return <div key={"trade-" + trade.id} className="trade">
    <div className="trade_section_title" style={{color: statusColor}}>{status} @ {`${new Date(trade.updateTimestamp).toLocaleTimeString('en-gb', { timeStyle: 'short'})} ${new Date(trade.updateTimestamp).toLocaleDateString('en-gb', { dateStyle:'short' })}`}</div>
    <div className="trade_section_title" style={{color: statusColor}}>Start @ {`${new Date(trade.startTimestamp).toLocaleTimeString('en-gb', { timeStyle: 'short'})} ${new Date(trade.startTimestamp).toLocaleDateString('en-gb', { dateStyle:'short' })}`}</div>
    <div className="trade_section">
      <div id={'current'} className="trade_item">
        <AttachMoney style={{color}}/>
        <span className="trade_item_name" style={{color}}>Total:</span>
        <span className="trade_item_value" style={{color}}>{profitAmount}<span>({MathUtils.MultiplyNumbers("100", profitPercentage)}%)</span></span>
      </div>
    </div>
    <div className="trade_section_title" style={{color: statusColor}}>Entry</div>
    <div className="trade_section">
      <div id={'currentTradeEntry'} className="trade_item">
        <AttachMoneySharp/>
        <span className="trade_item_name">Price:</span>
        <span className="trade_item_value">${MathUtils.Shorten(startingPrice, 3)}</span>
      </div>
      <div id={'currentTradeFirst'} className="trade_item">
        <AttachMoneySharp/>
        <span className="trade_item_name">Bought {startingFirstAmount} {tradingSetup.config.firstToken} for:</span>
        <span className="trade_item_value">{MathUtils.Shorten(startAmount, 2)} {tradingSetup.config.secondToken}</span>
      </div>
    </div>

    {hasSellTransactions && <div className="trade_section_title" style={{color: statusColor}}>Sell</div>}
    {sellTransactions}

    <div className="trade_section_title">Last Action</div>
    <div className="trade_section">
      <div id={'action'} className="trade_item">
        <AccessTime/>
        <span className="trade_item_name" style={{color: actionColor}}>{trade.currentAction.type}</span>
        <span className="trade_item_value" style={{color: actionColor}}>{action}</span>
      </div>
    </div>
    <div className="trade_section_title">Tokens Final</div>
    <div className="trade_section">
      <div id={'firstToken'} className="trade_item">
        <CurrencyBitcoin/>
        <span className="trade_item_name">{tradingSetup.config.firstToken} Amount:</span>
        <span className="trade_item_value">{MathUtils.Max("0", trade.firstAmount)}</span>
      </div>
      <div id={'secondToken'} className="trade_item">
        <Money/>
        <span className="trade_item_name">{tradingSetup.config.secondToken} Amount:</span>
        <span className="trade_item_value">{MathUtils.Shorten(MathUtils.Max("0", trade.secondAmount))}</span>
      </div>
    </div>
    <div className="trade_section_title">Tokens Start</div>
    <div className="trade_section">
      <div id={'firstToken'} className="trade_item">
        <CurrencyBitcoin/>
        <span className="trade_item_name">{tradingSetup.config.firstToken} Amount:</span>
        <span className="trade_item_value">{MathUtils.Max("0", trade.startingFirstAmount)}</span>
      </div>
      <div id={'secondToken'} className="trade_item">
        <Money/>
        <span className="trade_item_name">{tradingSetup.config.secondToken} Amount:</span>
        <span className="trade_item_value">{MathUtils.Shorten(MathUtils.Max("0", trade.startingSecondAmount))}</span>
      </div>
    </div>
      {/* {hasPendingSell && <span>Pending Sell transaction:</span>}
      {hasPendingSell && <div id={'sell_transactions'} className={`section__item`}>
        <LocalAtm/>
        <span className="section__item__name">{openTransaction!.buy ? "BUY" : "SELL"}</span>
        <span className="section__item__value">FILLED {openTransaction!.firstAmount + " " + openTransaction!.firstToken}</span>
      </div>}
      {hasPendingTransaction && <article id={'trades'} className={`section__item`}>
        <LocalAtm/>
        <span className="section__item__name">For</span>
        <span className="section__item__value">{openTransaction!.buy ? openTransaction!.secondAmount + " " + openTransaction!.secondToken : ""}</span>
      </article>}
      {hasPendingTransaction && <article id={'trades'} className={`section__item`}>
        <LocalAtm/>
        <span className="section__item__name">Price</span>
        <span className="section__item__value">{openTransaction!.wantedPriceAmount}</span>
      </article>}
      {hasPendingTransaction && <article id={'trades'} className={`section__item`}>
        <Timeline/>
        <span className="section__item__name">Initiated at</span>
        <span className="section__item__value">{(new Date(openTransaction!.firstUpdateTimestamp)).toDateString()}</span>
      </article>} */}
  </div>
}