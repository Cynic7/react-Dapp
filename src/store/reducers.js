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
export const exchange = (state = {}, action)=>{
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

    default:
      return state;
  }
}