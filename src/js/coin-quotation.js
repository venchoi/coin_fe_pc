import $ from 'jquery';
import './common';
import '../sass/views/coin-quotation.scss';
import ajax from '../lib/ajax';
import coinButtonClick from '../component/action/coinButtonClick';
import renderCoinSubject from '../component/card/search-coin-card';
import { each } from '../util/baseUtil';
import { updateCoins } from './common/updateCoin';

let page = 1;
const coinOptions = {
  page,
};
const quotationRequest = () => {
  coinOptions.page = page;
  ajax.GET_QUOTATIONS_LIST({
    param: coinOptions,
    success: (res) => {
      let $coinList = $('.coins-container .panel');
      if (!$coinList.length) {
        $coinList = $('<div class="panel"></div>');
        $('.coins-container').append($coinList);
      }
      if (res.data && res.data.dataList && res.data.dataList.length > 0) {
        page += 1;
        each(res.data.dataList, (coin) => {
          const $coin = renderCoinSubject(coin);
          $coinList.append($coin);
        });
        coinButtonClick();
      } else {
        const $more = $('.coins-container').siblings('.more');
        if ($more.length > 0) {
          $more.find('.button').addClass('disabled').html('已无更多');
        }
      }
    },
  });
};
quotationRequest();
$('.more .button').on('click', () => {
  quotationRequest();
});
updateCoins();
