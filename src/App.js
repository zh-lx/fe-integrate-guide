import { useEffect, useState } from 'react';
import Web3 from 'web3';
import Modal from './components/modal';
import './App.css';

function App() {
  const [account, setAccount] = useState(''); // user's own account
  const [amount, setAmount] = useState('0');
  const [address, setAddress] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [showInstallMetaMaskModal, setShowInstallMetaMaskModal] =
    useState(false);

  const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');

  useEffect(() => {
    validateMetaMaskInstalled();
    getAccounts();
  }, []);

  // input address
  const changeAddress = (e) => {
    let value = e.target.value;
    setAddress(value);
  };

  // input amount
  const changeAmount = (e) => {
    let value = e.target.value.toString();
    value = value.replace(/[^\d.]/g, ''); // clears characters other than numbers and .
    value = value.replace(/\.{2,}/g, '.'); // clears extra .
    value = value.replace(/^0+/g, '0'); // clears the extra 0 at the beginning
    value = value.match(/^0+[1-9]+/)
      ? (value = value.replace(/^0+/g, ''))
      : value; // clears 0 at the beginning of the integer part
    value = value.match(/^\d*(\.?\d{0,6})/g)[0] || ''; // keep up to six decimal places
    setAmount(value);
  };

  // transfer
  const transfer = async () => {
    if (!account) {
      getAccounts();
      return;
    }
    if (!validateInput() || !validateMetaMaskInstalled()) {
      return;
    }
    await getAccounts();
    address.includes(',') ? sendBatchTransaction() : sendTransaction();
  };

  // Verify that metamask is installed
  const validateMetaMaskInstalled = async () => {
    if (!web3.currentProvider?.isMetaMask) {
      setShowInstallMetaMaskModal(true);
      return false;
    }
    return true;
  };

  // validate address and amount
  const validateInput = () => {
    if (address.includes(',')) {
      const addresses = address.split(',');
      for (let address of addresses) {
        if (!web3.utils.isAddress(address)) {
          alert('Please input a valid address');
          return false;
        }
      }
    } else if (!web3.utils.isAddress(address)) {
      alert('Please input a valid address');
      return false;
    }
    if (Number(amount) < 1e-6) {
      alert('Please input a valid amount');
      return false;
    }
    return true;
  };

  // go to install MetaMask
  const geToInstallMetaMask = () => {
    setShowInstallMetaMaskModal(false);
    window.open('https://metamask.io/download.html', '_blank');
  };

  // get metamask account
  const getAccounts = async () => {
    let accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert('Please authorize metamask');
      accounts = await window.ethereum.enable();
    }
    setIsAuth(true);
    setAccount(accounts[0]);
  };

  // sendTransaction
  const sendTransaction = async () => {
    if (!(await determineBalance(amount))) {
      return;
    }
    try {
      const res = await web3.eth.sendTransaction({
        from: account,
        to: address,
        value: toBigNumber(amount),
      });
      if (res.status) {
        alert(`Transfer ${amount} eth to ${address} successfully!`);
      } else {
        alert(`Transfer ${amount} eth to ${address} unsuccessfully!`);
      }
    } catch (error) {
      alert(`Transfer ${amount} eth to ${address} unsuccessfully!`);
    }
  };

  // batch Transaction
  const sendBatchTransaction = async () => {
    const addresses = address.split(',');
    if (
      !(await determineBalance((Number(amount) * addresses.length).toString()))
    ) {
      return;
    }
    addresses.forEach(async (address) => {
      try {
        const res = await web3.eth.sendTransaction({
          from: account,
          to: address,
          value: toBigNumber(amount),
        });
        if (res.status) {
          alert(`Transfer ${amount} eth to ${address} successfully!`);
        } else {
          alert(`Transfer ${amount} eth to ${address} unsuccessfully!`);
        }
      } catch (error) {
        alert(`Transfer ${amount} eth to ${address} unsuccessfully!`);
      }
    });
  };

  function toBigNumber(num) {
    const integer = num.split('.')[0];
    const decimal = num.split('.')[1];
    return `${integer}${decimal || ''}${'0'.repeat(
      12 + (6 - (decimal?.length || 0))
    )}`;
  }

  const determineBalance = async (value) => {
    const total = toBigNumber(value);
    const balance = await web3.eth.getBalance(account);
    if (total.length < balance.length) {
      return Promise.resolve(true);
    } else if (total.length > balance.length || total > balance) {
      alert('Lack of balance！');
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  };

  return (
    <div className="App">
      <div className="transfer-container">
        <h3 className="transfer-title">Transfer</h3>
        <div className="transfer-description">transfer eth by MetaMask</div>
        <div className="form-item">
          <div className="label">Address:</div>
          <input
            className="input"
            type="text"
            placeholder="Recipient Address"
            value={address || ''}
            onChange={changeAddress}
          />
        </div>
        <div className="form-item">
          <div className="label">Amount:</div>
          <input
            name="amount"
            className="input"
            value={amount}
            onChange={changeAmount}
          />
        </div>

        <div className="transfer-btn" onClick={transfer}>
          {isAuth ? 'Transfer' : 'Authorize MetaMask'}
        </div>
      </div>
      <Modal
        visible={showInstallMetaMaskModal}
        content={`It detects that you haven't installed MetaMask. Go to install it?`}
        onConfirm={geToInstallMetaMask}
        onCancel={() => {
          setShowInstallMetaMaskModal(false);
        }}
      />
    </div>
  );
}

export default App;
