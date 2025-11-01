import { useSelector } from "react-redux";
import interactions from "../store/interactions.js";
import { useState, useRef } from "react";
const { makeOrders } = interactions;

const Order = () => {
  const tokens = useSelector((state) => state.exchange.currentToken);
  const [status, setStatus] = useState("买入");
  const depositRef = useRef();
  const withDrawRef = useRef();
  const [ipt1, setIpt1] = useState("");
  const [ipt2, setIpt2] = useState("");

  const tabClick = (e) => {
    if (e.target.className == depositRef.current.className) {
      depositRef.current.className = "tab tab--active";
      withDrawRef.current.className = "tab";
      setStatus("买入");
    } else {
      depositRef.current.className = "tab";
      withDrawRef.current.className = "tab tab--active";
      setStatus("卖出");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status == "买入") {
      makeOrders(
        [tokens[0].contract.address, tokens[1].contract.address],
        [ipt1, ipt2]
      );
    } else {
      makeOrders(
        [tokens[1].contract.address, tokens[0].contract.address],
        [ipt2, ipt1]
      );
    }
  };

  return (
    <div className="component exchange__orders">
      <div className="component__header flex-between">
        <h2>创建订单</h2>
        <div className="tabs">
          <button
            className="tab tab--active"
            ref={depositRef}
            onClick={tabClick}
          >
            买入
          </button>
          <button className="tab" ref={withDrawRef} onClick={tabClick}>
            卖出
          </button>
        </div>
      </div>

      <form onSubmit={submit}>
        {status} {tokens?.[0]?.symbol  || 'QHY'}
        <input
          type="text"
          value={ipt1}
          onChange={(e) => setIpt1(e.target.value)}
          id="amount"
          placeholder="0.0000"
        />
        {status == "买入" ? "花费" : "得到"} {tokens?.[1]?.symbol || 'mETH'}
        <input
          type="text"
          value={ipt2}
          onChange={(e) => setIpt2(e.target.value)}
          id="price"
          placeholder="0.0000"
        />
        <button className="button button--filled" type="submit">
          {status}
        </button>
      </form>
    </div>
  );
};

export default Order;
