//app.js
import regeneratorRuntime from 'regenerator-runtime' // async/await支持
import wxPro from '/lib/wxPromise.js'
import commonStore from '/stores/index.js';
import {
  PremitionError
} from '/common/enum.js';
import axios from 'axios'
import mpAdapter from 'axios-miniprogram-adapter'
axios.defaults.adapter = mpAdapter
let $axios = axios.create({
  // baseURL: 'http://api.pintu360.net.cn:39001/mock/28',
  baseURL: 'https://fvcms.iotnc.cn',
  timeout: 10000,
  headers: { 
    "Content-Type": "application/json",
    "APPID": "wx7f2178d6fb62eef4"
  }
});

App({
  async onLaunch (options) {
    this.$axios = $axios;
    this.wxPro = wxPro;
    this.globalData = {}

    $axios.interceptors.response.use(function (response) {
      // 对响应数据做点什么
      if (response.data.code === 1) {
        commonStore.changeApiError({ errorCode: response.data.errorCode, errorDesc: response.data.errorDesc })
        if (!(response.data.errorCode === PremitionError.NO_ACTIVE_PREMITION_1 || response.data.errorCode === PremitionError.NO_ACTIVE_PREMITION_2)) {
          wx.showToast({
            title: '服务君出错啦！',
            icon: 'none',
            duration: 2000
          })
        }
      }
      return response.data.data;
    }, function (error) {
      // 对响应错误做点什么
      wx.showToast({
        title: '服务君出错啦！',
        icon: 'none',
        duration: 2000
      })
      return Promise.reject(error);
    });
    
    wx.cloud.init({
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
      //   如不填则使用默认环境（第一个创建的环境）
      env: 'free-viewpoint-cloud-rmnlv',
      traceUser: true,
    })

    wx.showNavigationBarLoading()
    const res =  await wx.cloud.callFunction({name: 'userInfo'})
    $axios.interceptors.request.use(function (config) {
      // 在发送请求之前做些什么
      config.data = {
        openid: res.result.openid,
        ...config.data
      }
      return config;
    }, function (error) {
      // 对请求错误做些什么
      return Promise.reject(error);
    });
    this.globalData.openid = res.result.openid;
    $axios.defaults.headers.common['OPENID'] = res.result.openid;
    try {
      await commonStore.init($axios, options);
    } catch (e) {
      console.log(e);
    }
    commonStore.changeIsInit(true);
    wx.hideNavigationBarLoading()
  }
})
