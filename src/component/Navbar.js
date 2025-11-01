import { useSelector } from "react-redux";
import logo from "../assets/logo.png";
import eth from "../assets/eth.svg";
import Blockies from "react-blockies";
import { useEffect } from "react";
import config from "../config.json";
import interactions from "../store/interactions.js";
const { loadAccount } = interactions;

const Navbar = () => {
  let { account, balance, chainId } = useSelector((state) => state.blockchain);

  useEffect(() => {
    // loadAccount();
    if(!location.host.includes('localhost')){
      changeNetwork({target:{value:'0xaa36a7'}})
    }
    // if(location.host.includes('localhost')){
    //   changeNetwork({target:{value:'0x7a69'}})
    // }
  }, []);
  const connectHandler = async () => {
    loadAccount();
  };
  // console.log(chainId);
  const changeNetwork = (e) => {
    console.log(e.target.value);
    try {
      window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: e.target.value }],
        })
        .catch((e) => {
          alert("请先在你的钱包中添加 sepolia 网络");
        });
    } catch (e) {
      alert("请先在你的钱包中添加 sepolia 网络");
    }
  };
  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={logo} className="logo" />
        <h1>QHY代币交易所</h1>
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
          </select>
        )}
      </div>

      <div className="exchange__header--account flex">
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
          <button className="button" onClick={connectHandler}>
            连接账号
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
