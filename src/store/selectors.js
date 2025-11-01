import { createSelector } from "reselect";
import { ethers } from "ethers";
import { groupBy, maxBy, minBy } from "lodash";
import moment from "moment";

//过滤出未成交、未取消的订单
const filterOrder = (state) => {
  const { allOrders, fillOrders, cancelOrders } = state.exchange;
  return allOrders.filter((item) => {
    let arr1 = fillOrders?.map((child) => child.orderId.toString()) || [];
    let arr2 = cancelOrders?.map((child) => child.orderId.toString()) || [];
    return (
      !arr1.includes(item.orderId.toString()) &&
      !arr2.includes(item.orderId.toString())
    );
  });
};

export const orderBookSelector = createSelector(
  (state) => state.exchange.currentToken,
  filterOrder,
  (tokens, orders) => {
    if (!orders || !tokens) return;
    let buyOrder, sellOrder;
    orders = orders?.map((order) => initOrder(tokens, order));
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

//格式化订单数据
const initOrder = (tokens, order) => {
  let token0Value, token1Value;

  let type = "买入";
  if (order.tokenGet == tokens[0].contract.address) {
    //买入单，买入QHY，所以tokenGet是QHY，getValue要格式化
    token0Value = formatEther(order.getValue);
    token1Value = formatEther(order.giveValue);
    type = "买入";
  } else {
    token0Value = formatEther(order.giveValue);
    token1Value = formatEther(order.getValue);
    type = "卖出";
  }

  return {
    ...order,
    price: initNum(token1Value / token0Value),
    token0Value,
    token1Value,
    type,
    time: moment.unix(order.timestamp).format("YYYY-MM-DD HH:mm"),
  };
};

export const priceChartSelector = createSelector(
  (state) => state.exchange.currentToken,
  (state) => state.exchange.fillOrders,
  (tokens, orders) => {
    if (!orders || !tokens) return;
    let filterOrder = orders.filter(
      (item) =>
        item.tokenGet == tokens[0].contract.address ||
        item.tokenGet == tokens[1].contract.address
    );
    filterOrder = filterOrder.filter(
      (item) =>
        item.tokenGive == tokens[0].contract.address ||
        item.tokenGive == tokens[1].contract.address
    );
    filterOrder = filterOrder
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => initOrder(tokens, item));

    let groupOrder = groupBy(filterOrder, (o) =>
      moment.unix(o.timestamp).startOf("day").format("YYYY-MM-DD HH:mm")
    );

    let lastPrice = filterOrder[filterOrder.length - 1]?.price || 0;
    let lastPrice2 = filterOrder[filterOrder.length - 2]?.price || 0;

    let data = Object.keys(groupOrder).map((day) => {
      const group = groupOrder[day];
      const open = group[0];
      const high = maxBy(group, "price");
      const min = minBy(group, "price");
      const close = group[group.length - 1];

      return {
        x: new Date(day),
        y: [open.price, high.price, min.price, close.price],
      };
    });
    console.log('蜡烛图数据',data);
    return {
      lastPrice,
      priceChange: lastPrice - lastPrice2,
      series: [{ data }],
    };
  }
);

export const fillorderSelector = createSelector(
  (state) => state.exchange.currentToken,
  (state) => state.exchange.fillOrders,
  (tokens, orders) => {
    if (!orders || !tokens) return;
    let filterOrder = orders.filter(
      (item) =>
        item.tokenGet == tokens[0].contract.address ||
        item.tokenGet == tokens[1].contract.address
    );
    filterOrder = filterOrder.filter(
      (item) =>
        item.tokenGive == tokens[0].contract.address ||
        item.tokenGive == tokens[1].contract.address
    );
    filterOrder = filterOrder
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((item) => initOrder(tokens, item));

    return filterOrder;
  }
);

export const myOrderSelector = createSelector(
  (state) => state.blockchain.account,
  (state) => state.exchange.currentToken,
  filterOrder,
  (account, tokens, orders) => {
    if (!account || !orders || !tokens) return;
    let filterOrder = orders.filter(
      (item) =>
        item.tokenGet == tokens[0].contract.address ||
        item.tokenGet == tokens[1].contract.address
    );
    filterOrder = filterOrder.filter(
      (item) =>
        item.tokenGive == tokens[0].contract.address ||
        item.tokenGive == tokens[1].contract.address
    );
    filterOrder = filterOrder.filter((item) => {
      return item.user.toLowerCase() === account.toLowerCase();
    });

    filterOrder = filterOrder
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((item) => initOrder(tokens, item));

    return filterOrder;
  }
);

export const myFilledOrderSelector = createSelector(
  (state) => state.blockchain.account,
  (state) => state.exchange.currentToken,
  (state) => state.exchange.fillOrders,
  (account, tokens, orders) => {
    if (!account || !orders || !tokens) return;
    let filterOrder = orders.filter(
      (item) =>
        item.tokenGet == tokens[0].contract.address ||
        item.tokenGet == tokens[1].contract.address
    );
    filterOrder = filterOrder.filter(
      (item) =>
        item.tokenGive == tokens[0].contract.address ||
        item.tokenGive == tokens[1].contract.address
    );

    let IbuyOrder = filterOrder.filter((item) => {
      return item.spender.toLowerCase() === account.toLowerCase();
    });

    IbuyOrder = IbuyOrder.map((item) => {
      return { ...item, option: "下单" };
    });

    let ImakeOrder = filterOrder
      .filter((item) => {
        return item.user.toLowerCase() === account.toLowerCase();
      })
      .map((item) => {
        return { ...item, option: "创建订单" };
      });

    filterOrder = [...IbuyOrder, ...ImakeOrder];

    filterOrder = filterOrder.filter(
      (item, index, array) =>
        array.findIndex((a) => a.orderId == item.orderId) == index
    );

    filterOrder = filterOrder
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((item) => initOrder(tokens, item));

    filterOrder = filterOrder.map((item) => {
      if (item.option == "创建订单" && item.type == "买入") {
        //我创建了买单，被别人成交，我获得QHY
        return {
          ...item,
          icon: "+",
          optionType: "创建买单被成交",
        };
      }
      if (item.option == "创建订单" && item.type == "卖出") {
        //我创建了卖单，被别人成交，我失去QHY
        return {
          ...item,
          icon: "-",
          optionType: "创建卖单被成交",
        };
      }
      if (item.option == "下单" && item.type == "卖出") {
        //我去成交了 别人的卖单，我获得了QHY
        return {
          ...item,
          icon: "+",
          optionType: "主动成交卖单",
        };
      }
      if (item.option == "下单" && item.type == "买入") {
        //我去成交了 别人的买单，我失去了QHY
        return {
          ...item,
          icon: "-",
          optionType: "主动成交买单",
        };
      }
    });

    return filterOrder;
  }
);

export const myEventSelector = createSelector(
  (state) => state.blockchain.account,
  (state) => state.exchange.event,
  filterOrder,
  (account, events) => {
    if (!account || !events) return;

    events = events.filter(
      (item) => item.args.user.toLowerCase() == account.toLowerCase()
    );
    return events;
  }
);
