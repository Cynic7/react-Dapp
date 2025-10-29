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

  const orderBook = useSelector(orderBookSelector) || undefined;

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
                {tokens?.[0].symbol}
                <img src={sort} />
              </th>
              <th>
                {tokens?.[0].symbol + " / " + tokens?.[1].symbol}
                <img src={sort} />
              </th>
              <th>
                {tokens?.[1].symbol}
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
                {tokens?.[0].symbol}
                <img src={sort} />
              </th>
              <th>
                {tokens?.[0].symbol + " / " + tokens?.[1].symbol}
                <img src={sort} />
              </th>
              <th>
                {tokens?.[1].symbol}
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
