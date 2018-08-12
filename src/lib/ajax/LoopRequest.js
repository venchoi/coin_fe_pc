import baseUtil from '../../util/baseUtil';

export const CHANNEL = {
  HALF_MINUTE: 30 * 1000,
  ONE_MINUTE: 60 * 1000,
  TWO_MINUTE: 2 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
};

// 每个轮询频率对应的请求队列
const requestList = {
  30000: [],
  60000: [],
  120000: [],
  3600000: [],
};

const timer = {};

class LoopRequest {
  constructor() {
    this.loop();
    this.length = 0;
  }
  
  /**
   * 添加轮询方法
   * @param {Function} fn - 需定时执行的函数
   * @param {String} channel - 频率
   */
  add(fn, channel = CHANNEL.HALF_MINUTE) {
    if (typeof fn === 'function') {
      fn();
      requestList[channel].push(fn);
    }
    this.length += 1;
    return fn;
  }

  /**
   * 删除某个轮询方法
   * @param {*} item - 被删除的项
   * @param {String} channel - 频率
   */
  remove(item, channel = CHANNEL.HALF_MINUTE) {
    const index = requestList[channel].indexOf(item);
    if (index > -1) {
      requestList[channel].splice(index, 1);
      this.length -= 1;
    }
    return this;
  }

  /**
   * 清除某个频率的所有轮询方法
   * @param {String} channel - 频率
   */
  clear(channel) {
    requestList[channel].splice(0, requestList[channel].length);
    this.length -= requestList[channel].length;
    return this;
  }

  /**
   * 遍历每个频率下的轮询方法并执行
   */
  loop() {
    baseUtil.each(CHANNEL, (channel) => {
      timer[channel] = setInterval(() => {
        baseUtil.each(requestList[channel], (fn) => {
          fn();
        });
        return this;
      }, channel);
    });
  }
  
  get channel() {
    this.length += 0;
    return CHANNEL;
  }
}

export default new LoopRequest();