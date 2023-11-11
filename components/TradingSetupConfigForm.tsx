import React, { useEffect, useMemo } from 'react'
import { AttachMoney, Cancel, DeleteForever, Save, Sell } from '@mui/icons-material'
import { Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { TextInput } from './Input/TextInput'
import { TradingSetupConfigModel, TradingSetupModel, TradingStopLossConfigModel, TradingTakeProfitConfigModel, TradingTakeProfitTrailingStopConfigModel } from '../src/api/gen'
import MathUtils from '../src/commons/lib/mathUtils'

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
    use_LimitMakerOrders: boolean
    limitOrderBuyOffset: number
    limitOrderSellOffset: number
    limitOrderCancelDueToChecksElapsed: number
    limitOrderCancelDueToTimeElapsed?: number
    limitOrderCancelDueToPriceDivergence?: string

	isMarginAccount: boolean
}

export type Props = {
    tradingSetup?: TradingSetupModel
	prices: {[tokenPair: string] : string}
	availableSignals: string[]
	availableIntervals: string[]
	onCreate: (id: string, startingFirstAmount: string, startingSecondAmount: string, tradingSetup: TradingSetupConfigModel) => void
	onSave: (tradingSetup: TradingSetupModel, config: TradingSetupConfigModel) => void
	onDelete: (tradingSetup: TradingSetupModel) => void
}

