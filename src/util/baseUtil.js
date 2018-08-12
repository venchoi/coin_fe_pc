// import assert from 'assert';

class Queue {
  constructor() {
    this.arr = [];
  }
  get length() {
    return this.arr.length;
  }

  /**
   * 插入
   * @param {*} ele
   * @returns {Number}  arr.length
   */
  push(ele) {
    this.arr.push(ele);
  }

  /**
   * 删除队尾
   * @returns {*} ele
   */
  shift() {
    this.arr.shift();
  }

  /**
   * 返回队头
   */
  front() {
    return this.arr[0];
  }

  /**
   * 返回队尾
   */
  rear() {
    return this.arr[this.arr.length - 1];
  }
}

const BUILTIN_OBJECT = {
  '[object Function]': 1,
  '[object RegExp]': 1,
  '[object Date]': 1,
  '[object Error]': 1,
  '[object Image]': 1,
};

const TYPED_ARRAY = {
  '[object Int8Array]': 1,
  '[object Uint8Array]': 1,
  '[object Uint8ClampedArray]': 1,
  '[object Int16Array]': 1,
  '[object Uint16Array]': 1,
  '[object Int32Array]': 1,
  '[object Uint32Array]': 1,
  '[object Float32Array]': 1,
  '[object Float64Array]': 1,
};

const objToString = Object.prototype.toString;

const isBuildInObject = value => !!BUILTIN_OBJECT[objToString.call(value)];
/**
* 遍历方法
* @param {Object} obj - 遍历的对象
* @param {Function} cb - 回调函数，接收(value, key)
*/
const each = (obj, cb) => {
  let keys;
  if (obj instanceof Array) {
    return obj.forEach(cb);
  } else if (typeof obj === 'object') {
    keys = Object.keys(obj);
    return keys.forEach((k) => {
      cb(obj[k], k);
    });
  }
  return null;
};

/**
* 类型判断—— 对象、数组、dom
* @param {*} value - 被判断的值
*/
const isObject = (value) => {
  const type = typeof value;
  return type === 'function' || (!!value && type === 'object');
};
const isArray = value => objToString.call(value) === '[object Array]';
const isDom = value => typeof value === 'object' && typeof value.nodeType === 'number' && typeof value.ownerDocument === 'object';

/**
* 深度拷贝 创建副本
* @param {*} source - 原数据
*/
const copy = (source) => {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  let result;
  const typeStr = objToString.call(source);
  if (typeStr === '[object Array]') {
    result = [];
  } else if (typeStr === '[object Object]') {
    result = {};
  } else {
    result = source;
  }
  each(source, (value, key) => {
    result[key] = copy(value);
  });

  return result;
};

/**
* 浅拷贝 存储空间引用原数据
* @param {*} source - 原数据
*/
const clone = (source) => {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  let result = source;
  const typeStr = objToString.call(source);
  if (typeStr === '[object Array]') {
    result = [];
    for (let i = 0, len = source.length; i < len; i += 1) {
      result[i] = clone(source[i]);
    }
  } else if (TYPED_ARRAY[typeStr]) {
    result = source.constructor.from(source);
  }

  return result;
};
/**
* 合并
* @param target - 目标
* @param source - 源
* @param overwrite - 是否覆盖
* @returns {*} - 合并结果保存在target中，返回target
* 如果源和目标有一个不是Object类型，覆盖则返回源，不覆盖则返回目标；
* 对于两个都是Object类型的，比较他们本身的属性，如果两者属性都为Object，则递归调用merge;
* 否则只处理overwrite为true，或者在target对象中没有此属性的情况，将source的属性值clone到target相应属性中；
* 并且，对于target本没有的属性，也会创建属性并赋值。合并结果保存在target中。
*/
const merge = (target, source, overwrite) => {
  // We should escapse that source is string
  // and enter for ... in ...
  const $target = target;
  if (!isObject(source) || !isObject(target)) {
    return overwrite ? clone(source) : target;
  }

  each(source, (value, key) => {
    if (Object.hasOwnProperty.call(source, key)) {
      const targetProp = target[key];
      const sourceProp = source[key];

      if (isObject(sourceProp)
        && isObject(targetProp)
        && !isArray(sourceProp)
        && !isArray(targetProp)
        && !isDom(sourceProp)
        && !isDom(targetProp)
        && !isBuildInObject(sourceProp)
        && !isBuildInObject(targetProp)
      ) {
        // 如果需要递归覆盖，就递归调用merge
        merge(targetProp, sourceProp, overwrite);
      } else if (overwrite || !(key in target)) {
        // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
        // NOTE，在 target[key] 不存在的时候也是直接覆盖
        $target[key] = clone(source[key], true);
      }
    }
  });

  return target;
};

const defaults = (target, source, overlay) => {
  const t = target;
  const s = source;
  each(s, (value, key) => {
    if (Object.prototype.hasOwnProperty.call(s, key)
      && (overlay ? s[key] !== null : t[key] === null)
    ) {
      t[key] = s[key];
    }
  });
  return t;
};

/**
* mixin
* @param {*} target
* @param {*} source
* @param {*} overlay
*/
const mixin = (target, source, overlay) => {
  const t = 'prototype' in target ? target.prototype : target;
  const s = 'prototype' in source ? source.prototype : source;

  defaults(t, s, overlay);
};

/**
 * 查找 查找是否含有某个属性或值
 * @param {*} source 数组或对象格式的原数据
 * @param {*} target 被查找的元素
 */
const find = (source, target) => {
  if (isArray(source)) {
    return source.indexOf(target);
  } else if (isObject(target)) {
    // return source.hasOwnProperty(target) ? source[target] : -1
    return each(source, (value, key) => {
      if (target === value || target === key) {
        return { key: value };
      }
      return -1;
    });
  }
  return -1;
};

const assert = (value, message) => {
  if (!value) {
    throw new Error(message);
  }
};

export {
  Queue,
  each,
  isObject,
  isArray,
  isDom,
  merge,
  copy,
  clone,
  mixin,
  find,
  assert,
};
