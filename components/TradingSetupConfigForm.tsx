import React from 'react'
import { Cancel, DeleteForever, Save } from '@mui/icons-material'
import { Button, Checkbox, FormControl, FormControlLabel, TextField } from '@mui/material'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { TextInput } from './Input/TextInput'
import { TradingSetupConfigModel, TradingSetupModel, TradingStopLossConfigModel, TradingTakeProfitConfigModel, TradingTakeProfitTrailingStopConfigModel } from '../src/api/gen'

export interface TradingSetupConfigFormData
{
	id: string
    startingFirstAmount: number
    startingSecondAmount: number
    firstToken: string
    secondToken: string
    interval: string
    signal: string

    terminationPercentageLoss?: number

    useTakeProfit: boolean
    takeProfitPercentage?: number
    useTrailingTakeProfit: boolean,
    takeProfitTrailingDeltaPercentage?: number,
    takeProfitTrailingHardLimitPercentage?: number,

    useStopLoss: boolean
    stopLossPercentage?: number,

    use_LimitOrders: boolean
    limitOrderBuyOffset: number
    limitOrderSellOffset: number
    limitOrderCancelDueToChecksElapsed: number
    limitOrderCancelDueToTimeElapsed?: number
    limitOrderCancelDueToPriceDivergence?: string
}

export type Props = {
    tradingSetup?: TradingSetupModel
	onCreate: (id: string, startingFirstAmount: string, startingSecondAmount: string, tradingSetup: TradingSetupConfigModel) => void
	onDelete: (tradingSetup: TradingSetupModel) => void
}

