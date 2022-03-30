import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { showGetStartedModal } from "../../../src/app/actions";
import { RootState } from "../../../src/app/reducers";
import PowerIcon from "../../../src/assets/logos/power-off.png";
import ArrowDown from "../../../src/assets/logos/down-chevron.png";
import ArrowUp from "../../../src/assets/logos/up-chevron.png";
import Warning from "../../../src/assets/icons/warning.svg";
import c1 from "../../../src/assets/icons/checkpoint_1.svg";
import c2 from "../../../src/assets/icons/checkpoint_2.svg";
import c3 from "../../../src/assets/icons/checkpoint_3.svg";
import c4 from "../../../src/assets/icons/checkpoint_4.svg";
import c5 from "../../../src/assets/icons/checkpoint_5.svg";
import cs from "../../../src/assets/icons/checkpoint_selected.svg";
import styles from "./styles.module.scss";
import Image from "next/image";

const mapStateToProps = (state: RootState) => ({
  modal: state.modal.getStartedModal,
});

const mapDispatchToProps = {
  dispatchModal: showGetStartedModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type ModalProps = ConnectedProps<typeof connector>;

function Component(props: ModalProps) {
  const { dispatchModal, modal } = props;

  const [active, setActive] = useState(0)
  const [modalInfo, setModalInfo] = useState(false)
  const [checkedStep, setCheckedStep] = useState(Array());

  const menuActive = (id) => {
    setCheckedStep([...checkedStep, active]);
    if (active === id) {
      setActive(0)
    } else {
      setActive(id)
    }
  }

  const isChecked = (id) => {
    if (checkedStep.some(val => val === id)) {
      return true;
    } else {
      return false;
    }
  }

  if (!modal) {
    return null;
  }

  return (
    <>
      <div onClick={() => dispatchModal(false)} className={styles.outerWrapper} />
      <div className={active !== 0 ? styles.container2 : styles.container}>
        <div className={modalInfo ? styles.innerContainer2 : styles.innerContainer}>
          <div className={styles.headerWrapper}>
            <div>
              <Image alt="power-ico" src={PowerIcon} width={30} height={30} />
            </div>
            <h5 className={styles.headerTxt}>YOUR QUICKSTART GUIDE</h5>
          </div>
          <div className={styles.contentWrapper}>
            <div className={styles.rowWrapper}>
              <div onClick={() => menuActive(1)} className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    {isChecked(1) ? <Image alt="point-1" src={cs} width={25} height={25} /> : <Image alt="point-1" src={c1} width={25} height={25} />}
                  </div>
                  <text className={styles.rowHeaderTitle}>Create ZilPay Wallet</text>
                </div>
                <div>
                  {active === 1 ? <Image alt="arrow-up" src={ArrowUp} width={20} height={20} /> : <Image alt="arrow-down" src={ArrowDown} width={20} height={20} />}
                </div>
              </div>
              <div className={styles.rowContent}>
                {active === 1 ? (
                  <>
                    <text className={styles.rowContentTxt}>To create your ZilPay wallet, you must first download the extension to your browser.</text>
                    <text className={styles.rowContentTxt}>
                      <br /><br /><ul className={styles.ul}><li className={styles.li}>Go to <a className={styles.linkColor} href="https://zilpay.io/" target="_blank" rel="noreferrer">https://zilpay.io/</a> and click on **GET CHROME EXTENSION**.</li></ul>
                      Once you have downloaded and installed the extension, you will find an icon in the top right corner where Chrome extensions are listed. The ZilPay icon and name should be displayed in the list.
                      <br /><br /><ul className={styles.ul}><li className={styles.li}>Click on the ZilPay icon in the list of extensions, and click on Create.</li></ul>
                      {modalInfo &&
                        <>
                          <div onClick={() => setModalInfo(false)} className={styles.outerWrapper} />
                          <div className={styles.modalInfo}>
                            <h5 className={styles.modalInfoTitle}>WARNING</h5>
                            <text>Although the words shown at the beginning are 8, your secret phrase is made up of 12 or 24 words. To see the complete list, click between the words in the list and press the down arrow button repeatedly on your keyboard until you see the total number of words.</text>
                          </div>
                        </>
                      }
                      <ul className={styles.ul}><li className={styles.li}>You will see a list of words that make up your secret phrase. You must write these words down in a safe place. Remember that the words must be ordered and spelt correctly. You can choose between 12 and 24 words.<Image onClick={() => setModalInfo(!modalInfo)} alt="warning-ico" src={Warning} width={20} height={20} /></li></ul>
                      <ul className={styles.ul}><li className={styles.li}>Once you have entered all the words in your secret phrase word list correctly and in order, click **Continue.**. You will be asked to verify your phrase by clicking on the words in order. Once you have done that, press **Continue** again.</li></ul>
                      <ul className={styles.ul}><li className={styles.li}>Now it&apos;s time to create your username and password. Then click Accept PrivacyPolicy and Continue to finish.</li></ul>
                    </text>
                  </>
                ) : (
                  <text className={styles.rowContentTxt}>To create your ZilPay wallet, you must first download the extension to your browser.</text>
                )}
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    <Image alt="point-1" src={c2} width={25} height={25} />
                  </div>
                  <text className={styles.rowHeaderTitle}>Create ArConnect wallet</text>
                </div>
                <div>
                  <Image alt="arrow-down" src={ArrowDown} width={20} height={20} />
                </div>
              </div>
              <div className={styles.rowContent}>
                <text className={styles.rowContentTxt}>To create your ZilPay wallet, you must first download the extension to your browser.</text>
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    <Image alt="point-1" src={c3} width={25} height={25} />
                  </div>
                  <text className={styles.rowHeaderTitle}>Connect ZilPay wallet</text>
                </div>
                <div>
                  <Image alt="arrow-down" src={ArrowDown} width={20} height={20} />
                </div>
              </div>
              <div className={styles.rowContent}>
                <text className={styles.rowContentTxt}>To create your ZilPay wallet, you must first download the extension to your browser.</text>
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    <Image alt="point-1" src={c4} width={25} height={25} />
                  </div>
                  <text className={styles.rowHeaderTitle}>Buy Tyron SSI</text>
                </div>
                <div>
                  <Image alt="arrow-down" src={ArrowDown} width={20} height={20} />
                </div>
              </div>
              <div className={styles.rowContent}>
                <text className={styles.rowContentTxt}>To create your ZilPay wallet, you must first download the extension to your browser.</text>
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div className={styles.rowHeader}>
                <div className={styles.rowHeaderContent}>
                  <div>
                    <Image alt="point-1" src={c5} width={25} height={25} />
                  </div>
                  <text className={styles.rowHeaderTitle}>Buy NFT Username</text>
                </div>
                <div>
                  <Image alt="arrow-down" src={ArrowDown} width={20} height={20} />
                </div>
              </div>
              <div className={styles.rowContentNoBorder}>
                <text className={styles.rowContentTxt}>To create your ZilPay wallet, you must first download the extension to your browser.</text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default connector(Component);
