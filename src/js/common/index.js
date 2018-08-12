import mustache from 'mustache';
import $ from 'jquery';
import tab from '../../component/tab';
import loginTemplete from '../../template/login.html';
import headerUserTpl from '../../template/header-user.html';
import initLogin from '../../component/login';
import search from './search';
import ajax from '../../lib/ajax';
import { isArray } from '../../util/baseUtil';
import '../../lib/notification_v2';
import storage from '../../lib/storage/storage';
import { updateCoins } from './updateCoin';

const Base = window.Base;
const sound = new Audio('/res/pc/static/audio/fast-news.mp3');
const setting = {
  soundSetting: storage.read('soundSetting'),
  desktopSetting: storage.read('desktopSetting'),
};
const newsNumOptions = {
  max_time: '',
  type: 'fast',
};
const requestLastest = () => {
  ajax.GET_NEWS_NUM({
    param: newsNumOptions,
    success: (res) => {
      if (res.error_code === '0') {
        const resData = res.data;
        if (resData.news_num > 0) {
          ajax.GET_LASTEST_NEWS({
            param: newsNumOptions,
            success: (response) => {
              if (response.error_code === '0') {
                newsNumOptions.max_time = resData.max_time;
                const data = response.data;
                if (data.dataList && data.dataList.length > 0) {
                  const firstDate = data.dataList[0];
                  if (setting.soundSetting) {
                    sound.play();
                  }
                  if (setting.desktopSetting) {
                    const news = firstDate.news_list[0];
                    if (news.abstract.length > 49) {
                      news.abstract = news.abstract.substr(0, 49).concat('...');
                    }
                    Base.notification({
                      title: news.title,
                      icon: '/res/pc/static/images/noti-icon.png',
                      body: news.abstract,
                    }).show(function () {
                      const self = this;
                      setTimeout(() => {
                        self.noti.close();
                      }, 5000);
                    });
                    // each(firstDate.news_list, (news) => {
                    //   Base.notification({
                    //     title: news.title,
                    //     icon: 'http://www.popcoin.live/favicon.ico',
                    //     body: news.abstract,
                    //   }).show(function () {
                    //     const self = this;
                    //     setTimeout(() => {
                    //       self.noti.close();
                    //     }, 1500);
                    //   });
                    // });
                  }
                }
              }
            },
          });
        } else {
          newsNumOptions.max_time = res.data.max_time;
        }
      }
    },
  });
};
requestLastest();
setInterval(requestLastest, 10000);
tab('.page-header');
let logFlag = false;
let user = {};
const tabSwitch = (tabType) => {
  const tabItemSelector = tabType.replace('[', '"[').replace(']', ']"');
  const $tabItem = $('.user-page .tabs').find(`[data-tab=${tabItemSelector}]`);
  if (tabType === '[data-tab-1]') {
    $tabItem.parents('.level-menu').addClass('active');
  }
  const beforeTabItem = $tabItem.addClass('active').siblings('.active');
  if (beforeTabItem.length > 0) {
    $tabItem.addClass('active').siblings().removeClass('active')
      .parents()
      .find('.tabs-content')
      .find(tabType)
      .addClass('active')
      .siblings()
      .removeClass('active');
  } else {
    $tabItem.addClass('active')
      .parents()
      .find('.tabs-content')
      .find(tabType)
      .addClass('active')
      .siblings()
      .removeClass('active');
  }
};
const initUser = () => {
  $('.user').removeClass('log').addClass('logged').html(headerUserTpl);
  if (user.image_url) {
    const $portrait = `<img src= ${user.image_url}>`;
    $('.user a > span').remove();
    $('.user a').prepend($portrait);
  }
  $('.user a').mouseenter(() => {
    $('.user-popup').removeClass('hidden');
    $('.user .popup-bg').removeClass('hidden');
  });
  $('.user .popup-bg').mouseleave(() => {
    $('.user-popup').addClass('hidden');
    $('.user .popup-bg').addClass('hidden');
  });
  // 在其他页面通过头部用户弹出窗进入个人中心页面时，判断地址锚点
  let tabType = window.location.hash;
  if (tabType) {
    tabType = `[${tabType.replace('#', '')}]`;
    tabSwitch(tabType.replace('#', ''));
  }
  $('.user-popup .menu-item').on('click', function () {
    const $this = $(this);
    tabType = $this.data('tab');
    if (window.location.pathname !== '/user/center.html') {
      tabType = tabType.replace('[', '').replace(']', '');
      window.location.replace(`/user/center.html#${tabType}`);
    }
    tabSwitch(tabType);
  });
  $('.log-out').on('click', () => {
    ajax.LOGOUT({
      success: (res) => {
        if (res.error_code === '0') {
          window.location.reload();
        }
      },
    });
  });
};
// 初始化登录状态
ajax.GET_USER_INFO({
  success: (res) => {
    if (!isArray(res.data)) {
      user = res.data;
      logFlag = true;
      initUser();
    } else {
      const loginTpl = mustache.render(loginTemplete);
      $('body').append(loginTpl);
      tab('.log-modal');
      // $('.log .sign').on('click', function () {
      //   const $this = $(this);
      //   const signTab = $this.attr('data-tab');
      //   $('.login').find('.log-modal .tabs')
      //     .find(`[data-tab="[data-tab-${signTab}]"]`)
      //     .addClass('active')
      //     .siblings()
      //     .removeClass('active');
      //   $('.login').find('.log-modal .tabs-content')
      //     .find(`[data-tab-${signTab}]`)
      //     .addClass('active')
      //     .siblings()
      //     .removeClass('active');
      // });
      $('.log').on('click', () => {
        $('.login').removeClass('hidden')
          .find('.log-modal')
          .removeClass('hidden')
          .siblings('.layer-dialog')
          .addClass('hidden');
      });
      initLogin();
    }
  },
});
$('.layer .close').on('click', () => {
  $('.layer').addClass('hidden');
});
search();
const outers = $('.outer');
for (let i = 0; i < outers.length; i += 1) {
  $(outers[i]).attr('href', $(outers[i]).data('href'));
}
const isLogin = logFlag;
const userInfo = user;
window.$ = $;
const toTop = (selector, limitPosition) => {
  $(selector).on('click', () => {
    let position = window.scrollY;
    if (!limitPosition || position > limitPosition) {
      const timer = setInterval(() => {
        if (position > 0) {
          $(window).scrollTop(position);
          position -= 100;
        } else {
          $(window).scrollTop(0);
          clearInterval(timer);
        }
      }, 10);
    }
  });
};
toTop('.scroll-top');
window.onscroll = () => {
  if (window.scrollY > 2000) {
    $('.scroll-top').removeClass('hidden');
  } else {
    $('.scroll-top').addClass('hidden');
  }
};
setInterval(updateCoins, 30000);
export {
  isLogin,
  userInfo,
  toTop,
};
