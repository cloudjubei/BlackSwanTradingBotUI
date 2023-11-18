import React, { useMemo } from 'react'
import { TradingSetupModel } from '../src/api/gen'
import { TradingSetupTradeHistoryView } from './TradingSetupTradeHistoryView'

export type Props = {
    tradingSetup: TradingSetupModel
}

const Page: React.FC<Props> = ({ tradingSetup }: Props) => {

	const transactions = useMemo(() => {
		return tradingSetup.finishedTrades.map(trade => {
				return <TradingSetupTradeHistoryView key={trade.id} tradingSetup={tradingSetup} trade={trade}/>
			})
	  }, [tradingSetup.finishedTrades])

	return (
		<div className='trade-history'>
			{transactions}
		</div>
	)
}

export default Page