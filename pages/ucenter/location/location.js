var countTooGetLocation = 0;
var total_micro_second = 0;
var totalSecond = 0;
var oriMeters = 0.0;



// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60)); // equal to => var sec = second % 60;


  return hr + ":" + min + ":" + sec + " ";
}


function getDistance(lat1, lng1, lat2, lng2) {
  var dis = 0;
  var radLat1 = toRadians(lat1);
  var radLat2 = toRadians(lat2);
  var deltaLat = radLat1 - radLat2;
  var deltaLng = toRadians(lng1) - toRadians(lng2);
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;

  function toRadians(d) {
    return d * Math.PI / 180;
  }
}

function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}

//****************************************************************************************
//****************************************************************************************

Page({
  data: {
    clock: '',
    isLocation: false,
    tglatitude: 0,
    tglongitude: 0,
    latitude: 0,
    longitude: 0,
    markers: [],
    covers: [],
    meters: 0.00,
    time: "0:00:00"
  },

  //****************************
  onLoad: function(options) {
    this.setData({
      tglatitude: wx.getStorageSync('gps').split(',')[0],
      tglongitude: wx.getStorageSync('gps').split(',')[1],
    })
    // 页面初始化 options为页面跳转所带来的参数
    this.getTgLocation()
  },
  //****************************
  openLocation: function() {
    var that = this
    console.log(that.data.tglatitude),
      wx.getLocation({
        type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
        success: function(res) {
          wx.openLocation({
            latitude: res.latitude, // 纬度，范围为-90~90，负数表示南纬
            longitude: res.longitude, // 经度，范围为-180~180，负数表示西经
            scale: 18, // 缩放比例
          })
        },
      })
  },
  openTgLocation: function() {
    wx.openLocation({
      latitude: 1*this.data.tglatitude,
      longitude: 1 *this.data.tglongitude,
      scale: 18, // 缩放比例
    })
  },



  //****************************
  getLocation: function() {
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res) {
        console.log("res----------")
        console.log(res)
        //make datas 
        var newCover = {
          latitude: res.latitude,
          longitude: res.longitude,
        };
        var oriCovers = that.data.covers;

        console.log("oriMeters----------")
        console.log(oriMeters);
        var len = oriCovers.length;
        var lastCover;
        if (len == 0) {
          oriCovers.push(newCover);
        }
        len = oriCovers.length;
        var lastCover = oriCovers[len - 1];

        console.log("oriCovers----------")
        console.log(oriCovers, len);

        var newMeters = getDistance(lastCover.latitude, lastCover.longitude, res.latitude, res.longitude) / 1000;

        if (newMeters < 0.0015) {
          newMeters = 0.0;
        }

        oriMeters = oriMeters + newMeters;
        console.log("newMeters----------")
        console.log(newMeters);


        var meters = new Number(oriMeters);
        var showMeters = meters.toFixed(2);

        oriCovers.push(newCover);

        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: [],
          covers: oriCovers,
          meters: showMeters,
        });
      },
    })
  },
  //****************************
  getTgLocation: function() {
    var that = this
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res) {
        console.log("res----------")
        console.log(res)
        //make datas 
        var newCover = {
          latitude: that.data.tglatitude,
          longitude: that.data.tglongitude,
          iconPath: "/images/location_red_blue.png",
        };

        var newMeters = getDistance(newCover.latitude, newCover.longitude, res.latitude, res.longitude) / 1000;
        if (newMeters < 0.0015) {
          newMeters = 0.0;
        }
        console.log("newMeters----------")
        console.log(newMeters);

        var meters = new Number(newMeters);
        var showMeters = meters.toFixed(2);

        var oriCovers = that.data.covers;
        oriCovers.push(newCover);
        console.log("oriCovers----------")
        console.log(oriCovers);

        that.setData({
          latitude: that.data.tglatitude, //res.latitude,
          longitude: that.data.tglongitude, //res.longitude,
          markers: [],
          covers: oriCovers,
          meters: showMeters,
        });
      },
    })
  }

})