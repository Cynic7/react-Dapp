import { useSelector } from "react-redux";
import interactions from "../store/interactions.js";
import { useState, useRef } from "react";
const { cancelOrder } = interactions;
import sort from "../assets/sort.svg";
import { myOrderSelector, myFilledOrderSelector } from "../store/selectors.js";

const Transactions = () => {
  const tokens = useSelector((state) => state.exchange.currentToken);
  const orders = useSelector(myOrderSelector);
  const myFilledOrder = useSelector(myFilledOrderSelector);
  const [status, setStatus] = useState("order");
  const depositRef = useRef();
  const withDrawRef = useRef();

  const tabClick = (e) => {
    if (e.target.className == depositRef.current.className) {
      depositRef.current.className = "tab tab--active";
      withDrawRef.current.className = "tab";
      setStatus("order");
    } else {
      depositRef.current.className = "tab";
      withDrawRef.current.className = "tab tab--active";
      setStatus("trades");
    }
  };

  return (
    <div className="component exchange__transactions">
      <div>
        <div className="component__header flex-between">
          <h2>我的订单</h2>

          <div className="tabs">
            <button
              onClick={tabClick}
              ref={depositRef}
              className="tab tab--active"
            >
              订单
            </button>
            <button onClick={tabClick} ref={withDrawRef} className="tab">
              交易记录
            </button>
          </div>
        </div>

        {status == "order" ? (
          <table>
            <thead>
              <tr>
                <th>
                  类型
                  <img src={sort} />
                </th>
                <th>
                  {tokens?.[0]?.symbol}
                  <img src={sort} />
                </th>
                <th>
                  {tokens?.[0]?.symbol + " / " + tokens?.[1]?.symbol}
                  <img src={sort} />
                </th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((item) => (
                <tr key={item.orderId}>
                  <td>{item.type == "买入" ? '买单' : '卖单'}</td>
                  <td
                    style={{
                      color: item.type == "买入" ? "#25CE8F" : "#F45353",
                    }}
                  >
                    {item.token0Value}
                  </td>
                  <td>{item.price}</td>
                  <td>
                    <button
                      className="button--sm"
                      onClick={() => cancelOrder(item)}
                    >
                      取消
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  时间
                  <img src={sort} />
                </th>
                <th>
                  类型
                  <img src={sort} />
                </th>
                <th>
                  {tokens?.[0]?.symbol}
                  <img src={sort} />
                </th>
                <th>
                  {tokens?.[0]?.symbol + " / " + tokens?.[1]?.symbol}
                  <img src={sort} />
                </th>
              </tr>
            </thead>
            <tbody>
              {myFilledOrder?.map((item) => (
                <tr key={item.orderId}>
                  <td>{item.time}</td>
                  <td>{item.optionType}</td>
                  <td
                    style={{
                      color: item.type == "买入" ? "#25CE8F" : "#F45353",
                    }}
                  >
                    {item.icon}{item.token0Value}
                  </td>
                  <td>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Transactions;
