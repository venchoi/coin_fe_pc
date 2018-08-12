// 深度卡片
import $ from 'jquery';

const articleTemplete = '<article class="article"><a href="" target="_blank"><div class="main-content" news-crab>  <h2 class="title"></h2>  <p class="text"></p>  <div class="other"><div class="author"><div class="icon"><img src="" alt=""></div><div class="name"><span></span><time></time></div></div><div class="button main collect"><i class="iconfont icon-star"></i><span></span></div></div></div><div class="img"><img src="" alt=""></div></a></article>';
const renderArticleCard = (article) => {
  const $article = $(articleTemplete);
  const $content = $article.find('.main-content');
  const $other = $article.find('.other');
  const type = article.is_collect === 0 ? 1 : 0;
  // const collect = article.is_collect ? '已收藏' : '收藏';
  // const collectClass = article.is_collect ? 'active' : '';
  $article.find('> a').attr('href', `/news/id_${article.news_uuid}.html`);
  $content.find('h2').html(article.title).addClass(article.tag[0]);
  $content.find('p.text').html(article.abstract);
  $other.find('.icon > img').attr('src', article.channel_icon);
  $other.find('.name > span').html(`${article.source_name} · `);
  $other.find('.name > time').html(article.time);
  $other.find('.button').attr('data-source-id', article.news_id);
  // 一直获取不到is_collect
  $other.find('.button').attr('data-type', type);
  // console.log('article', article, article.is_collect);
  if (article.is_collect) {
    $other.find('.button').addClass('active')
      .find('i')
      // .siblings('i')
      .remove();
  } else {
    $other.find('.button');
  }
  $article.find('div.img > img').attr('src', article.thumb_url);
  return $article;
};
export default renderArticleCard;
