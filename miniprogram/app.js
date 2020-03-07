//app.js
import axios from 'axios'
import mpAdapter from 'axios-miniprogram-adapter'
axios.defaults.adapter = mpAdapter
import regeneratorRuntime from 'regenerator-runtime' // async/await支持
import wxPro from '/lib/wxPromise.js'

var instance = axios.create({
  baseURL: 'http://api.pintu360.net.cn:39001/',
  timeout: 1000,
  headers: { "content-type": "application/json" }
});

App({
  async onLaunch () {

    this.axios = instance;
    this.globalData = {}
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'free-viewpoint-cloud-rmnlv',
        traceUser: true,
      })
      wx.cloud.callFunction({
        name: 'userInfo',
        data: {},
        success: res => {
          console.log('[云函数] [login] user openid: ', res.result.openid)
          this.globalData.openid = res.result.openid
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    }

    instance.interceptors.response.use(function (response) {
      // 对响应数据做点什么
      return response.data;
    }, function (error) {
      // 对响应错误做点什么
      return Promise.reject(error);
    });

    // const result = await wxPro.login();
    // console.log(result);
    // const res = await this.axios.post("mock/28/fvcms/mini/activity/list");
    // console.log(res);
  }
})
