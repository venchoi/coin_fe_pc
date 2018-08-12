import $ from 'jquery';
import ajax from '../../lib/ajax';
import { isLogin } from '../../js/common';

// 用户操作单个新闻
const userCoinOptions = {
  source_id: '',
  source_type: '', // 新闻或者是币
  is_favorite: 0,
};
const coinCollectButton = () => {
  $('.coin-card .button.follow').on('click', function (e) {
    if (!isLogin) {
      $('.login').removeClass('hidden');
    }
    const $this = $(this);
    let type = '';
    userCoinOptions.source_type = 'coin';
    userCoinOptions.source_id = $this.parents('.coin-card').data('source-id');
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
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
};
export default coinCollectButton;
