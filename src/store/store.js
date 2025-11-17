import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

/* Import Reducers */
import { blockchain, tokens, exchange, Qhy_NFT } from './reducers'

const reducer = combineReducers({
  blockchain,
  tokens,
  exchange,
  Qhy_NFT
})

const initialState = {}

const middleware = [thunk]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store
