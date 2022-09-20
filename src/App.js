import { useState, useEffect } from "react";
import Web3 from "web3";
import "./App.css";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import Home from "./components/Home/Home";
import Staff from "./components/Staff/Staff";
import openTipAbi from "./contracts/opentip.abi.json";

const ERC20_DECIMALS = 18;
const openTipAddress = "0xf2E2613d32E006ea3f300A76d69b972bf662A929";

function App() {
  const [kit, setKit] = useState();
  const [balance, setBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState();
  const [openTipContract, setOpenTipContract] = useState();
  const [namesTaken, setNamesTaken] = useState([]);
  const [isStaff, setIsStaff] = useState(null);
  const [tips, setTips] = useState(null);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (kit && walletAddress) {
      getBalance();
    }
  }, [kit, walletAddress]);

  useEffect(() => {
    if (openTipContract) {
      setNamesTakenFunc();
      getTips();
    }
  }, [openTipContract]);

  useEffect(() => {
    if (walletAddress && openTipContract) {
      setIsStaffFunc();
    }
  }, [openTipContract, walletAddress]);

  // wallet connection
  const connectWallet = async () => {
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const defaultAccount = accounts[0];
        kit.defaultAccount = defaultAccount;

        setKit(kit);
        setWalletAddress(defaultAccount);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert(
        "You need to install the celo wallet extension in order to use this app"
      );
    }
  };

  // set wallet balance and contract
  const getBalance = async () => {
    try {
      const balance = await kit.getTotalBalance(walletAddress);
      const cUsdBalance = balance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2);
      const contract = new kit.web3.eth.Contract(openTipAbi, openTipAddress);

      setOpenTipContract(contract);
      setBalance(cUsdBalance);
    } catch (error) {
      console.log(error);
    }
  };

  const getTips = async () => {
    try {
      const myTips = await openTipContract.methods.readMyTips().call();
      const _tips = [];
      for (let i = 0; i < myTips.length; i++) {
        let tip = await new Promise(async (resolve) => {
          let _tip = await openTipContract.methods.readTip(myTips[i]).call();
          resolve({
            message: _tip[0],
            amount: _tip[1],
            sender: _tip[2],
            timeStamp: _tip[3],
          });
        });
        _tips.push(tip);
      }
      const loadedTips = await Promise.all(_tips);
      console.log(loadedTips.length);
      setTips(loadedTips);
    } catch (e) {
      console.log(e);
    }
  };

  const register = async (uniqueId) => {
    if (uniqueId) {
      const _uniqueId = uniqueId + ".dac";
      try {
        await openTipContract.methods
          .createNewWallet(_uniqueId, walletAddress)
          .send({ from: walletAddress });
        alert("Registration completed successfully");
        window.location.reload();
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("Invalid details entered");
    }
  };

  const setNamesTakenFunc = async () => {
    try {
      const _namesTaken = await openTipContract.methods.readNamesTaken().call();
      setNamesTaken(_namesTaken);
    } catch (e) {
      console.log(e);
    }
  };

  const checkAddressWithNameFunc = async (walletId) => {
    try {
      const walletAddress = await openTipContract.methods
        .checkAddressWithName(walletId)
        .call();
      return walletAddress;
    } catch (e) {
      console.log(e);
    }
  };

  const tip = async (message, receiverId, receiverAddress, amount) => {
    if (!message || !receiverId || !receiverAddress) {
      alert("Please enter valid details and try again");
    } else {
      console.log(message, receiverId, receiverAddress, amount);
      const bigAmount = new BigNumber(amount)
        .shiftedBy(ERC20_DECIMALS)
        .toString();
      try {
        await openTipContract.methods
          .tip(message, receiverId, receiverAddress)
          .send({ from: walletAddress, value: bigAmount });
        alert("You have tipped a staff successfully");
        window.location.reload();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const setIsStaffFunc = async () => {
    try {
      const name = await openTipContract.methods
        .checkNameWithAddress(walletAddress)
        .call();
      const isStaff = await openTipContract.methods.isStaff(name).call();      
      setIsStaff(isStaff);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {isStaff !== null ? (
        <div className="app">
          {!isStaff ? (
            <Home
              bal={balance}
              namesTaken={namesTaken}
              register={register}
              tip={tip}
              checkAddress={checkAddressWithNameFunc}
              userWallet={walletAddress}
            />
          ) : (
            <Staff tips={tips} />
          )}
        </div>
      ) : (
        <div>Data loading. Please wait</div>
      )}
    </>
  );
}

export default App;
