import $ from 'jquery';
import Layer from '../../lib/layer/layer';

const imgZoomIn = (selectot) => {
  $(selectot).on('click', function (e) {
    const $this = $(this);
    const layer = new Layer({
      content: $this.clone(), // 内容
      draggable: true, // 是否可拖动
      bgClose: true, // 是否可点击背景关闭
      head: {
        // 头部配置，暂时只有关闭功能
        close: false,
      },
    });
    e.preventDefault();
    return layer;
  });
};
export default imgZoomIn;
