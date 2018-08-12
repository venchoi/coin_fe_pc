import {
  baseUtil,
} from '../../util/baseUtil';
import EasyWebSocket from '../../lib/ws/EasyWebSocket';
import Event from '../../lib/Event';

const quotationsAdress = 'ws:/push.popcoin.live:9988';
const columnAdress = 'ws:/push.popcoin.live:9989';
const quotations = new EasyWebSocket(quotationsAdress);
const column = new EasyWebSocket(columnAdress);

const CMD = {
  INDEX: 201, // 快照
};

const EVENT = {
  INDEX: 801, // 快照
};

const extraParam = {};
/**
 * 将服务代码和后台需要的附加信息组合为发送请求时数据格式
 * @param type - 服务CM代码
 * @param code - 附加信息，后台提供
 * @returns {{}} - 返回发送请求的数据格式
 */
const sender = (type, code) => {
  const msg = {
    ...extraParam,
  };
  if (type) {
    msg.cmd = type;
  }
  if (code) {
    msg.cmdData = code;
  }
  return msg;
};
/**
 * PopWebSocket 类
 * 基类： Event
 * 提供方法： init():初始化。
 * subscribe():订阅函数；将请求添加到订阅队列，并建立webSocket连接。
 * unSubscribe():取消订阅；从订阅队列中删除请求，停止连接。
 * resubscribe():重新订阅；为订阅队列中所有请求建立连接。
 */
class PopWebSocket extends Event {
  constructor() {
    super();
    this.subscriptionList = {};
    this.init();
  }

  init() {
    quotations.on('message', (data) => {
      this.messageHandler(data);
    });
    quotations.on('error', () => this.resubscribe());
  }

  closeWs() {
    quotations.close();
    return this;
  }

  multiSubscribe(type, codes) {
    baseUtil.each(codes, (code) => {
      this.subscribe(code, type);
    });
  }

  subscribe(code, cmdType = 'base') {
    let cmd;

    if (cmdType === 'index') {
      cmd = CMD.INDEX;
    } else if (cmdType === 'base') {
      cmd = CMD.STOCK;
    } else if (cmdType === 'deal') {
      cmd = CMD.DEAL;
    }

    if (!this.subscriptionList[code]) {
      this.subscriptionList[code] = [];
    }
    if (this.subscriptionList[code].indexOf(cmd) < 0) {
      this.subscriptionList[code].push(cmd);
      quotations.send(sender(cmd, code));
    }
  }
  unSubscribe(code, cmdType = 'base') {
    if (!code) {
      return this;
    }
    const cmdList = this.subscriptionList[code];
    let cancelCode;
    let cancelCMDIndex;

    if (!cmdList) {
      return this;
    }
    if (cmdType === 'index') {
      cancelCode = CMD.CANCEL_INDEX;
    } else if (cmdType === 'base') {
      cancelCode = CMD.CANCEL_STOCK;
    } else if (cmdType === 'deal') {
      cancelCode = CMD.CANCEL_DEAL;
    }
    baseUtil.each(cmdList, (cmd, key) => {
      let cmdFri;
      let cancelFri;
      if (typeof cmd === 'number') {
        cmdFri = cmd.toString().charAt(0);
      } else if (typeof cmd === 'string') {
        cmdFri = cmd.charAt(0);
      }
      if (typeof cmd === 'number') {
        cancelFri = cancelCode.toString().charAt(0);
      } else if (typeof cmd === 'string') {
        cancelFri = cancelCode.charAt(0);
      }
      if (cmdFri === cancelFri) {
        quotations.send(sender(cancelCode, code));
        cancelCMDIndex = key;
      }
    });
    if (typeof cancelCMDIndex === 'number') { // bug fix
      cmdList.splice(cancelCMDIndex, 1);
    }
    return this;
  }

  resubscribe() {
    baseUtil.each(this.subscriptionList, (cmdList, code) => {
      baseUtil.each(cmdList, (cmd) => {
        quotations.send(sender(cmd, code));
      });
    });
  }

  clear() {
    quotations.reconnect();
    return this;
  }
  messageHandler(data) {
    const trigger = (strData) => {
      let handlerData;
      const type = strData.cmd;
      try {
        handlerData = JSON.parse(strData.cmdData);
      } catch (error) {
        handlerData = strData.cmdData;
      }
      this.trigger(type, handlerData);
    };

    if (baseUtil.isArray(data)) {
      const cmdType = data[0].cmd;
      switch (cmdType) {
        case EVENT.DEAL:
          baseUtil.each(data, d => trigger(d));
          break;
        case EVENT.ENTRUST_QUEUE: {
          let buy;
          let sell;
          const regBuy = /"Side":66/;
          const regSell = /"Side":65/;
          baseUtil.each(data, (d) => {
            if (regBuy.test(d.cmdData)) {
              buy = d;
            }
            if (regSell.test(d.cmdData)) {
              sell = d;
            }
          });
          trigger(buy);
          trigger(sell);
          break;
        }
        default: {
          const indexData = baseUtil.getLast(data);
          trigger(indexData);
          break;
        }
      }
    } else {
      trigger(data);
    }
  }
}
/**
 * ColumnSocket 类
 * 基类： Event
 * 为相应服务推送建立连接。
 */
class ColumnSocket extends Event {
  constructor() {
    super();
    return this;
  }
  closeWs() {
    column.close();
    return this;
  }
}

export {
  CMD,
  EVENT,
};
export const extra = obj => baseUtil.merge(extraParam, obj, true); // 添加额外传参数
export const PopSocket = quotations ? new PopWebSocket() : quotations;
export const columnSocket = new ColumnSocket();
