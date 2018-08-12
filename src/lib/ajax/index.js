import axios from 'axios';
import qs from 'qs';
import apiList from '../../js/common/apiList';

import {
  merge,
  isArray,
  each,
  assert,
} from '../../util/baseUtil';
// import arrayUtil from '../../util/arrayUtil';
import {
  businessCodeHandler,
  specialHandler,
} from './handlers';

// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const env = process.env.NODE_ENV;
const methods = ['put', 'delete'];
const axiosConfig = {
  withCredentials: true,
  baseURL: env === 'production' ? '' : '',
  // timeout: 10000,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' }),
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

class Ajax {
  /**
   *
   * @param {Object} options
   * @property {Object} options.body
   * @property {Object} options.errorHandler
   * @property {Object} options.headers
   * @property {Object} options.max
   */
  constructor(options = {}) {
    this.errorHandler = options.errorHandler; // 异常处理
    this.intercept = options.intercept || (() => { }); // 拦截返回数据

    merge(axiosConfig, options.default);
    this.axios = axios.create(axiosConfig);
  }
  /**
   * 类似promis.all
   */
  all(requests = [], callback) {
    if (!isArray(requests)) {
      return;
    }
    axios.all(requests)
      .then(axios.spread((acc, pres) => callback(acc, pres)));
  }

  static create(...args) {
    const instance = new Ajax(...args);

    instance.axios.interceptors.response.use((response) => {
      // 对响应数据做点什么
      const data = response.data;
      assert(typeof data === 'object', 'res返回格式不正确');
      assert(!!data.data && !!data.error_code && !!data.msg, 'res返回格式不正确');

      businessCodeHandler(data.code);
      // specialHandler(data);
      return response.data;
    }, (error) => {
      // 对响应错误做点什么
      console.log('i m error', error);
      return Promise.reject(error);
    });

    return instance;
  }
  post({ url, param }) {
    const config = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(param),
      url,
    };
    return axios(config);
  }
  form({ url, param }) {
    const form = new FormData();
    const keys = Object.keys(param);
    keys.forEach((key) => {
      if (isArray(param[key])) {
        each(param[key], (val) => {
          form.append(`${key}[]`, encodeURIComponent(val));
        });
      } else {
        form.append(key, param[key]);
      }
    });
    const config = {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data' },
      data: form,
      url,
    };
    return axios(config)
      .then((res) => {
        if (res.status === 200) {
          return res.data;
        }
      });
  }
}
const PPCDataHandler = (data, dataHandler) => { // 数据处理层
  if (data && typeof dataHandler === 'function') {
    dataHandler(data);
  }
};
each(methods, (method) => {
  Ajax.prototype[method] = function ajaxMethod({ url, param }) {
    const dataHandler = param.dataHandler;
    return this.axios[method](url, param).then(data => PPCDataHandler(data, dataHandler))
      .catch((e) => {
        console.error(e);
      });
  };
});
each(apiList, (url, name) => {
  Ajax.prototype[name] = function ajaxUrl(options) {
    let param = {};
    let success = function success(data) {
      return data;
    };
    let dataHandler = () => {};
    if (options) {
      success = options.success || success;
      param = options.param;
    }
    dataHandler = (data) => {
      if (specialHandler[url]) {
        specialHandler[url](data);
      }
      success(data);
    };
    return this.axios.post(url, qs.stringify(param))
      .then(data => PPCDataHandler(data, dataHandler))
      .catch((e) => {
        console.error(e);
      });
  };
});
export default Ajax.create();
