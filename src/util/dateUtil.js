import { each } from './baseUtil';

const date = {};
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

date.format = (timestamp, dateFormat) => {
  if (!(timestamp instanceof Date)) {
    return null;
  }
  const o = {
    'M+': timestamp.getMonth() + 1, // 月份
    'd+': timestamp.getDate(), // 日
    'h+': timestamp.getHours(), // 小时
    'm+': timestamp.getMinutes(), // 分
    's+': timestamp.getSeconds(), // 秒
    'q+': Math.floor((timestamp.getMonth() + 3) / 3), // 季度
    S: timestamp.getMilliseconds(), // 毫秒
  };
  let fmt = dateFormat;

  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, `${timestamp.getFullYear()}`.substr(4 - RegExp.$1.length));
  each(o, (v, k) => {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (RegExp.$1.length === 1) ? (o[k]) : ((`00${v}`).substr(v.toString().length)));
    }
  });
  return fmt;
};

date.getDay = (d) => {
  const arr = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  if (d instanceof Date) {
    return arr[date.getDay()];
  }
  return d;
};

/**
 * @param {Date} d - 日期
 * @param {Date} d1 - 日期
 * @returns {String} - 返回与今日的距离 今日 昨日 前日
 */
date.compare = (d, d1) => {
  const todayStr = date.format(new Date(), 'yyyy-MM-dd');
  const today = new Date(todayStr).getTime();
  console.log(d1);
  if (d instanceof Date) {
    return d.getTime() - today > DAY ? '' : '';
  }
  return d;
};

export default date;
