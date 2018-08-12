class Logger {
  constructor() {
    this.env = process.env.NODE_ENV;
  }

  log(msg) {
    if (this.isDev()) {
      console.log(msg);
    }
  }

  error(error, isPush) {
    let msg;
    if (error instanceof Error) {
      msg = error.message;
    } else if (typeof error === 'string') {
      msg = error;
    }
    if (this.isDev()) {
      console.error(msg);
    } else if (this.isPro() && isPush) {
      console.log('there is a error occurred, you can find the log in the fe-erp server');
    }
  }

  tryCatch(fn, catchFn) {
    try {
      fn();
    } catch (e) {
      catchFn(e);
      this.errorHandler(e);
    }
  }

  errorHandler(e) { // 错误处理
    if (this.isDev()) {
      this.error(e, false);
    } else {
      // todo push to server
      this.error(e, true);
    }
  }

  isDev() {
    return this.env === 'development';
  }

  isPro() {
    return this.env === 'production';
  }
}

export default new Logger();
