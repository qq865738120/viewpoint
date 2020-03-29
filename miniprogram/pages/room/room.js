/**
 * 视频详情页
 */
import LastMayday from "./img.js"
import {
  genTestUserSig
} from '../../common/GenerateTestUserSig.js'
import {
  mapToData
} from 'minii'
import {
  px2Rpx,
  getIn,
  isNull,
  isEmptyObj
} from '../../common/tools.js';
import commonStore from '../../stores/common.js';
import {
  PremitionError
} from '../../common/enum.js';

const connect = mapToData((state) => ({
  isInit: state.common.isInit,
  enterType: state.common.enterType,
  enterPath: state.common.enterPath,
  userInfo: state.common.userInfo,
  usersig: state.common.usersig,
  currentVideo: state.common.currentVideo,
  apiError: state.common.apiError,
  isAuthorization: state.common.isAuthorization,
}))

const sysInfo = wx.getSystemInfoSync();

let videoId = "";
let shareImagePath = null;
let socketOpen = false
let socketMsgQueue = []
let socketTask;
let timer1;
let timer2;

let videoDetail; // 远端视频推送信息
let orientation = "vertical"; // 手机方向

const ORIENTATION_TYPE = {
  VERTICAL: "vertical",
  HORIZONTAL: "horizontal"
}
const OP_TYPE = {
  PLAY: 3,
  DOWNLOAD: 4,
  SHARE: 5
};
const EVENT_TYPE = {
  LEFT: 0,
  RIGHT: 1,
  ZOOM: 2,
  REDUCE: 3,
  PLAY: 4,
  STOP: 5
}

