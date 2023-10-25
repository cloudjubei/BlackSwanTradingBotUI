import React, { useMemo } from "react"
import { AttachMoney, AttachMoneySharp, Bolt, BuildCircle, CurrencyBitcoin, CurrencyExchange, Dangerous, Error, LocalAtm, Money, Paid, Timeline, TripOrigin } from '@mui/icons-material'
import { TradingSetupModel, TradingSetupStatusType, TradingTransactionModel } from "../src/api/gen"
import MathUtils from "../src/commons/lib/mathUtils"
import { Button } from "@mui/material"

interface Props {
  tradingSetup: TradingSetupModel,
  clickConfig: (setup: TradingSetupModel) => void
}

export const TradingSetupInfo = ({ tradingSetup, clickConfig }: Props) =>
{
  const startingAmount = MathUtils.AddNumbers(tradingSetup.startingSecondAmount, (MathUtils.MultiplyNumbers(tradingSetup.currentPriceAmount, tradingSetup.startingFirstAmount)))
  const currentAmount = MathUtils.Shorten(MathUtils.AddNumbers(tradingSetup.secondAmount, (MathUtils.MultiplyNumbers(tradingSetup.currentPriceAmount, tradingSetup.firstAmount))), 2)
  const profitAmount = MathUtils.Shorten(MathUtils.SubtractNumbers(currentAmount, startingAmount), 2)
  const profitPercentage = MathUtils.Shorten(MathUtils.DivideNumbers(profitAmount, startingAmount), 3)
  const color = MathUtils.IsZero(profitAmount) ? "Black" : MathUtils.IsBiggerThanZero(profitAmount) ? "Green" : "Red"
 
  const openTransactions = tradingSetup.openTransactions as { [id: string] : TradingTransactionModel }
  const hasOpenTransaction = Object.keys(openTransactions).length > 0
  const openTransaction = hasOpenTransaction ? openTransactions[Object.keys(openTransactions)[0]] : null
  const hasPendingTransaction = hasOpenTransaction && !openTransaction!.complete

  const buyTransactions = tradingSetup.transactions.filter(t => t.complete && !t.canceled && t.buy && MathUtils.IsBiggerThanZero(t.firstAmount))
  const sellTransactions = tradingSetup.transactions.filter(t => t.complete && !t.canceled && !t.buy && MathUtils.IsBiggerThanZero(t.firstAmount))
  const cancelledTransactions = tradingSetup.transactions.filter(t => t.complete && t.canceled && MathUtils.IsBiggerThanZero(t.firstAmount))

  const hasRunningTrade = MathUtils.IsGreaterThan(tradingSetup.firstAmount, "0.001")
  // const hasTrade = transactions.length > 0 
  // const lastTrade = hasTrade ? transactions[transactions.length-1] : null
  // const hasRunningTrade = hasTrade && lastTrade!.buy && MathUtils.IsBiggerThanZero(lastTrade!.firstAmount) && MathUtils.IsBiggerThanZero(tradingSetup.currentPriceAmount)
  const tradeEntryPrice = hasRunningTrade ? tradingSetup.tradeEntryPriceAmount : "0"
  const tradeStartAmount = hasRunningTrade ?  MathUtils.MultiplyNumbers(tradingSetup.firstAmount, tradeEntryPrice) : "0" //MathUtils.Shorten(MathUtils.AddNumbers(lastTrade!.secondAmount, MathUtils.MultiplyNumbers(lastTrade!.priceAmount, lastTrade!.firstAmount))) : "0"
  const tradeCurrentAmount = hasRunningTrade ? MathUtils.MultiplyNumbers(tradingSetup.firstAmount, tradingSetup.currentPriceAmount) : "0"
  const tradeProfitAmount = MathUtils.Shorten(MathUtils.SubtractNumbers(tradeCurrentAmount, tradeStartAmount), 2)
  const tradeProfitPercentage = MathUtils.Shorten(MathUtils.DivideNumbers(tradeProfitAmount, tradeStartAmount), 3)
  const tradeColor = MathUtils.IsZero(tradeProfitAmount) ? "Black" : MathUtils.IsBiggerThanZero(tradeProfitAmount) ? "Green" : "Red"

  const takeProfitTriggerAmount = hasRunningTrade ? MathUtils.MultiplyNumbers(tradingSetup.tradeEntryPriceAmount, "" + (1.0 + (tradingSetup.config.takeProfit?.percentage ?? 0))) : "0"
  const hasTrailingTP = hasRunningTrade ? tradingSetup.config.takeProfit?.trailingStop !== undefined : false
  const isTrailingTPActivated = hasTrailingTP ? MathUtils.IsGreaterThanOrEqualTo(tradingSetup.tradeHighestPriceAmount, takeProfitTriggerAmount) : false
  const trailingTPActivation = isTrailingTPActivated ? MathUtils.MultiplyNumbers(tradingSetup.tradeHighestPriceAmount, "" + (1.0 - (tradingSetup.config.takeProfit?.trailingStop?.deltaPercentage ?? 0))) : "0"

  return <article key={"info-" + tradingSetup.id} className="section">
    <header>
      {tradingSetup.status == TradingSetupStatusType.Initial && <TripOrigin className="icon"/>}
      {tradingSetup.status == TradingSetupStatusType.Running && <Bolt className="icon" color="success"/>}
      {tradingSetup.status == TradingSetupStatusType.Terminated && <Dangerous className="icon" color="error"/>}
			<Button className="button_config" onClick={() => clickConfig(tradingSetup)}><BuildCircle color="action"/></Button>
      <h1 className="title">
        <span className="title__top">{tradingSetup.config.firstToken + " / " + tradingSetup.config.secondToken + "  |  " + tradingSetup.config.interval}</span>
        <span className="title__bottom">{tradingSetup.id}</span>
        <span className="title__bottom">{tradingSetup.config.signal}</span>
      </h1>
    </header>
    <main className="section__items">
      <article id={'price'} className={`section__item`}>
        <AttachMoney style={{color:"Blue"}}/>
        <span className="section__item__name" style={{color:"Blue"}}>Price:</span>
        <span className="section__item__value" style={{color:"Blue"}}>{tradingSetup.currentPriceAmount}</span>
      </article>
      <span className="section__header">Current</span>
      <article id={'current'} className={`section__item`}>
        <AttachMoney style={{color}}/>
        <span className="section__item__name" style={{color}}>Total:</span>
        <span className="section__item__value" style={{color}}>{currentAmount}<span>(%{profitPercentage}) {profitAmount}</span></span>
      </article>
      {hasRunningTrade && 
      <article id={'currentTrade'} className={`section__item`}>
        <AttachMoneySharp style={{color:tradeColor}}/>
        <span className="section__item__name" style={{color:tradeColor}}>Current Trade:</span>
        <span className="section__item__value" style={{color:tradeColor}}>{tradeProfitAmount} <span>(%{tradeProfitPercentage})</span></span>
      </article>}
      {hasRunningTrade && 
      <article id={'currentTradeEntry'} className={`section__item`}>
        <AttachMoneySharp/>
        <span className="section__item__name">Entry Price:</span>
        <span className="section__item__value">{tradeEntryPrice}</span>
      </article>}
      {hasRunningTrade && 
      <article id={'takeProfit'} className={`section__item`}>
        <AttachMoneySharp style={{color:"Orange"}}/>
        <span className="section__item__name" style={{color:"Orange"}}>TP Activates at:</span>
        <span className="section__item__value" style={{color:"Orange"}}>{takeProfitTriggerAmount}</span>
      </article>}
      {isTrailingTPActivated &&
      <article id={'takeProfitTrailing'} className={`section__item`}>
        <AttachMoneySharp style={{color:"Orange"}}/>
        <span className="section__item__name" style={{color:"Orange"}}>Trailing will sell at:</span>
        <span className="section__item__value" style={{color:"Orange"}}>{trailingTPActivation}</span>
      </article>}
      <span className="section__header">Tokens</span>
      <article id={'firstToken'} className={`section__item`}>
        <CurrencyBitcoin/>
        <span className="section__item__name">{tradingSetup.config.firstToken} Amount:</span>
        <span className="section__item__value">{tradingSetup.firstAmount}</span>
      </article>
      <article id={'secondToken'} className={`section__item`}>
        <Money/>
        <span className="section__item__name">{tradingSetup.config.secondToken} Amount:</span>
        <span className="section__item__value">{MathUtils.Shorten(tradingSetup.secondAmount)}</span>
      </article>
      <span className="section__header">Trades</span>
      <article id={'tradesBuy'} className={`section__item`}>
        <CurrencyExchange/>
        <span className="section__item__name">No. BUY trades:</span>
        <span className="section__item__value">{buyTransactions.length}</span>
      </article>
      <article id={'tradesSell'} className={`section__item`}>
        <CurrencyExchange/>
        <span className="section__item__name">No. SELL trades:</span>
        <span className="section__item__value">{sellTransactions.length}</span>
      </article>
      <article id={'tradesCancel'} className={`section__item`}>
        <Error/>
        <span className="section__item__name">Failed transactions:</span>
        <span className="section__item__value">{cancelledTransactions.length}</span>
      </article>
      {hasPendingTransaction && <span>Pending transaction:</span>}
      {hasPendingTransaction && <article id={'trades'} className={`section__item`}>
        <LocalAtm/>
        <span className="section__item__name">{openTransaction!.buy ? "BUY" : "SELL"}</span>
        <span className="section__item__value">FILLED {openTransaction!.firstAmount + " " + openTransaction!.firstToken}</span>
      </article>}
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
      </article>}
    </main>
  </article>
}