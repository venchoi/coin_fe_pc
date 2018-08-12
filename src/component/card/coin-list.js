import $ from 'jquery';

const templete = '<li><a href="" target="_blank"><div class="icon"><img src="" alt = ""></div><div class = "info"><div class = "details"><div class = "name">BTC 比特币</div><div class = "source">数据来源于 Huobi</div></div><div class = "market"><div class = "price">$7988.74</div><div class = "ratio good">+7.98%</div></div></div></a></li>';
const renderCoinList = (coin) => {
  const $li = $(templete);
  const ratioClass = Number(coin.ratio) > 0 ? 'good' : 'bad';
  const coinCode = coin.coin_id;
  const href = `/coin/code_${coinCode.toLowerCase()}.html`;
  $li.find('a').attr('href', href);
  $li.find('.icon > img').attr('src', coin.small_logo_url);
  $li.find('.info > .details > .name').html(coin.ch_name);
  $li.find('.info > .details > .source').html(coin.source_namerce);
  $li.find('.info > .market > .price').html(coin.price);
  $li.find('.info > .market > .ratio').addClass(ratioClass).html(coin.ratio);
  return $li;
};
export default renderCoinList;
