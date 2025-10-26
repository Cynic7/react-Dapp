import { useSelector } from "react-redux";
import interactions from "../store/interactions.js";
import { useState, useRef, useEffect } from "react";
const { loadAllOrder } = interactions;
import sort from "../assets/sort.svg";
import { orderBookSelector } from "../store/selectors.js";

const OrderBook = () => {
  const tokens = useSelector((state) => state.exchange.currentToken);
  const exchange = useSelector((state) => state.exchange.contract);

  const orderBook = useSelector(orderBookSelector) || undefined;
  console.log(orderBook);

  useEffect(() => {
    loadAllOrder(exchange);
  }, [exchange]);

  return (
    <div className="component exchange__orderbook">
      <div className="component__header flex-between">
        <h2>当前订单</h2>
      </div>

      <div className="flex">
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
          <tbody>
            {orderBook?.sellOrder ? (
              orderBook?.sellOrder.map((item) => (
                <tr>
                  <td>{item.token0Value}</td>
                  <td style={{color:'#F45353'}}>{item.price}</td>
                  <td>{item.token1Value}</td>
                </tr>
              ))
            ) : (
              <td>2</td>
            )}
          </tbody>
        </table>

        <div className="divider"></div>

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
          <tbody>
            {orderBook?.buyOrder ? (
              orderBook?.buyOrder.map((item) => (
                <tr>
                  <td>{item.token0Value}</td>
                  <td style={{color:'#25CE8F'}}>{item.price}</td>
                  <td>{item.token1Value}</td>
                </tr>
              ))
            ) : (
              <td>2</td>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderBook;
