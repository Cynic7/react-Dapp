import token_abi from '../abi/token_abi.json'
import { ethers } from 'ethers';
let dispatch,provider;


export default {
    getDispatch:(_dispatch)=>{
        dispatch = _dispatch;
    },
    loadAccount:async()=>{
        const accounts =  await window.ethereum.request({method:'eth_requestAccounts'})
        let balance = ethers.utils.formatEther(await provider.getBalance(accounts[0])) 
        dispatch({type:'ACCOUNT_LOADED', account:accounts[0],balance });
        return {
            balance,
            account:accounts[0],
        }
    },
    loadBlockchain: async()=>{
        provider = new ethers.providers.Web3Provider(window.ethereum)
        const { chainId } = await provider.getNetwork()
        dispatch({type:'BLOCKCHAIN_LOADED', provider,chainId});
        return chainId
    },
    loadToken: async(address)=>{
        let tokens = []
        console.log(address);
        address.forEach(async(item)=>{
            const contract = new ethers.Contract(item, token_abi , provider)
            console.log(contract);
            let symbol = await contract.symbol()
            tokens.push({symbol,contract})
            console.log(tokens);
        })
        console.log(333,tokens);
        dispatch({type:'TOKEN_LOADED',tokens });
    },
    //当前交易对象
    loadToken_Exchange: (currentToken)=>{
        dispatch({type:'TOKEN_EXCHANGE_LOADED',currentToken });
    },
    loadExchange: async(address)=>{
        let tokens = []
        const contract = new ethers.Contract(address, token_abi , provider)
        dispatch({type:'EXCHANGE_LOADED',contract });
    },
}