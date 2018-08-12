import baseUtil from "./baseUtil";

const arrayUtil = {};

arrayUtil.flatten = (src) => {
  let result = [];
  function recurse(arr) {
    let res = [];
    for (let i = 0; i < arr.length; i++) {
      if (baseUtil.isArray(arr[i])) {
        res.push.apply(res, recurse(arr[i]));
      } else {
        res.push(arr[i]);
      }
    }
    return res;
  }
  result = recurse(src);
  return result;
};

arrayUtil.max = (arr) => Math.max(...arr);

arrayUtil.min = (arr) => Math.min(...arr);

arrayUtil.sum = (arr) => {
  let s = 0;
  if (arr.length === 0) {
    return 0;
  } else if (arr.length === 1) {
    return arr[0];
  } else {
    for (let i = 0; i < arr.length; i++) {
      s += arr[i];
    }
    return s;
  }
};

/**
* 二分法查找
* @param {Array} arr - 已排序的被查找数组
* @param {*} target - 需查找的值
*/
// todo arr的长度没有校验
arrayUtil.binarySearch = (arr, target) => {
  let low = 0;
  let high = arr.length - 1;
  let mid = (low + high) / 2;
  while (high - low > 1) {
    if (target === arr[low]) { return low; }
    if (target === arr[high]) { return high; }
    if (target === arr[mid]) { return mid; }
    if (target > arr[mid]) {
      low = mid;
      mid = (low + high) / 2;
    }
    if (target < arr[mid]) {
      high = mid;
      mid = (low + high) / 2;
    }
  }
  return -1;
};

/**
* 数组去重
* @param {Array} array
*/
arrayUtil.arrUnique = (array) => {
  const tmp = {};
  const ret = [];
  each(array, (item) => {
    if (!tmp[item]) {
      tmp[item] = 1;
      ret.push(item);
    }
  });
  return ret;
};

/**
* 求数组补集
* @param {Array} a - 补集最终所在的数组
* @param {Array} b - 需要排除的数组
*/
arrayUtil.minus = (a, b) => {
  const result = new Array(0);
  const obj = {};
  each(a, (item) => {
    obj[item] = 1;
  });
  each(b, (item) => {
    if (!obj[item]) {
      obj[item] = 1;
      result.push(item);
    }
  });
  return result;
};

/**
* 排序
* @param {Array} array - 需排序的数组
*/
arrayUtil.ascSort = array => array.sort((a, b) => a - b);

arrayUtil.desSort = array => array.sort((a, b) => b - a);

export default arrayUtil;
