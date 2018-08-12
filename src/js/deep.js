import $ from 'jquery';
import './common';
import renderCoinList from '../component/card/coin-list';
import renderArticleCard from '../component/card/article-card';
import '../sass/views/deep.scss';
import ajax from '../lib/ajax';
import { each, merge } from '../util/baseUtil';

// ======================行情数据格式
// "data": [{
//     "code": '',     //币代码
//     "ch_name": '',  // 中文名
//     "samll_logo_url":"", //logo地址
//     "source_name": '',  //来源名称
//     "price": '',
//     "ratio": '', // 带符号
// }]
let hasData = true;
// 用户操作单个新闻
const userNewsOptions = {
  source_id: '',
  source_type: '', // 新闻或者是币
  is_favorite: 0,
};
const bindClick = () => {
  $('.news-container .button.collect').on('click', function (e) {
    const $this = $(this);
    let type = '';
    const iDom = '<i class="iconfont icon-star"></i>';
    userNewsOptions.source_type = 'news';
    userNewsOptions.source_id = $this.data('source-id');
    type = $this.data('type') === 0 ? 0 : 1;
    userNewsOptions.is_favorite = type;
    ajax.OPERATE_USER_FAVORITE({
      param: userNewsOptions,
      success: (res) => {
        if (res.error_code === '0') {
          type = type === 0 ? 1 : 0;
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
    e.preventDefault();
  });
};
const requestCoinList = () => {
  ajax.GET_QUOTATIONS({
    success: (res) => {
      const $coinList = $('<ul></ul>');
      each(res.data, (coin) => {
        const $coin = renderCoinList(coin);
        $coinList.append($coin);
      });
      $('.column.coin .body .coin-list').html($coinList);
    },
  });
};
// ==========深度新闻列表
const options = {
  type: 'deep',
  min_id: '',
};
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect'],
  source_ids: [],
};
const request = () => {
  if (hasData) {
    ajax.GET_NEWS_LIST({
      param: options,
      success: (res) => {
        const newsData = res.data;
        options.min_id = newsData.min_id;
        userNewsListOptions.source_ids = newsData.newsIds;
        if (newsData.dataList && newsData.dataList.length > 0) {
          ajax.GET_USER_FAVORITE({
            param: userNewsListOptions,
            success: (response) => {
              if (response.error_code === '0') {
                each(newsData.dataList, (news) => {
                  each(response.data, (value) => {
                    if (news.news_id === value.news_id) {
                      merge(news, value, true);
                    }
                  });
                });
                each(newsData.dataList, (article) => {
                  const $article = renderArticleCard(article);
                  $('.news-container > .more').before($article);
                });
                bindClick();
              }
            },
          });
        } else {
          hasData = !hasData;
          $('.news-container > .more .button').addClass('disabled').html('已无更多');
        }
      },
    });
  }
};

$('.news-container .more').on('click', () => {
  request();
});
setInterval(() => {
  requestCoinList();
}, 30000);
requestCoinList();
request();
