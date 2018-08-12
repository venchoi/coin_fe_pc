/**
 * 事件基类
 * 定义监听对象及基础的触发事件和关闭事件方法
 */
class Event {
  constructor() {
    this.listeners = {};
  }

  on(type, handler) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  once(type, handler) {
    const once = (data) => {
      handler.call(this, data);
      this.off(type, once);
    };
    once.isOnce = true;
    this.on(type, once);
  }

  trigger(type, data) {
    if (!(type in this.listeners)) {
      return;
    }
    let i = 0;
    const stack = this.listeners[type];
    const l = stack.length;
    for (i; i < l; i += 1) {
      const isOnce = stack[i].isOnce;
      stack[i].call(this, data);
      if (isOnce) {
        this.trigger(type, data);
        break;
      }
    }
  }

  off(type, callback) {
    if (!(type in this.listeners)) {
      return;
    }
    const stack = this.listeners[type];
    const l = stack.length;
    let isClean = false;
    let i = 0;
    for (i; i < l; i += 1) {
      if (stack[i] === callback) {
        stack.splice(i, 1);
        isClean = true;
        break;
      }
    }
    if (isClean) {
      this.off(type, callback);
    }
  }
}

export default Event;