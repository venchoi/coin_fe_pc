import $ from 'jquery';
import { merge } from '../util/baseUtil';

const config = {
  dir: 'ltr',
  tag: '',
  icon: '/res/pc/static/images/noti-icon.png',
  body: '',
};
// 兼容
const customEvent = function () {
  const customEventElement = function () {
    this.listeners = {};
  };
  customEventElement.prototype = {
    // eslint-disable-next-line
    addEventListener: function (type, callback) {
      if (!(type in this.listeners)) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(callback);
    },
    // eslint-disable-next-line
    removeEventListener: function (type, callback) {
      if (!(type in this.listeners)) {
        return;
      }
      const stack = this.listeners[type];
      for (let i = 0, l = stack.length; i < l; i += 1) {
        if (stack[i] === callback) {
          stack.splice(i, 1);
          return this.removeEventListener(type, callback);
        }
      }
    },
    // eslint-disable-next-line
    dispatchEvent: function (eve) {
      let event = eve;
      let type;
      if (typeof event !== 'object' && typeof event === 'string') {
        type = event;
        event = document.createEvent('Event');
        event.initEvent(type, false, false);
        try {
          event = new Event(type);
        } catch (e) {
          event = document.createEvent('Event');
          event.initEvent(type, false, false);
        }
      }

      if (!(event.type in this.listeners)) {
        return;
      }
      const stack = this.listeners[event.type];
      // event.target = this;
      for (let i = 0, l = stack.length; i < l; i += 1) {
        stack[i].call(this, event);
      }
    },
  };
  window.cusEventElement = customEventElement;
};
customEvent();
const compatible = function () {
  const chromeReg = /Chrome\/[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*/;
  const appV = window.navigator.appVersion;
  const chromeV = chromeReg.test(appV) && appV.match(chromeReg)[0].split('/')[1].split('.')[0];
  if (!('Notification' in window) || Number(chromeV) >= 62) {
    const Notification = function (title, op) {
      const self = this;
      const option = op || {};
      const timestamp = Date.now();
      let dialogDom;
      const body = $('body');
      this.permission = 'granted';
      this.title = title || '';
      this.dir = option.dir || '';
      this.lang = option.lang || '';
      this.body = option.body || '';
      this.tag = option.tag || '';
      this.icon = option.icon || '';
      window.cusEventElement.apply(this);
      const eventHandle = (type, cb) => {
        let callback = cb;
        if (typeof callback !== 'function') {
          callback = function () { };
        }
        self.addEventListener(type, callback.bind(self));
      };
      const createDialog = () => {
        let bottom = 15;
        let notiCount = 0;
        const createDom = (options) => {
          // const lang = options.lang;
          // const body = options.body;
          // const tag = options.tag;
          const icon = options.icon;
          const tem = `<div id="noti_${timestamp}" class="notification"><span class="close"><i class="icon icon-plus"></i></span> <img src="${icon}"><div class="content"><h1 class="text-ellipsis">${title}</h1><p>${body}</p><span>wwww.popcoin.live</span></div></div>`;
          return tem;
        };
        const html = $(createDom(option));
        $('.notification').each((i, ele) => {
          bottom += $(ele).height();
          notiCount += 1;
        });
        html.css('bottom', bottom + (15 * notiCount));
        html.find('.close').click(() => {
          self.close();
        });
        body.append(html);
      };
      this.onshow = () => {
        eventHandle('show');
      };
      this.onerror = () => {
        eventHandle('error');
      };
      this.onclose = () => {
        eventHandle('close');
      };
      this.close = () => {
        dialogDom.remove();
        self.dispatchEvent('close');
      };
      this.init = function () {
        createDialog();
        dialogDom = $(`#noti_${timestamp}`);
        eventHandle('show', function () {
          const that = this;
          setTimeout(() => {
            that.close();
          }, 10000);
        });
        self.dispatchEvent('show');
        return self;
      };
      return this.init();
    };
    Notification.prototype = window.cusEventElement.prototype;
    // eslint-disable-next-line
    Notification.__proto__ = { permission: 'granted' };
    window.Notification = Notification;
  }
};
compatible();
class Noti {
  constructor(options) {
    const self = this;
    self.config = config;
    self.title = '';
    merge(self.config, options, true);
    this._init();
  }
  _init() {
    const self = this;
    const title = self.config.title;
    delete self.config.title;
    if (Notification.permission === 'granted') {
      self.noti = new Notification(title, self.config);
    } else if (Notification.permission !== 'denied') {
      if (Notification.requestPermission === 'undefined') {
        self.noti = new Notification(title, self.config);
        self.show().close().error().click();
        return;
      }
      Notification.requestPermission((prem) => {
        if (prem === 'granted') {
          self.noti = new Notification(title, self.config);
          self.show().close().error().click();
        }
      });
    }
  }
  proxy(method, fn) {
    this[`f${method}`] = fn || this[`f${method}`] || function () { };
    if (this.noti) {
      // eslint-disable-next-line
      this.noti.addEventListener(method, function () {
        const self = this;
        self[`f${method}`].call(self);
      }.bind(this), false);
    }
    return this;
  }
  show(func) {
    return this.proxy('show', func);
  }
  close(func) {
    return this.proxy('close', func);
  }
  error(func) {
    return this.proxy('error', func);
  }
  click(func) {
    return this.proxy('click', func);
  }
}
export default Noti;
