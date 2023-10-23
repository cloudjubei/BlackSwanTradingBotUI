import React, { useEffect, useMemo, useState } from 'react'
import { Configuration, PricesApi, SignalsApi, TradingApi, TradingSetupConfigModel, TradingSetupModel, TransactionApi, WalletModel } from '../src/api/gen'
import { TradingSetupInfo } from '../components/TradingSetupInfo'
import TradingSetupConfigForm, { TradingSetupConfigFormData } from '../components/TradingSetupConfigForm'
import Modal from '../components/Modal/Modal'
import { WalletsInfo } from '../components/WalletsInfo'

const UPDATE_TIME = 1000

const AVAILABLE_SIGNAL_IDS = [
	"bollingerHighSignal", "bollingerLowSignal", 
	"rsi30Overbought", "rsi30Oversold",
	"rsi9Overbought", "rsi9Oversold",
	"bollingerHighWithRSI30Overbought", "bollingerLowWithRSI30Oversold"
]

const AVAILABLE_INTERVALS = [	"1s", "1m", "5m", "15m", "1h", "1d"]

export default function Home()
{
    const [time, setTime] = useState(Date.now())
    const [walletsFree, setWalletsFree] = useState<WalletModel>({ amounts: {}})
    const [walletsLocked, setWalletsLocked] = useState<WalletModel>({ amounts: {}})
    const [tradingSetups, setTradingSetups] = useState<TradingSetupModel[]>([])
	// const pricesApi = useMemo(() => { return new PricesApi(new Configuration({ basePath: "http://localhost:3001"})) }, [])
	// const signalsApi = useMemo(() => { return new SignalsApi(new Configuration({ basePath: "http://localhost:3001"})) }, [])
	const tradingApi = useMemo(() => { return new TradingApi(new Configuration({ basePath: "http://localhost:3001"})) }, [])
	const transactionApi = useMemo(() => { return new TransactionApi(new Configuration({ basePath: "http://localhost:3001"})) }, [])
    const [selectedTradingSetupShowing, setSelectedTradingSetupShowing] = useState<TradingSetupModel | undefined>(undefined)
    const [configTradingSetupShowing, setConfigTradingSetupShowing] = useState(false)

    useEffect(() => {
      const interval = setInterval(() => setTime(Date.now()), UPDATE_TIME)
      return () => {
        clearInterval(interval)
      }
    }, [])

    useEffect(() => {
        const update = async () => {

            const walletFree = await transactionApi.transactionGetWalletFree()
            setWalletsFree(walletFree.data)
            const walletLocked = await transactionApi.transactionGetWalletLocked()
            setWalletsLocked(walletLocked.data)

            const setups = await tradingApi.tradingSetupsGetAll()
            setTradingSetups(setups.data)

        }
        update().catch(console.error)
    }, [time])

    const clickShowTradingSetupConfig = (tradingSetup: TradingSetupModel) => {
        setSelectedTradingSetupShowing(tradingSetup)
        setConfigTradingSetupShowing(true)
    }
    const clickAddTradingSetup = () => {
        setSelectedTradingSetupShowing(undefined)
        setConfigTradingSetupShowing(true)
    }
    const clickTradingSetupAdded = (id: string, startingFirstAmount: string, startingSecondAmount: string, config: TradingSetupConfigModel) => {
        setConfigTradingSetupShowing(false)
        const create = async () => {
            const newSetupData = await tradingApi.tradingSetupsAdd(id, startingFirstAmount, startingSecondAmount, config)
            setTradingSetups([...tradingSetups, newSetupData.data])
        }
        create().then(() =>
            setSelectedTradingSetupShowing(undefined)
        ).catch(console.error)
    }
    const clickTradingSetupDelete = (tradingSetup: TradingSetupModel) => {
        setConfigTradingSetupShowing(false)
        const create = async () => {
            await tradingApi.tradingSetupsRemove(tradingSetup.id)
            const setups = [...tradingSetups]
            setups.splice(0, 1, tradingSetup)
            setTradingSetups(setups)
        }
        create().then(() =>
            setSelectedTradingSetupShowing(undefined)
        ).catch(console.error)
    }

    const wallestView = useMemo(() => {
        return <div className='container wallets'>
            {(Object.keys(walletsFree.amounts).map(token => {
                return <WalletsInfo token={token} freeAmount={walletsFree.amounts[token]} lockedAmount={walletsLocked.amounts[token]} />
            }))}
        </div>
    }, [walletsFree, walletsLocked])

    const tradingSetupsViews = useMemo(() => {
        return <div className='container'>
            {(tradingSetups.map(tradingSetup => {
                return <TradingSetupInfo tradingSetup={tradingSetup} clickConfig={clickShowTradingSetupConfig} />
            }))}
        </div>
    }, [tradingSetups])
    
    return (
        <div>
            <h1> Trading Bot </h1>
            {wallestView}
            {tradingSetupsViews}
            <div className="menu">
                <button className="menu-button" onClick={clickAddTradingSetup}>{"Add Setup"}</button>
            </div>
            <Modal show={configTradingSetupShowing} clickClose={() => setConfigTradingSetupShowing(false)}>
                <TradingSetupConfigForm tradingSetup={selectedTradingSetupShowing} availableSignals={AVAILABLE_SIGNAL_IDS} availableIntervals={AVAILABLE_INTERVALS} onCreate={clickTradingSetupAdded}  onDelete={clickTradingSetupDelete} />
            </Modal>
        </div>
    )
}