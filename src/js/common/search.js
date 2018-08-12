import $ from 'jquery';
import mustache from 'mustache';
import ajax from '../../lib/ajax';
import searchItemTpl from '../../template/card/searchItem.html';

const searchOptions = {
  keyword: '',
};
const search = () => {
  $('.search-input').on('keydown', function (e) {
    setTimeout(() => {
      const $this = $(this);
      const val = $this.val();
      searchOptions.keyword = val;
      if (e.keyCode === 13) {
        $('#keyword').val(val);
        $('#search-form').submit();
      }
      ajax.SEARCH_KEYWORD({
        param: searchOptions,
        success: (res) => {
          if (res.error_code === '0' && res.data.length > 0) {
            const $keywordList = mustache.render(searchItemTpl, { keywordList: res.data });
            $('.search .search-list').html($keywordList).removeClass('hidden');
            $('.search-list .keyword-item').on('click', function () {
              const $thisDom = $(this);
              const keyword = $thisDom.data('keyword').split(' ')[0].toLowerCase();
              window.open(`/coin/code_${keyword}.html`);
              // $('#keyword').val(keyword);
              // $('#search-form').submit();
            });
          } else {
            $('.search .search-list').empty().removeClass('hidden');
          }
        },
      });
    }, 300);
  });
  $('.search-input').on('blur', () => {
    setTimeout(() => {
      $('.search .search-list').addClass('hidden');
    }, 500);
  });
};

export default search;
