import $ from 'jquery';
import { updateCoins } from './common/updateCoin';
import { bindClick, imgZoom, adjustImg, adjustDeepImg } from '../component/action/newsButtonClick';
import renderNews from '../component/card/news';
import renderDeepNews from '../component/card/deep-news-card';
import { requestCoinList, upDownList } from '../component/aside/quotation';
import tooltip from '../component/layer/tooltip';
import ajax from '../lib/ajax';
import { each, merge } from '../util/baseUtil';
import storage from '../lib/storage/storage';
import { toTop } from './common';
import '../sass/views/index.scss';
import switchWrap from '../component/switch';

tooltip($('.tooltip-container'));
let lastestCache = {};
let hasData = true;
// eslint-disable-next-line
let hasLastest = true;
const pressIds = window.pressIds;
const pressMinId = $('.press-container').data('min-id');
let pressMaxTime = $('.press-container').data('max-time');
const tagParamCache = {
  0: {
    min_id: pressMinId,
    hasData: true,
  },
};
const setting = {
  soundSetting: storage.read('soundSetting'),
  desktopSetting: storage.read('desktopSetting'),
};
$('.noti-tip').on('click', () => {
  $('.noti-pop-container').toggleClass('hidden');
});
$('.popup-bg').on('click', () => {
  $('.noti-pop-container').addClass('hidden');
});
switchWrap((name, checked) => {
  storage.application.save(name, checked);
  setting[name] = checked;
});
each(setting, (value, item) => {
  if (typeof value === 'object') {
    storage.application.save(item, true);
    $(`.layui-form-switch[name="${item}"]`).attr('checked', true);
  } else {
    $(`.layui-form-switch[name="${item}"]`).attr('checked', value);
  }
});
const isVisible = (selectid) => {
  let o;
  if (typeof selectid === 'object') {
    o = selectid;
  } else {
    o = $(selectid);
  }
  const of = o.offset();
  const w = $(window);
  return !(w.scrollTop() > (of.top + o.outerHeight()) || (w.scrollTop() + w.height()) < of.top);
};
// ============ 快讯
// 请求无状态快讯列表
// 请求新闻列表用户对应的喜好
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect', 'attitude_up', 'attitude_down'],
  source_ids: pressIds,
};

// todo 零点时reload页面
const panelTemplete = '<div class="panel"><time><div class="date"></div><div class="details"></div></time></div>';

