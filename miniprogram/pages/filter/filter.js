/**
 * 类型选择页
 */
import {
  mapToData
} from 'minii'
import commonStore from '../../stores/common.js';
import { px2Rpx } from '../../common/tools.js';
const sysInfo = wx.getSystemInfoSync();

const connect = mapToData((state) => ({
  activityType: state.common.activityType,
  activityListRes: state.common.activityListRes
}))


Page(connect({

  /**
   * 页面的初始数据
   */
  data: {
    contentHeight: px2Rpx(sysInfo.windowHeight) - 220 + "rpx",
    videoList: [
      { id: "-1", text: "全部" },
      { id: "0", text: "体育" },
      { id: "1", text: "舞蹈" },
      { id: "2", text: "展会" },
      { id: "3", text: "景点" },
      { id: "4", text: "极限" },
      { id: "99", text: "其他" }
    ],
    typeList: [
      { id: "0", text: "共有" },
      { id: "1", text: "私有" }
    ]
  },

  async onSaveTap() {
    await commonStore.refechActivityList(this.data.activityType);
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  onVideoTap(e) {
    commonStore.changeActivityType({
      ...this.data.activityType,
      type: Number(e.detail.id)
    });
  },

  onPramTap(e) {
    commonStore.changeActivityType({
      ...this.data.activityType,
      permissionType: Number(e.detail.id)
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
}))