/**
 * 收藏列表页
 */
import regeneratorRuntime from 'regenerator-runtime'
import {
  mapToData
} from 'minii'
import commonStore from '../../stores/common.js';
import {
  px2Rpx,
  getIn
} from '../../common/tools.js';

const app = getApp()
const sysInfo = wx.getSystemInfoSync();

const connect = mapToData((state) => ({
  isInit: state.common.isInit,
  pageSize: state.common.pageSize,
  videoStarListRes: state.common.videoStarListRes
}))

let currentPage = 1;
let searchVal = "";

Page(connect({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    listHeight: px2Rpx(sysInfo.windowHeight) - 5 + "rpx",
  },

  async onStarTap(e) {
    currentPage = 1;
    await commonStore.refechDoVideoUnstar({
      videoId: e.currentTarget.dataset.id
    });
    await commonStore.refechVideoStarList({
      size: this.data.pageSize,
      current: currentPage,
      condition: e.detail.detail.value
    })
  },

  async onSearch(e) {
    searchVal = e.detail.detail.value;
    await commonStore.refechVideoStarList({
      size: this.data.pageSize,
      current: currentPage,
      condition: e.detail.detail.value
    })
  },

  async onclean() {
    searchVal = "";
    currentPage = 1;
    await commonStore.refechVideoStarList({
      size: this.data.pageSize,
      current: currentPage,
      condition: searchVal
    });
  },

  onVideoTap(e) {
    commonStore.changeCurrentVideo(e.currentTarget.dataset.video);
    wx.navigateTo({
      url: '/pages/room/room'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow() {
    currentPage = 1;
    wx.setNavigationBarTitle({
      title: "我的收藏",
    })

    commonStore.refechVideoStarList({
      size: this.data.pageSize,
      current: currentPage,
      condition: searchVal
    });
  },

  async scrollToLower() {
    if (this.data.videoListRes.canLoad) {
      currentPage = currentPage + 1;
      this.setData({
        isLoading: true
      });
      await commonStore.refechVideoStarList({
        size: this.data.pageSize,
        current: currentPage,
        condition: searchVal
      });
      this.setData({
        isLoading: false
      });
    }
  }
}))