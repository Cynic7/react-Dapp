import { useSelector } from "react-redux";
import interactions from "../store/interactions.js";
import { useEffect } from "react";
const { loadAllOrder, fillOrder, loadBalance } = interactions;
import sort from "../assets/sort.svg";
import { orderBookSelector } from "../store/selectors.js";

const OrderBook = () => {
  const tokens = useSelector((state) => state.exchange.currentToken);
  const exchange = useSelector((state) => state.exchange.contract);
  const account = useSelector((state) => state.blockchain.account);

  const orderBook = account ? useSelector(orderBookSelector) :
    {
      sellOrder: [
        {orderId: "1", token0Value: 1, token1Value: 2, price: 3, type: "卖出"},
        {orderId: "2", token0Value: 2, token1Value: 4, price: 2.5, type: "卖出"},
        {orderId: "3", token0Value: 3, token1Value: 9, price: 3.0, type: "卖出"},
        {orderId: "4", token0Value: 4, token1Value: 12, price: 3.0, type: "卖出"},
        {orderId: "5", token0Value: 2.5, token1Value: 7.5, price: 3.0, type: "卖出"},
        {orderId: "6", token0Value: 3.5, token1Value: 10.5, price: 3.0, type: "卖出"},
      ],
      buyOrder: [
        {orderId: "7", token0Value: 0.8, token1Value: 2.4, price: 3.0, type: "买入"},
        {orderId: "8", token0Value: 1.2, token1Value: 3.6, price: 3.0, type: "买入"},
        {orderId: "9", token0Value: 0.5, token1Value: 1.5, price: 3.2, type: "买入"},
        {orderId: "10", token0Value: 1.5, token1Value: 4.5, price: 3.1, type: "买入"},
      ]
    }

  ;

  const fillOrderHandler = async (order) => {
    await fillOrder(order);
    loadBalance(tokens, account, exchange);
  };

  useEffect(() => {
    loadAllOrder(exchange);
  }, [exchange]);

  return (
    <div className="component exchange__orderbook">
      <div className="component__header flex-between">
        <h2>当前订单</h2>
      </div>

      <div className="flex">
         <div className="exchange__orderbook_content">
        <table className="exchange__orderbook--sell">
          <caption>卖单</caption>
          <thead>
            <tr>
              <th>
                {tokens?.[0].symbol || 'QHY'}
                <img src={sort} />
              </th>
              <th>
                {tokens?.[0] && tokens?.[0].symbol + " / " + tokens?.[1].symbol || 'QHY / mDAI'}
                <img src={sort} />
              </th>
              <th>
                {tokens?.[1].symbol || 'mDAI'}
                <img src={sort} />
              </th>
            </tr>
          </thead>
           {/* style={{height:251,overflowY:'auto',scrollbarWidth:'thin'}} */}
          <tbody style={{maxHeight:251,overflowY:'auto',scrollbarWidth:'thin'}}>
            {orderBook?.sellOrder ? (
              orderBook?.sellOrder?.map((item) => (
                <tr style={{height:28}} key={item.orderId} onClick={() => fillOrderHandler(item)}>
                  <td>{item.token0Value}</td>
                  <td style={{ color: "#F45353" }}>{item.price}</td>
                  <td>{item.token1Value}</td>
                </tr>
              ))
            ) : (
              <tr></tr>
            )}
          </tbody>
        </table>
            </div>
        <div className="divider"></div>
        <div className="exchange__orderbook_content">

       
        <table className="exchange__orderbook--buy">
          <caption>买单</caption>
          <thead>
            <tr>
              <th>
                {tokens?.[0].symbol || 'QHY'}
                <img src={sort} />
              </th>
              <th>
                {tokens?.[0] && tokens?.[0].symbol + " / " + tokens?.[1].symbol || 'QHY / mDAI'}
                <img src={sort} />
              </th>
              <th>
                {tokens?.[1].symbol || 'mDAI'}
                <img src={sort} />
              </th>
            </tr>
          </thead>
          <tbody style={{maxHeight:251,overflowY:'auto',scrollbarWidth:'thin'}}>
            {orderBook?.buyOrder ? (
              orderBook?.buyOrder?.map((item) => (
                <tr key={item.orderId} onClick={() => fillOrderHandler(item)}>
                  <td>{item.token0Value}</td>
                  <td style={{ color: "#25CE8F" }}>{item.price}</td>
                  <td>{item.token1Value}</td>
                </tr>
              ))
            ) : (
              <tr></tr>
            )}
          </tbody>
        </table>
         </div>
      </div>
    </div>
  );
};

export default OrderBook;
