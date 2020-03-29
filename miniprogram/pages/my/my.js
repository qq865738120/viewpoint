/**
 * 我的页
 */
import regeneratorRuntime from 'regenerator-runtime'

const { wxPro } = getApp()

import WxTouchEvent from "wx-touch-event";

let infoListTouchEvent = new WxTouchEvent();

Page({
  data: {
  },

  async onLoad() {
    // try {
      const scope = await wxPro.authorize({ scope: "scope.userInfo" })
      console.log("scope", scope)
    const info = await wxPro.getUserInfo();
      console.log(info);
    // } catch {
    //   console.log("e");
    // }
    
  },

  onFavoriteTap() {
    wx.navigateTo({
      url: '/pages/favorite/favorite',
    })
  }

})
