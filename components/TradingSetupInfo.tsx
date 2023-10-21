import React, { useMemo } from "react"
import { AttachMoney, Bolt, BuildCircle, CurrencyBitcoin, CurrencyExchange, Dangerous, LocalAtm, Money, Paid, TripOrigin } from '@mui/icons-material'
import { TradingSetupModel, TradingSetupStatusType } from "../src/api/gen"
import MathUtils from "../src/commons/lib/mathUtils"
import { Button } from "@mui/material"

interface Props {
  tradingSetup: TradingSetupModel,
  clickConfig: (setup: TradingSetupModel) => void
}

export const TradingSetupInfo = ({ tradingSetup, clickConfig }: Props) =>
{
  const startingAmount = MathUtils.AddNumbers(tradingSetup.startingSecondAmount, (MathUtils.MultiplyNumbers(tradingSetup.currentPriceAmount, tradingSetup.startingFirstAmount)))
  const currentAmount = MathUtils.AddNumbers(tradingSetup.secondAmount, (MathUtils.MultiplyNumbers(tradingSetup.currentPriceAmount, tradingSetup.firstAmount)))
  const profitAmount = MathUtils.SubtractNumbers(currentAmount, startingAmount)
  const isZero = MathUtils.IsZero(profitAmount)
  const isPositiveProfit = MathUtils.IsBiggerThanZero(profitAmount)

  const color = isZero ? "Black" : isPositiveProfit ? "Green" : "Red"

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
      <article id={'current'} className={`section__item`}>
        <AttachMoney style={{color}}/>
        <span className="section__item__name" style={{color}}>Current:</span>
        <span className="section__item__value" style={{color}}>{currentAmount}</span>
      </article>
      <article id={'profit'} className={`section__item`}>
        <Paid style={{color}}/>
        <span className="section__item__name" style={{color}}>Profit:</span>
        <span className="section__item__value" style={{color}}>{profitAmount}</span>
      </article>
      <article id={'firstToken'} className={`section__item`}>
        <CurrencyBitcoin/>
        <span className="section__item__name">{tradingSetup.config.firstToken} Amount:</span>
        <span className="section__item__value">{tradingSetup.firstAmount}</span>
      </article>
      <article id={'secondToken'} className={`section__item`}>
        <Money/>
        <span className="section__item__name">{tradingSetup.config.secondToken} Amount:</span>
        <span className="section__item__value">{tradingSetup.secondAmount}</span>
      </article>
      <article id={'trades'} className={`section__item`}>
        <CurrencyExchange/>
        <span className="section__item__name">No. trades:</span>
        <span className="section__item__value">{tradingSetup.transactions.length}</span>
      </article>
      <article id={'trades'} className={`section__item`}>
        <LocalAtm/>
        <span className="section__item__name">Pending trades:</span>
        <span className="section__item__value">{Object.keys(tradingSetup.openTransactions).length}</span>
      </article>
    </main>
  </article>
}