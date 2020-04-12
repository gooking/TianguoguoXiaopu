const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
//获取应用实例
var starscore = require("../../templates/starscore/starscore.js");
var WxSearch = require('../../templates/wxSearch/wxSearch.js');
var app = getApp()
Page({
  data: {
    wxlogin: true,

    page:1,
    pageSize:10000,
    keyword:'',
    loadingHidden: false, // loading
    userInfo: {},
    categories: [],
    goods: [],
    scrollTop: 0,
    loadingMoreHidden: false,
    hasNoCoupons: true,
    couponsTitlePicStr:'',
    coupons: [],
    networkStatus: true, //正常联网
    couponsStatus: 0,
    getCoupStatus: -1
  },
  
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.onLoad()
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('shareProfile'),
      path: '/pages/classification/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  onShow: function () {
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.setData({
          wxlogin: isLogined
        })
      }
    })
    this.setData({
      background_color: app.globalData.globalBGColor,
      bgRed: app.globalData.bgRed,
      bgGreen: app.globalData.bgGreen,
      bgBlue: app.globalData.bgBlue
    })
  },
  onLoad: function () {
    //初始化的时候渲染wxSearchdata 第二个为你的search高度
    WxSearch.init(this, 43, wx.getStorageSync('hotSearchWords').split(','));

    this.setData({
      couponsTitlePicStr: wx.getStorageSync('couponsTitlePicStr')
    })
    this.getCoupons();
  },
  //事件处理函数
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  toSearch: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/search/index?keyword=' + this.data.keyword,
    })
    console.log(e);
  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list',
      data: {
        page: that.data.page,
        pageSize: that.data.pageSize,
        categoryId: categoryId
      },
      success: function (res) {
        that.setData({
          goods: [],
          loadingMoreHidden: true
        });
        var goods = [];
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
            prePageBtn: false,
            nextPageBtn: true,
            toBottom: true
          });
          return;
        }
        for (var i = 0; i < res.data.data.length; i++) {
          goods.push(res.data.data[i]);
        }


        console.log('getGoodsList----------------------')
        console.log(goods)


        for (let i = 0; i < goods.length; i++) {
          goods[i].starscore = (goods[i].numberGoodReputation / goods[i].numberOrders) * 5
          goods[i].starscore = Math.ceil(goods[i].starscore / 0.5) * 0.5
          goods[i].starpic = starscore.picStr(goods[i].starscore)
        }
        console.log('getGoodsReputation----------------------')
        console.log(goods)

      }
    })
  },
  async getCoupons() {
    const res = await WXAPI.coupons()
    if (res.code == 0) {
      this.setData({
        hasNoCoupons: false,
        coupons: res.data,
        couponsStatus: 1
      });
      setTimeout(() => {
        this.setData({
          couponsStatus: -1
        })
      }, 1500)
    } else if (res.code == 700) {
      this.setData({
        hasNoCoupons: true,
        coupons: res.data,
        couponsStatus: 2
      })
    }
  },
  gitCoupon: function (e) {
    AUTH.checkHasLogined().then(isLogined => {
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        this.gitCouponDone(e);
      }
    })
  },
  gitCouponDone: function (e) {    
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          that.setData({
            getCoupStatus: 0
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
          return;
        }
        if (res.data.code == 20003) {
          that.setData({
            getCoupStatus: 2
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
          return;
        }
        if (res.data.code == 30001) {
          that.setData({
            getCoupStatus: 3
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
          return;
        }
        if (res.data.code == 20004) {
          that.setData({
            getCoupStatus: 4
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
          return;
        }
        if (res.data.code == 0) {
          that.setData({
            getCoupStatus: 1
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
        } else if (res.data.code == 600){
          this.setData({
            wxlogin: false
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.code + res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },

  //////////////////////////////////////
  wxSearchFn: function (e) {
    var that = this
    that.toSearch();
    WxSearch.wxSearchAddHisKey(that);

  },
  wxSearchInput: function (e) {
    var that = this
    WxSearch.wxSearchInput(e, that);

    that.setData({
      keyword: that.data.wxSearchData.value,
    })
  },
  wxSerchFocus: function (e) {
    var that = this
    WxSearch.wxSearchFocus(e, that);
  },
  wxSearchBlur: function (e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  wxSearchKeyTap: function (e) {
    var that = this
    WxSearch.wxSearchKeyTap(e, that);

    that.setData({
      keyword: that.data.wxSearchData.value,
    })
  },
  wxSearchDeleteKey: function (e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function (e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that);
  },
  wxSearchTap: function (e) {
    var that = this
    WxSearch.wxSearchHiddenPancel(that);
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }
    AUTH.register(this);
  }
})
