//区块链信息
export const blockchain = (state = {}, action) => {
  switch (action.type) {
    case "BLOCKCHAIN_LOADED":
      return {
        ...state,
        provider: action.provider,
        chainId: action.chainId,
      };
    case "ACCOUNT_LOADED":
      return {
        ...state,
        account: action.account,
        balance: action.balance,
      };
    default:
      return state;
  }
};

//代币信息
export const tokens = (state = {}, action)=>{
    switch (action.type) {
    //所有代币
    case "TOKEN_LOADED":
      return action.tokens;
    
    default:
      return state;
  }
}

//交易所信息
export const exchange = (state = { event:[], allOrders:[] }, action)=>{
    switch (action.type) {
    case "EXCHANGE_LOADED":
      return {
        ...state,
        contract:action.contract,
      }
    //当前交易的代币
    case "TOKEN_EXCHANGE_LOADED":
      return {
        ...state,
        currentToken:action.currentToken,
      }
    //当前交易的代币
    case "EXCHANGE_BALANCE_LOADED":
      return {
        ...state,
        balance:action.balance,
      }
    case "TOKEN_BALANCE_LOADED":
      state.currentToken[0].balance = action.balance_token[0]
      state.currentToken[1].balance = action.balance_token[1]
      return {
        ...state,
      }
    //进行中
    case "TRANSFER_REQUEST":
      return {
        ...state,
        status:{
          type:'Transfer',
          pendding:true,
          success:false,
        }
      }
    //成功
    case "TRANSFER_SUCCESS":
      return {
        ...state,
        status:{
          type:'Transfer',
          pendding:false,
          success:true,
        },
        event:[action.event,...state.event]
      }
    //失败
    case "TRANSFER_FAIL":
      return {
        ...state,
        status:{
          type:'Transfer',
          pendding:false,
          success:false,
          isError:true,
        },
      }
    case "MAKEORDER_REQUEST":
      return {
        ...state,
        status:{
          type:'MakeOrder',
          pendding:true,
          success:false,
        }
      }
    case "MAKEORDER_SUCCESS":
     //去重
      let index = state.allOrders.findIndex(item=>{
        return item.orderId.toString() == action.order.orderId.toString()
      }
      )
      if(index > -1){
        return state
      }
      return {
        ...state,
        status:{
          type:'MakeOrder',
          pendding:false,
          success:true,
        },
        event:[action.event,...state.event],
        allOrders:[...state.allOrders,action.order]
      }
      case "MAKEORDER_FAIL":
      return {
        ...state,
        status:{
          type:'MakeOrder',
          pendding:false,
          success:false,
          isError:true,
        }
      }
      case "ALL_ORDER_LOAD":
      return {
        ...state,
        allOrders:action.allOrders
      }



    default:
      return state;
  }
}