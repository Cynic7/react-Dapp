import { useSelector } from "react-redux";
import sort from "../assets/sort.svg";
import { fillorderSelector } from "../store/selectors.js";

const Trades = () => {
  const tokens = useSelector((state) => state.exchange.currentToken);
  const account = useSelector((state) => state.exchange.account);
  const orders = account ? useSelector(fillorderSelector) :
  [
    {time: '2025-05-03', token0Value: 1, token1Value: 2, price: 3, type: "买入", orderId: "1"},
    {time: '2025-05-04', token0Value: 2, token1Value: 4, price: 2.5, type: "卖出", orderId: "2"},
    {time: '2025-05-05', token0Value: 0.5, token1Value: 1.5, price: 3.2, type: "买入", orderId: "3"},
    {time: '2025-05-06', token0Value: 3, token1Value: 9, price: 3.0, type: "卖出", orderId: "4"},
    {time: '2025-05-07', token0Value: 1.5, token1Value: 4.5, price: 3.1, type: "买入", orderId: "5"},
    {time: '2025-05-08', token0Value: 4, token1Value: 12, price: 3.0, type: "卖出", orderId: "6"},
    {time: '2025-05-09', token0Value: 0.8, token1Value: 2.4, price: 3.0, type: "买入", orderId: "7"},
    {time: '2025-05-10', token0Value: 2.5, token1Value: 7.5, price: 3.0, type: "卖出", orderId: "8"},
    {time: '2025-05-11', token0Value: 1.2, token1Value: 3.6, price: 3.0, type: "买入", orderId: "9"},
    {time: '2025-05-12', token0Value: 3.5, token1Value: 10.5, price: 3.0, type: "卖出", orderId: "10"}
  ];
  return (
    <div className="component exchange__trades">
      <div className="component__header flex-between">
        <h2>交易记录</h2>
      </div>

      <table>
        <thead>
          <tr>
            <th>
              时间
              <img src={sort} />
            </th>
            {/* <th>类型<img src={sort} /></th> */}
            <th>
              {tokens?.[0]?.symbol || 'QHY'}
              <img src={sort} />
            </th>
            <th>
              {tokens?.[0] && tokens?.[0]?.symbol + " / " + tokens?.[1]?.symbol || 'QHY/mETH'}
              <img src={sort} />
            </th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((item) => (
            <tr key={item.orderId}>
              <td>{item.time}</td>
              {/* <td>{item.type}</td> */}
              <td
                style={{ color: item.type == "买入" ? "#25CE8F" : "#F45353" }}
              >
                {item.token0Value}
              </td>
              <td>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Trades;
