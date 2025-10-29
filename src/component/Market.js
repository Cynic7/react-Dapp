import { useSelector } from "react-redux";
import interactions from "../store/interactions.js";
const { loadToken_Exchange } = interactions;
import { useEffect } from "react";

const Market = () => {
  const tokens = useSelector((state) => state.tokens);
  useEffect(() => {
    selectChange({ target: { value: "QHY,mETH" } });
  }, [tokens]);

  const selectChange = (e) => {
    if (!tokens?.filter) return;
    let arr = e.target.value.split(",");
    let currentToken = tokens.filter((item) => arr.includes(item.symbol));
    loadToken_Exchange(currentToken);
  };
  return (
    <div className="component exchange__markets">
      <div className="component__header">
        <h2>选择市场</h2>
      </div>
      <select name="markets" id="markets" onChange={selectChange}>
        <option value="QHY,mETH">QHY / mETH</option>
        <option value="QHY,mDAI">QHY / mDAI</option>
      </select>
      <hr />
    </div>
  );
};

export default Market;
