import React, { useMemo } from "react"
import { AirplaneTicket, AttachMoney, AttachMoneySharp, Bolt, BuildCircle, CurrencyBitcoin, CurrencyExchange, Dangerous, Done, Error, History, LocalAtm, Money, Paid, Sell, Timeline, TripOrigin } from '@mui/icons-material'
import { TradingSetupModel, TradingSetupStatusType, TradingSetupTradeModelStatusEnum, TradingTransactionModel } from "../src/api/gen"
import MathUtils from "../src/commons/lib/mathUtils"
import { Button } from "@mui/material"
import { TradingSetupTradeView } from "./TradingSetupTradeView"

interface Props {
  tradingSetup: TradingSetupModel,
  clickConfig: (setup: TradingSetupModel) => void
	onForceBuy: (tradingSetup: TradingSetupModel) => void
	onForceSell: (tradingSetup: TradingSetupModel) => void
  onHistory: (tradingSetup: TradingSetupModel) => void
}

export const TradingSetupInfo = ({ tradingSetup, clickConfig, onForceBuy, onForceSell, onHistory }: Props) =>
{
  const startingAmount = MathUtils.AddNumbers(tradingSetup.startingSecondAmount, (MathUtils.MultiplyNumbers(tradingSetup.currentPriceAmount, tradingSetup.startingFirstAmount)))
  const currentAmount = MathUtils.AddNumbers(tradingSetup.secondAmount, MathUtils.MultiplyNumbers(tradingSetup.currentPriceAmount, tradingSetup.firstAmount))
  const profitAmount = MathUtils.Shorten(MathUtils.SubtractNumbers(currentAmount, startingAmount), 2)
  const profitPercentage = MathUtils.Shorten(MathUtils.DivideNumbers(profitAmount, startingAmount), 3)
  const color = MathUtils.IsZero(profitAmount) ? "Black" : MathUtils.IsBiggerThanZero(profitAmount) ? "Green" : "Red"
 
  const openTransactionViews = useMemo(() => {
    return <div className='trades_open'>
        {(tradingSetup.openTrades.map(trade => {
            return <TradingSetupTradeView key={trade.id} tradingSetup={tradingSetup} trade={trade}/>
        }))}
    </div>
  }, [tradingSetup.openTrades])

  const finishedTransactionView = useMemo(() => {
    return <article id={'trades_closed'} className={`section__item`} onClick={() => onHistory(tradingSetup)}>
        <Done/>
        <span className="section__item__name">Finished transactions:</span>
        <span className="section__item__value">{tradingSetup.finishedTrades.filter(t => t.status === TradingSetupTradeModelStatusEnum.Complete).length} <History/></span>
      </article>
  }, [tradingSetup.finishedTrades])
  const cancelledTransactionView = useMemo(() => {
    return <article id={'trades_cancelled'} className={`section__item`} onClick={() => onHistory(tradingSetup)}>
        <Error/>
        <span className="section__item__name">Cancelled transactions:</span>
        <span className="section__item__value">{tradingSetup.finishedTrades.filter(t => t.status === TradingSetupTradeModelStatusEnum.Cancelled).length} <History/></span>
      </article>
  }, [tradingSetup.finishedTrades])

  return <article key={"info-" + tradingSetup.id} className="section">
    <header>
      {tradingSetup.status == TradingSetupStatusType.Initial && <TripOrigin className="icon"/>}
      {tradingSetup.status == TradingSetupStatusType.Running && <Bolt className="icon" color="success"/>}
      {tradingSetup.status == TradingSetupStatusType.Terminated && <Dangerous className="icon" color="error"/>}
      <div className="buttons_container">
        <Button className="button_config" onClick={() => clickConfig(tradingSetup)}><BuildCircle color="action"/></Button>
        <Button className="button_buy" onClick={() => onForceBuy(tradingSetup)}>BUY</Button>
        <Button className="button_sell" onClick={() => onForceSell(tradingSetup)} color="error">SELL</Button>
      </div>
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
        <span className="section__item__value" style={{color:"Blue"}}>{MathUtils.Shorten(tradingSetup.currentPriceAmount, 2)}</span>
      </article>
      <span className="section__header">Current</span>
      <article id={'current'} className={`section__item`}>
        <AttachMoney style={{color}}/>
        <span className="section__item__name" style={{color}}>Total:</span>
        <span className="section__item__value" style={{color}}>{MathUtils.Shorten(currentAmount, 2)}<span>({profitPercentage}%) {profitAmount}</span></span>
      </article>

      {openTransactionViews}
      
      {finishedTransactionView}
      {cancelledTransactionView}

      <article id={'tradesFailedMarketMaking'} className={`section__item`}>
        <Error/>
        <span className="section__item__name">Market Making failed:</span>
        <span className="section__item__value">{tradingSetup.failedDueToMarketMaking}</span>
      </article>

      <span className="section__header">Tokens</span>
      <article id={'firstToken'} className={`section__item`}>
        <CurrencyBitcoin/>
        <span className="section__item__name">{tradingSetup.config.firstToken} Amount:</span>
        <span className="section__item__value">{tradingSetup.firstAmount}</span>
      </article>
      <article id={'secondToken'} className={`section__item`}>
        <Money/>
        <span className="section__item__name">{tradingSetup.config.secondToken} Amount:</span>
        <span className="section__item__value">{MathUtils.Shorten(tradingSetup.secondAmount, 2)}</span>
      </article>
    </main>
  </article>
}