const requestNews = (tab) => {
  const param = {
    type: 'fast',
    min_id: '',
    class_tag: tab,
  };
  if (tagParamCache[tab].min_id) {
    param.min_id = tagParamCache[tab].min_id;
  }
  const $tab = $(`[data-tab="${tab}"]`);
  $tab.find('.loading-page').removeClass('hidden');
  $tab.find('.more').addClass('hidden');
  ajax.GET_NEWS_LIST({
    param,
    success: (res) => {
      // newData是最终渲染需要的数据
      const newsData = res.data;
      // tagParamCache[tab].min_id = res.data.min_id;
      // todo 数据处理
      userNewsListOptions.source_ids = newsData.newsIds;
      if (newsData.dataList && newsData.dataList.length > 0) {
        // 获取列表对应用户状态
        tagParamCache[tab].min_id = newsData.min_id;
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
                let $panel = $tab.find(`.panel[data-date="${date}"]`);
                if ($panel.length <= 0) {
                  $panel = $(panelTemplete);
                  $panel.attr('data-date', date);
                  $tab.find('.loading-page').before($panel);
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
              $tab.find('.loading-page').addClass('hidden');
              $tab.find('.more').removeClass('hidden');
              bindClick();
              imgZoom($('.my-gallery img'), '.my-gallery');
            }
          },
        });
      } else {
        $tab.find('.loading-page').addClass('hidden');
        $tab.find('.more').removeClass('hidden');
        tagParamCache[tab].hasData = false;
        hasData = !hasData;
        $tab.find('.more .button').addClass('disabled').html('已无更多');
      }
    },
  });
};
$('.label').on('click', function () {
  const $this = $(this);
  const tab = $this.data('tab');
  if (!tagParamCache[tab]) {
    tagParamCache[tab] = {
      hasData: true,
    };
    requestNews(tab);
  }
  $this.addClass('active').siblings().removeClass('active');
  $('.tabs-content').find(`[data-tab="${tab}"]`).addClass('active')
    .siblings()
    .removeClass('active');
});
const lastesNewsOptions = {
  type: 'fast',
  max_time: pressMaxTime,
  // max_time: '1530239862',
};
const requestLastestNews = () => {
  ajax.GET_NEWS_NUM({
    param: lastesNewsOptions,
    success: (resp) => {
      if (resp.error_code === '0') {
        const resData = resp.data;
        if (resData.news_num > 0) {
          ajax.GET_LASTEST_NEWS({
            param: lastesNewsOptions,
            success: (res) => {
              if (res.error_code === '0') {
                lastesNewsOptions.max_time = resp.max_time;
                const data = res.data;
                if (data.dataList && data.dataList.length > 0) {
                  const firstDate = data.dataList[0];
                  const firstNews = firstDate.news_list[0];
                  pressMaxTime = firstNews.update_time;
                  lastesNewsOptions.max_time = firstNews.update_time;
                  userNewsListOptions.source_ids = data.newsIds;
                  ajax.GET_USER_FAVORITE({
                    param: userNewsListOptions,
                    success: (response) => {
                      if (response.error_code === '0') {
                        each(data.dataList, (list) => {
                          each(list.news_list, (news) => {
                            each(response.data, (value) => {
                              if (news.news_id === value.news_id) {
                                merge(news, value, true);
                              }
                            });
                          });
                        });
                        const renderDateList = data.dataList.reverse();
                        each(renderDateList, (list) => {
                          const date = list.date;
                          // const renderList = list.news_list;
                          let $panel = $(`.panel[data-date="${date}"]`);
                          if ($panel.length <= 0) {
                            $panel = $(panelTemplete);
                            $panel.attr('data-date', date);
                            $('.press-container ').prepend($panel);
                          }
                          $panel.find('time > .date').html(list.lang_date);
                          $panel.find('time > .details').html(list.date_week);
                          const renderList = list.news_list.reverse();
                          const isV = isVisible('.press-container .panel:first-child article:nth-of-type(1)');
                          if (!isV) {
                            hasLastest = true;
                          }
                          each(renderList, (news) => {
                            let $news;
                            if (news.catalog_id === '200') {
                              $news = renderDeepNews(news);
                            } else {
                              $news = renderNews(news);
                            }
                            if (isV) {
                              $panel.children('time').after($news);
                            } else {
                              if (!lastestCache[date]) {
                                lastestCache[date] = [];
                              }
                              lastestCache[date].push($news);
                              $('.has-lastest-news').removeClass('hidden');
                            }
                          });
                        });
                        bindClick();
                        imgZoom($('.my-gallery img'), '.my-gallery');
                      }
                    },
                  });
                }
              }
            },
          });
        }
      }
    },
  });
};
const mergePressInterest = () => {
  ajax.GET_USER_FAVORITE({
    param: userNewsListOptions,
    success: (response) => {
      if (response.error_code === '0') {
        each(response.data, (news) => {
          const $news = $('.press-container').find(`[data-source-id="${news.news_id}"]`);
          const $buttonContainer = $news.find('.article-container .button-container');
          $buttonContainer.find('.good span').html(news.attitude_up);
          $buttonContainer.find('.bad span').html(news.attitude_down);
          const map = {
            up: '.good',
            down: '.bad',
          };
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
$('.press-container .more').on('click', function () {
  const tab = $(this).parents('.content-item.press-container').data('tab');
  if (tagParamCache[tab].hasData) {
    requestNews(tab);
  }
});
imgZoom($('.my-gallery img'), '.my-gallery');
const $imgGalleryDoms = $('.fast-card').find('.my-gallery');
if ($imgGalleryDoms.length) {
  adjustImg($imgGalleryDoms);
}
const $imgConDoms = $('.deep-card ').find('.img');
if ($imgConDoms.length) {
  adjustDeepImg($imgConDoms);
}
const renderLastestNews = (news) => {
  each(news, (list, date) => {
    let $panel = $(`.panel[data-date="${date}"]`);
    if ($panel.length <= 0) {
      $panel = $(panelTemplete);
      $panel.attr('data-date', date);
      $('.press-container').prepend($panel);
      $panel.find('time > .date').html(list.lang_date);
      $panel.find('time > .details').html(list.date_week);
    }
    const renderList = list.reverse();
    $panel.children('time').after(renderList);
    // eslint-disable-next-line
    $(renderList).each(function () {
      $(this).find('time').css({
        color: '#5F99DA',
      })
        .stop()
        .animate({
          color: '#5F99DA',
        }, 3000, function () {
          $(this).removeAttr('style');
        });
      $(this).find('h2').css({
        color: '#5F99DA',
      })
        .stop()
        .animate({
          color: '#5F99DA',
        }, 3000, function () {
          $(this).removeAttr('style');
        });
      $(this).find('.article-content').css({
        color: '#5F99DA',
      })
        .stop()
        .animate({
          color: '#5F99DA',
        }, 3000, function () {
          $(this).removeAttr('style');
        });
    });
  });
  bindClick();
  imgZoom($('.my-gallery img'), '.my-gallery');
};
toTop('.has-lastest-news');
$('.has-lastest-news').on('click', () => {
  renderLastestNews(lastestCache);
  $('.has-lastest-news').addClass('hidden');
  lastestCache = {};
  hasLastest = false;
});
setInterval(() => {
  requestLastestNews();
}, 10000);
const upSelector = $('#up-chart');
const downSelector = $('#down-chart');
const updateUDList = (isInit) => {
  let chart;
  ajax.UPDOWN_AMOUNT({
    success: (res) => {
      if (res.error_code === '0' && res.data && res.data.chart_data) {
        chart = upDownList(upSelector[0], downSelector[0], res.data, isInit);
      }
    },
  });
  return chart;
};
updateUDList(true);
setInterval(() => {
  requestCoinList();
  updateUDList(false);
}, 30000);
requestCoinList();
mergePressInterest();
requestLastestNews();
updateCoins();
