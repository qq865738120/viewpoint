//index.js
import regeneratorRuntime from 'regenerator-runtime'

const app = getApp()

Page({
  data: {
    topBarSelected: 0,
    listData: [
      {
        
      }
    ]
  },

  async onLoad() {
    // const res = await app.axios.post("mock/28/fvcms/mini/activity/list");
    // console.log(res);
    
  },

  onTopBarTap(e) {
    this.setData({
      topBarSelected: e.currentTarget.dataset.index
    })
    console.log(e);
  }

})
