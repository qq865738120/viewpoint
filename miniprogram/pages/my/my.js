//index.js
import regeneratorRuntime from 'regenerator-runtime'

const app = getApp()

import WxTouchEvent from "wx-touch-event";

let infoListTouchEvent = new WxTouchEvent();

Page({
  data: {
  },

  async onLoad() {
    const res = await app.axios.post("mock/28/fvcms/mini/activity/list");
    console.log(res);

    this.infoListTouchEvent = infoListTouchEvent;
    this.infoListTouchEvent.bind({//初始化后绑定事件
      swipe: function (e) {
        console.log("滑动");
      },
      rotate: function (e) {
        console.log("旋转", e)
      }.bind(this),
      pinch: function (e) {
        // console.log("捏");
      }

    })
    
  },

  touchStart: infoListTouchEvent.start.bind(infoListTouchEvent),
  touchMove: infoListTouchEvent.move.bind(infoListTouchEvent),
  touchEnd: infoListTouchEvent.end.bind(infoListTouchEvent),
  touchCancel: infoListTouchEvent.cancel.bind(infoListTouchEvent),

})
