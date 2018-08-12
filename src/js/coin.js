import $ from 'jquery';
import './common';
import '../sass/views/coin.scss';
import '../sass/component/layer/simpleLayer.scss';
import tab from '../component/tab';
import renderNews from '../component/card/news';
import rederDeepNews from '../component/card/deep-news-card';
import { bindClick, imgZoom } from '../component/action/newsButtonClick';
import { each, merge } from '../util/baseUtil';
import ajax from '../lib/ajax';
import { updateCoins } from './common/updateCoin';
import '../component/photoswipe';
// 变量pressIds coinCode来自模板

let hasData = true;
const coinId = $('.coin-detail-page').data('coin-id');
const coinCode = $('.coin-detail-page').data('code');
// const pressMinId = $('.press-container').data('min-id');
const pressIds = window.pressIds;
// const pressMaxTime = $('.press-container').data('max-time');
tab('.coin-detail-page .content');

// =======================用户操作单个新闻
const map = {
  up: '.good',
  down: '.bad',
};

// ========================== 新闻列表
// 请求无状态快讯列表
const options = {
  keyword: coinCode,
  page: 2,
};
// 请求新闻列表用户对应的喜好
const panelTemplete = '<div class="panel"><time><div class="date"></div><div class="details"></div></time></div>';
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect', 'attitude_up', 'attitude_down'],
  source_ids: [],
};
const request = () => {
  if (hasData) {
    // 获取无状态新闻列表
    $('.press-container').find('.loading-page').removeClass('hidden');
    $('.press-container').find('.more').addClass('hidden');
    ajax.SEARCH_COIN_NEWS({
      param: options,
      success: (res) => {
        // newData是最终渲染需要的数据
        const newsData = res.data;
        // todo 数据处理
        userNewsListOptions.source_ids = newsData.newsIds;
        if (newsData.dataList && newsData.dataList.length > 0) {
          // 获取列表对应用户状态
          options.page += 1;
          ajax.GET_USER_FAVORITE({
            param: userNewsListOptions,
            success: (response) => {
              if (response.error_code === '0') {
                each(newsData.dataList, (list) => {
                  each(list.news_list, (news) => {
                    each(response.data, (value) => {
                      if (news.news_id === value.news_id) {
                        merge(news, value, true);
                      }
                    });
                  });
                });
                // todo 判断当前日期是否已存在
                each(newsData.dataList, (list) => {
                  const date = list.date;
                  let $panel = $(`.panel[data-date="${date}"]`);
                  if ($panel.length <= 0) {
                    $panel = $(panelTemplete);
                    $panel.attr('data-date', date);
                    $('.press-container > .loading-page').before($panel);
                  }
                  $panel.find('time > .date').html(list.lang_date);
                  $panel.find('time > .details').html(list.date_week);
                  each((list.news_list), (news) => {
                    let $news;
                    if (news.catalog_id === '200') {
                      $news = rederDeepNews(news);
                    } else {
                      $news = renderNews(news);
                    }
                    $panel.append($news);
                  });
                });
                $('.press-container').find('.loading-page').addClass('hidden');
                $('.press-container').find('.more').removeClass('hidden');
                bindClick();
                imgZoom($('.my-gallery img'), '.my-gallery');
              }
            },
          });
        } else {
          $('.press-container').find('.loading-page').addClass('hidden');
          $('.press-container').find('.more').removeClass('hidden');
          hasData = !hasData;
          $('.press-container > .more .button').addClass('disabled').html('已无更多');
        }
      },
    });
  }
};
$('.press-container .more').on('click', () => {
  request();
});
const coinInterest = () => {
  userNewsListOptions.type = 'coin';
  userNewsListOptions.favorite_types = ['collect'];
  userNewsListOptions.source_ids = [coinId];
  ajax.GET_USER_FAVORITE({
    param: userNewsListOptions,
    success: (response) => {
      if (response.error_code === '0') {
        each(response.data, (coin) => {
          if (coin.is_collect) {
            $('.coin-detail-page .button.follow').addClass('active').attr('data-type', '0');
          }
        });
      }
    },
  });
};
coinInterest();
const userCoinOptions = {
  source_id: '',
  source_type: '', // 新闻或者是币
  is_favorite: 0,
};
$('.coin-detail-page .button.follow').on('click', function (e) {
  const $this = $(this);
  // const ids = [coinId];
  let type = '';
  // const iDom = '<i class="iconfont icon-star"></i>';
  userCoinOptions.source_type = 'coin';
  userCoinOptions.source_id = coinId;
  type = $this.data('type') === 0 ? 0 : 1;
  userCoinOptions.is_favorite = type;
  ajax.OPERATE_USER_FAVORITE({
    param: userCoinOptions,
    success: (res) => {
      if (res.error_code === '0') {
        type = $this.data('type') === 0 ? 1 : 0;
        $this.data('type', type);
        $this.toggleClass('active');
      }
    },
  });
  e.preventDefault();
});
//  ===================== 币行情数据
const marketOptions = {
  code: coinCode,
};
const marketRequest = () => {
  ajax.GET_REALTIME_QUOTATIONS({
    param: marketOptions,
    success: (res) => {
      const data = res.data;
      if (data && data.length > 0) {
        const ratioClass = parseFloat(data[0].ratio) > 0 ? 'good' : 'bad';
        $('.price').html(data[0].price);
        $('.ratio').html(data[0].ratio).addClass(ratioClass);
        $('.data-source').html(`数据来源于： ${data[0].source_name}`);
      }
    },
  });
};
marketRequest();
setInterval(() => {
  marketRequest();
}, 30000);
// const $moreLayer = mustache.render(simpleLyer, {
//   content,
// });
// console.log(content);
// $('.more-layer').html($moreLayer);
$('.desc-more').on('click', () => {
  $('.coin-detail-page .layer').removeClass('hidden');
});

// ====================== 请求新闻列表用户对应的喜好
const mergePressInterest = () => {
  userNewsListOptions.type = 'news';
  userNewsListOptions.favorite_types = ['collect', 'attitude_up', 'attitude_down'];
  userNewsListOptions.source_ids = pressIds;
  ajax.GET_USER_FAVORITE({
    param: userNewsListOptions,
    success: (response) => {
      if (response.error_code === '0') {
        each(response.data, (news) => {
          const $news = $('.press-container').find(`[data-source-id="${news.news_id}"]`);
          const $buttonContainer = $news.find('.article-container .button-container');
          $buttonContainer.find('.good span').html(news.attitude_up);
          $buttonContainer.find('.bad span').html(news.attitude_down);
          const activeButton = map[news.user_attitude];
          if (activeButton) {
            $buttonContainer.find(activeButton).addClass('active').attr('data-type', '0');
          }
          if (news.is_collect) {
            $buttonContainer.find('.collect').addClass('active')
              .attr('data-type', '0')
              .find('i')
              .remove();
          } else {
            $buttonContainer.find('.collect').find('span');
          }
        });
        bindClick();
        imgZoom($('.my-gallery img'), '.my-gallery');
      }
    },
  });
};
$('.layer-bg').on('click', () => {
  $('.layer').addClass('hidden');
});
mergePressInterest();
updateCoins();