const Page: React.FC<Props> = ({ tradingSetup, onCreate, onDelete }: Props) => {
    const onSubmit = (formData: TradingSetupConfigFormData) => {
        onCreate(
            formData.id,
            "" + formData.startingFirstAmount,
            "" + formData.startingSecondAmount,
            {
            ...formData,

            terminationPercentageLoss: formData.terminationPercentageLoss ?? 0 > 0 ? formData.terminationPercentageLoss : undefined,

            takeProfit: formData.useTakeProfit ? {
                percentage: formData.takeProfitPercentage,
                trailingStop: formData.useTrailingTakeProfit ? {
                    deltaPercentage: formData.takeProfitTrailingDeltaPercentage,
                    hardLimitPercentage: formData.takeProfitTrailingHardLimitPercentage,
                } as TradingTakeProfitTrailingStopConfigModel : undefined
            } as TradingTakeProfitConfigModel : undefined,

            stopLoss: formData.useStopLoss ? {
                percentage: formData.stopLossPercentage,
            } as TradingStopLossConfigModel : undefined,

			useLimitOrders: formData.use_LimitOrders,
            limitOrderCancelDueToTimeElapsed: formData.limitOrderCancelDueToTimeElapsed ?? 0 > 0 ? formData.limitOrderCancelDueToTimeElapsed : undefined,
            limitOrderCancelDueToPriceDivergence: formData.limitOrderCancelDueToPriceDivergence ?? 0 > 0 ? "" + formData.limitOrderCancelDueToPriceDivergence : undefined,
        })
    }

    const isViewOnly = tradingSetup !== undefined && tradingSetup !== null
	const formMethods = useForm<TradingSetupConfigFormData>({
		defaultValues: {
            id: tradingSetup?.id,
            startingFirstAmount: parseFloat(tradingSetup?.startingFirstAmount ?? "0"),
            startingSecondAmount: parseFloat(tradingSetup?.startingSecondAmount ?? "0"),
            firstToken: "BTC",
            secondToken: "FDUSD",
            interval: "1m",
            signal: "bollingerLowWithRSI30Oversold",

            terminationPercentageLoss: undefined,

            useTakeProfit: tradingSetup?.config.takeProfit !== undefined,
            takeProfitPercentage: tradingSetup?.config.takeProfit?.percentage,
            useTrailingTakeProfit: tradingSetup?.config.takeProfit?.trailingStop !== undefined,
            takeProfitTrailingDeltaPercentage: tradingSetup?.config.takeProfit?.trailingStop?.deltaPercentage,
            takeProfitTrailingHardLimitPercentage: tradingSetup?.config.takeProfit?.trailingStop?.hardLimitPercentage,

            useStopLoss: tradingSetup?.config.stopLoss !== undefined,
            stopLossPercentage: tradingSetup?.config.stopLoss?.percentage,

            use_LimitOrders: tradingSetup?.config.useLimitOrders,
            limitOrderBuyOffset: 0,
            limitOrderSellOffset: 0,
            limitOrderCancelDueToChecksElapsed: 60,
            limitOrderCancelDueToTimeElapsed:  undefined,
            limitOrderCancelDueToPriceDivergence: undefined,
            ...tradingSetup?.config,
		},
	})
	const useTakeProfit = formMethods.watch('useTakeProfit')
	const useTrailingTakeProfit = formMethods.watch('useTrailingTakeProfit')
	const useStopLoss = formMethods.watch('useStopLoss')
	const useLimitOrders = formMethods.watch('use_LimitOrders')

	return (
		<FormProvider {...formMethods}>
			<FormControl fullWidth id='trading-setup-config-form' component='form' onSubmit={formMethods.handleSubmit(onSubmit)}>
				
				<div className='input-group'>
					<TextInput
						id='id-input'
						formField='id'
						formValidation={{ required: { value: true, message: 'A setup name is required!'} }}
						label='Name of the setup'
						disabled={isViewOnly}
					/>
					<TextInput
						id='signal-input'
						formField='signal'
						formValidation={{ required: { value: true, message: 'A signal id is required!'} }}
						label='ID of the signal'
						disabled={isViewOnly}
					/>
				</div>
				<div className='input-group'>
					<TextInput
						id='firstToken-input'
						formField='firstToken'
						placeholder='BTC | ETH | XRP'
						formValidation={{ required: { value: true, message: 'A first token is required!'} }}
						label={'Name of first token'}
						disabled={isViewOnly}
					/>
					<TextInput
						id='secondToken-input'
						formField='secondToken'
						placeholder='FDUSD | USDT'
						formValidation={{ required: { value: true, message: 'A second token is required!'} }}
						label={'Name of second token'}
						disabled={isViewOnly}
					/>
				</div>
				<div className='input-group'>
					<TextInput
						id='startingFirstAmount-input'
						formField='startingFirstAmount'
						formValidation={{ required: true, min: 0.0, valueAsNumber: true }}
						placeholder='First token start amount'
						label={'Start amount of ' + (tradingSetup?.config.firstToken ?? "first token")}
						disabled={isViewOnly}
					/>
					<TextInput
						id='startingSecondAmount-input'
						formField='startingSecondAmount'
						formValidation={{ required: true, min: 0.0, valueAsNumber: true }}
						placeholder='Second token start amount'
						label={'Start amount of ' + (tradingSetup?.config.secondToken ?? "second token")}
						disabled={isViewOnly}
					/>
				</div>
				<div className='input-group'>
					<TextInput
						id='interval-input'
						formField='interval'
						placeholder='1s'
						formValidation={{ required: { value: true, message: 'An interval is required!'} }}
						label={'Interval'}
						helperText='1s | 1m | 5m | 15m | 1h | 1d'
						disabled={isViewOnly}
					/>

					<TextInput
						id='terminationPercentageLoss-input'
						formField='terminationPercentageLoss'
						formValidation={{ min: 0.0, valueAsNumber: true }}
						placeholder='%15 == 0.15'
						label='Termination % loss'
						helperText='% amount when setup is terminated'
						disabled={isViewOnly}
					/>
				</div>

				<div className='input-group'>
                	<FormControlLabel control={<Checkbox />} label='Use Take Profit' onChange={(_, checked) => formMethods.setValue('useTakeProfit', checked)}/>
				</div>
				{useTakeProfit && <div className='input-group'>
					<TextInput
						id='takeProfitPercentage-input'
						formField='takeProfitPercentage'
						formValidation={{ required: useTakeProfit, min: 0.01, valueAsNumber: true }}
						placeholder='%15 == 0.15'
						label='TP Trigger %'
						helperText={useTrailingTakeProfit ?'Starts Trailing once amount goes over this threshold' : 'Sell once amount goes over this threshold'}
						disabled={isViewOnly}
					/>
				</div>}
                {useTakeProfit && 
				<div className='input-group'>
					<FormControlLabel control={<Checkbox />} label='Use Trailing TP' checked={useTrailingTakeProfit} onChange={(_, checked) => formMethods.setValue('useTrailingTakeProfit', checked)}/>
				</div>}
				{useTakeProfit && useTrailingTakeProfit && 
				<div className='input-group'>
					<TextInput
						id='takeProfitTrailingDeltaPercentage-input'
						formField='takeProfitTrailingDeltaPercentage'
						formValidation={{ required: useTakeProfit && useTrailingTakeProfit, min: 0.01, valueAsNumber: true }}
						placeholder='%15 == 0.15'
						label='Trailing Trigger %'
						helperText='Bot sells once amount falls below this threshold since highest achieved'
						disabled={isViewOnly}
					/>
					<TextInput
						id='takeProfitTrailingHardLimitPercentage-input'
						formField='takeProfitTrailingHardLimitPercentage'
						formValidation={{ min: 0.01, valueAsNumber: true }}
						placeholder='%15 == 0.15'
						label='(Optional) Hard limit'
						helperText='Threshold to sell once reached desired profit % (similar to original TP)'
						disabled={isViewOnly}
					/>
				</div>}

				<div className='input-group'>
                	<FormControlLabel control={<Checkbox />} label='Use Stop Loss' checked={useStopLoss} onChange={(_, checked) => formMethods.setValue('useStopLoss', checked)}/>
				</div>
				{useStopLoss && <div className='input-group'>
					<TextInput
						id='stopLossPercentage-input'
						formField='stopLossPercentage'
						formValidation={{ required: useStopLoss, min: 0.01, valueAsNumber: true }}
						placeholder='%15 == 0.15'
						label='Percentage to trigger Stop Loss'
						disabled={isViewOnly}
					/>
				</div>}

				<div className='input-group'>
                	<FormControlLabel control={<Checkbox />} label='Use Limit Orders' checked={useLimitOrders} onChange={(_, checked) => formMethods.setValue('use_LimitOrders', checked)}/>
				</div>
				{useLimitOrders && <div className='input-group'>
					<TextInput
						id='limitOrderBuyOffset-input'
						formField='limitOrderBuyOffset'
						formValidation={{ required: true, valueAsNumber: true }}
						label='Offset % from buy amount'
						helperText='E.g. 0.1, means the limit order sets the price 10% higher than current'
						disabled={isViewOnly}
					/>
					<TextInput
						id='limitOrderSellOffset-input'
						formField='limitOrderSellOffset'
						formValidation={{ required: true, valueAsNumber: true }}
						label='Offset % from sell amount'
						helperText='E.g. -0.1, means the limit order sets the price 10% lower than current'
						disabled={isViewOnly}
					/>
				</div>}
				{useLimitOrders && <div className='input-group'>
					<TextInput
						id='limitOrderCancelDueToChecksElapsed-input'
						formField='limitOrderCancelDueToChecksElapsed'
						formValidation={{ required: true, min: 1, max: 10000, valueAsNumber: true }}
						label='Ticks to cancel'
						helperText='1 tick is roughly 1 second, but it could be more'
						disabled={isViewOnly}
					/>
					<TextInput
						id='limitOrderCancelDueToTimeElapsed-input'
						formField='limitOrderCancelDueToTimeElapsed'
						formValidation={{ min: 0.0, valueAsNumber: true }}
						label='Time in seconds to cancel'
						helperText='e.g. 3600 == 1 hour'
						disabled={isViewOnly}
					/>
					<TextInput
						id='limitOrderCancelDueToPriceDivergence-input'
						formField='limitOrderCancelDueToPriceDivergence'
						formValidation={{ min: 0.0, valueAsNumber: true }}
						label='Price difference to cancel'
						helperText='e.g. 50, means that if current price changes by 50 - order is canceled'
						disabled={isViewOnly}
					/>
				</div>}
			
				<div className='input-group'>
					{!isViewOnly && <Button startIcon={<Save />} type='submit' variant='contained' style={{ marginRight: '5px' }}>
						Create Setup
					</Button>}
					{isViewOnly && <Button startIcon={<DeleteForever />} variant='contained' style={{ marginRight: '5px' }} color='error' onClick={() => onDelete(tradingSetup)}>
						Delete Setup
					</Button>}
				</div>
			</FormControl>
		</FormProvider>
	)
}

export default Page