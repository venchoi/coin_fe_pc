import $ from 'jquery';

const hint = (state, type, text, time) => {
  const resTpl = '<div class="hint-container"><i class="iconfont"></i><span class="text"></span></div>';
  const $resDom = $(resTpl);
  $resDom.find('i').addClass(`icon-${state} ${type}`).siblings('.text').html(text);
  $('.hint').html($resDom).removeClass('hidden');
  setTimeout(() => {
    $('.hint').addClass('hidden');
  }, time);
  return $resDom;
};
export default hint;
