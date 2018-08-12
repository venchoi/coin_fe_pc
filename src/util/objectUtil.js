import baseUtil from "./baseUtil";

const objectUtil = {};

/**
* 空对象判断
* @param {*} obj
*/
objectUtil.isEmptyObject = obj => Object.keys(obj).length === 0;

/**
 * 对象扁平化
 * @param {object} obj - 多维对象，例如: { a : 1, b : { c : 2 }}
 * @return {object} result - 返回一维对象，例如：{ a : 1, b.c : 2}
 */
objectUtil.flatten = (obj) => {
  let result = {};
  function recurse(src, prop) {
    let toString = Object.prototype.toString;
    if (toString.call(src) === '[object Object]') {
      let isEmpty = true;
      for (var p in src) {
        isEmpty = false;
        recurse(src[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty && prop) {
        result[prop] = {};
      }
    } else {
      result[prop] = src;
    }
  }
  recurse(obj, '');
  return result;
}

/**
 * 反扁平化
 * @param {object} obj - 一维对象 例如：{s: 2, 'd.w': 3} 或{s: 2, 'd[w]': 3}
 * @return {object} resultholder - 多维对象 例如： {s: 2, d: { w : 3 }}
 */
objectUtil.unflatten = function(obj) {
  if (Object(obj) !== obj || baseUtil.isArray(obj))
      return obj;
  var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
      resultholder = {};
  for (var p in obj) {
      var cur = resultholder,
          prop = "",
          m;
      while (m = regex.exec(p)) {
          cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
          prop = m[2] || m[1];
      }
      cur[prop] = obj[p];
  }
  return resultholder[""] || resultholder;
}

/**
 * 对象转换成数组
 * @param {object} obj - 被转换的对象，如果是多维数组，先扁平化
 */
object.toArray = (obj) => {}