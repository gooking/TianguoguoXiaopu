const WXAPI = require('apifm-wxapi')
const AUTH = require('utils/auth')
var starscore = require("./templates/starscore/starscore.js");
App({
  async getMallName(){
    if (this.globalData.initOk) {
      return wx.getStorageSync('mallName')
    }
    const res = await WXAPI.queryConfigBatch('mallName,recharge_amount_min,couponsTitlePicStr,hotSearchWords,gps,logo,shareProfile')
    if (res.code == 0) {
      res.data.forEach(config => {
        wx.setStorageSync(config.key, config.value)
      })
    }
    this.globalData.initOk = true
    return wx.getStorageSync('mallName')
  },
  async getGoodsCategory(){
    const res = await WXAPI.goodsCategory()
    const categories = []; //{ id: 0, name: "全品类" }
    if (res.code == 0) {
      for (var i = 0; i < res.data.length; i++) {
        categories.push(res.data[i]);
      }
      this.globalData.categories = categories
      // this.getGoods(0);//获取全品类商品
      return categories
    }
  },
  onLaunch: function () {
    WXAPI.init(this.globalData.subDomain)
  },
  onShow(e) {
    // 保存邀请人
    if (e && e.query && e.query.inviter_id) {
      wx.setStorageSync('referrer', e.query.inviter_id)
    }
    // 自动登录
    AUTH.checkHasLogined().then(isLogined => {
      if (!isLogined) {
        AUTH.login()
      }
    })
  },
  async getGoods(categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    let res = await WXAPI.goods({
      page: this.globalData.page,
      pageSize: this.globalData.pageSize,
      categoryId: categoryId
    })
    this.globalData.goods = []
    var goods = [];
    if (res.code != 0 || res.data.length == 0) {
      /*that.setData({
        prePageBtn: false,
        nextPageBtn: true,
        toBottom: true
      });*/
      return;
    }
    var temp;
    for (var i = 0; i < res.data.length; i++) {
      temp = res.data[i];
      temp.minPrice = temp.minPrice.toFixed(2);
      temp.originalPrice = temp.originalPrice.toFixed(2);
      goods.push(temp);
    }
    

    var page = this.globalData.page;
    var pageSize = this.globalData.pageSize;
    for (let i = 0; i < goods.length; i++) {
      goods[i].starscore = (goods[i].numberGoodReputation / goods[i].numberOrders) * 5
      goods[i].starscore = Math.ceil(goods[i].starscore / 0.5) * 0.5
      goods[i].starpic = starscore.picStr(goods[i].starscore)

    }
    this.globalData.goods = goods
    res = await WXAPI.goods({
      page: this.globalData.page,
      pageSize: this.globalData.pageSize,
      categoryId: categoryId
    })
    var categories = this.globalData.categories
    var goodsList = [],
      id,
      key,
      name,
      typeStr,
      goodsTemp = []
    for (let i = 0; i < categories.length; i++) {
      id = categories[i].id;
      key = categories[i].key;
      name = categories[i].name;
      typeStr = categories[i].type;
      goodsTemp = [];
      for (let j = 0; j < goods.length; j++) {
        if (goods[j].categoryId === id) {
          goodsTemp.push(goods[j])
        }
      }
      if ((this.globalData.activeCategoryId === null) & (goodsTemp.length > 0)) {
        this.globalData.activeCategoryId = categories[i].id
      }
      goodsList.push({ 'id': id, 'key': key, 'name': name, 'type': typeStr, 'goods': goodsTemp })
      console.log("你好," + categories[i].name)
    }

    this.globalData.goodsList = goodsList
    this.globalData.onLoadStatus = true
    console.log('categories:', categories)
    //that.globalData.activeCategoryId = categories[0].id   改为第一个不为null的类
  },
  globalData:{
    page: 1, //初始加载商品时的页面号
    pageSize: 10000, //初始加载时的商品数，设置为10000保证小商户能加载完全部商品
    categories: [],
    goods: [],
    goodsName: [],
    goodsList: [],
    onLoadStatus: true,
    activeCategoryId: null,

    globalBGColor: '#00afb4',
    bgRed: 0,
    bgGreen: 175,
    bgBlue: 180,
    userInfo: null,
    subDomain: "cjns",// 商城后台个性域名 tggnew
    version: "2.4.0"
  }
  // 根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒
})