Page(connect({

  /**
   * 页面的初始数据
   */
  data: {
    trtcConfig: {
      sdkAppID: '1400323883', // 开通实时音视频服务创建应用后分配的 SDKAppID
      userID: "", // 用户 ID，可以由您的帐号系统指定
      userSig: "", // 身份签名，相当于登录密码的作用
      template: '1v1', // 画面排版模式
      scene: "rtc",
      audioVolumeType: "media",
      enableCamera: true,
      enableMic: false,
      enableAns: true,
      enableAgc: true,
      enableIM: false,
      debugMode: true
    },
    isShowBar: true,
    downloadText: "保存",
    isShowDialog: false,
    isShowShare: false,
    imgData: null,
    isStop: false,
    statusBarHeight: px2Rpx(sysInfo.statusBarHeight) + "rpx",
    PremitionError: PremitionError
  },

  onModalButtonTap(e) {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  onPinch(e) {
    if (this.data.isStop) {
      return;
    }

    const {
      scale
    } = e.detail;
    console.log("捏", scale);
    const msg = {
      type: scale > 1 ? EVENT_TYPE.REDUCE : EVENT_TYPE.ZOOM,
      percent: parseInt((scale > 1 ? scale - 0.5 : scale) * 2),
      roomID: getIn(this.data.currentVideo, ["roomID"])
    };
    console.log("wss message", JSON.stringify(msg))
    this.sendSocketMessage(JSON.stringify(msg))
  },

  onSwipe(e) {
    console.log("滑", e);
  },

  onTap(e) {
    console.log("点击", e);
    this.setData({
      isShowBar: !this.data.isShowBar
    })
  },

  onDoubleTap(e) {
    this.setData({ isStop: !this.data.isStop })

    console.log("双击", this.data.isStop);
    const msg = {
      type: this.data.isStop ? EVENT_TYPE.STOP : EVENT_TYPE.PLAY,
      percent: 1,
      roomID: getIn(this.data.currentVideo, ["roomID"])
    };
    console.log("wss message", JSON.stringify(msg))
    this.sendSocketMessage(JSON.stringify(msg))
  },

  onMove(e) {
    if (this.data.isStop) {
      return;
    }

    const {
      deltaX,
      deltaY
    } = e.detail;
    if (deltaY && deltaY) {
      console.log("移动", deltaX, deltaY);
      let msg;
      if (orientation === ORIENTATION_TYPE.VERTICAL) {
        msg = {
          type: deltaX > 0 ? EVENT_TYPE.RIGHT : EVENT_TYPE.LEFT,
          percent: parseInt((deltaX > 0 ? deltaX : -deltaX) / 750 * 10),
          roomID: getIn(this.data.currentVideo, ["roomID"])
        };
      } else if (orientation === ORIENTATION_TYPE.HORIZONTAL) {
        msg = {
          type: deltaY > 0 ? EVENT_TYPE.RIGHT : EVENT_TYPE.LEFT,
          percent: parseInt((deltaY > 0 ? deltaY : -deltaY) / 750 * 10),
          roomID: getIn(this.data.currentVideo, ["roomID"])
        };
      }
      console.log("wss message", JSON.stringify(msg))
      this.sendSocketMessage(JSON.stringify(msg))
    }
  },

  onShareTap(e) {
    commonStore.refechDoVideoOpen({
      videoId: videoId ? videoId : getIn(this.data.currentVideo, ["id"], 0),
      opType: OP_TYPE.SHARE
    });
    this.setData({
      isShowShare: true
    })
  },

  // onShareWarpTap(e) {
  //   this.setData({ isShowShare: false })
  // },

  onFriendTap(e) {
    this.setData({
      isShowShare: false
    })
  },

  async onCanvasTap(e) {
    this.setData({
      isShowShare: false
    })
    if (!isNull(shareImagePath)) {
      const setting = await wx.getSetting();
      console.log(setting)
      if (setting.authSetting['scope.writePhotosAlbum']) {
        // 已经授权 this.isAuthorization = true;
        wx.saveImageToPhotosAlbum({
          filePath: shareImagePath,
          success(res) {
            console.log(res.errMsg)
          }
        })
      } else {
        // 未授权 this.isAuthorization = false;
        wx.saveImageToPhotosAlbum({
          filePath: shareImagePath,
          success(res) {
            console.log(res.errMsg)
          }
        })
        console.log("false")
        that.setData({
          isShowDialog: true
        })
      }
    } else {
      wx.showToast({
        title: '生成海报失败',
        icon: 'none'
      })
    }
  },

  onImgOK(e) {
    console.log("imageOk", e);
    shareImagePath = e.detail.path;
  },

  onImgErr(e) {
    console.log("imageErr", e);
  },

  async onFavoriteTap(e) {
    let res;
    if (getIn(this.data.currentVideo, ["stared"], true)) {
      res = await commonStore.refechDoVideoUnstar({
        videoId: videoId ? videoId : getIn(this.data.currentVideo, ["id"], 0)
      })
    } else {
      res = await commonStore.refectDoVideoStar({
        videoId: videoId ? videoId : getIn(this.data.currentVideo, ["id"], 0)
      })
    }
    
    if (isNull(res)) {
      // wx.showToast({
      //   title: '收藏成功',
      //   icon: 'none',
      // })
      await commonStore.refechVideoInfo({
        videoId: videoId ? videoId : getIn(this.data.currentVideo, ["id"], 0),
        enterType: this.data.enterType
      })
    }
  },

  onBackTap(e) {
    if (this.data.enterPath === "pages/room/room") {
      wx.switchTab({
        url: '/pages/index/index',
      })
    } else {
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  onOpenSetting(e) {
    console.log("eeeee", e)
    this.setData({
      isShowDialog: false
    })
  },

  onDownloadTap(e) {
    const that = this;
    if (this.data.downloadText === "保存") {
      commonStore.refechDoVideoOpen({
        videoId: videoId ? videoId : getIn(this.data.currentVideo, ["id"], 0),
        opType: OP_TYPE.DOWNLOAD
      });
      const downloadTask = wx.downloadFile({
        url: getIn(this.data.currentVideo, ["pullStreamUrl"], ""),
        header: {
          "Content-Type": "video/mpeg4"
        },
        async success(res) {
          if (res.statusCode === 200) {
            console.log("res.tempFilePath", res.tempFilePath)
            const setting = await wx.getSetting();
            console.log(setting)
            if (setting.authSetting['scope.writePhotosAlbum']) {
              // 已经授权 this.isAuthorization = true;
              wx.saveVideoToPhotosAlbum({
                filePath: res.tempFilePath,
                success(res) {
                  console.log(res.errMsg)
                }
              })
            } else {
              // 未授权 this.isAuthorization = false;
              wx.saveVideoToPhotosAlbum({
                filePath: res.tempFilePath,
                success(res) {
                  console.log(res.errMsg)
                }
              })
              console.log("false")
              that.setData({
                isShowDialog: true
              })
            }
          }
        },
        fail(res) {
          wx.showToast({
            icon: "none",
            title: '下载失败！',
          })
        }
      })
      downloadTask.onProgressUpdate((res) => {
        console.log('下载进度', res.progress)
        this.setData({
          downloadText: res.progress + "%"
        })
      })
    }
  },

  /**
   * 发送手势数据
   */
  sendSocketMessage(msg) {
    console.log("socketOpen:", socketOpen, " socketMsgQueue:", socketMsgQueue)
    if (socketOpen) {
      wx.sendSocketMessage({
        data: msg
      })
    } else {
      socketMsgQueue.push(msg)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      videoId = scene;
      console.log("videoId", videoId)
    }
    
    let lastState = 0;
    let lastTime = Date.now();

    wx.startAccelerometer();
    wx.onAccelerometerChange((res) => {
      const now = Date.now();

      // 500ms检测一次
      if (now - lastTime < 500) {
        return;
      }
      lastTime = now;

      let nowState;

      // 57.3 = 180 / Math.PI
      const Roll = Math.atan2(-res.x, Math.sqrt(res.y * res.y + res.z * res.z)) * 57.3;
      const Pitch = Math.atan2(res.y, res.z) * 57.3;

      // console.log('Roll: ' + Roll, 'Pitch: ' + Pitch)

      // 横屏状态
      if (Roll > 50) {
        if ((Pitch > -180 && Pitch < -60) || (Pitch > 130)) {
          nowState = 1;
        } else {
          nowState = lastState;
        }

      } else if ((Roll > 0 && Roll < 30) || (Roll < 0 && Roll > -30)) {
        let absPitch = Math.abs(Pitch);

        // 如果手机平躺，保持原状态不变，40容错率
        if ((absPitch > 140 || absPitch < 40)) {
          nowState = lastState;
        } else if (Pitch < 0) { /*收集竖向正立的情况*/
          nowState = 0;
        } else {
          nowState = lastState;
        }
      }
      else {
        nowState = lastState;
      }

      // 状态变化时，触发
      if (nowState !== lastState) {
        lastState = nowState;
        if (nowState === 1) {
          console.log('change:横屏');
          // 设置视频方向
          orientation = "horizontal";
          this.trtcComponent && this.trtcComponent.setViewOrientation({
            userID: videoDetail.userID,
            streamType: videoDetail.streamType,
            orientation: 'horizontal' // 竖向：vertical，横向：horizontal
          })
        } else {
          console.log('change:竖屏');
          // 设置视频方向
          orientation = "vertical";
          this.trtcComponent && this.trtcComponent.setViewOrientation({
            userID: videoDetail.userID,
            streamType: videoDetail.streamType,
            orientation: 'vertical' // 竖向：vertical，横向：horizontal
          })
        }
      }
    });


    const timer1 = setInterval(async() => {
      if (this.data.isInit) {
        clearInterval(timer1);

        await commonStore.refechVideoInfo({
          videoId: videoId ? videoId : getIn(this.data.currentVideo, ["id"], 0),
          enterType: this.data.enterType
        })

        this.setData({
          trtcConfig: {
            ...this.data.trtcConfig,
            userID: getApp().globalData.openid,
            userSig: this.data.usersig
          }
        })

        commonStore.refechDoVideoOpen({
          videoId: videoId ? videoId : getIn(this.data.currentVideo, ["id"], 0),
          opType: OP_TYPE.PLAY
        });


        /**
         * 直播组件
         */
        const timer2 = setInterval(() => {
          if (getIn(this.data.currentVideo, ["roomID"])) {
            clearInterval(timer2);
            if (getIn(this.data.currentVideo, ["type"]) === 1) {
              this.trtcComponent = this.selectComponent('#trtcroom');
              this.bindTRTCRoomEvent();
              this.trtcComponent.enterRoom({
                roomID: parseInt(getIn(this.data.currentVideo, ["roomID"]))
              }).catch((res) => {
                console.error('room joinRoom 进房失败:', res)
              });

              /**
               * 连接手势wss
               */
              console.log("----------wss开始连接----------")
              socketTask = wx.connectSocket({
                url: 'wss://fvcv0.iotnc.cn:8081',
                success: (res) => {
                  console.log("---------wss连接成功---------", res)
                },
                fail: (res) => {
                  console.log("---------wss连接失败---------", res)
                }
              })
              socketTask.onClose(function(res) {
                console.log('WebSocket 已关闭！')
              })
              socketTask.onError(res => {
                console.log("-------wss出现错误--------", res)
                wx.showToast({
                  title: '手势连接失败，请检查网络。',
                  icon: 'none'
                })
              })
              socketTask.onOpen(function(res) {
                console.log("----------wss管道打开成功----------", res)
                socketOpen = true
                for (let i = 0; i < socketMsgQueue.length; i++) {
                  this.sendSocketMessage(socketMsgQueue[i])
                }
                socketMsgQueue = []
              })
            }
          }
        }, 100)
      }
    }, 100);

    const timer2 = setInterval(() => {
      if (!isEmptyObj(this.data.currentVideo)) {
        clearInterval(timer2);
        this.setData({
          imgData: new LastMayday().palette(this.data.currentVideo)
        })
      }
    }, 500)
  },

  bindTRTCRoomEvent() {
    const TRTC_EVENT = this.trtcComponent.EVENT
    this.timestamp = []
    // 初始化事件订阅
    this.trtcComponent.on(TRTC_EVENT.LOCAL_JOIN, (event) => {
      console.log('******* 加入房间', this.trtcComponent.getRemoteUserList())

    })
    this.trtcComponent.on(TRTC_EVENT.LOCAL_LEAVE, (event) => {
      console.log('* room LOCAL_LEAVE', event)
    })
    this.trtcComponent.on(TRTC_EVENT.ERROR, (event) => {
      console.log('* room ERROR', event)
    })

    // 远端用户推送视频
    this.trtcComponent.on(TRTC_EVENT.REMOTE_VIDEO_ADD, (event) => {
      console.log('* room REMOTE_VIDEO_ADD 远端用户推送视频', event, this.trtcComponent.getRemoteUserList())
      // 订阅视频
      const userList = this.trtcComponent.getRemoteUserList()
      const data = event.data
      videoDetail = event.data


      this.trtcComponent.setViewOrientation({
        userID: videoDetail.userID,
        streamType: videoDetail.streamType,
        orientation // 竖向：vertical，横向：horizontal
      })

      // 设置视频填充方式
      this.trtcComponent.setViewFillMode({
        userID: data.userID,
        streamType: data.streamType,
        fillMode: 'contain'
      })

      // 播放视频
      this.trtcComponent.subscribeRemoteVideo({
        userID: data.userID,
        streamType: data.streamType,
      })
    })

    // 远端用户推送音频
    this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_ADD, (event) => {
      console.log('* room REMOTE_AUDIO_ADD', event, this.trtcComponent.getRemoteUserList())
      // 订阅音频
      const data = event.data
      if (this.template === '1v1' && (!this.remoteUser || this.remoteUser === data.userID)) {
        this.remoteUser = data.userID
        this.trtcComponent.subscribeRemoteAudio({
          userID: data.userID
        })
      } else if (this.template === 'grid' || this.template === 'custom') {
        this.trtcComponent.subscribeRemoteAudio({
          userID: data.userID
        })
      }
      // 如果不订阅就不会自动播放音频
      // this.trtcComponent.subscribeRemoteAudio({ userID: data.userID })
    })

    // 远端用户取消推送音频
    this.trtcComponent.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, (event) => {
      console.log('* room REMOTE_AUDIO_REMOVE', event, this.trtcComponent.getRemoteUserList())
    })

    this.trtcComponent.on(TRTC_EVENT.IM_MESSAGE_RECEIVED, (event) => {
      console.log('* room IM_MESSAGE_RECEIVED', event)
    })
  },

  onShareAppMessage() {
    return {
      title: getIn(this.data.currentVideo, ["shareTitle"], "-"),
      path: `/pages/room/room?scene=${getIn(this.data.currentVideo, ["id"], 0)}`,
      imageUrl: getIn(this.data.currentVideo, ["firstFrameImgSrc"], "")
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    socketTask && socketTask.close({
      complete: res => console.log("------关闭wss------", res)
    })
    if (timer1) {
      clearInterval(timer1);
      timer1 = undefined;
    }
    if (timer2) {
      clearInterval(timer2);
      timer2 = undefined;
    }
  },
}))