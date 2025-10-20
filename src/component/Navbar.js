import { useSelector } from 'react-redux'
import logo from '../assets/logo.png'
import eth from '../assets/eth.svg'
import Blockies  from 'react-blockies'
import { useState,useEffect } from 'react'
import interactions from '../store/interactions.js'
const { loadAccount } = interactions;

const Navbar = () => {
  let {account,balance,chainId} = useSelector(state=>state.blockchain)

  // useEffect(()=>{
  //   loadAccount()
  // },[])
  const connectHandler = async()=>{
    loadAccount()
  }
  console.log(chainId);
  const changeNetwork = ()=>{

  }
  return(
    <div className='exchange__header grid'>
      <div className='exchange__header--brand flex'>
        <img src={logo} className='logo' />
        <h1>QHY代币交易所</h1>
      </div>

      <div className='exchange__header--networks flex'>
        <img src={eth} className='Eth logo' />
        {
          chainId && 
          <select name="network" id="networks" value={'0x' + chainId.toString(16)} placeholder="请选择网络" onChange={changeNetwork}>
            <option value=""></option>
            <option value="0x7a69">Localhost</option>
            <option value="0x2A">Kovan</option>
          </select>
        }
        
      </div>

      <div className='exchange__header--account flex'>
        {
          balance ? <p><small>余额 </small> {Number(balance).toFixed(4)}</p>
          :''
        }
        {account? (
          <a>
            {account.slice(0,5) + '...' + account.slice(38,42)}
            <Blockies
              seed={account}
              size={10}
              scale={3}
              color='#2187D0'
              className='identicon'
             />
          </a>
          
        ) : <button className='button' onClick={connectHandler}>连接账号</button>}
      </div>
    </div>
  )
}

export default Navbar;