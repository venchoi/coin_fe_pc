import $ from 'jquery';
import mustache from 'mustache';
import { isLogin } from './common';
import tab from '../component/tab';
import ajax from '../lib/ajax';
import { each } from '../util/baseUtil';
import { updateCoinsQuotations } from './common/updateCoin';
import '../sass/views/quotations.scss';

// todo 首页和尾页 不可以点击下一页
tab('.quotations-tabs');
// const cache = {};
let allInit = true;
let exInit = true;
let concernInit = true;
const template = '<ul class="market-realtime" data-code="{{code}}"><li class="range">{{range}}</li><li class="coin-name"><a href="/coin/code_{{code}}.html" target="_blank"><div class="logo"></div>{{en_short_name}} {{ch_name}}</a></li><li class="market-value">{{market_value}}</li><li class="price">{{price}}</li><li class="coin-amount">{{coin_amount}}</li><li class="total-amount">{{total_amount}}</li><li class="ratio {{class}}">{{ratio}}</li></ul>';
const exTpl = '<ul class="ex" data-code="{{name}}"><li class="range">{{range}}</li><li class="ex-name"><div class="logo"></div>{{name}}</li><li class="total-amount">{{total_amount}}</li><li class="trade-pair">{{trade_pair}}</li><li class="country">{{country}}</li><li class="support-currency">{{support_currency}}</li><li class="action"><div class="button"><a href="{{website_address}}" target="_blank">前往交易</a></div></li></ul>';
const pageTpl = '<div class="page-item turn-page prev-page disabled"><i class="iconfont icon-turn-left"></i></div><ul class="page"></ul><div class="page-item turn-page next-page"><i class="iconfont icon-turn-right"></i></div>';
const allParam = {
  is_index: 2,
  page: 1,
  type: '+market_value',
};
const exParam = {
  is_index: 2,
  page: 1,
  type: '+exchange_trade_amount',
};
const concernParam = {
  is_index: 2,
  page: 1,
  type: '+market_value',
};
const exCache = {};
const initPageNum = (conainer, pageNum, cb) => {
  conainer.find('.page-container .page-item').on('click', function () {
    const $this = $(this);
    const type = $this.parents('.content-item').attr('data-type');
    let page = $this.parents('.content-item').find('.page .page-item.active').attr('data-page');
    if ($this.hasClass('active')) {
      return false;
    }
    if ($this.hasClass('prev-page')) {
      if (Number(page) === 1) {
        return;
      }
      page = Number(page) - 1;
    } else if ($this.hasClass('next-page')) {
      if (Number(page) === Number(pageNum)) {
        return;
      }
      page = Number(page) + 1;
    } else {
      page = $this.attr('data-page');
    }
    conainer.find('.page-item.active').removeClass('active')
      .siblings(`[data-page=${page}]`)
      .addClass('active');
    if (Number(page) === 1) {
      $this.parents('.content-item').find('.prev-page').addClass('disabled');
    } else {
      $this.parents('.content-item').find('.prev-page').removeClass('disabled');
    }
    if (Number(page) === Number(pageNum)) {
      $this.parents('.content-item').find('.next-page').addClass('disabled');
    } else {
      $this.parents('.content-item').find('.next-page').removeClass('disabled');
    }
    if (typeof cb === 'function') {
      cb(page, type);
    }
    return page;
  });
};
const initPage = (container, pageNum) => {
  // const pageCon = container.find('.page-container');
  let pageItems = '';
  const page = mustache.render(pageTpl);
  container.find('.page-container').removeClass('hidden').html(page);
  for (let i = 1; i <= pageNum; i += 1) {
    if (i === 1) {
      pageItems += `<li class="page-item active" data-page="${i}">${i}</li>`;
    } else {
      pageItems += `<li class="page-item" data-page="${i}">${i}</li>`;
    }
  }
  // const pageDom = $(page);
  container.find('.page-container').removeClass('hidden').find('.page').html(pageItems);
  // eslint-disable-next-line
  initPageNum(container, pageNum, renderTable);
};
const renderCoinsList = (res, conainer, param) => {
  const tbody = $('<div class="tbody-container"></div>');
  // todo 一页多少条
  let range = (param.page - 1) * 50;
  each(res.data.dataList, (coinItem) => {
    range += 1;
    const copyOfCoin = coinItem;
    if (parseFloat(copyOfCoin.ratio) > 0) {
      copyOfCoin.class = 'good';
    }
    if (parseFloat(copyOfCoin.ratio) < 0) {
      copyOfCoin.class = 'bad';
    }
    copyOfCoin.range = range;
    copyOfCoin.code = String(copyOfCoin.code).toLowerCase();
    const tpl = mustache.render(template, copyOfCoin);
    let $img;
    if (copyOfCoin.small_logo_url) {
      $img = `<img src="${copyOfCoin.small_logo_url}" alt="">`;
    } else if (copyOfCoin.big_logo_url) {
      $img = `<img src="${copyOfCoin.big_logo_url}" alt="">`;
    } else {
      $img = '<span><i class="iconfont icon-coin-logo"></i></span>';
    }
    const dom = $(tpl);
    dom.find('.logo').html($img);
    tbody.append(dom[0]);
  });
  conainer.html(tbody);
  $('.loading-page').addClass('hidden');
};
const requestAll = () => {
  $('.loading-page').removeClass('hidden');
  ajax.QUOTATIONS_LIST({
    param: allParam,
    success: (res) => {
      if (res.error_code === '0' && res.data && res.data.dataList) {
        if (allInit) {
          const pageNum = res.data.pageInfo.page_num;
          allInit = false;
          if (pageNum > 1) {
            initPage($('.all'), pageNum);
          }
        }
        renderCoinsList(res, $('.all-table .table-body'), allParam);
      }
    },
  });
};
const requestEx = () => {
  $('.loading-page').removeClass('hidden');
  ajax.QUOTATIONS_LIST({
    param: exParam,
    success: (res) => {
      if (res.error_code === '0' && res.data && res.data.dataList) {
        if (exInit) {
          exInit = false;
          const pageNum = res.data.pageInfo.page_num;
          if (pageNum > 1) {
            initPage($('.ex'), res.data.pageInfo.page_num);
          }
        }
        const tbody = $('<div class="tbody-container"></div>');
        // todo 一页多少条
        let range = (exParam.page - 1) * 50;
        each(res.data.dataList, (exItem) => {
          range += 1;
          const copyOfEx = exItem;
          copyOfEx.range = range;
          const tpl = mustache.render(exTpl, copyOfEx);
          let $img;
          if (copyOfEx.logo_url) {
            $img = `<img src="${copyOfEx.logo_url}" alt="">`;
          } else {
            $img = '<span></span>';
          }
          const dom = $(tpl);
          dom.find('.logo').html($img);
          tbody.append(dom[0]);
        });
        exCache[exParam.page] = tbody;
        $('.ex-table .table-body').html(tbody);
        $('.loading-page').addClass('hidden');
      }
    },
  });
};
const requestConcern = () => {
  $('.loading-page').removeClass('hidden');
  ajax.CONCERN_QUOTATIONS({
    param: concernParam,
    success: (res) => {
      if (res.error_code === '0' && res.data && res.data.dataList) {
        if (res.data.dataList.length) {
          if (concernInit) {
            concernInit = false;
            const pageNum = res.data.pageInfo.page_num;
            if (pageNum > 1) {
              initPage($('.concern'), res.data.pageInfo.page_num);
            }
          }
          renderCoinsList(res, $('.concern-table .table-body'), concernParam);
        } else {
          $('.loading-page').addClass('hidden');
          $('.concern-none-container').removeClass('hidden');
          $('.concern .container').addClass('hidden');
        }
      }
    },
  });
};
const renderTable = (page, type) => {
  if (type === 'all') {
    allParam.page = page;
    requestAll();
  }
  if (type === 'concern') {
    concernParam.page = page;
    requestConcern();
  }
  if (type === 'ex') {
    if (exCache[page]) {
      $('.ex-table .table-body').html(exCache[page]);
    } else {
      exParam.page = page;
      requestEx();
    }
  }
};
$('.all .th').on('click', function () {
  const $this = $(this);
  let rankType = '';
  rankType = $this.attr('data-rank-type') ? $this.attr('data-rank-type') : '+';
  const type = $this.attr('data-type');
  if (!$this.attr('data-rank-type')) {
    rankType = '+';
  } else {
    rankType = $this.attr('data-rank-type') === '+' ? '-' : '+';
  }
  allParam.type = rankType + type;
  $this.siblings().attr('data-rank-type', '');
  $this.attr('data-rank-type', rankType);
  requestAll();
});
$('.concern .th').on('click', function () {
  const body = $('.concern .tbody-container').find('ul');
  if (!body.length) {
    return;
  }
  const $this = $(this);
  let rankType = '';
  rankType = $this.attr('data-rank-type') ? $this.attr('data-rank-type') : '+';
  const type = $this.attr('data-type');
  if (!$this.attr('data-rank-type')) {
    rankType = '+';
  } else {
    rankType = $this.attr('data-rank-type') === '+' ? '-' : '+';
  }
  concernParam.type = rankType + type;
  $this.siblings().attr('data-rank-type', '');
  $this.attr('data-rank-type', rankType);
  requestConcern();
});
$('.tab-item[data-tab="[data-tab-2]"]').on('click', () => {
  if (!isLogin) {
    $('.login').removeClass('hidden');
  }
});
// todo 没有中文名的
requestAll();
requestEx();
requestConcern();
updateCoinsQuotations();
setInterval(updateCoinsQuotations, 30000);
