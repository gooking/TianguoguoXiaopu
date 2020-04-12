var app = getApp();
var WxParse = require('../../templates/wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/notice/detail',
      data: {
        id: options.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            notice: res.data.data
          });
          WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
        }
      }
    })
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
})