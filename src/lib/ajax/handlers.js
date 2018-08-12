import axios from 'axios';
import qs from 'qs';
import apiList from '../../js/common/apiList';
import numUtil from '../../util/numUtil';
import { each, merge } from '../../util/baseUtil';

let rate = 1;
const param = {
  currency_code: 'CNY',
};
const config = {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  data: qs.stringify(param),
  url: '/coin/usdt_exchange_rate_by_code/wapi/ajax.html',
};
axios(config).then((res) => {
  rate = res.data.data.rate;
});

const marketValFormat = (coinItem) => {
  const copyOfCoin = coinItem;
  const formartV = ['market_value', 'total_amount'];
  let price;
  if (copyOfCoin.price === '--' || typeof copyOfCoin.price === 'undefined') {
    price = '--';
  } else {
    price = copyOfCoin.price * rate;
    if (parseFloat(price) > 100) {
      price = price.toFixed(2);
    } else {
      price = price.toFixed(8);
    }
    price = `￥${price}`;
  }
  copyOfCoin.price = price;
  each(formartV, (v) => {
    if (copyOfCoin[v] !== '--') {
      copyOfCoin[v] *= rate;
      copyOfCoin[v] = numUtil.format(copyOfCoin[v], 'cn', 2);
      copyOfCoin[v] = `￥${copyOfCoin[v]}`;
    }
  });
  merge(coinItem, copyOfCoin, true);
};

/**
 * responed 统一处理的函数
 * @param {String} code - data字段的数据
 */
const businessCodeHandler = (code) => {
  switch (code) {
    case '301':
      break;
    default:
      break;
  }
};

/**
 * 异常处理
 * @param {String} error - 异常信息
 */
const catchHandler = (error) => {
  console.log(error);
};


const specialHandler = {
  [apiList.GET_QUOTATIONS_LIST](res) {
    if (res.error_code === '0' && res.data && res.data.dataList) {
      each(res.data.dataList, (coinItem) => {
        marketValFormat(coinItem);
      });
    }
  },
  [apiList.QUOTATIONS_LIST](res) {
    if (res.error_code === '0' && res.data && res.data.dataList) {
      each(res.data.dataList, (coinItem) => {
        marketValFormat(coinItem);
      });
    }
  },
  [apiList.CONCERN_QUOTATIONS](res) {
    if (res.error_code === '0' && res.data && res.data.dataList) {
      each(res.data.dataList, (coinItem) => {
        marketValFormat(coinItem);
      });
    }
  },
  [apiList.GET_REALTIME_QUOTATIONS](res) {
    if (res.error_code === '0' && res.data && res.data.length) {
      each(res.data, (coinItem) => {
        marketValFormat(coinItem);
      });
    }
  },
  [apiList.GET_QUOTATIONS](res) {
    if (res.error_code === '0' && res.data.length) {
      each(res.data, (coinItem) => {
        marketValFormat(coinItem);
      });
    }
  },
};
export {
  businessCodeHandler,
  catchHandler,
  specialHandler,
};
