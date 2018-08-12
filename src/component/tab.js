import $ from 'jquery';

const tab = (selector) => {
  const $root = $(selector);
  const $hoverLine = $root.find('.hover-line');
  $root.find('.tab-item').on('mouseover', (e) => {
    const target = e.currentTarget;
    const $target = $(target);
    $hoverLine.css('width', $target.width());
    $hoverLine.css('left', target.offsetLeft);
  });
  $root.find('.tab-item').on('mouseout', () => {
    $hoverLine.css('width', 0);
  });
  $root.find('li.tab-item').on('click', function () {
    const $this = $(this);
    if (!$this.hasClass('disabled') && !$this.hasClass('active')) {
      $this.addClass('active').siblings().removeClass('active')
        .parents()
        // .parent()
        // .parent()
        // .parent()
        .find('.tabs-content') // todo 判断是否存在，再往下寻找
        .find($(this).attr('data-tab'))
        .addClass('active')
        .siblings()
        .removeClass('active');
    }
  });
};
export default tab;
