import React, { useEffect, useMemo, useState } from 'react'
import { Configuration, PricesApi, SignalsApi, TradingApi, TradingSetupConfigModel, TradingSetupModel, TransactionApi, WalletModel } from '../src/api/gen'
import { TradingSetupInfo } from '../components/TradingSetupInfo'
import TradingSetupConfigForm, { TradingSetupConfigFormData } from '../components/TradingSetupConfigForm'
import Modal from '../components/Modal/Modal'
import { WalletsInfo } from '../components/WalletsInfo'
import Image from 'next/image'
import TradingSetupHistoryView from '../components/TradingSetupHistoryView'

const UPDATE_TIME = 1000

const AVAILABLE_TOKEN_PAIRS = [
    "BTCFDUSD", "BTCUSDT", "BTCTUSD", "BTCUSDC", "ETHUSDT", "ETHUSDC", "XRPUSDT", "DOTUSDT", "DOGEUSDT", "SOLUSDT", "LTCUSDT"
]
const AVAILABLE_SIGNAL_IDS = [
	"bollingerHighSignal", "bollingerLowSignal", 
	"rsi30Overbought", "rsi30Oversold",
	"rsi9Overbought", "rsi9Oversold",
	"bollingerHighWithRSI30Overbought", "bollingerLowWithRSI30Oversold",
	"dump1_00_01", "pump1_00_01", "dump3_00_05", "pump3_00_05", "dump5_00_10", "pump5_00_10",
    "model_ai_1", "model_ai_2", "model_ai_3"
]

const AVAILABLE_INTERVALS = ["1m", "5m", "15m", "1h"]

