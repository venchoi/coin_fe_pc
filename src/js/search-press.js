import $ from 'jquery';
import '../sass/views/search-press.scss';
import renderDeepNews from '../component/card/deep-news-card';
import renderNews from '../component/card/news';
import tab from '../component/tab';
import './common';
import ajax from '../lib/ajax';
import { bindClick, imgZoom } from '../component/action/newsButtonClick';
import renderCoinSubject from '../component/card/search-coin-card';
import coinButtonClick from '../component/action/coinButtonClick';
import '../component/photoswipe';
import { each, merge } from '../util/baseUtil';
import { updateCoins } from './common/updateCoin';

tab('.search-tabs');
const keyword = $('.search-page').data('keyword');
let page = 1;
let hasData = true;
let isInit = true;
const searchOptions = {
  keyword,
  page,
};
// 请求新闻列表用户对应的喜好
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect', 'attitude_up', 'attitude_down'],
  source_ids: [],
};
const panelTemplete = '<div class="panel"><time><div class="date"></div><div class="details"></div></time></div>';
const requestSearch = () => {
  if (hasData) {
    $('.press-container').find('.loading-page').removeClass('hidden');
    $('.press-container').find('.more').addClass('hidden');
    ajax.SEARCH({
      param: searchOptions,
      success: (res) => {
        const resData = res;
        if (resData.data.dataList) {
          page += 1;
          searchOptions.page = page;
          userNewsListOptions.source_ids = resData.data.newsIds;
          ajax.GET_USER_FAVORITE({
            param: userNewsListOptions,
            success: (response) => {
              if (response.error_code === '0') {
                each(resData.data.dataList, (list) => {
                  each(list.news_list, (news) => {
                    each(response.data, (value) => {
                      if (news.news_id === value.news_id) {
                        merge(news, value, true);
                      }
                    });
                  });
                });
              }
            },
          });
          // todo 判断当前日期是否已存在
          each(resData.data.dataList, (list) => {
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
                $news = renderDeepNews(news);
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
        } else if (!isInit) {
          $('.press-container').find('.loading-page').addClass('hidden');
          $('.press-container').find('.more').removeClass('hidden');
          hasData = !hasData;
          $('.press-container > .more .button').addClass('disabled').html('已无更多');
        } else if (isInit) {
          $('.press-container').find('.loading-page').addClass('hidden');
          $('.press-container .more').remove();
          $('.press-container').append(`<div class="no-single-result"><div class="text">没有找到关于“${keyword}”的相关快讯</div></div>`);
        }
        if (resData.data.coins && resData.data.coins.length > 0) {
          const $coinList = $('<div class="panel"></div>');
          each(resData.data.coins, (coin) => {
            const $coin = renderCoinSubject(coin);
            $coinList.append($coin);
          });
          $('.coins-container').html($coinList);
          coinButtonClick();
        }
        if (resData.data.coins &&
          resData.data.coins.length === 0 &&
          resData.data.dataList &&
          resData.data.dataList.length === 0) {
          $('.result-press').addClass('hidden').siblings('.no-result').removeClass('hidden');
        }
        isInit = false;
      },
    });
  }
};
requestSearch();
$('.press-container .more').on('click', () => {
  requestSearch();
});
updateCoins();
