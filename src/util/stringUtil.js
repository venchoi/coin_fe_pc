const strUtil = {};

/**
 * 去除字符串空格
 * @param {String} str - 需要去除空格的字符串
 * @param {String} position - 去除空格的位置，l,r,all,ends
 */
strUtil.trim = (str, position = 'ends') => {
  if (position === 'l') {
    return str.replace(/^\s+/, "");
  } else if (position === 'r') {
    return str.replace(/\s+$/, "");
  } else if (position === 'all') {
    return str.replace(/\s/g, "");
  } else {
    return str.replace(/^\s+$/, "");
  }
};

/**
 * 字符串的首字母大写
 * @param {String} param0 - ...rest用于获取第一个字母之后的字符数组
 * @param {boolean} lowerRest - 其他字符是否需要小写
 */
strUtil.capitalize = ([first, ...rest], lowerRest = false) => first.toUpperCase() + (lowerRest ? rest.join("").toLowerCase() : rest.join(""));

strUtil.sub = () => {};