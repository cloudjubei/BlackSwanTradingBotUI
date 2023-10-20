import React, { useMemo } from "react"
import { AttachMoney, Lock, CurrencyBitcoin } from '@mui/icons-material'
import {  WalletModel } from "../src/api/gen"

interface Props {
  token: string
  freeAmount: string,
  lockedAmount: string
}

export const WalletsInfo = ({ token, freeAmount, lockedAmount }: Props) =>
{
  return <article key="wallets" className="section">
    <header>
      <CurrencyBitcoin className="icon"/>
      <h1 className="title">
        <span className="title__top">{token}</span>
        <span className="title__bottom">FREE | LOCKED</span>
      </h1>
    </header>
    <main className="section__items">
      {/* <article id={'current'} className={`section__item`}> */}
        <span >{freeAmount}</span>
        <span className="locked"><Lock /> {lockedAmount}</span>
        {/* <CurrencyBitcoin style={{color}}/>
        <span className="section__item__name" style={{color}}>{freeAmount} | {lockedAmount}</span> */}
        {/* <span className="section__item__value" style={{color}}>| {lockedAmount}</span> */}
      {/* </article> */}
    </main>
  </article>
}