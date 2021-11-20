import { useStore } from 'effector-react';
import * as tyron from 'tyron'
import React, { useState } from 'react';
import { $contract } from 'src/store/contract';
import { $user } from 'src/store/user';
import { DIDOperations, Liquidity, NFTUsernameDNS, StakeRewards } from '..';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import styles from './styles.module.scss';
import { $net } from 'src/store/wallet-network';
import { $arconnect } from 'src/store/arconnect';

function Component() {
    const user = useStore($user);
    const arConnect = useStore($arconnect);

    const [hideOperations, setHideOperations] = useState(true);
    const [operationsLegend, setOperationsLegend] = useState('did operations');
    const [hideDns, setHideDns] = useState(true);
    const [dnsLegend, setDnsLegend] = useState('nft username');
    const [hideUpgrade, setHideUpgrade] = useState(true);
    const [upgradeLegend, setUpgradeLegend] = useState('upgrade');

    const [hideLiquidity, setHideLiquidity] = useState(true);
    const [liquidityLegend, setLiquidityLegend] = useState('add / remove');
    const [hideDex, setHideDex] = useState(true);
    const [dexLegend, setDexLegend] = useState('exchange');
    const [hideStake, setHideStake] = useState(true);
    const [stakeLegend, setStakeLegend] = useState('+ rewards')
    const [hideStake2, setHideStake2] = useState(true);
    const [stakeLegend2, setStakeLegend2] = useState('swap');

    const contract = useStore($contract);
    const net = useStore($net);
    const [error, setError] = useState('');


    const handleTest = async () => {
        if (contract !== null) {
            try {
                const zilpay = new ZilPayBase();
                const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');

                const username = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'String', user?.nft);
                const input = "0xf17c14ca06322e8fe4f460965a94184eb008b2c4"   //@todo-test beneficiary
                const guardianship = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'ByStr20', input);
                const id = "tyron";

                const tx_value = [
                    {
                        "argtypes": [
                            "String",
                            "Uint128"
                        ],
                        "arguments": [
                            `${"tyron"}`,
                            `${9}`
                        ],
                        "constructor": "Pair"
                    },/*
                    {
                        "argtypes": [
                            "String",
                            "Uint128"
                        ],
                        "arguments": [
                            `${"xsgd"}`,
                            `${1000000}`
                        ],
                        "constructor": "Pair"
                    }*/
                ];
                const params = [];
                const username_ = {
                    vname: 'username',
                    type: 'Option String',
                    value: username,
                };
                params.push(username_);
                const addr_ = {
                    vname: 'recipient',
                    type: 'ByStr20',
                    value: input,
                };
                params.push(addr_);
                const guardianship_ = {
                    vname: 'guardianship',
                    type: 'Option ByStr20',
                    value: guardianship,
                };
                params.push(guardianship_);
                const id_ = {
                    vname: 'id',
                    type: 'String',
                    value: id,
                };
                params.push(id_);
                const amount_ = {
                    vname: 'amount',
                    type: 'Uint128',
                    value: '0',   //@todo 0 because ID is tyron
                };
                params.push(amount_);
                const tokens_ = {
                    vname: 'tokens',
                    type: 'List( Pair String Uint128 )',
                    value: tx_value,
                };
                params.push(tokens_);
                const tyron__ = {
                    vname: 'tyron',
                    type: 'Option Uint128',
                    value: tyron_,
                };
                params.push(tyron__);
                await zilpay.call(
                    {
                        contractAddress: contract.addr,
                        transition: 'Upgrade',
                        params: params as unknown as Record<string, unknown>[],
                        amount: String(0)
                    },
                    {
                        gasPrice: '2000',
                        gaslimit: '20000'
                    }
                )
                    .then(res => {
                        window.open(
                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                        );
                    })
            } catch (error) {
                const err = error as string;
                setError(err)
            }
        } else {
            setError('some data is missing.')
        }
    };

    return (
        <div style={{ marginTop: '14%', textAlign: 'center' }}>
            {
                user?.domain === 'did' &&
                <h1 style={{ textAlign: 'center', marginBottom: '10%' }}>
                    <span className={styles.username}>
                        {user?.nft}<span style={{ color: 'white' }}>&apos;s</span>
                    </span>
                    {' '}
                    <span>
                        DID<span style={{ textTransform: 'lowercase' }}>x</span>Wallet
                    </span>

                </h1>
            }
            {
                user?.domain !== 'did' &&
                <h1>
                    <span className={styles.username}>
                        <span style={{ color: 'white' }}>
                            {user?.nft}
                        </span>
                        .{user?.domain}
                    </span>{' '}
                    <span style={{ textTransform: 'lowercase' }}>x</span>Wallet
                    {' '}
                    <span style={{ textTransform: 'lowercase' }}>domain</span>
                </h1>
            }
            <div style={{ marginTop: '14%' }}>
                {
                    user?.domain === 'did' && hideDns && hideLiquidity && hideDex && hideStake && hideStake2 &&
                    hideUpgrade &&
                    <h2>
                        {
                            hideOperations
                                ? <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        if (arConnect === null) {
                                            alert('To continue, connect your SSI private key to encrypt/decrypt data.')
                                        } else {
                                            setHideOperations(false);
                                            setOperationsLegend('back');
                                        }
                                    }}
                                >
                                    <p className={styles.buttonBlue}>
                                        {operationsLegend}
                                    </p>
                                </button>
                                : <>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideOperations(true);
                                            setOperationsLegend('did operations');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {operationsLegend}
                                        </p>
                                    </button>
                                </>
                        }
                    </h2>
                }
                {
                    !hideOperations &&
                    <DIDOperations />
                }
            </div>
            <div style={{ marginTop: '7%' }}>
                {
                    hideOperations && user?.domain === 'did' && hideUpgrade &&
                    <>
                        {
                            hideDns
                                ? <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDns(false);
                                        setDnsLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonYellowText}>
                                        {dnsLegend}
                                    </p>
                                </button>

                                : <>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideDns(true);
                                            setDnsLegend('nft username');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {dnsLegend}
                                        </p>
                                    </button>
                                </>
                        }
                    </>
                }
                {
                    !hideDns &&
                    <NFTUsernameDNS />
                }
            </div>
            <div style={{ marginTop: '7%' }}>
                {
                    hideOperations && hideDns && user?.domain === 'did' &&
                    <>
                        {
                            hideUpgrade
                                ? <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideUpgrade(false);
                                        setUpgradeLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {upgradeLegend}
                                    </p>
                                </button>
                                : <>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideUpgrade(true);
                                            setUpgradeLegend('upgrade');
                                            //handleTest()
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {upgradeLegend}
                                        </p>
                                    </button>
                                </>
                        }
                    </>
                }
                {
                    !hideUpgrade &&
                    <div style={{ marginTop: '14%' }}>
                        <code>
                            <ul>
                                <li>
                                    On Tyron, you can transfer your NFT Username, tokens and ZIL, all in one transaction.
                                </li>
                                <li>
                                    Available from version 4.
                                </li>
                            </ul>
                        </code>
                    </div>
                }
            </div>
            <div style={{ marginTop: '7%' }}>
                {
                    hideOperations && user?.domain === 'dex' && hideDex &&
                    <h2>
                        liquidity{' '}
                        {
                            hideLiquidity
                                ? <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideLiquidity(false);
                                        setLiquidityLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {liquidityLegend}
                                    </p>
                                </button>

                                : <>
                                    on zilswap
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideLiquidity(true);
                                            setLiquidityLegend('add / remove');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {liquidityLegend}
                                        </p>
                                    </button>
                                </>
                        }
                    </h2>
                }
                {
                    !hideLiquidity &&
                    <Liquidity />
                }
            </div>
            <div style={{ marginTop: '7%' }}>
                {
                    hideOperations && user?.domain === 'dex' && hideLiquidity &&
                    <h2 style={{ width: '110%' }}>
                        decentralized{' '}
                        {
                            hideDex
                                ? <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDex(false);
                                        setDexLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {dexLegend}
                                    </p>
                                </button>

                                : <>
                                    exchange
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideDex(true);
                                            setDexLegend('exchange');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {dexLegend}
                                        </p>
                                    </button>
                                </>
                        }
                    </h2>
                }
                {
                    !hideDex &&
                    <p>
                        Coming soon!
                    </p>
                }
            </div>
            <div style={{ marginTop: '7%' }}>
                {
                    hideOperations && user?.domain === 'stake' && hideStake2 &&
                    <h2>
                        stake{' '}
                        {
                            hideStake
                                ? <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideStake(false);
                                        setStakeLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonYellowText}>
                                        {stakeLegend}
                                    </p>
                                </button>

                                : <>
                                    + rewards
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideStake(true);
                                            setStakeLegend('+ rewards');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {stakeLegend}
                                        </p>
                                    </button>
                                </>
                        }
                    </h2>
                }
                {
                    !hideStake &&
                    <StakeRewards />
                }
            </div>
            <div style={{ marginTop: '7%' }}>
                {
                    hideOperations && user?.domain === 'stake' && hideStake &&
                    <h2>
                        delegator{' '}
                        {
                            hideStake2
                                ? <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideStake2(false);
                                        setStakeLegend2('back');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {stakeLegend2}
                                    </p>
                                </button>

                                : <>
                                    swap
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideStake2(true);
                                            setStakeLegend2('swap');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {stakeLegend2}
                                        </p>
                                    </button>
                                </>
                        }
                    </h2>
                }
                {
                    !hideStake2 &&
                    <p>Coming soon.</p>
                }
            </div>
        </div>
    );
}

export default Component
