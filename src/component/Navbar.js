import { useSelector } from "react-redux";
import logo from "../assets/logo.svg";
import eth from "../assets/eth.svg";
import Blockies from "react-blockies";
import { useEffect } from "react";
import config from "../config.json";
import interactions from "../store/interactions.js";
const { loadAccount, swapToken,loadBalance, loadBlockchain } = interactions;

const Navbar = (props) => {
  let { account, balance, chainId } = useSelector((state) => state.blockchain);
  let TokenSwap = useSelector((state) => state.exchange.TokenSwap);
  const tokens = useSelector((state) => state.exchange.currentToken);
  const { contract: exchange } = useSelector((state) => state.exchange);

  useEffect(() => {
    loadAccount();
    // if (!location.host.includes("localhost")) {
    //   changeNetwork({ target: { value: "0xaa36a7" } });
    // }
    // if(location.host.includes('localhost')){
    //   changeNetwork({target:{value:'0x7a69'}})
    // }
  }, []);

  const connectHandler = async () => {
    loadAccount();
  };

  const changeNetwork = (e) => {
    console.log(e.target.value);
    try {
      window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: e.target.value }],
        })
        .catch(() => {
          alert("请先在你的钱包中添加 sepolia 网络");
        });
    } catch (e) {
      alert("请先在你的钱包中添加 sepolia 网络");
    }
  };

  const duihuan = async () => {
    await swapToken(TokenSwap);
    await loadAccount()
    if (tokens && account && exchange) loadBalance(tokens, account, exchange);
  };

  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={logo} className="logo" />
        <h1>{props.title}</h1>
      </div>

      <div className="exchange__header--networks flex">
        <img src={eth} className="Eth logo" />
        {chainId && (
          <select
            name="network"
            id="networks"
            value={"0x" + chainId.toString(16)}
            placeholder="请选择网络"
            onChange={changeNetwork}
          >
            <option value=""></option>
            <option value="0x7a69">Localhost</option>
            <option value="0xaa36a7">Sepolia</option>
            <option value="0x13882">Polygon Amoy</option>
          </select>
        )}
      </div>

      <div className="exchange__header--account flex">
        {balance && props.title == 'QHY代币交易所' ? (
          <div>
            <button
              style={{ width: 46, fontSize: 13 }}
              title="用0.001 ether 兑换 100 QHY（限一次）"
              className="button"
              onClick={duihuan}
            >
              兑换QHY
            </button>
          </div>
        ) : (
          ""
        )}
        {balance ? (
          <p>
            <small>余额 </small> {Number(balance).toFixed(4)}
          </p>
        ) : (
          ""
        )}
        {account ? (
          <a
            href={
              config[chainId]
                ? config[chainId].explorerURL + "/address/" + account
                : "#"
            }
            target="_blank"
          >
            {account.slice(0, 5) + "..." + account.slice(38, 42)}
            <Blockies
              seed={account}
              size={10}
              scale={3}
              color="#2187D0"
              className="identicon"
            />
          </a>
        ) : (
          <button
            style={{ position: "fixed", right: 7 }}
            className="button"
            onClick={connectHandler}
          >
            连接账号
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