export default function Home()
{
    const [time, setTime] = useState(Date.now())
    const [walletsFree, setWalletsFree] = useState<WalletModel>({ amounts: {}})
    const [walletsLocked, setWalletsLocked] = useState<WalletModel>({ amounts: {}})
    const [walletsMarginFree, setWalletsMarginFree] = useState<WalletModel>({ amounts: {}})
    const [walletsMarginLocked, setWalletsMarginLocked] = useState<WalletModel>({ amounts: {}})
    const [tradingSetups, setTradingSetups] = useState<TradingSetupModel[]>([])
    const [prices, setPrices] = useState<{[tokenPair:string] : string}>({})
	const pricesApi = useMemo(() => { return new PricesApi(new Configuration({ basePath: "http://localhost:3001"})) }, [])
	// const signalsApi = useMemo(() => { return new SignalsApi(new Configuration({ basePath: "http://localhost:3001"})) }, [])
	const tradingApi = useMemo(() => { return new TradingApi(new Configuration({ basePath: "http://localhost:3001"})) }, [])
	const transactionApi = useMemo(() => { return new TransactionApi(new Configuration({ basePath: "http://localhost:3001"})) }, [])
    const [selectedTradingSetupShowing, setSelectedTradingSetupShowing] = useState<TradingSetupModel | undefined>(undefined)
    const [selectedCopyTradingSetupShowing, setSelectedCopyTradingSetupShowing] = useState<TradingSetupModel | undefined>(undefined)
    const [configTradingSetupShowing, setConfigTradingSetupShowing] = useState(false)
    const [historyTradingSetupShowing, setHistoryTradingSetupShowing] = useState(false)

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

            const walletMarginFree = await transactionApi.transactionGetWalletMarginFree()
            setWalletsMarginFree(walletMarginFree.data)
            const walletMarginLocked = await transactionApi.transactionGetWalletMarginLocked()
            setWalletsMarginLocked(walletMarginLocked.data)

            const newPrices : {[tokenPair:string] : string} = {}
            for (const tokenPair of AVAILABLE_TOKEN_PAIRS) {
                const price = await pricesApi.pricesGetLatest(tokenPair, '1s')
                newPrices[tokenPair] = price.data.price
            }
            setPrices(newPrices)

            const setups = await tradingApi.tradingSetupsGetAll()
            setTradingSetups(setups.data)

        }
        update().catch(console.error)
    }, [time])

    const clickConvertWalletBTC = () => {
        const action = async () => {
            const walletFree = await transactionApi.transactionConvertAllBTC()
            setWalletsFree(walletFree.data)
        }
        action().catch(console.error)
    }
    const clickShowTradingSetupConfig = (tradingSetup: TradingSetupModel) => {
        setSelectedTradingSetupShowing(tradingSetup)
        setConfigTradingSetupShowing(true)
    }
    const clickCopyTradingSetupConfig = (tradingSetup: TradingSetupModel) => {
        setSelectedCopyTradingSetupShowing({ ...tradingSetup, id: "" })
        setConfigTradingSetupShowing(true)
    }
    const clickAddTradingSetup = () => {
        setSelectedTradingSetupShowing(undefined)
        setConfigTradingSetupShowing(true)
    }
    const clickTradingSetupAdded = (id: string, startingFirstAmount: string, startingSecondAmount: string, config: TradingSetupConfigModel) => {
        setConfigTradingSetupShowing(false)
        const action = async () => {
            const newSetupData = await tradingApi.tradingSetupsAdd(id, startingFirstAmount, startingSecondAmount, config)
            setTradingSetups([...tradingSetups, newSetupData.data])
        }
        action().then(() =>
            setSelectedTradingSetupShowing(undefined)
        ).catch(console.error)
    }
    const clickTradingSetupSave = (setup: TradingSetupModel, config: TradingSetupConfigModel) => {
        setConfigTradingSetupShowing(false)

        const action = async () => {
            const newSetup = await tradingApi.tradingSetupsUpdate({ ...setup, config })
            const setups = [...tradingSetups]
            const index = setups.findIndex(s => s.id === newSetup.data.id)
            setups[index] = newSetup.data
            setTradingSetups([...setups])
        }
        action().then(() =>
            setSelectedTradingSetupShowing(undefined)
        ).catch(console.error)
    }
    const clickTradingSetupDelete = (tradingSetup: TradingSetupModel) => {
        setConfigTradingSetupShowing(false)
        const action = async () => {
            await tradingApi.tradingSetupsRemove(tradingSetup.id)
            const setups = [...tradingSetups]
            const index = setups.findIndex(s => s.id === tradingSetup.id)
            if (index !== undefined){
                setups.splice(index, 1)
            }
            setTradingSetups([...setups])
        }
        action().then(() =>
            setSelectedTradingSetupShowing(undefined)
        ).catch(console.error)
    }

    const clickTradingSetupTogglePause = (tradingSetup: TradingSetupModel) => {
        setConfigTradingSetupShowing(false)
        
        const action = async () => {
            const updatedSetup = await transactionApi.transactionTogglePause(tradingSetup.id)
            const setups = [...tradingSetups]
            const index = setups.findIndex(s => s.id === updatedSetup.data.id)
            setups[index] = updatedSetup.data
            setTradingSetups([...setups])
        }
        action().then(() =>
            setSelectedTradingSetupShowing(undefined)
        ).catch(console.error)
    }
    const clickTradingSetupForceBuy = (tradingSetup: TradingSetupModel) => {
        setConfigTradingSetupShowing(false)
        const action = async () => {
            const newSetup = await transactionApi.transactionForceBuy(tradingSetup.id)
            const setups = [...tradingSetups]
            const index = setups.findIndex(s => s.id === newSetup.data.id)
            setups[index] = newSetup.data
            setTradingSetups([...setups])
        }
        action().then(() =>
            setSelectedTradingSetupShowing(undefined)
        ).catch(console.error)
    }
    const clickTradingSetupForceSell = (tradingSetup: TradingSetupModel) => {
        setConfigTradingSetupShowing(false)
        const action = async () => {
            const newSetup = await transactionApi.transactionForceSell(tradingSetup.id)
            const setups = [...tradingSetups]
            const index = setups.findIndex(s => s.id === newSetup.data.id)
            setups[index] = newSetup.data
            setTradingSetups([...setups])
        }
        action().then(() =>
            setSelectedTradingSetupShowing(undefined)
        ).catch(console.error)
    }
    const clickHistory = (tradingSetup: TradingSetupModel) => {
        setSelectedTradingSetupShowing(tradingSetup)
        setHistoryTradingSetupShowing(true)
    }

    const walletsView = useMemo(() => {
        return <div className='container wallets'>
            {(Object.keys(walletsFree.amounts).map(token => {
                return <WalletsInfo key={token} token={token} freeAmount={walletsFree.amounts[token]} lockedAmount={walletsLocked.amounts[token]} />
            }))}
        </div>
    }, [walletsFree, walletsLocked])
    const walletsMarginView = useMemo(() => {
        return <div className='container wallets margin'>
            {(Object.keys(walletsMarginFree.amounts).map(token => {
                return <WalletsInfo key={token} token={token} freeAmount={walletsMarginFree.amounts[token]} lockedAmount={walletsMarginLocked.amounts[token]} />
            }))}
        </div>
    }, [walletsMarginFree, walletsMarginLocked])

    const tradingSetupsViews = useMemo(() => {
        return <div className='container'>
            {(tradingSetups.map(tradingSetup => {
                return <TradingSetupInfo key={tradingSetup.id} tradingSetup={tradingSetup} clickConfig={clickShowTradingSetupConfig} clickCopy={clickCopyTradingSetupConfig} clickPause={clickTradingSetupTogglePause}  onForceBuy={clickTradingSetupForceBuy} onForceSell={clickTradingSetupForceSell} onHistory={clickHistory}/>
            }))}
        </div>
    }, [tradingSetups])
    
    return (
        <div>
            <Image className="logo" src="/logicxlogo.png" alt="logo" width={200} height={80} />
            <h1> Binance Trading Module </h1>
            <h4>Spot</h4>
            {walletsView}
            <h4>Margin</h4>
            {walletsMarginView}
            {tradingSetupsViews}
            <div className="menu">
                <button className="menu-button" onClick={clickConvertWalletBTC}>{"Convert all BTC"}</button>
                <button className="menu-button" onClick={clickAddTradingSetup}>{"Add Setup"}</button>
            </div>
            <Modal show={configTradingSetupShowing} clickClose={() => setConfigTradingSetupShowing(false)}>
                <TradingSetupConfigForm tradingSetup={selectedTradingSetupShowing} tradingSetupToCopy={selectedCopyTradingSetupShowing} prices={prices} availableSignals={AVAILABLE_SIGNAL_IDS} availableIntervals={AVAILABLE_INTERVALS} onCreate={clickTradingSetupAdded} onSave={clickTradingSetupSave} onDelete={clickTradingSetupDelete} />
            </Modal>
            <Modal show={historyTradingSetupShowing} clickClose={() => setHistoryTradingSetupShowing(false)}>
                <TradingSetupHistoryView tradingSetup={selectedTradingSetupShowing!}/>
            </Modal>
        </div>
    )
}