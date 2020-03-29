import regeneratorRuntime from 'regenerator-runtime'
const qs = require('qs');

class Request {
  constructor(axios) {
    this.$axios = axios || (getApp() && getApp().$axios)
  }

  /**
   * 提交用户信息
   */
  postUserInfo = async params => {
    return await this.$axios.post("/mini/user/info_collection", params);
  }

  /**
   * 获取活动列表
   */
  getActivityList = async params => {
    return await this.$axios.post("/mini/activity/list", params)
  }

  /**
   * 获取视频列表
   */
  getVideoList = async params => {
    return await this.$axios.post("/mini/video/list", params);
  }

  /**
   * 获取视频收藏列表
   */
  getVideoStarList = async params => {
    return await this.$axios.post("/mini/video/star_list", params);
  }

  /**
   * 视频观看统计
   */
  doVideoOpen = async params => {
    return await this.$axios.post("/mini/video/op_add", params);
  }

  /**
   * 视频收藏
   */
  doVideoStar = async params => {
    return await this.$axios.post("/mini/video/star", params);
  }

  /**
   * 视频取消收藏
   */
  doVideoUnstar = async params => {
    return await this.$axios.post("/mini/video/unstar", params);
  }

  /**
   * 获取视频详情
   */
  getVideoInfo = async params => {
    return await this.$axios.post("/mini/video/info", params);
  }

  /**
   * 获取房间
   */
  // getVideoRoom = async params => {
  //   return await this.$axios.post("/mini/video/roomid", params);
  // }

  /**
   * 获取usersig
   */
  getUserSig = async params => {
    return await this.$axios.post("/mini/user/gen_usersig", params);
  }

  /**
   * 获取活动详情
   */
  getActivityInfo = async params => {
    return await this.$axios.post("/mini/activity/info", params);
  }
}

export default Request;