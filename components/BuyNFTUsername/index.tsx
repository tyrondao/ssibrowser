import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import { HTTPProvider } from "@zilliqa-js/core";
import { Transaction } from "@zilliqa-js/account";
import { BN, Long } from "@zilliqa-js/util";
import { randomBytes, toChecksumAddress } from "@zilliqa-js/crypto";
import styles from "./styles.module.scss";
import { useStore } from "effector-react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { ZilPayBase } from "../ZilPay/zilpay-base";
import { $new_ssi } from "../../src/store/new-ssi";
import { $user } from "../../src/store/user";
import { Donate, AddFunds } from "..";
import { $loggedIn, updateLoggedIn } from "../../src/store/loggedIn";
import { $net, updateNet } from "../../src/store/wallet-network";
import { $donation, updateDonation } from "../../src/store/donation";
import { fetchAddr } from "../SearchBar/utils";
import {
  setTxStatusLoading,
  showTxStatusModal,
  setTxId,
  hideTxStatusModal,
  showLoginModal,
} from "../../src/app/actions";
import { updateContract } from "../../src/store/contract";
import { updateZilAddress } from "../../src/store/zil_address";
import { updateTxList } from "../../src/store/transactions";

function Component() {
  const Router = useRouter();
  const dispatch = useDispatch();
  const net = useStore($net);
  const donation = useStore($donation);

  const username = $user.getState()?.name;
  const new_ssi = useStore($new_ssi);
  const logged_in = useStore($loggedIn);
  const [ssi, setSSI] = useState(""); // DIDxWallet contract address

  const [currency, setCurrency] = useState("");
  const [addrID, setAddrID] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [isEnough, setIsEnough] = useState(false);
  const [recipientOpt, setRecipientOpt] = useState("");
  const [inputAddr, setInputAddr] = useState("");
  const [legend, setLegend] = useState("save");

  const [loading, setLoading] = useState(false);

  const handleOnChangeRecipient = async (event: { target: { value: any } }) => {
    setRecipientOpt(event.target.value);
  };
  const handleOnChange = async (event: { target: { value: any } }) => {
    setSSI("");
    setCurrency("");
    setAddrID("");
    setCurrentBalance(0);
    setIsEnough(false);
    updateDonation(null);
    setLoadingBalance(true);

    const selection = event.target.value;
    setCurrency(selection);

    let addr: string;
    if (new_ssi !== null) {
      addr = new_ssi;
      updateLoggedIn({ address: new_ssi });
    } else {
      addr = logged_in?.address!;
    }
    setSSI(addr);
    updateContract({ addr: addr });

    const paymentOptions = async (id: string) => {
      let token_addr: string;
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;
      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
      }
      const init = new tyron.ZilliqaInit.default(network);
      const init_addr = await fetchAddr({
        net,
        _username: "init",
        _domain: "did",
      });
      const get_services = await init.API.blockchain.getSmartContractSubState(
        init_addr,
        "services"
      );
      const services = await tyron.SmartUtil.default.intoMap(
        get_services.result.services
      );
      try {
        token_addr = services.get(id.toLowerCase());
        const balances = await init.API.blockchain.getSmartContractSubState(
          token_addr,
          "balances"
        );
        const balances_ = await tyron.SmartUtil.default.intoMap(
          balances.result.balances
        );
        const balance = balances_.get(addr.toLowerCase());
        if (balance !== undefined) {
          setCurrentBalance(balance);
          if (balance >= 10e12) {
            setIsEnough(true);
          }
        }
      } catch (error) {
        toast.error("Not able to fetch balance.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
      setLoadingBalance(false);
    };
    let addrId = "free00";
    switch (selection) {
      case "TYRON":
        addrId = "tyron0";
        break;
      case "$SI":
        addrId = "$si000";
        break;
      case "XSGD":
        addrId = "xsgd00";
        break;
      case "zUSDT":
        addrId = "zusdt0";
        break;
      case "PIL":
        addrId = "pil000";
        break;
      case "PIL":
        addrId = "pil000";
        break;
    }
    if (addrId !== "free00") {
      paymentOptions(addrId);
    }
    setAddrID(addrId);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const zilpay = new ZilPayBase();
      const tx_params = Array();

      const username_ = addrID.concat(username!);
      const tx_username = {
        vname: "username",
        type: "String",
        value: username_,
      };
      tx_params.push(tx_username);
      /*
      const id_ = {
        vname: "id",
        type: "String",
        value: id,
      };
      tx_params.push(id_);*/

      let addr;
      if (recipientOpt === "ADDR") {
        addr = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.some,
          "ByStr20",
          inputAddr
        );
      } else {
        addr = await tyron.TyronZil.default.OptionParam(
          tyron.TyronZil.Option.none,
          "ByStr20"
        );
      }

      const tx_addr = {
        vname: "addr",
        type: "Option ByStr20",
        value: addr,
      };
      tx_params.push(tx_addr);

      let _amount = String(0);
      /*
      let tx_amount = {
        vname: "amount",
        type: "Uint128",
        value: "0",
      };
      tx_params.push(tx_amount);*/

      let tyron_ = await tyron.TyronZil.default.OptionParam(
        tyron.TyronZil.Option.none,
        "Uint128"
      );
      if (addrID === "free00" && donation !== null) {
        tyron_ = await tyron.Donation.default.tyron(donation);
        _amount = String(donation);
      }
      const tx_tyron = {
        vname: "tyron",
        type: "Option Uint128",
        value: tyron_,
      };
      tx_params.push(tx_tyron);

      /**
       * @todo move the following to tyron.js
       */
      const generateChecksumAddress = () => toChecksumAddress(randomBytes(20));
      let endpoint = "https://api.zilliqa.com/";
      if (net === "testnet") {
        endpoint = "https://dev-api.zilliqa.com/";
      }
      let tx = new Transaction(
        {
          version: 0,
          toAddr: generateChecksumAddress(),
          amount: new BN(0),
          gasPrice: new BN(1000),
          gasLimit: Long.fromNumber(1000),
        },
        new HTTPProvider(endpoint)
      );
      // end @todo

      toast.info(
        `You're about to buy the NFT Username ${username} for your SSI.`,
        {
          position: "top-center",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      dispatch(setTxStatusLoading("true"));
      dispatch(showTxStatusModal());
      await zilpay
        .call({
          contractAddress: ssi,
          transition: "BuyNftUsername",
          params: tx_params,
          amount: _amount,
        })
        .then(async (res) => {
          dispatch(setTxId(res.ID));
          dispatch(setTxStatusLoading("submitted"));

          tx = await tx.confirm(res.ID);
          if (tx.isConfirmed()) {
            dispatch(setTxStatusLoading("confirmed"));
            setTimeout(() => {
              window.open(
                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
              );
            }, 1000);
            Router.push(`/${username}`);
          } else if (tx.isRejected()) {
            dispatch(hideTxStatusModal());
            dispatch(setTxStatusLoading("idle"));
            toast.error("Transaction failed.", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          }
          updateDonation(null);
        })
        .catch((err) => {
          throw err;
        });
    } catch (error) {
      toast.error(String(error), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
    setLoading(false);
  };

  const connect = React.useCallback(async () => {
    try {
      const wallet = new ZilPayBase();
      const zp = await wallet.zilpay();
      const connected = await zp.wallet.connect();

      const network = zp.wallet.net;
      updateNet(network);

      if (connected && zp.wallet.defaultAccount) {
        const address = zp.wallet.defaultAccount;
        updateZilAddress(address);
        dispatch(showLoginModal(true));
      }

      const cache = window.localStorage.getItem(
        String(zp.wallet.defaultAccount?.base16)
      );
      if (cache) {
        updateTxList(JSON.parse(cache));
      }
    } catch (err) {
      toast.error(`Connection error: ${err}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }, [dispatch]);

  const handleInputAddr = (event: { target: { value: any } }) => {
    setInputAddr("");
    setLegend("save");
    let value = event.target.value;
    try {
      value = zcrypto.fromBech32Address(value);
      setInputAddr(value);
    } catch (error) {
      try {
        value = zcrypto.toChecksumAddress(value);
        setInputAddr(value);
      } catch {
        toast.error(`Wrong address.`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10%" }}>
      <h1 style={{ color: "silver", marginBottom: "10%" }}>
        Own <span className={styles.username}>{username}</span>
      </h1>
      <>
        {new_ssi !== null ? (
          <>
            <p>You have a new self-sovereign identity at this address:</p>
            <p>
              <a
                href={`https://viewblock.io/zilliqa/address/${new_ssi}?network=${net}`}
                rel="noreferrer"
                target="_blank"
              >
                <span className={styles.x}>
                  {zcrypto.toBech32Address(new_ssi)}
                </span>
              </a>
            </p>
          </>
        ) : (
          <>
            {logged_in !== null && (
              <>
                <p>You are logged in with</p>
                {logged_in.username ? (
                  <p>
                    <span className={styles.x}>{logged_in?.username}.did</span>
                  </p>
                ) : (
                  <p>
                    <a
                      className={styles.x}
                      href={`https://viewblock.io/zilliqa/address/${logged_in?.address}?network=${net}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className={styles.x}>
                        {zcrypto.toBech32Address(logged_in.address!)}
                      </span>
                    </a>
                  </p>
                )}
              </>
            )}
          </>
        )}
        {new_ssi !== null ||
          (logged_in !== null && (
            <div className={styles.containerWrapper}>
              <select
                style={{ marginBottom: "10%" }}
                onChange={handleOnChangeRecipient}
              >
                <option value="">Select recipient option</option>
                <option value="SSI">SSI</option>
                <option value="ADDR">Input Address</option>
              </select>
              {recipientOpt === "ADDR" && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="text"
                    className={styles.inputAdress}
                    onChange={handleInputAddr}
                    placeholder="Type address"
                    autoFocus
                  />
                  <button
                    onClick={() => setLegend("saved")}
                    className={
                      legend === "save" ? "button primary" : "button secondary"
                    }
                  >
                    {legend}
                  </button>
                </div>
              )}
            </div>
          ))}
        {new_ssi === null && logged_in === null ? (
          <>
            <p style={{ marginBottom: "7%" }}>
              Buy this NFT Username with your self-sovereign identity
            </p>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <p style={{ marginTop: "1%" }}>To continue,&nbsp;</p>
              <button className="button" onClick={connect}>
                <p>CONNECT</p>
              </button>
            </div>
          </>
        ) : recipientOpt !== "" ? (
          <div className={styles.containerWrapper}>
            <select className={styles.container} onChange={handleOnChange}>
              <option value="">Select payment</option>
              <option value="TYRON">TYRON</option>
              <option value="$SI">$SI</option>
              <option value="zUSDT">zUSDT</option>
              <option value="XSGD">XSGD</option>
              <option value="PIL">PIL</option>
              <option value="FREE">Free</option>
            </select>
            {currency === "TYRON" && (
              <>
                <h4>Cost: 10 TYRON</h4>
                {!loadingBalance && (
                  <p>
                    Your SSI has a current balance of {currentBalance / 1e12}{" "}
                    TYRON.
                  </p>
                )}
              </>
            )}
            {currency === "$SI" && (
              <>
                <h4>Cost: 10 $SI</h4>
                {!loadingBalance && (
                  <p>
                    Your SSI has a current balance of {currentBalance / 1e12}{" "}
                    $SI.
                  </p>
                )}
              </>
            )}
            {currency === "XSGD" && <h4>Cost: 14 XSGD</h4>}
            {currency === "zUSDT" && <h4>Cost: 10 zUSDT</h4>}
            {currency === "PIL" && <h4>Cost: 12 PIL</h4>}
            {currency === "FREE" && (
              <h4>Only valid for NFT Username winners!</h4>
            )}
            {currency === "FREE" && <Donate />}
            {currency !== "" && !loadingBalance ? (
              isEnough ? (
                <>
                  {(donation !== null || currency !== "FREE") && (
                    <div style={{ marginTop: "14%", textAlign: "center" }}>
                      <button className="button" onClick={handleSubmit}>
                        <p>
                          Buy{" "}
                          <span className={styles.username}>{username}</span>{" "}
                          NFT Username
                        </p>
                      </button>
                      {currency !== "FREE" && (
                        <h5 style={{ marginTop: "3%" }}>around 13 ZIL</h5>
                      )}
                      {currency === "FREE" && (
                        <h5 style={{ marginTop: "3%" }}>around 5.5 ZIL</h5>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p style={{ marginBottom: "10%" }}>
                    Not enough balance to buy an NFT Username.
                  </p>
                  <AddFunds type="buy" coin={currency} />
                  {/**
                   * @todo after adding funds, get back to previous step showing the updated balance to continue with the purchase.
                   */}
                </>
              )
            ) : currency !== "" && loadingBalance ? (
              <i
                className="fa fa-lg fa-spin fa-circle-notch"
                aria-hidden="true"
              ></i>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
      </>
      {loading ? (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Component;
