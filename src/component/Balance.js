import { useSelector } from "react-redux";
import interactions from "../store/interactions.js";
import { useEffect, useState, useRef } from "react";
const { loadBalance, depositToken, withdrawToken } = interactions;
import eth from "../assets/eth.svg";

const Balance = () => {
  const tokens = useSelector((state) => state.exchange.currentToken);
  const { contract: exchange, balance } = useSelector(
    (state) => state.exchange
  );
  const account = useSelector((state) => state.blockchain.account);
  const [ipt1, setIpt1] = useState("");
  const [ipt2, setIpt2] = useState("");
  const depositRef = useRef();
  const withDrawRef = useRef();

  const [status, setStatus] = useState("存入");

  useEffect(() => {
    if (tokens && account && exchange) loadBalance(tokens, account, exchange);
  }, [tokens, account]);

  const tabClick = (e) => {
    if (e.target.className == depositRef.current.className) {
      depositRef.current.className = "tab tab--active";
      withDrawRef.current.className = "tab";
      setStatus("存入");
    } else {
      depositRef.current.className = "tab";
      withDrawRef.current.className = "tab tab--active";
      setStatus("取出");
    }
  };

  const submit = async (e, index) => {
    e.preventDefault();
    let value;
    if (index == 0) {
      value = ipt1;
    }
    if (index == 1) {
      value = ipt2;
    }
    if (!value) {
      alert("请输入数量");
      return;
    }

    if (status == "存入") {
      await depositToken(tokens[index].contract, value, exchange);
    } else {
      await withdrawToken(tokens[index].contract, value, exchange);
    }
    loadBalance(tokens, account, exchange);

    if (index == 0) {
      setIpt1("");
    }
    if (index == 1) {
      setIpt2("");
    }
  };

  const formmatNum = (num) => {
    if (!num) return;
    return Math.round(Number(num) * 1000) / 1000;
  };

  return (
    <div className="component exchange__transfers">
      <div className="component__header flex-between">
        <h2>余额</h2>
        <div className="tabs">
          <button
            className="tab tab--active"
            ref={depositRef}
            onClick={tabClick}
          >
            存款
          </button>
          <button className="tab" ref={withDrawRef} onClick={tabClick}>
            取款
          </button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>代币</small>
            <br />
            <img src={eth} />
            {tokens?.[0]?.symbol}
          </p>
          <p>
            <small>钱包</small>
            <br />
            {formmatNum(tokens?.[0]?.balance) || 0}
          </p>
          <p>
            <small>交易所</small>
            <br />
            {formmatNum(balance?.[0]) || 0}
          </p>
        </div>

        <form onSubmit={(e) => submit(e, 0)}>
          <label htmlFor="token0"></label>
          <input
            type="text"
            value={ipt1}
            onChange={(e) => setIpt1(e.target.value)}
            id="token0"
            placeholder="0.0000"
          />

          <button className="button" type="submit">
            <span>{status}</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>代币</small>
            <br />
            <img src={eth} />
            {tokens?.[1]?.symbol}
          </p>
          <p>
            <small>钱包</small>
            <br />
            {formmatNum(tokens?.[1]?.balance) || 0}
          </p>
          <p>
            <small>交易所</small>
            <br />
            {formmatNum(balance?.[1]) || 0}
          </p>
        </div>

        <form onSubmit={(e) => submit(e, 1)}>
          <label htmlFor="token1"></label>
          <input
            type="text"
            value={ipt2}
            onChange={(e) => setIpt2(e.target.value)}
            id="token1"
            placeholder="0.0000"
          />

          <button className="button" type="submit">
            <span>{status}</span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
};

export default Balance;
