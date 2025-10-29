import token_abi from "../abi/token_abi.json";
import exchange_abi from "../abi/exchange_abi.json";
import { ethers } from "ethers";
let dispatch, provider, exchange;

function parseEther(n){
  return ethers.utils.parseEther(n)
}

export default {
  getDispatch: (_dispatch) => {
    dispatch = _dispatch;
  },
  loadAccount: async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    let balance = ethers.utils.formatEther(
      await provider.getBalance(accounts[0])
    );
    dispatch({ type: "ACCOUNT_LOADED", account: accounts[0], balance });
    return {
      balance,
      account: accounts[0],
    };
  },
  loadBlockchain: async () => {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    dispatch({ type: "BLOCKCHAIN_LOADED", provider, chainId });
    return chainId;
  },
  loadToken: async (address) => {
    let tokens = [];
    for (let i = 0; i < address.length; i++) {
      const contract = new ethers.Contract(address[i], token_abi, provider);
      let symbol = await contract.symbol();
      tokens.push({ symbol, contract });
    }
    console.log(333, tokens);
    dispatch({ type: "TOKEN_LOADED", tokens });
  },
  //当前交易对象
  loadToken_Exchange: (currentToken) => {
    dispatch({ type: "TOKEN_EXCHANGE_LOADED", currentToken });
  },
  loadExchange: (address) => {
    const contract = new ethers.Contract(address, exchange_abi, provider);
    dispatch({ type: "EXCHANGE_LOADED", contract });
    console.log("loadExchange", contract);
    exchange = contract;
    return contract;
  },
  loadBalance: async (tokens, account, exchange) => {
    let balance_token = [];
    let balance_exchange = [];
    for (let i = 0; i < tokens.length; i++) {
      balance_exchange.push(
        ethers.utils.formatEther(
          await exchange.balanceOf(tokens[i].contract.address, account)
        )
      );

      balance_token.push(
        ethers.utils.formatEther(await tokens[i].contract.balanceOf(account))
      );
    }

    dispatch({ type: "EXCHANGE_BALANCE_LOADED", balance: balance_exchange });
    dispatch({ type: "TOKEN_BALANCE_LOADED", balance_token });
  },

  listenEvent: (exchange) => {
    exchange.on("DepositToken", (...args) => {
      dispatch({ type: "TRANSFER_SUCCESS", event: args[args.length - 1] });
    });

    exchange.on("WithdrawToken", (...args) => {
      console.log('WithdrawToken');
      dispatch({ type: "TRANSFER_SUCCESS", event: args[args.length - 1] });
    });

    exchange.on("MakeOrder", (...args) => {
      let event = args[args.length - 1];
      console.log('MakeOrder');
      dispatch({ type: "MAKEORDER_SUCCESS", event,order:event.args });
    });

    exchange.on("CancelOrder", (...args) => {
      let event = args[args.length - 1];
      console.log('CancelOrder');
      dispatch({ type: "EXCHANGE_REQUEST_SUCCESS",requestType:'CancelOrder', event, order:event.args });
    });

    exchange.on("FillOrder", (...args) => {
      let event = args[args.length - 1];
      console.log('FillOrder');
      dispatch({ type: "EXCHANGE_REQUEST_SUCCESS",requestType:'FillOrder', event, order:event.args });
    });

  },

  depositToken: async (token, value, exchange) => {
    dispatch({ type: "TRANSFER_REQUEST" });

    try {
      const signer = await provider.getSigner();
      let transcation;
      transcation = await token
        .connect(signer)
        .approve(exchange.address, parseEther(value));
      await transcation.wait();
      transcation = await exchange
        .connect(signer)
        .depositToken(token.address, parseEther(value));
      await transcation.wait();
    } catch (e) {
      dispatch({ type: "TRANSFER_FAIL" });
    }
  },

  withdrawToken: async (token, value, exchange) => {
    dispatch({ type: "TRANSFER_REQUEST" });

    try {
      const signer = await provider.getSigner();
      let transcation;

      transcation = await exchange
        .connect(signer)
        .withdrawToken(token.address, parseEther(value));
      await transcation.wait();
    } catch (e) {
      dispatch({ type: "TRANSFER_FAIL" });
    }
  },

  makeOrders: async (tokens, values) => {
    dispatch({ type: "MAKEORDER_REQUEST" });

    try {
      const signer = await provider.getSigner();
      let transcation;

      transcation = await exchange
        .connect(signer)
        .makeOrder(tokens[0],parseEther(values[0]),tokens[1],parseEther(values[1]));
      await transcation.wait();
      
    } catch (e) {
      dispatch({ type: "MAKEORDER_FAIL" });
    }
  },

  loadAllOrder: async(exchange)=>{
    const events = await exchange?.queryFilter('MakeOrder',0,'latest')
    const events_cancel = await exchange?.queryFilter('CancelOrder',0,'latest')
    const events_fill = await exchange?.queryFilter('FillOrder',0,'latest')
    if(!events)return;
    console.log('events',events);

    let allOrders = events?.map(item=>item.args)
    let cancelOrders = events_cancel?.map(item=>item.args)
    let fillOrders = events_fill?.map(item=>item.args)

    console.log('allOrders',allOrders);
    dispatch({ type: "ALL_ORDER_LOAD",allOrders });
    dispatch({ type: "CANCEL_ORDER_LOAD",cancelOrders });
    dispatch({ type: "FILL_ORDER_LOAD",fillOrders });

  },
  cancelOrder: async(order)=>{
    dispatch({ type: "EXCHANGE_REQUEST",requestType:'CancelOrder' });
    try{
      const signer = await provider.getSigner()
      let transcation = await exchange.connect(signer).cancelOrder(order.orderId);
      await transcation.wait();

    }catch(e){
      dispatch({ type: "EXCHANGE_REQUEST_FAIL",requestType:'CancelOrder'  });
    }

  },
  fillOrder: async(order)=>{
    dispatch({ type: "EXCHANGE_REQUEST",requestType:'FillOrder' });
    try{
      const signer = await provider.getSigner()
      let transcation = await exchange.connect(signer).fillOrder(order.orderId);
      await transcation.wait();

    }catch(e){
      dispatch({ type: "EXCHANGE_REQUEST_FAIL",requestType:'FillOrder'  });
    }

  }
  
};
