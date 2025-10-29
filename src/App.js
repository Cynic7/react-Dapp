import { useEffect } from 'react';
import { ethers } from 'ethers';
import token_abi from './abi/token_abi.json'
import { useDispatch } from 'react-redux'
import config from './config.json'
import './App.css';
import Navbar from './component/Navbar.js'
import Market from './component/Market.js'
import Balance from './component/Balance.js'
import Order from './component/Order.js'
import OrderBook from './component/OrderBook.js'
import PriceChart from './component/PriceChart.js'
import Trades from './component/Trades.js'
import Transactions from './component/Transactions.js'
import Alert from './component/Alert.js'

import interactions from './store/interactions.js'
const { getDispatch,loadBlockchain,loadToken,loadExchange,loadAccount,listenEvent } = interactions;

function App() {
  
  getDispatch(useDispatch())

  const mounted = async()=>{
    const chainId = await loadBlockchain()
    let myConfig = config[chainId];
    console.log(chainId);
    try{
      loadToken([myConfig.QHY.address,myConfig.mETH.address,myConfig.mDAI.address])
      const exchange = loadExchange(myConfig.exchange.address)
        //监听事件
      listenEvent(exchange)
    }catch(e){
      console.log(e);
    }

    window.ethereum.on('accountsChanged',()=>{
      console.log('账号变更');
      loadAccount()
    })

    window.ethereum.on('chainChanged',()=>{
      window.location.reload()
    })
  }

  useEffect(()=>{
    mounted()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Market />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart />

          <Transactions />

          <Trades />

          <OrderBook />

        </section>
      </main>

      <Alert />

    </div>
  );
}

export default App;
