import {
  observe
} from 'minii'
import Request from "../common/request.js";
import {
  getIn,
  isEmptyObj
} from "../common/tools.js";

/**
 * 全局状态管理
 */
class CommonStore {
  constructor() {

  }

  async init(axios, options) {
    console.log("options", options)
    const {
      scene,
      path
    } = options;
    this.request = new Request(axios)
    this.userInfo = {};
    this.isInit = false; // 是否初始化完成
    this.isAuthorization = false; // 是否已授权
    this.orderField = "degree"; // activity排序、degree为最热、update_time为最新
    this.activityListRes = {}; // activity列表
    this.activityType = {
      type: -1,
      permissionType: 0
    }; // activity筛选类型
    this.currentActivity = {}; // 当前活动
    this.currentVideo = {}; // 当前视频
    this.videoListRes = {}; // video列表
    this.videoStarListRes = {}; // video收藏列表
    this.usersig = ""; // 用户进入视频房间的凭证
    this.enterType = (scene === 1011 || scene === 1012 || scene === 1013 || scene === 1007) ? 1 : 0; // 进入类型：0-非扫码，1-扫码
    this.enterPath = path // 扫码进入的页面
    this.pageSize = 20; // 页面大小
    this.apiError = { errorCode: null, errorDesc: null } // 接口错误信息

    wx.getSetting({
      success: (setting) => {
        if (setting.authSetting['scope.userInfo']) {
          this.isAuthorization = true;
        } else {
          this.isAuthorization = false;
        }
      },
      complete: async() => {
        await Promise.all([this.refechUserInfo(), this.refectUsersig()])
        this.refechActivityList({
          orderField: this.orderField
        })
      }
    });
  }


  changeApiError(apiError) {
    this.apiError = {...apiError};
  }

  async warpData(dataKey, refech, refechParams, isNotShowLoading) {
    if (isNotShowLoading) {
      const res = await refech(refechParams);
      this[dataKey] = {
        isLoading: false,
        ...res
      }
    } else {
      const data = {
        isLoading: false,
        ...this[dataKey]
      };
      if (this[dataKey]) {
        this[dataKey].isLoading = true;
      }
      const res = await refech(refechParams);
      this[dataKey] = {
        isLoading: false,
        ...res
      }
    }
  }

  changeEnterType(enterType) {
    this.enterType = enterType;
  }

  changeCurrentVideo(currentVideo) {
    this.currentVideo = { ...currentVideo
    };
  }

  changeCurrentActivity(currentActivity) {
    this.currentActivity = { ...currentActivity
    }
  }

  changeActivityType(activityType) {
    this.activityType = { ...activityType
    };
  }

  changeOrderField(orderField) {
    this.orderField = orderField
  }

  async postUserInfo(params) {
    await this.request.postUserInfo(params);
  }

  changeUserInfo(userInfo) {
    this.userInfo = { ...userInfo
    }
  }

  async refechUserInfo() {
    wx.getUserInfo({
      success: async res => {
        console.log("用户信息：", res)
        this.changeUserInfo(res.userInfo);
        this.changeIsAuthorization(true);
        await this.postUserInfo({
          nickname: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl
        })
      },
      fail: async err => {
        console.log("获取userInfo失败", err)
        wx.getSetting({
          success: (setting) => {
            if (setting.authSetting['scope.userInfo']) {
              this.isAuthorization = true;
            } else {
              this.isAuthorization = false;
            }
            this.refechUserInfo();
          }
        });
      }
    });
  }

  changeIsInit(isInit) {
    this.isInit = isInit;
  }

  changeIsAuthorization(isAuthorization) {
    this.isAuthorization = isAuthorization;
  }

  refechAuthorization() {
    wx.getSetting({
      success: (setting) => {
        if (setting.authSetting['scope.userInfo']) {
          this.isAuthorization = true;
        } else {
          this.isAuthorization = false;
        }
      }
    });
  }

  changeActivityList(activityList) {
    this.activityListRes = { ...activityList
    }
  }

  /**
   * 获取活动列表，并且改变状态
   */
  async refechActivityList(params, isNotShowLoading) {
    const current = getIn(params, ["current"], 1);
    if (current === 1) {
      await this.warpData("activityListRes", this.request.getActivityList, params);
    } else if (!isEmptyObj(this.activityListRes)) {
      const res = await this.request.getActivityList(params);
      this.activityListRes.records.push.apply((this.activityListRes.records || []), res.records);
    }
    if ((this.activityListRes.records || []).length >= this.activityListRes.total) {
      this.activityListRes.canLoad = false;
    } else {
      this.activityListRes.canLoad = true;
    }
  }

  async refechVideoList(params) {
    const current = getIn(params, ["current"], 1);
    if (current === 1) {
      await this.warpData("videoListRes", this.request.getVideoList, params);
    } else if (!isEmptyObj(this.videoListRes)) {
      const res = await this.request.getVideoList(params);
      this.videoListRes.records.push.apply((this.videoListRes.records || []), res.records);
    }
    if ((this.videoListRes.records || []).length >= this.videoListRes.total) {
      this.videoListRes.canLoad = false;
    } else {
      this.videoListRes.canLoad = true;
    }
  }

  async refechVideoStarList(params) {
    const current = getIn(params, ["current"], 1);
    if (current === 1) {
      await this.warpData("videoStarListRes", this.request.getVideoStarList, params);
    } else if (!isEmptyObj(this.videoStarListRes)) {
      const res = await this.request.getVideoStarList(params);
      this.videoStarListRes.records.push.apply((this.videoStarListRes.records || []), res.records);
    }
    if ((this.videoStarListRes.records || []).length >= this.videoStarListRes.total) {
      this.videoStarListRes.canLoad = false;
    } else {
      this.videoStarListRes.canLoad = true;
    }
  }

  /**
   * 视频取消收藏
   */
  async refechDoVideoUnstar(params) {
    await this.request.doVideoUnstar(params);
  }

  async refectUsersig(params) {
    const res = await this.request.getUserSig(params);
    this.usersig = getIn(res, ["usersig"], "")
  }

  /**
   * 获取活动详情并更新状态
   */
  async refechActivityInfo(params) {
    const res = await this.request.getActivityInfo(params);
    this.changeCurrentActivity(res)
  }

  /**
   * 获取视频/活动详情并更新仓库
   */
  async refechVideoInfo(params) {
    const res = await this.request.getVideoInfo(params);
    console.log("res", res)
    this.changeCurrentActivity(res.activity);
    this.changeCurrentVideo(res.video);
  }

  async refechDoVideoOpen(params) {
    await this.request.doVideoOpen(params)
  }

  /**
   * 视频收藏
   */
  async refectDoVideoStar(params) {
    return await this.request.doVideoStar(params);
  }
}

export default observe(new CommonStore(), 'common')