// components/authorize_popup/authorize_popup.js
import commonStore from '../../stores/common.js';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: false,
      observer: function (newVal) {
        this.setData({ mIsShow: newVal })
      }
    },
    // isShow: {
    //   type: String,
    //   value: "getUserInfo",
    // },
  },

  /**
   * 组件的初始数据
   */
  data: {
    mIsShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo(res) {
      if (res.detail.errMsg === "getUserInfo:ok") {
        commonStore.changeUserInfo(res.detail.userInfo);
        this.setData({ mIsShow: false })
      }
    }
  }
})
