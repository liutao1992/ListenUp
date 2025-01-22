export default {
  // 日志级别
  levels: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },

  // 当前日志级别
  level: 1,

  // 设置日志级别
  setLevel(level) {
    this.level = level;
  },

  // 调试日志
  debug(message, ...args) {
    if (this.level <= this.levels.DEBUG) {
      console.debug('[DEBUG]', message, ...args);
    }
  },

  // 信息日志
  info(message, ...args) {
    if (this.level <= this.levels.INFO) {
      console.info('[INFO]', message, ...args);
    }
  },

  // 警告日志
  warn(message, ...args) {
    if (this.level <= this.levels.WARN) {
      console.warn('[WARN]', message, ...args);
    }
  },

  // 错误日志
  error(message, ...args) {
    if (this.level <= this.levels.ERROR) {
      console.error('[ERROR]', message, ...args);
      
      // 上报错误日志到服务器
      wx.request({
        url: 'https://api.example.com/logs/error',
        method: 'POST',
        data: {
          message,
          stack: new Error().stack,
          timestamp: Date.now()
        }
      });
    }
  }
}
