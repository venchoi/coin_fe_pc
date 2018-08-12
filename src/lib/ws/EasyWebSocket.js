import {
  baseUtil,
} from '../../util/baseUtil';
import { logger } from '../logger/Logger';
import Event from '../Event';

let errorCount = -1;

class EasyWebSocket extends Event {
  constructor(adress) {
    super();
    this.adress = adress;
    this.wsInstance = null;
    this.pinger = null;
    return this;
  }

  connect(adress) {
    this.wsInstance = new WebSocket(adress);
    /**
     * onopen 当网络连接建立时触发该事件
     * 每隔三十秒向服务器发送ping命令，保持连接
     */
    this.wsInstance.onopen = () => {
      const ping = 'ping';
      this.trigger('open');

      this.pinger = setInterval(() => {
        this.send(ping);
      }, 30000);
    };
    this.wsInstance.onmessage = (e) => {
      const res = JSON.parse(e.data);
      this.trigger('message', res);
    };
    this.wsInstance.onerror = () => {
      clearInterval(this.pinger);
      this.trigger('error');

      setTimeout(() => {
        this.connect(this.adress);
        errorCount += 1;
      }, 5000 + (5000 * errorCount));
    };
    this.wsInstance.onclose = () => {
      clearInterval(this.pinger);
      this.trigger('close');
    };
  }

  send(param) {
    if (!this.wsInstance) {
      this.connect(this.adress);
    }
    const wsInstance = this.wsInstance;
    const send = () => {
      if (baseUtil.isObject(param)) {
        wsInstance.send(JSON.stringify(param));
      } else {
        wsInstance.send(param);
      }
    };
    /**
     * readyState值为0时表示websocket正尝试与服务器建立连接
     * 发送open命令，打开连接
     * readyState值为1时表示websocket与服务器已经建立连接
     * 向服务器发送数据
     */
    if (wsInstance.readyState === 0) {
      this.once('open', send);
    } else if (wsInstance.readyState === 1) {
      send();
    }
  }

  close() {
    const wsInstance = this.wsInstance;
    if (wsInstance && wsInstance.readyState === 1) {
      this.once('close', () => logger.log('ws has close'));
      wsInstance.close();
    }
  }

  reconnect() {
    this.close();
    this.connect();
  }

}

export default WebSocket ? EasyWebSocket : false;
