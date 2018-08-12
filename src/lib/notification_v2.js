import jQuery from 'jquery';
window.Base = {
  siteUrl: location.protocol + '//' + location.hostname,
  loadingPageHtml: '<div class="loading-page"></div>',
  str: {
    trimAll: function (string) {
      return string.replace(XUI.reg.trimAll, '');
    }
  },
  //静态模板内路径(图片)赋值
  // formatTemplate: function (msg) {
  //   return msg.replace(/\{\s*assetsUrl\s*\}/g, Base.assetsUrl);
  // }
};
(function (win) {
  var customEventElement = function () {
    this.listeners = {} //如果写在proto里面会 list 会共享
  }
  customEventElement.prototype = {
    //如果listener 记录被绑定的对象，那么多想就无法释放
    addEventListener: function (type, callback) {
      if (!(type in this.listeners)) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(callback);
    },
    removeEventListener: function (type, callback) {
      if (!(type in this.listeners)) {
        return;
      }
      var stack = this.listeners[type];
      for (var i = 0, l = stack.length; i < l; i++) {
        if (stack[i] === callback) {
          stack.splice(i, 1);
          return this.removeEventListener(type, callback);
        }
      }
    },
    dispatchEvent: function (event) {
      var event = event,
        type;
      if (typeof event !== 'obejct' && typeof event === 'string') {
        type = event;
        try {
          event = new Event(type) // 兼容ie9
        } catch (e) {
          event = document.createEvent("Event");
          event.initEvent(type, false, false);
        }
      }

      if (!(event.type in this.listeners)) {
        return;
      }
      var stack = this.listeners[event.type];
      // event.target = this;
      for (var i = 0, l = stack.length; i < l; i++) {
        stack[i].call(this, event);
      }
    }
  }
  win.cusEventElement = customEventElement;
}(window));
(function (win) {
  var chrome_reg = /Chrome\/[0-9]*\.[0-9]*\.[0-9]*\.[0-9]*/;
  var app_v = window.navigator.appVersion;
  var chrome_v = chrome_reg.test(app_v) && app_v.match(chrome_reg)[0].split('/')[1].split('.')[0];
  if (!('Notification' in window) || Number(chrome_v) >= 62) {
    var Notification = function (title, option) {
      var self = this,
        option = option || {},
        timesamp = Date.now(),
        dialog_dom,
        body = $('body');

      this.permission = 'granted' //不做只读限制
      this.title = title || '' //不做只读限制
      this.dir = option.dir || '' //不做只读限制
      this.lang = option.lang || '' //不做只读限制
      this.body = option.body || '' //不做只读限制
      this.tag = option.tag || '' //不做只读限制
      this.icon = option.icon || '' //不做只读限制
      win.cusEventElement.apply(this) // 继承cusEventElement 构造器

      var eventHandle = function (type, callback) {
        var callback = callback;
        if (typeof callback !== 'function') {
          callback = function () { };
        }
        self.addEventListener(type, callback.bind(self))

      }
      var createDialog = function () {
        var html,
          bottom = 15,
          noti_count = 0;

        function createDom(option) {
          var lang = option.lang,
            body = option.body,
            tag = option.tag,
            icon = option.icon,

            tem = '<div id="noti_' + timesamp + '" class="notification"><span class="close"><i class="iconfont icon-close"></i></span> <h1 class="text-ellipsis">' + title + '</h1><div class="content"><img src="' + icon + '"><p>' + body + '</p></div><span>www.popcoin.live</span></div>';

          return tem
        }
        html = $(createDom(option));
        $('.notification').each(function (i, ele) {
          bottom += $(ele).height();
          noti_count++;
        })
        html.css('bottom', bottom + 15 * noti_count);
        html.find('.close').click(function (e) {
          self.close();
        })
        body.append(html);
      }

      this.onshow = function () {
        eventHandle('show')
      }
      this.onerror = function () {
        eventHandle('error')
      }
      this.onclose = function () {
        eventHandle('close')
      }

      this.close = function () {
        //关闭
        dialog_dom.remove();
        self.dispatchEvent('close');
      };


      this.init = function () {
        createDialog()
        dialog_dom = $('#noti_' + timesamp);
        eventHandle('show', function () {
          var self = this;
          setTimeout(function () {
            self.close();
          }, 10000);
        })
        self.dispatchEvent('show');
        return self
      }
      return this.init()

    }
    Notification.prototype = win.cusEventElement.prototype;
    Notification.__proto__ = { permission: 'granted' };

    win.Notification = Notification;
  }
}(window));
+
  function ($, Base) {
    'use strict';

    function Noti(options) {
      return new Noti.fn.init(options);
    }

    Noti.title = '';
    Noti.config = {
      dir: 'ltr',
      tag: '',
      icon: '',
      body: ''
    };

    Noti.fn = Noti.prototype = {
      constructor: Noti,
      init: function (options) {
        var self = this;
        var title = options.title || Noti.title;
        delete options.title;
        options = $.extend({}, Noti.config, options);
        options.icon = options.icon;

        if (Notification.permission === 'granted') {
          self.noti = new Notification(title, options);
        } else if (Notification.permission !== 'denied') {
          if (Notification.requestPermission == undefined) { //IE 不支持Notification.requestPermission方法
            self.noti = new Notification(title, options);
            self.show().close().error().click();
            return;
          }
          Notification.requestPermission(function (prem) {
            if (prem === 'granted') {
              self.noti = new Notification(title, options);
              self.show().close().error().click();
            }
          });
        }
      },
      proxy: function (method, fn) {
        this['f' + method] = fn || this['f' + method] || function () { };
        if (this.noti) {
          this.noti.addEventListener(method, function () {
            this['f' + method].call(this);
          }.bind(this), false);
        }
        return this;
      },
      show: function (fn) {
        return this.proxy('show', fn);
      },
      close: function (fn) {
        return this.proxy('close', fn);
      },
      error: function (fn) {
        return this.proxy('error', fn);
      },
      click: function (fn) {
        return this.proxy('click', fn);
      }
    };

    Noti.fn.init.prototype = Noti.fn;
    Base.notification = Noti;
  }(jQuery, Base);