const Page: React.FC<Props> = ({ tradingSetup, prices, availableSignals, availableIntervals, onCreate, onSave, onDelete }: Props) => {
    const onSubmit = (formData: TradingSetupConfigFormData) => {
		if (isViewOnly){
			onSave(tradingSetup!!,
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
					useLimitMakerOrders: formData.use_LimitMakerOrders,
					limitOrderCancelDueToTimeElapsed: formData.limitOrderCancelDueToTimeElapsed ?? 0 > 0 ? formData.limitOrderCancelDueToTimeElapsed : undefined,
					limitOrderCancelDueToPriceDivergence: formData.limitOrderCancelDueToPriceDivergence ?? 0 > 0 ? "" + formData.limitOrderCancelDueToPriceDivergence : undefined
				})
			return
		}
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
			useLimitMakerOrders: formData.use_LimitMakerOrders,
            limitOrderCancelDueToTimeElapsed: formData.limitOrderCancelDueToTimeElapsed ?? 0 > 0 ? formData.limitOrderCancelDueToTimeElapsed : undefined,
            limitOrderCancelDueToPriceDivergence: formData.limitOrderCancelDueToPriceDivergence ?? 0 > 0 ? "" + formData.limitOrderCancelDueToPriceDivergence : undefined,
        })
    }

    const isViewOnly = tradingSetup !== undefined && tradingSetup !== null
	const formMethods = useForm<TradingSetupConfigFormData>({
		defaultValues: {
            startingFirstAmount: 0,
            startingSecondAmount: 0,
            firstToken: "BTC",
            secondToken: "FDUSD",
            interval: "1m",
            signal: "bollingerLowWithRSI30Oversold",

			useTakeProfit: true,
			useStopLoss: false,
			useTrailingTakeProfit: false,
            use_LimitOrders: true,
			use_LimitMakerOrders: false,
            limitOrderBuyOffset: 0,
            limitOrderSellOffset: 0,
            limitOrderCancelDueToChecksElapsed: 60,
            limitOrderCancelDueToTimeElapsed:  undefined,
            limitOrderCancelDueToPriceDivergence: undefined,

			isMarginAccount: false
		},
	})

	const signal = formMethods.watch('signal')
	const interval = formMethods.watch('interval')
	const firstToken = formMethods.watch('firstToken')
	const secondToken = formMethods.watch('secondToken')
	const tokenPair = firstToken + secondToken
	const currentPriceAmount = prices[tokenPair]
	const useTakeProfit = formMethods.watch('useTakeProfit')
	const useTrailingTakeProfit = formMethods.watch('useTrailingTakeProfit')
	const useStopLoss = formMethods.watch('useStopLoss')
	const useLimitOrders = formMethods.watch('use_LimitOrders')
	const useLimitMakerOrders = formMethods.watch('use_LimitMakerOrders')
	const startingSecondAmount = formMethods.watch('startingSecondAmount')
	const takeProfitPercentage = formMethods.watch('takeProfitPercentage')
	const takeProfitTrailingDeltaPercentage = formMethods.watch('takeProfitTrailingDeltaPercentage')
	const isMarginAccount = formMethods.watch('isMarginAccount')

	const takeProfitPercentageInput = useMemo(() => {
		if (!useTakeProfit) { return <></>}
		const takeProfitAmount = MathUtils.Shorten("" + (startingSecondAmount ?? 0) * (takeProfitPercentage ?? 0), 2)
		const label = 'TP Trigger %' + (useTakeProfit ? " - $" + takeProfitAmount : "")

		const triggerAmount = MathUtils.Shorten(MathUtils.MultiplyNumbers(currentPriceAmount, "" + (1.0 + (takeProfitPercentage ?? 0))), 2)
		const triggerDiffAmount = MathUtils.Shorten(MathUtils.SubtractNumbers(triggerAmount, currentPriceAmount), 2)
		const helperText = "Price needs to increase by $" + triggerDiffAmount + " (hitting $" + triggerAmount + ") to activate"

		return <div className='input-group'>
			<TextInput
				className='input-item'
				id='takeProfitPercentage-input'
				formField='takeProfitPercentage'
				formValidation={{ required: useTakeProfit, min: 0.000001, valueAsNumber: true }}
				placeholder='%15 == 0.15'
				label={label}
				helperText={helperText}
			/>
		</div>
	}, [useTakeProfit, startingSecondAmount, currentPriceAmount, takeProfitPercentage])

	const trailingTakeProfitPercentageInput = useMemo(() => {
		if (!useTakeProfit || !useTrailingTakeProfit) { return <></>}

		const triggerPercentage = (takeProfitPercentage ?? 0) - (takeProfitTrailingDeltaPercentage ?? 0)

		const takeProfitAmount = MathUtils.Shorten("" + ((startingSecondAmount ?? 0) * triggerPercentage), 2)
		const label = "Trailing Trigger % - $" + takeProfitAmount

		const tpTriggerAmount = MathUtils.Shorten(MathUtils.MultiplyNumbers(currentPriceAmount, "" + (1.0 + (takeProfitPercentage ?? 0))), 2)
		const triggerAmount = MathUtils.MultiplyNumbers(tpTriggerAmount, "" + (1.0 - (takeProfitTrailingDeltaPercentage ?? 0)))
		const triggerDiffAmount = MathUtils.SubtractNumbers(tpTriggerAmount, triggerAmount)
		const helperText = "Price needs to fall by $" + triggerDiffAmount + " (hitting $" + triggerAmount + ") to activate"

		return <TextInput
			className='input-item'
			id='takeProfitTrailingDeltaPercentage-input'
			formField='takeProfitTrailingDeltaPercentage'
			formValidation={{ required: useTakeProfit && useTrailingTakeProfit, min: 0.000001, valueAsNumber: true }}
			placeholder='%15 == 0.15'
			label={label}
			helperText={helperText}
		/>
	}, [startingSecondAmount, useTakeProfit, useTrailingTakeProfit, currentPriceAmount, takeProfitPercentage, takeProfitTrailingDeltaPercentage])

	const signalIdItems = useMemo(() => {
		return (availableSignals.map(signal => {
			return <MenuItem key={signal} value={signal}>{signal}</MenuItem>
		}))
	}, [availableSignals])
	const intervalItems = useMemo(() => {
		return (availableIntervals.map(interval => {
			return <MenuItem key={interval} value={interval}>{interval}</MenuItem>
		}))
	}, [availableIntervals])



	useEffect(() => {
		if (tradingSetup){
			formMethods.reset({
				id: tradingSetup!.id,
				startingFirstAmount: parseFloat(tradingSetup!.startingFirstAmount),
				startingSecondAmount: parseFloat(tradingSetup!.startingSecondAmount),

				useTakeProfit: tradingSetup!.config.takeProfit !== undefined,
				takeProfitPercentage: tradingSetup!.config.takeProfit?.percentage,
				useTrailingTakeProfit: tradingSetup!.config.takeProfit?.trailingStop !== undefined,
				takeProfitTrailingDeltaPercentage: tradingSetup!.config.takeProfit?.trailingStop?.deltaPercentage,
				takeProfitTrailingHardLimitPercentage: tradingSetup!.config.takeProfit?.trailingStop?.hardLimitPercentage,

				useStopLoss: tradingSetup!.config.stopLoss !== undefined,
				stopLossPercentage: tradingSetup!.config.stopLoss?.percentage,

				use_LimitOrders: tradingSetup!.config.useLimitOrders,
				use_LimitMakerOrders: tradingSetup!.config.userLimitMakerOrders,

				...tradingSetup?.config,
			})
		}
	 }, [formMethods, tradingSetup])

	return (
		<FormProvider {...formMethods}>
			<FormControl fullWidth id='trading-setup-config-form' component='form' onSubmit={formMethods.handleSubmit(onSubmit)}>
				
				<div className='input-group'>
					<TextInput
						className='input-item'
						id='id-input'
						formField='id'
						formValidation={{ required: { value: true, message: 'A setup name is required!'} }}
						label='Name of the setup'
						disabled={isViewOnly}
					/>
					<TextField
						className='input-item'
						id='signal-input'
						{...formMethods.register('signal', {
							required: 'A signal id is required!',
						})}
						select
						value={signal}
						label="ID of the signal"
						disabled={isViewOnly}
						>
						{signalIdItems}
					</TextField>
				</div>
				<div className='input-group'>
					<TextInput
						className='input-item'
						id='firstToken-input'
						formField='firstToken'
						placeholder='BTC | ETH | XRP'
						formValidation={{ required: { value: true, message: 'A first token is required!'} }}
						label={'Name of first token'}
						disabled={isViewOnly}
					/>
					<TextInput
						className='input-item'
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
						className='input-item'
						id='startingFirstAmount-input'
						formField='startingFirstAmount'
						formValidation={{ required: true, min: 0.0, valueAsNumber: true }}
						placeholder='First token start amount'
						label={'Start amount of ' + (tradingSetup?.config.firstToken ?? "first token")}
						disabled={isViewOnly}
					/>
					<TextInput
						className='input-item'
						id='startingSecondAmount-input'
						formField='startingSecondAmount'
						formValidation={{ required: true, min: 0.0, valueAsNumber: true }}
						placeholder='Second token start amount'
						label={'Start amount of ' + (tradingSetup?.config.secondToken ?? "second token")}
						disabled={isViewOnly}
					/>
				</div>
				<div className='input-group'>
					<TextField
						className='input-item'
						id='interval-input'
						{...formMethods.register('interval', {
							required: 'An interval is required!',
						})}
						select
						value={interval}
						label="Interval"
						disabled={isViewOnly}
						>
						{intervalItems}
					</TextField>
					
					<TextInput
						className='input-item'
						id='terminationPercentageLoss-input'
						formField='terminationPercentageLoss'
						formValidation={{ min: 0.0, valueAsNumber: true }}
						placeholder='%15 == 0.15'
						label='Termination % loss'
						helperText='% amount when setup is terminated'
					/>
				</div>

				<div className='input-group'>
                	<FormControlLabel control={<Checkbox />} label='Use Take Profit' checked={useTakeProfit} onChange={(_, checked) => formMethods.setValue('useTakeProfit', checked)}/>
				</div>
				{takeProfitPercentageInput}
                {useTakeProfit && 
				<div className='input-group'>
					<FormControlLabel control={<Checkbox />} label='Use Trailing TP' checked={useTrailingTakeProfit} onChange={(_, checked) => formMethods.setValue('useTrailingTakeProfit', checked)}/>
				</div>}
				{useTakeProfit && useTrailingTakeProfit && 
				<div className='input-group'>
					{trailingTakeProfitPercentageInput}
					<TextInput
						className='input-item'
						id='takeProfitTrailingHardLimitPercentage-input'
						formField='takeProfitTrailingHardLimitPercentage'
						formValidation={{ min: 0.000001, valueAsNumber: true }}
						placeholder='%15 == 0.15'
						label='(Optional) Hard limit'
						helperText='Threshold to sell once reached desired profit % (similar to original TP)'
					/>
				</div>}

				<div className='input-group'>
                	<FormControlLabel control={<Checkbox />} label='Use Stop Loss' checked={useStopLoss} onChange={(_, checked) => formMethods.setValue('useStopLoss', checked)}/>
				</div>
				{useStopLoss && <div className='input-group'>
					<TextInput
						className='input-item'
						id='stopLossPercentage-input'
						formField='stopLossPercentage'
						formValidation={{ required: useStopLoss, min: 0.00001, valueAsNumber: true }}
						placeholder='%15 == 0.15'
						label='Percentage to trigger Stop Loss'
					/>
				</div>}

				<div className='input-group'>
                	<FormControlLabel control={<Checkbox />} label='Use Limit Orders' checked={useLimitOrders} onChange={(_, checked) => formMethods.setValue('use_LimitOrders', checked)}/>
				</div>
				{useLimitOrders && <div className='input-group'>
                	<FormControlLabel control={<Checkbox />} label='Use Limit Maker Orders' checked={useLimitMakerOrders} onChange={(_, checked) => formMethods.setValue('use_LimitMakerOrders', checked)}/>
				</div>}
				{useLimitOrders && <div className='input-group'>
					<TextInput
						className='input-item'
						id='limitOrderBuyOffset-input'
						formField='limitOrderBuyOffset'
						formValidation={{ required: true, valueAsNumber: true }}
						label='Offset % from buy amount'
						helperText='E.g. 0.1, means the limit order sets the price 10% higher than current'
					/>
					<TextInput
						className='input-item'
						id='limitOrderSellOffset-input'
						formField='limitOrderSellOffset'
						formValidation={{ required: true, valueAsNumber: true }}
						label='Offset % from sell amount'
						helperText='E.g. -0.1, means the limit order sets the price 10% lower than current'
					/>
				</div>}
				{useLimitOrders && <div className='input-group'>
					<TextInput
						className='input-item'
						id='limitOrderCancelDueToChecksElapsed-input'
						formField='limitOrderCancelDueToChecksElapsed'
						formValidation={{ required: true, min: 1, max: 10000, valueAsNumber: true }}
						label='Ticks to cancel'
						helperText='1 tick is roughly 1 second, but it could be more'
					/>
					<TextInput
						className='input-item'
						id='limitOrderCancelDueToTimeElapsed-input'
						formField='limitOrderCancelDueToTimeElapsed'
						formValidation={{ min: 0.0, valueAsNumber: true }}
						label='Time in seconds to cancel'
						helperText='e.g. 3600 == 1 hour'
					/>
					<TextInput
						className='input-item'
						id='limitOrderCancelDueToPriceDivergence-input'
						formField='limitOrderCancelDueToPriceDivergence'
						formValidation={{ min: 0.0, valueAsNumber: true }}
						label='Price difference to cancel'
						helperText='e.g. 50, means that if current price changes by 50 - order is canceled'
					/>
				</div>}

				<div className='input-group'>
                	<FormControlLabel control={<Checkbox />} label='Margin Account' checked={isMarginAccount} onChange={(_, checked) => formMethods.setValue('isMarginAccount', checked)}/>
				</div>
			
				<div className='input-group'>
					{!isViewOnly && <Button startIcon={<Save />} type='submit' variant='contained' style={{ marginRight: '5px' }}>
						Create Setup
					</Button>}
					{isViewOnly && <Button startIcon={<Save />} type='submit' variant='contained' style={{ marginRight: '5px' }}>
						Save Setup
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