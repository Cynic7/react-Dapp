import { useSelector } from "react-redux";
import sort from "../assets/sort.svg";
import { fillorderSelector } from "../store/selectors.js";

const Trades = () => {
  const tokens = useSelector((state) => state.exchange.currentToken);
  const orders = useSelector(fillorderSelector);
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
