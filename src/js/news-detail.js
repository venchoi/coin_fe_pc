import $ from 'jquery';
import '../sass/views/news-detail.scss';
import './common';
import ajax from '../lib/ajax';
import { requestCoinList } from '../component/aside/quotation';
import { updateCoins } from './common/updateCoin';
import { imgZoom } from '../component/action/newsButtonClick';

const newsId = $('.news-detail-page').data('news-id');
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect', 'thumb_up'],
  source_ids: [],
};
const userNewsOptions = {
  source_id: newsId,
  source_type: '', // 新闻或者是币
  is_favorite: '',
};
const bindClick = () => {
  $('.button.collect').on('click', function () {
    const $this = $(this);
    let type = '';
    const iDom = '<i class="iconfont icon-star"></i>';
    userNewsOptions.source_type = 'news';
    type = $this.data('type') === 0 ? 0 : 1;
    userNewsOptions.is_favorite = type;
    ajax.OPERATE_USER_FAVORITE({
      param: userNewsOptions,
      success: (res) => {
        if (res.error_code === '0') {
          type = $this.data('type') === 0 ? 1 : 0;
          $this.data('type', type);
          $this.toggleClass('active');
          if (type) {
            $this.prepend($(iDom));
          } else {
            $this.find('.icon-star').remove();
          }
        }
      },
    });
  });
  $('.button.thumbs-up').on('click', function () {
    const $this = $(this);
    let type = $this.data('type') === 0 ? 0 : 1;
    userNewsOptions.source_type = 'thumb_up';
    userNewsOptions.is_favorite = type;
    ajax.OPERATE_USER_FAVORITE({
      param: userNewsOptions,
      success: (res) => {
        if (res.error_code === '0') {
          type = $this.data('type') === 0 ? 1 : 0;
          const active = $this.hasClass('active');
          let count = Number($this.data('count'));
          count = active ? count - 1 : count + 1;
          $this.toggleClass('active').data('count', count).attr('data-type', type)
            .find('span')
            .html(count);
        }
      },
    });
  });
};
const requestUserNews = () => {
  userNewsListOptions.source_ids.push(newsId);
  ajax.GET_USER_FAVORITE({
    param: userNewsListOptions,
    success: (res) => {
      if (res.error_code === '0') {
        const data = res.data[0];
        const upCount = data.thumb_up;
        const collectClass = data.is_collect === 1 ? 'active' : '';
        const type = data.is_collect === 1 ? 0 : 1;
        $('.button.thumbs-up').attr('data-count', upCount).find('span').html(upCount);
        if (data.is_thumb_up === 1) {
          $('.button.thumbs-up').addClass('active').attr('data-type', 0);
        }
        $('.collect').addClass(collectClass).attr('data-type', type);
        if (data.is_collect === 1) {
          $('.button.collect').find('.icon-star').remove();
        }
        bindClick();
        imgZoom($('.my-gallery img'), '.my-gallery');
      }
    },
  });
};
requestUserNews();
setInterval(() => {
  requestCoinList();
  updateCoins();
}, 30000);
requestCoinList();
updateCoins();
