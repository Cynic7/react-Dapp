import { createSelector } from "reselect";
import { ethers } from "ethers";

export const orderBookSelector = createSelector(
  (state) => state.exchange.currentToken,
  (state) => state.exchange.allOrders,
  (tokens, orders) => {
    if (!orders || !tokens) return;
    let buyOrder, sellOrder;
    orders = orders.map((order) => initOrder(tokens, order));
    buyOrder = orders.filter(
      (item) =>
        item.tokenGet == tokens[0].contract.address &&
        item.tokenGive == tokens[1].contract.address
    );
    sellOrder = orders.filter(
      (item) =>
        item.tokenGive == tokens[0].contract.address &&
        item.tokenGet == tokens[1].contract.address
    );

    buyOrder = buyOrder.sort((a, b) => b.price - a.price);
    sellOrder = sellOrder.sort((a, b) => b.price - a.price);
    return {
      buyOrder,
      sellOrder,
    };
  }
);

function formatEther(n) {
  return ethers.utils.formatEther(n);
}

function initNum(n) {
  return Math.round(n * 10000) / 10000;
}

const initOrder = (tokens, order) => {
  let token0Value, token1Value;

  if (order.tokenGet == tokens[0].contract.address) {
    //买入单，买入QHY，所以tokenGet是QHY，getValue要格式化
    token0Value = formatEther(order.getValue);
    token1Value = formatEther(order.giveValue);
  } else {
    token0Value = formatEther(order.giveValue);
    token1Value = formatEther(order.getValue);
  }

  return {
    ...order,
    price: initNum(token0Value / token1Value),
    token0Value,
    token1Value,
  };
};
