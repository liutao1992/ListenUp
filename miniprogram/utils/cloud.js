import WxLogger from "./logger";

export default class WxCloud {
  static timeout = 5000;
  static throwError = false;

  static setConfig(config = {}) {
    this.timeout = config.timeout ?? this.timeout;
    this.throwError = config.throwError ?? this.throwError;
  }

  static async request({
    name,
    data = {},
    throwError = WxCloud.throwError
  } = {}) {
    if (!name) {
      throw new Error('云函数名称不能为空');
    }
    
    WxLogger.info(`开始调用云函数: ${name}`, data);
    
    try {
      const result = await Promise.race([
        this._callFunction(name, data),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), this.timeout);
        })
      ]);
      
      WxLogger.info(`云函数调用成功: ${name}`, result);
      return result !== undefined ? result : {};
    } catch (error) {
      WxLogger.error(`云函数调用失败: ${name}`, error);
      if (throwError) {
        throw error;
      }
      const formattedError = this._formatError(error);
      this.showError(formattedError.code, formattedError);
      return null;
    }
  }

  static async _callFunction(name, data) {
    try {
      const { result } = await wx.cloud.callFunction({
        name,
        data
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static _formatError(error) {
    if (!error.errMsg || !error.errMsg.includes('cloud.callFunction:fail')) {
      return {
        code: error.errCode || -1,
        message: error.message || error.errMsg || '未知错误',
        originalError: error
      };
    }

    const message = this._extractErrorMessage(error.errMsg);

    return {
      code: error.errCode || -1,
      message,
      originalError: error
    };
  }

  static _extractErrorMessage(errMsg) {
    const errorMatches = Array.from(errMsg.matchAll(/Error:\s*([^|\n]+)/g));
    
    if (errorMatches.length > 0) {
      return errorMatches[errorMatches.length - 1][1].trim();
    }

    const errMsgMatch = errMsg.match(/errMsg:\s*([^|\n]+)/);
    if (errMsgMatch) {
      return errMsgMatch[1].trim();
    }

    return '系统错误';
  }

  static showError(errorCode, serverError) {
    WxLogger.error(`error: ${errorCode}, serverError:${serverError}`)
    const tip = serverError.message || '未知错误';
    wx.showToast({
      icon: 'none',
      title: tip,
      duration: 3000
    });
  }
}
