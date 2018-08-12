import { each } from '../../util/baseUtil';
import base64 from '../../util/base64';

const storage = {};
const saver = (storager, key, data) => {
  let dataStr = (typeof data === 'object') ? JSON.stringify(data) : data.toString();
  dataStr = base64.encode(dataStr);
  storager.setItem(key, dataStr);
};
const reader = (storager, key) => {
  const item = storager.getItem(key);
  let result = null;
  let encodeItem = null;
  if (item) {
    encodeItem = base64.decode(item);
    try {
      result = JSON.parse(encodeItem);
    } catch (e) {
      result = encodeItem;
    }
  }
  return result;
};
const remove = (storager, key) => storager.removeItem(key);

storage.application = {};
storage.application.save = (key, data) => saver(localStorage, key, data);
storage.application.read = key => reader(localStorage, key);
storage.application.remove = key => remove(localStorage, key);

storage.session = {};
storage.session.save = (key, data) => saver(sessionStorage, key, data);
storage.session.read = key => reader(sessionStorage, key);
storage.session.remove = key => remove(sessionStorage, key);
storage.read = (key) => {
  const st = [localStorage, sessionStorage];
  let result = null;
  each(st, (s) => {
    const r = reader(s, key);
    if (typeof r !== 'undefined' && r !== null) {
      result = r;
    }
  });
  return result;
};
storage.clear = (key) => {
  const st = [localStorage, sessionStorage];
  each(st, (s) => {
    s.removeItem(key);
  });
};
export default storage;
