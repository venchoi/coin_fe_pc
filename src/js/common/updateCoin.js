import $ from 'jquery';
import { each } from '../../util/baseUtil';
import ajax from '../../lib/ajax';

// todo 汇率

const requestQuotations = (type) => {
  const updateCoinsOptions = {
    type: '1',
    code: [],
    source_type: type,
  };
  const $coins = $('.market-realtime');
  const codes = new Set();
  const coinsLenght = $coins.length;
  for (let i = 0; i < coinsLenght; i += 1) {
    const code = $($coins[i]).data('code');
    codes.add(code);
  }
  updateCoinsOptions.code = Array.from(codes);
  if (codes.size) {
    ajax.GET_REALTIME_QUOTATIONS({
      param: updateCoinsOptions,
      success: (res) => {
        const coinsData = res;
        if (coinsData.error_code === '0' && coinsData.data && coinsData.data.length > 0) {
          each(coinsData.data, (coinData) => {
            const copyOfCoin = coinData;
            const code = String(copyOfCoin.code).toLowerCase();
            const $targetDom = $(`[data-code=${code}]`);
            const targetDomLength = $targetDom.length;
            for (let i = 0; i < targetDomLength; i += 1) {
              const $ratioDom = $($targetDom[i]).find('.ratio');
              const $priceDom = $($targetDom[i]).find('.price');
              const $totalDom = $($targetDom[i]).find('.total-amount');
              const $marketValDom = $($targetDom[i]).find('.market-value');
              if (parseFloat(copyOfCoin.ratio) > 0) {
                $ratioDom.addClass('good').removeClass('bad');
              } else if (parseFloat(copyOfCoin.ratio) < 0) {
                $ratioDom.addClass('bad').removeClass('good');
              } else {
                $ratioDom.removeClass('bad').removeClass('good');
              }
              $ratioDom.html(copyOfCoin.ratio);
              $priceDom.html(copyOfCoin.price);
              if (type === 2 || type === '2') {
                if ($totalDom.length) {
                  $totalDom.html(copyOfCoin.total_amount);
                }
                if ($marketValDom.length) {
                  $marketValDom.html(copyOfCoin.market_value);
                }
              }
            }
          });
        }
      },
    });
    // ajax.USDT_EX_RATE().then((res) => {
    //   console.log(res);
    // });
  }
};
const updateCoins = () => {
  requestQuotations(1);
};
const updateCoinsQuotations = () => {
  requestQuotations(2);
};
export {
  updateCoins,
  updateCoinsQuotations,
};
