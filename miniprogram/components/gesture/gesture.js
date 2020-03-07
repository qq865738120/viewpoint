// components/gesture/gesture.js

var touchStartX = 0; //触摸时的原点 
var touchStartY = 0; //触摸时的原点 
var time = 0; // 时间记录，用于滑动时且时间小于1s则执行左右滑动 
var interval = ""; // 记录/清理时间记录 
var touchMoveX = 0; // x轴方向移动的距离
var touchMoveY = 0; // y轴方向移动的距离

var distance = 0; // 两指间距
var moveDistance = 0 // 移动间距

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

    isDouble: function(e) {
      return e.touches.length === 2 ? true : false;
    },

    // 触摸开始事件 
    touchStart: function(e) {
      if (this.isDouble(e)) {
        let _x = e.touches[1].pageX - e.touches[0].pageX,
          _y = e.touches[1].pageY - e.touches[0].pageY;
          distance = Math.sqrt(Math.pow(_x, 2) + Math.pow(_y, 2)); //实际距离
        console.log("kais", distance)
      } else {
        touchStartX = e.touches[0].pageX; // 获取触摸时的原点 
        touchStartY = e.touches[0].pageY; // 获取触摸时的原点 
        // 使用js计时器记录时间  
        interval = setInterval(function() {
          time++;
        }, 50);
      }
    },
    // 触摸移动事件 
    touchMove: function(e) {
      console.log("this.isDouble(e)", this.isDouble(e))
      if (this.isDouble(e)) {
        let _x = e.touches[1].pageX - e.touches[0].pageX,
          _y = e.touches[1].pageY - e.touches[0].pageY;
        console.log('_x', e.touches[1].pageX, e.touches[0].pageX);
        console.log('_y', _y);
        moveDistance = Math.sqrt(Math.pow(_x, 2) + Math.pow(_y, 2));
        let end_distance = moveDistance - distance; //计算手指移动的距离
        let pic_scale = 1 + end_distance * 0.002;
        console.log("distance", distance)
        console.log("newdistance", moveDistance)
        // console.log("大于1放大，小于1缩小", pic_scale);
      } else {
        touchMoveX = e.touches[0].pageX;
        touchMoveY = e.touches[0].pageY;
      }

    },
    // 触摸结束事件 
    touchEnd: function(e) {
      if (this.isDouble(e)) {

      } else {
        var moveX = touchMoveX - touchStartX
        var moveY = touchMoveY - touchStartY
        if (Math.sign(moveX) == -1) {
          moveX = moveX * -1
        }
        if (Math.sign(moveY) == -1) {
          moveY = moveY * -1
        }
        if (moveX <= moveY) { // 上下
          // 向上滑动
          if (touchMoveY - touchStartY <= -30 && time < 10) {
            console.log("向上滑动")
          }
          // 向下滑动 
          if (touchMoveY - touchStartY >= 30 && time < 10) {
            console.log('向下滑动 ');
          }
        } else { // 左右
          // 向左滑动
          if (touchMoveX - touchStartX <= -30 && time < 10) {
            console.log("左滑页面")
          }
          // 向右滑动 
          if (touchMoveX - touchStartX >= 30 && time < 10) {
            console.log('向右滑动');
          }
        }
        clearInterval(interval); // 清除setInterval 
        time = 0;
      }

    },

  }
})