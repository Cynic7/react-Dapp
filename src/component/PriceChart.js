import { useSelector } from "react-redux";
import arrowUp from "../assets/up-arrow.svg";
import arrowDown from "../assets/down-arrow.svg";
import { priceChartSelector } from "../store/selectors.js";
import Banner from "./Banner.js";
import { options, series } from "./priceChart.config.js";
import Chart from "react-apexcharts";

const PriceChart = () => {
  const account = useSelector((state) => state.blockchain.account);
  const tokens = useSelector((state) => state.exchange.currentToken);

  const priceSeries = useSelector(priceChartSelector);
  return (
    <div className="component exchange__chart">
      <div className="component__header flex-between">
        <div className="flex">
          <h2>{tokens && tokens?.[0].symbol + " / " + tokens?.[1].symbol}</h2>

          <div className="flex">
            {priceSeries?.priceChange > 0 ? (
              <img src={arrowUp} alt="Arrow up" />
            ) : (
              <img src={arrowDown} alt="Arrow down" />
            )}
            <span className="up">{priceSeries?.lastPrice}</span>
          </div>
        </div>
      </div>

      {/* Price chart goes here */}
      {!account ? (
        <Banner text="请连接您的钱包" />
      ) : (
        <Chart
          type="candlestick"
          options={options}
          series={priceSeries ? priceSeries.series : series}
          width={"100%"}
          height={"100%"}
        />
      )}
    </div>
  );
};

export default PriceChart;
