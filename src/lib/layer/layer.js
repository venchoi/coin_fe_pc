import $ from 'jquery';
import { merge } from '../../util/baseUtil';
import '../../lib/jqExtend/draggable';

const config = {
  content: '', // 内容
  draggable: true, // 是否可拖动
  bgClose: true, // 是否可点击背景关闭
  head: {
    // 头部配置，暂时只有关闭功能
    close: false,
  },
};

const templete = '<div class="layer"><div class="layer-bg"></div><div class="layer-dialog"><div class="layer-content"></div></div></div>';

/**
 * props: config{}
 * methods: show()、hide()、remove()、replaceContent()
 */
class Layer {
  constructor(options) {
    let option = options;
    if (typeof options === 'string') {
      option = {
        content: options,
      };
    }
    this.config = merge(option, config);
    this.$layer = $(templete);
    this.hidden = true;
    this._init(config);
  }
  _init() {
    this._bgClose();
    this._headClose();
    this._addContent();
    $('body').append(this.$layer);
    this.hidden = false;
    this._drag();
    return this;
  }
  show() {
    if (this.hidden) {
      this.$layer.removeClass('hidden');
      this.hidden = false;
    }
  }
  hide() {
    if (!this.hidden) {
      this.$layer.addClass('hidden');
      this.hidden = true;
    }
  }
  remove() {
    this.$layer.remove();
    this.hidden = true;
  }
  replaceContent(content) {
    this.$layer.find('.layer-content').html(content);
  }
  _drag() {
    if (this.config.draggable) {
      const layer = this.$layer;
      const dialog = layer.find('.layer-dialog');
      dialog.addClass('layer-dialog-drag').drag({
        limit: false,
      });
      dialog.css({
        left: ($(window).width() - dialog.outerWidth()) / 2,
        top: ($(window).height() - dialog.outerHeight()) / 2,
      });
    }
  }
  _bgClose() {
    if (this.config.bgClose) {
      this.$layer.find('.layer-bg').click(this.hide.bind(this));
    }
  }
  _headClose() {
    const headConfig = this.config.head;
    if (headConfig.close) {
      const head = this.$layer.find('.layer-header');
      head.find('.close').css('display', 'block').click(this.hide.bind(this));
      head.css('position', 'relative');
    }
  }
  _addContent() {
    this.$layer.find('.layer-content').html(this.config.content);
  }
}

export default Layer;
