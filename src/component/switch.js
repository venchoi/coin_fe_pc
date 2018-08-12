import $ from 'jquery';
import mustache from 'mustache';
import tpl from '../template/switch.html';

const render = () => {
  const switchs = $('.layui-form .switch[type="checkbox"]');
  for (let i = 0; i < switchs.length; i += 1) {
    const name = $(switchs[i]).attr('name');
    const switchTpl = mustache.render(tpl, { checked: true, name });
    $(switchs[i]).after(switchTpl);
  }
};
const change = (selector, checked) => {
  selector.attr('checked', checked);
};
// 切换绑定
const toggle = (cb) => {
  $('.layui-form-switch').on('click', function () {
    const name = $(this).attr('name');
    const checked = !($(this).attr('checked'));
    change($(this), checked);
    if (typeof cb === 'function') {
      cb(name, checked);
    }
  });
};
const switchWrap = (cb) => {
  render();
  toggle(cb);
};
export default switchWrap;
