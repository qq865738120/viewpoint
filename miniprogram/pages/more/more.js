/**
 * 活动视频列表页
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
import {
  PremitionError
} from '../../common/enum.js';

const app = getApp()
const sysInfo = wx.getSystemInfoSync();

const connect = mapToData((state) => ({
  isInit: state.common.isInit,
  currentActivity: state.common.currentActivity,
  enterType: state.common.enterType,
  pageSize: state.common.pageSize,
  videoListRes: state.common.videoListRes,
  apiError: state.common.apiError,
  isAuthorization: state.common.isAuthorization,
}))

let activityId = "";

let currentPage = 1;
let searchVal = "";

Page(connect({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    listHeight: px2Rpx(sysInfo.windowHeight) - 5 + "rpx",
    PremitionError: PremitionError
  },

  onVideoTap(e) {
    commonStore.changeCurrentVideo(e.currentTarget.dataset.video);
    wx.navigateTo({
      url: '/pages/room/room'
    })
  },

  onModalButtonTap(e) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  async onSearch(e) {
    searchVal = e.detail.detail.value;
    await commonStore.refechVideoList({
      activityId: activityId ? activityId : getIn(this.data.currentActivity, ["id"], 0),
      enterType: this.data.enterType,
      size: this.data.pageSize,
      current: currentPage,
      condition: e.detail.detail.value
    })
  },

  async onclean() {
    searchVal = "";
    currentPage = 1;
    await commonStore.refechVideoList({
      activityId: activityId ? activityId : getIn(this.data.currentActivity, ["id"], 0),
      enterType: this.data.enterType,
      size: this.data.pageSize,
      current: currentPage,
      condition: searchVal
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      activityId = scene;
      console.log("activityId", activityId)
    }

    currentPage = 1;
    if (this.data.currentActivity) {
      wx.setNavigationBarTitle({
        title: getIn(this.data.currentActivity, ["name"], "-"),
      })
    }

    const timer = setInterval(async () => {
      if (this.data.isInit) {
        clearInterval(timer);
        commonStore.refechVideoList({
          activityId: activityId ? activityId : getIn(this.data.currentActivity, ["id"], 0),
          enterType: this.data.enterType,
          size: this.data.pageSize,
          current: currentPage,
          condition: searchVal
        });
        if (this.data.enterType === 1) { // 扫码进来
          await commonStore.refechActivityInfo({
            activityId: activityId ? activityId : getIn(this.data.currentActivity, ["id"], 0),
            enterType: this.data.enterType
          })
          wx.setNavigationBarTitle({
            title: getIn(this.data.currentActivity, ["name"], ""),
          })
          commonStore.changeEnterType(0);
        }
      }
    }, 100);
  },

  onShow() {
    
  },

  async scrollToLower() {
    if (this.data.videoListRes.canLoad) {
      currentPage = currentPage + 1;
      this.setData({
        isLoading: true
      });
      await commonStore.refechVideoList({
        activityId: activityId ? activityId : getIn(this.data.currentActivity, ["id"], 0),
        enterType: this.data.enterType,
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