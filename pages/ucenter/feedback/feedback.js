const WXAPI = require('apifm-wxapi')

Page({
  data: {
    array: ['请选择反馈类型', '商品相关', '物流状况', '客户服务', '优惠活动', '功能异常', '产品建议', '其他'],
    index: 0,
    inputTxt: '',
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  clearMobileNumber: function(){
    this.setData({
      //更新页面input框显示
      inputTxt: ''
    })
  },
  onLoad: function (options) {
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  },
  bindSave: function (e) {
    const content = e.detail.value.content
    const mobile = e.detail.value.mobile
    if (!content) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      })
      return
    }
    if (!mobile) {
      wx.showToast({
        title: '请填写手机号',
        icon: 'none'
      })
      return
    }
    WXAPI.addComment({
      type: 1,
      content: content,
      extJsonStr: '{"手机号码": ' + mobile +'}'
    }).then(res => {
      if (res.code == 0) {
        wx.showToast({
          title: '感谢您的反馈',
          icon: 'success'
        })
        setTimeout(()=> {
          wx.navigateBack({
            
          })
        }, 1000)
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
    })
  }
})