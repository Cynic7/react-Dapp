import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { myEventSelector } from "../store/selectors.js";

const Alert = () => {
  const { pendding, success, isError } = useSelector(
    (state) => state.exchange.status
  );
  const account = useSelector((state) => state.blockchain.account);
  const allevent = useSelector((state) => state.exchange.event);
  const events = useSelector(myEventSelector);
  const alerRef = useRef();
  const [status, setStatus] = useState("");
  const [myPadding, setMyPadding] = useState(false);

  useEffect(() => {
    if (!account) return;

    if (pendding) {
      alerRef.current.className = "alert";
      setStatus("交易进行中...");
      setMyPadding(true)
    } else if (success && events?.length && allevent?.length != 1 && myPadding) {
      alerRef.current.className = "alert";
      setStatus("交易成功");
      setMyPadding(false)
      setTimeout(() => {
        alerRef.current.className = "alert alert--remove";
      }, 3000);
    } else if (isError) {
      alerRef.current.className = "alert";
      setStatus("交易失败");
      setTimeout(() => {
        alerRef.current.className = "alert alert--remove";
      }, 3000);
    } else {
      alerRef.current.className = "alert alert--remove";
    }
  }, [pendding, success, isError, account, events]);

  const removeHandler = () => {
    alerRef.current.className = "alert alert--remove";
  };

  return (
    <div>
      <div
        className="alert alert--remove"
        ref={alerRef}
        onClick={removeHandler}
      >
        <h1>{status}</h1>
        {events?.[0] && status == "交易成功" && (
          <a href="" target="_blank" rel="noreferrer">
            {events[0].transactionHash.slice(0, 6) +
              "..." +
              events[0].transactionHash.slice(60, 66)}
          </a>
        )}
      </div>
    </div>
  );
};

export default Alert;
