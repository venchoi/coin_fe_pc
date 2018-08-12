import $ from 'jquery';
import mustache from 'mustache';
import coinCardTpl from '../../template/card/coinCard.html';

const coinSubject = mustache.render(coinCardTpl);

const renderCoinSubject = (coin) => {
  const $coinSubject = $(coinSubject);
  const ratio = parseFloat(coin.ratio);
  let ratioClass = '';
  if (ratio > 0) {
    ratioClass = 'good';
  }
  if (ratio < 0) {
    ratioClass = 'bad';
  }
  const coinCode = String(coin.code).toLowerCase();
  const href = `/coin/code_${coinCode}.html`;
  const $button = $coinSubject.find('.action .button');
  let $img;
  if (coin.small_logo_url) {
    $img = `<img src="${coin.small_logo_url}" alt="">`;
  } else if (coin.big_logo_url) {
    $img = `<img src="${coin.big_logo_url}" alt="">`;
  } else {
    $img = '<span><i class="iconfont icon-coin-logo"></i></span>';
  }
  $coinSubject.attr('data-code', coinCode);
  $coinSubject.attr('data-source-id', coin.coin_id);
  $coinSubject.find('a').attr('href', href);
  $coinSubject.find('.name').html(`${coin.en_short_name} ${coin.ch_name}`);
  $coinSubject.find('.logo').append($img);
  $coinSubject.find('.price').html(coin.price);
  $coinSubject.find('.ratio').addClass(ratioClass).html(coin.ratio);
  $coinSubject.find('.data-source').html(`数据来源于${coin.source_name}`);
  // $coinSubject.find('.action .button').addClass(collectClass).html(collect).attr('data-type', );
  if (coin.is_collect) {
    $button.addClass('active').attr('data-type', '0');
  }
  return $coinSubject;
};
export default renderCoinSubject;
