import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import * as tyron from 'tyron'
import {
    setTxId,
    setTxStatusLoading,
    updateLoginInfoUsername,
    updateLoginInfoZilpay,
    UpdateNet,
} from '../../../src/app/actions'
import { RootState } from '../../../src/app/reducers'
import CloseIconReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIconBlack from '../../../src/assets/icons/ic_cross_black.svg'
import InfoDefaultReg from '../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../src/assets/icons/info_default_black.svg'
import InfoIcon from '../../../src/assets/icons/warning.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import {
    $resolvedInfo,
    updateResolvedInfo,
} from '../../../src/store/resolvedInfo'
import {
    updateModalTx,
    updateModalDashboard,
    updateShowZilpay,
    updateModalTxMinimized,
} from '../../../src/store/modal'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { updateTxList } from '../../../src/store/transactions'
import { $donation, updateDonation } from '../../../src/store/donation'
import { $buyInfo, updateBuyInfo } from '../../../src/store/buyInfo'
import {
    $modalBuyNft,
    updateModalBuyNft,
    $txType, //@info: we need this when user adding funds from buy nft modal then minimizing the tx modal
} from '../../../src/store/modal'
import { AddFunds, Arrow, Donate, Selector, Spinner } from '../../'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../src/utils/smartContract'
import TickIco from '../../../src/assets/icons/tick.svg'
import toastTheme from '../../../src/hooks/toastTheme'
import ThreeDots from '../../Spinner/ThreeDots'
import * as fetch_ from '../../../src/hooks/fetch'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { fetchWalletBalance } = fetch_.default()
    const Router = useRouter()
    const net = useSelector((state: RootState) => state.modal.net)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const donation = useStore($donation)
    const buyInfo = useStore($buyInfo)
    const modalBuyNft = useStore($modalBuyNft)
    const txType = useStore($txType)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const CloseIcon = isLight ? CloseIconBlack : CloseIconReg
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
    const [loadingBalance, setLoadingBalance] = useState(false)
    const [inputAddr, setInputAddr] = useState('')
    const [legend, setLegend] = useState('save')
    const [loading, setLoading] = useState(false)
    const [loadingPayment, setLoadingPayment] = useState(false)

    const handleOnChangeRecipient = (value: any) => {
        setInputAddr('')
        updateDonation(null)
        updateBuyInfo({
            recipientOpt: value,
            anotherAddr: undefined,
            currency: undefined,
            currentBalance: 0,
            isEnough: false,
        })
    }

    const handleConnect = React.useCallback(async () => {
        try {
            const wallet = new ZilPayBase()
            const zp = await wallet.zilpay()
            const connected = await zp.wallet.connect()

            const network = zp.wallet.net
            dispatch(UpdateNet(network))

            const address = zp.wallet.defaultAccount

            if (connected && address) {
                dispatch(updateLoginInfoZilpay(address))
                updateShowZilpay(true)
                updateModalDashboard(true)
            }

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            )
            if (cache) {
                updateTxList(JSON.parse(cache))
            }
        } catch (err) {
            toast.error(String(err), {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const handleInputAddr = (event: { target: { value } }) => {
        setLegend('save')
        setInputAddr(event.target.value)
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            validateInputAddr()
        }
    }

    const validateInputAddr = () => {
        const addr = tyron.Address.default.verification(inputAddr)
        if (addr !== '') {
            updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: addr,
            })
            setLegend('saved')
        } else {
            toast.error(t('Wrong address.'), {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }
    }

    const handleOnChangePayment = async (value: any) => {
        updateDonation(null)
        updateBuyInfo({
            recipientOpt: buyInfo?.recipientOpt,
            anotherAddr: buyInfo?.anotherAddr,
            currency: undefined,
            currentBalance: undefined,
            isEnough: undefined,
        })
        if (value !== '') {
            updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: buyInfo?.anotherAddr,
                currency: value,
                currentBalance: 0,
                isEnough: false,
            })
            setLoadingPayment(true)
            try {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                if (value === 'FREE') {
                    const get_freelist = await getSmartContract(
                        init_addr!,
                        'free_list'
                    )
                    const freelist: Array<string> =
                        get_freelist.result.free_list
                    const is_free = freelist.filter(
                        (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (is_free.length === 0) {
                        throw new Error('You are not on the free list')
                    }
                    toast("Congratulations! You're a winner, baby!!", {
                        position: 'bottom-left',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 8,
                    })
                }
                const paymentOptions = async (id: string) => {
                    setLoadingBalance(true)
                    await fetchWalletBalance(
                        id,
                        loginInfo.address.toLowerCase()
                    )
                        .then((balances) => {
                            const balance = balances[0]
                            if (balance !== undefined) {
                                updateBuyInfo({
                                    recipientOpt: buyInfo?.recipientOpt,
                                    anotherAddr: buyInfo?.anotherAddr,
                                    currency: value,
                                    currentBalance: balance,
                                })
                                let price: number
                                switch (id) {
                                    case 'xsgd':
                                        price = 15
                                        break
                                    default:
                                        price = 10
                                        break
                                }
                                if (balance >= price) {
                                    updateBuyInfo({
                                        recipientOpt: buyInfo?.recipientOpt,
                                        anotherAddr: buyInfo?.anotherAddr,
                                        currency: value,
                                        currentBalance: balance,
                                        isEnough: true,
                                    })
                                } else {
                                    toast.warn(
                                        'Your DIDxWallet does not have enough balance',
                                        {
                                            position: 'bottom-right',
                                            autoClose: 3000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: toastTheme(isLight),
                                            toastId: 3,
                                        }
                                    )
                                }
                            }
                        })
                        .catch(() => {
                            toast.warning(t('Buy NFT: Unsupported currency'), {
                                position: 'bottom-left',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 4,
                            })
                        })
                    setLoadingBalance(false)
                }
                const id = value.toLowerCase()
                if (id !== 'free') {
                    paymentOptions(id)
                } else {
                    updateBuyInfo({
                        recipientOpt: buyInfo?.recipientOpt,
                        anotherAddr: buyInfo?.anotherAddr,
                        currency: value,
                        currentBalance: 0,
                        isEnough: true,
                    })
                }
            } catch (error) {
                updateBuyInfo({
                    recipientOpt: buyInfo?.recipientOpt,
                    anotherAddr: buyInfo?.anotherAddr,
                    currency: undefined,
                    currentBalance: undefined,
                    isEnough: undefined,
                })
                toast.error(String(error), {
                    position: 'bottom-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 2,
                })
            }
            setLoadingPayment(false)
        }
    }

    const webHookBuyNft = async (username) => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: `TYRON ${net}\n\n${username}.ssi`,
        }
        await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_BUYNFT_URL}`, request)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const zilpay = new ZilPayBase()

            let addr: tyron.TyronZil.TransitionValue
            if (buyInfo?.recipientOpt === 'ADDR') {
                addr = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'ByStr20',
                    buyInfo?.anotherAddr
                )
            } else {
                addr = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.none,
                    'ByStr20'
                )
            }

            const tyron_: tyron.TyronZil.TransitionValue =
                await tyron.Donation.default.tyron(donation!)
            const tx_params = await tyron.TyronZil.default.BuyNftUsername(
                username!,
                addr,
                buyInfo?.currency?.toLowerCase()!,
                tyron_
            )

            let tx = await tyron.Init.default.transaction(net)

            toast.info(
                t('You’re about to buy the NFT Username X!', {
                    name: username,
                }),
                {
                    position: 'top-center',
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 6,
                }
            )
            updateModalBuyNft(false)
            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)

            let _amount = '0'
            if (donation !== null) {
                _amount = String(donation)
            }
            if (buyInfo?.currency?.toLowerCase() === 'zil') {
                _amount = String(Number(_amount) + 500)
            }

            await zilpay
                .call({
                    contractAddress: loginInfo.address,
                    transition: 'BuyNftUsername',
                    params: tx_params as unknown as Record<string, unknown>[],
                    amount: _amount,
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))

                    tx = await tx.confirm(res.ID)
                    if (tx.isConfirmed()) {
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        }, 1000)
                        dispatch(updateLoginInfoUsername(username!))
                        updateBuyInfo(null)
                        updateResolvedInfo({
                            name: username!,
                            domain: 'did',
                        })
                        Router.push(`/${username}.did`)
                        webHookBuyNft(username)
                    } else if (tx.isRejected()) {
                        dispatch(setTxStatusLoading('failed'))
                        Router.push('/')
                    }
                })
                .catch((err) => {
                    throw err
                })
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.error(String(error), {
                position: 'bottom-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 7,
            })
            Router.push('/')
        }
        updateDonation(null)
    }

    const closeModal = () => {
        setInputAddr('')
        updateDonation(null)
        updateBuyInfo({
            recipientOpt: '',
            anotherAddr: undefined,
            currency: undefined,
            currentBalance: 0,
            isEnough: false,
        })
        Router.push('/')
        updateModalBuyNft(false)
    }

    const outerClose = () => {
        if (window.confirm('Are you sure about closing this window?')) {
            closeModal()
        }
    }

    const spinner = <Spinner />

    if (!modalBuyNft) {
        return null
    }

    const option = [
        {
            value: 'SSI',
            label: t('THIS_SSI'),
        },
        {
            value: 'ADDR',
            label: t('ANOTHER_ADDRESS'),
        },
    ]

    const optionPayment = [
        {
            value: 'ZIL',
            label: '500 ZIL',
        },
        {
            value: 'TYRON',
            label: '10 TYRON',
        },
        {
            value: 'XSGD',
            label: '15 XSGD',
        },
        {
            value: 'zUSDT',
            label: '10 zUSDT',
        },
        {
            value: 'FREE',
            label: t('FREE'),
        },
    ]

    return (
        <>
            <>
                <div className={styles.outerWrapper} onClick={outerClose} />
                <div className={styles.container}>
                    <div className={styles.innerContainer}>
                        <div className="closeIcon">
                            <Image
                                alt="close-ico"
                                src={CloseIcon}
                                onClick={outerClose}
                            />
                        </div>
                        {txType === 'AddFunds' &&
                        (loginInfo.txStatusLoading === 'true' ||
                            loginInfo.txStatusLoading === 'submitted') ? (
                            <div className={styles.wrapperLoading}>
                                <div className={styles.loadingIco}>
                                    {spinner}
                                </div>
                                <h4 style={{ marginTop: '4%' }}>
                                    To continue, please wait until the Add Funds
                                    transaction gets finalised on the Zilliqa
                                    blockchain
                                </h4>
                            </div>
                        ) : (
                            <div className={styles.contentWrapper}>
                                <h3 className={styles.headerInfo}>
                                    {t('BUY_THIS_NFT_USERNAME')}
                                </h3>
                                <div className={styles.usernameInfoWrapper}>
                                    <h2 className={styles.usernameInfoYellow}>
                                        {username?.length! > 20
                                            ? `${username?.slice(
                                                  0,
                                                  8
                                              )}...${username?.slice(-8)}`
                                            : username}
                                        {domain === '' ? '.ssi' : '.did'}
                                    </h2>
                                    <h2 className={styles.usernameInfo}>
                                        {t('IS_AVAILABLE')}
                                    </h2>
                                </div>
                                {loginInfo.address === null ? (
                                    <div className={styles.wrapperActionBtn}>
                                        <div
                                            className={
                                                isLight
                                                    ? 'actionBtnLight'
                                                    : 'actionBtn'
                                            }
                                            onClick={handleConnect}
                                        >
                                            <div>{t('LOG_IN')}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div
                                                className={styles.txt}
                                                style={{
                                                    fontSize: '14px',
                                                    marginBottom: '2rem',
                                                }}
                                            >
                                                {t('YOU_HAVE_LOGGED_IN_SSI')}
                                            </div>
                                            <div
                                                style={{ marginBottom: '2rem' }}
                                                className={styles.loginAddress}
                                            >
                                                {loginInfo.username ? (
                                                    `${loginInfo.username}.did`
                                                ) : (
                                                    <a
                                                        href={`https://v2.viewblock.io/zilliqa/address/${loginInfo.address}?network=${net}`}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        <span>
                                                            did:tyron:zil...
                                                            {loginInfo.address.slice(
                                                                -10
                                                            )}
                                                        </span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.selectWrapper}>
                                            <div
                                                className={
                                                    styles.recipientWrapper
                                                }
                                            >
                                                <div
                                                    style={{ display: 'flex' }}
                                                >
                                                    <div
                                                        className={styles.txt}
                                                        style={{
                                                            fontSize: '20px',
                                                            marginBottom:
                                                                '2rem',
                                                        }}
                                                    >
                                                        {t('SELECT_RECIPIENT')}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.icoInfo
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.tooltip
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.ico
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.icoDefault
                                                                    }
                                                                >
                                                                    <Image
                                                                        alt="warning-ico"
                                                                        src={
                                                                            InfoDefault
                                                                        }
                                                                        width={
                                                                            20
                                                                        }
                                                                        height={
                                                                            20
                                                                        }
                                                                    />
                                                                </div>
                                                                <div
                                                                    className={
                                                                        styles.icoColor
                                                                    }
                                                                >
                                                                    <Image
                                                                        alt="warning-ico"
                                                                        src={
                                                                            InfoIcon
                                                                        }
                                                                        width={
                                                                            20
                                                                        }
                                                                        height={
                                                                            20
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={
                                                                    styles.tooltiptext
                                                                }
                                                            >
                                                                <h5
                                                                    className={
                                                                        styles.modalInfoTitle
                                                                    }
                                                                >
                                                                    {t('INFO')}
                                                                </h5>
                                                                <div
                                                                    className={
                                                                        styles.txt
                                                                    }
                                                                    style={{
                                                                        fontSize:
                                                                            '11px',
                                                                    }}
                                                                >
                                                                    {t(
                                                                        'INFO_MSG_RECIPIENT'
                                                                    )}
                                                                </div>
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.wrapperOptionMobile
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.recipientWrapperMobile
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.select
                                                        }
                                                    >
                                                        <Selector
                                                            option={option}
                                                            onChange={
                                                                handleOnChangeRecipient
                                                            }
                                                            placeholder=""
                                                            defaultValue={
                                                                buyInfo?.recipientOpt ===
                                                                ''
                                                                    ? undefined
                                                                    : buyInfo?.recipientOpt
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.paymentWrapper
                                                }
                                            >
                                                {buyInfo?.recipientOpt ===
                                                    'SSI' ||
                                                (buyInfo?.recipientOpt ===
                                                    'ADDR' &&
                                                    buyInfo?.anotherAddr !==
                                                        undefined) ? (
                                                    <>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                            }}
                                                        >
                                                            <div
                                                                className={
                                                                    styles.txt
                                                                }
                                                                style={{
                                                                    fontSize:
                                                                        '20px',
                                                                    marginBottom:
                                                                        '2rem',
                                                                }}
                                                            >
                                                                {t(
                                                                    'SELECT_PAYMENT'
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.selectWrapper}>
                                            <div
                                                className={
                                                    styles.wrapperOptionDesktop
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.recipientWrapper
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.select
                                                        }
                                                    >
                                                        <Selector
                                                            option={option}
                                                            onChange={
                                                                handleOnChangeRecipient
                                                            }
                                                            placeholder=""
                                                            defaultValue={
                                                                buyInfo?.recipientOpt ===
                                                                ''
                                                                    ? undefined
                                                                    : buyInfo?.recipientOpt
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.paymentWrapperOption
                                                }
                                            >
                                                {buyInfo?.recipientOpt ===
                                                    'SSI' ||
                                                (buyInfo?.recipientOpt ===
                                                    'ADDR' &&
                                                    buyInfo?.anotherAddr !==
                                                        undefined) ? (
                                                    <>
                                                        <div
                                                            className={
                                                                styles.select
                                                            }
                                                        >
                                                            <Selector
                                                                option={
                                                                    optionPayment
                                                                }
                                                                onChange={
                                                                    handleOnChangePayment
                                                                }
                                                                loading={
                                                                    loadingPayment
                                                                }
                                                                placeholder=""
                                                                defaultValue={
                                                                    buyInfo?.currency ===
                                                                    undefined
                                                                        ? undefined
                                                                        : buyInfo?.currency
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </div>
                                        </div>
                                        {buyInfo?.recipientOpt == 'ADDR' ? (
                                            buyInfo?.anotherAddr !==
                                            undefined ? (
                                                <div
                                                    style={{
                                                        marginTop: '3%',
                                                        marginBottom: '2rem',
                                                    }}
                                                >
                                                    {t('Recipient (address):')}{' '}
                                                    {zcrypto.toBech32Address(
                                                        buyInfo?.anotherAddr!
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className={
                                                        styles.inputAddrWrapper
                                                    }
                                                >
                                                    <input
                                                        type="text"
                                                        style={{
                                                            marginRight: '5%',
                                                        }}
                                                        className={styles.input}
                                                        onChange={
                                                            handleInputAddr
                                                        }
                                                        onKeyPress={
                                                            handleOnKeyPress
                                                        }
                                                        placeholder={t(
                                                            'Type address'
                                                        )}
                                                    />
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <div
                                                            onClick={
                                                                validateInputAddr
                                                            }
                                                        >
                                                            {legend ===
                                                            'save' ? (
                                                                <Arrow />
                                                            ) : (
                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            '5px',
                                                                    }}
                                                                >
                                                                    <Image
                                                                        width={
                                                                            40
                                                                        }
                                                                        src={
                                                                            TickIco
                                                                        }
                                                                        alt="tick"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <></>
                                        )}
                                        {buyInfo?.currency !== undefined &&
                                            !loadingPayment && (
                                                <>
                                                    {buyInfo?.currency !==
                                                        'FREE' && (
                                                        <div
                                                            className={
                                                                styles.balanceInfoWrapepr
                                                            }
                                                        >
                                                            {loadingBalance ? (
                                                                <div>
                                                                    {spinner}
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={
                                                                        styles.balanceInfo
                                                                    }
                                                                    style={{
                                                                        marginBottom:
                                                                            '2rem',
                                                                    }}
                                                                >
                                                                    {t(
                                                                        'CURRENT_BALANCE'
                                                                    )}
                                                                    <span
                                                                        className={
                                                                            styles.balanceInfoYellow
                                                                        }
                                                                    >
                                                                        &nbsp;
                                                                        {
                                                                            buyInfo?.currentBalance
                                                                        }{' '}
                                                                        {
                                                                            buyInfo?.currency
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {buyInfo?.currency !==
                                                        undefined &&
                                                        !loadingBalance && (
                                                            <>
                                                                {buyInfo?.isEnough ? (
                                                                    <>
                                                                        {donation ===
                                                                        null ? (
                                                                            <Donate />
                                                                        ) : (
                                                                            <>
                                                                                <div
                                                                                    style={{
                                                                                        width: 'fit-content',
                                                                                        marginTop:
                                                                                            '10%',
                                                                                        textAlign:
                                                                                            'center',
                                                                                    }}
                                                                                >
                                                                                    <div
                                                                                        className={
                                                                                            isLight
                                                                                                ? 'actionBtnLight'
                                                                                                : 'actionBtn'
                                                                                        }
                                                                                        onClick={
                                                                                            handleSubmit
                                                                                        }
                                                                                    >
                                                                                        {loading ? (
                                                                                            <ThreeDots color="yellow" />
                                                                                        ) : (
                                                                                            t(
                                                                                                'BUY NFT USERNAME'
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <h5
                                                                                    className={
                                                                                        styles.gasTxt
                                                                                    }
                                                                                >
                                                                                    {t(
                                                                                        'GAS_AROUND'
                                                                                    )}
                                                                                    &nbsp;
                                                                                    14
                                                                                    ZIL
                                                                                </h5>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div
                                                                            style={{
                                                                                color: 'red',
                                                                                marginBottom:
                                                                                    '2rem',
                                                                            }}
                                                                        >
                                                                            {t(
                                                                                'NOT_ENOUGH_BALANCE'
                                                                            )}
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                width: '90%',
                                                                            }}
                                                                        >
                                                                            <AddFunds
                                                                                type="buy"
                                                                                coin={
                                                                                    buyInfo?.currency
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                </>
                                            )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </>
        </>
    )
}

export default Component
