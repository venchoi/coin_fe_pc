import $ from 'jquery';
import ajax from '../../lib/ajax';
import { isLogin } from '../../js/common';
import initPhotoSwipeFromDOM from '../../component/photoswipe';
// import { each } from '../../util/baseUtil';

// 用户操作单个新闻
const userNewsOptions = {
  source_id: '',
  source_type: '', // 新闻或者是币
  is_favorite: 0,
};
const bindClick = () => {
  $('.press-container .button.collect').on('click', function () {
    if (!isLogin) {
      $('.login').removeClass('hidden');
    }
    const $this = $(this);
    let type = '';
    const iDom = '<i class="iconfont icon-star"></i>';
    const sourceId = $this.parents('[press-carb]').data('source-id');
    userNewsOptions.source_type = 'news';
    userNewsOptions.source_id = sourceId;
    type = $this.data('type') === 0 ? 0 : 1;
    userNewsOptions.is_favorite = type;
    ajax.OPERATE_USER_FAVORITE({
      param: userNewsOptions,
      success: (res) => {
        if (res.error_code === '0') {
          const $newsDoms = $(`[data-source-id="${sourceId}"]`);
          const length = $newsDoms.length;
          for (let i = 0; i < length; i += 1) {
            const $dom = $($newsDoms[i]).find('.button.collect');
            type = $dom.data('type') === 0 ? 1 : 0;
            $dom.data('type', type);
            $dom.toggleClass('active');
            if (type) {
              $dom.prepend($(iDom));
            } else {
              $dom.find('.icon-star').remove();
            }
          }
        }
      },
    });
  });
  $('.press-container .button.attitude').on('click', function () {
    if (!isLogin) {
      $('.login').removeClass('hidden');
    }
    const $this = $(this);
    let type = '';
    const newsId = $this.parents('[press-carb]').data('source-id');
    const sourceType = $this.data('attitude');
    type = $this.data('type') === 0 ? 0 : 1;
    userNewsOptions.is_favorite = type;
    userNewsOptions.source_id = newsId;
    userNewsOptions.source_type = sourceType;
    // newsUser.source_id = newsId;
    ajax.OPERATE_USER_FAVORITE({
      param: userNewsOptions,
      success: (res) => {
        if (res.error_code === '0') {
          const $newsDoms = $(`[data-source-id="${newsId}"]`);
          const length = $newsDoms.length;
          for (let i = 0; i < length; i += 1) {
            const $dom = $($newsDoms[i]).find(`.attitude[data-attitude="${sourceType}"]`);
            const downCountDom = $($newsDoms[i]).find('.attitude.active');
            if (downCountDom.length) {
              const count = Number(downCountDom.find('span').html()) - 1;
              downCountDom.find('span').html(count);
            }
            type = type === 0 ? 1 : 0;
            $dom.data('type', type);
            $dom.toggleClass('active').siblings('.attitude').removeClass('active');
            if ($dom.hasClass('active')) {
              const upCount = Number($dom.find('span').html()) + 1;
              $dom.find('span').html(upCount);
            }
          }
        }
      },
    });
  });
};
const thumbsUpClick = (newsId) => {
  $('.button.thumbs-up').on('click', function () {
    if (!isLogin) {
      $('.login').removeClass('hidden');
    }
    const $this = $(this);
    userNewsOptions.source_type = newsId;
    userNewsOptions.source_type = 'thumb_up';
    userNewsOptions.is_favorite = $('.button.thumbs-up').data('type');
    ajax.OPERATE_USER_FAVORITE({
      param: userNewsOptions,
      success: (res) => {
        if (res.error_code === '0') {
          const active = $this.hasClass('active');
          let count = Number($this.data('count'));
          count = active ? count - 1 : count + 1;
          $this.toggleClass('active').data('count', count).find('span').html(count);
        }
      },
    });
  });
};
const imgZoom = (container, selector) => {
  container.on('click', () => {
    initPhotoSwipeFromDOM(selector);
  });
};
const adjustImg = ($imgContainers) => {
  if ($imgContainers.length) {
    const imgContainer = $imgContainers[0];
    if (imgContainer.children[0] && imgContainer.children[0].children[0].children[0]) {
      const height = imgContainer.children[0].children[0].children[0].naturalHeight;
      const width = imgContainer.children[0].children[0].children[0].naturalWidth;
      const ratio = width / height;
      if (ratio > 6) {
        $(imgContainer).addClass('over').addClass('w-over');
      }
      if (ratio < 0.1667) {
        $(imgContainer).addClass('over').addClass('h-over');
      }
    }
  }
};
const adjustDeepImg = ($imgConDoms) => {
  if ($imgConDoms.length) {
    const $imgConDom = $imgConDoms[0].firstElementChild;
    const height = $imgConDom.naturalHeight;
    const width = $imgConDom.naturalWidth;
    if (width > height) {
      $imgConDoms.addClass('over').addClass('w-over');
    }
    if (width < height) {
      $imgConDoms.addClass('over').addClass('h-over');
    }
  }
};
export {
  bindClick,
  thumbsUpClick,
  imgZoom,
  adjustImg,
  adjustDeepImg,
};
