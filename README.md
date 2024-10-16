"# compressionIamge" 
// 微信小程序前端图片压缩组件，核心原理是利用canvas重绘，几千kb的图片压缩完只有几十kb，效果几乎不减少
// 使用代码：
// 1.json导入组件
// 2.wxml中使用
                    <compressionIamge file_path_list='{{xczpArr}}' bind:imageCompressedList='handleImageCompressed'></compressionIamge>
// 3.js文件   
                    handleImageCompressed(e) {
                    this.setData({
                      ysimgList: e.detail.res
                    })
                  },
                    wx.chooseMedia({
                    count: 3,
                  mediaType: ['image'],
                  sourceType: ['camera', 'album'],
                  success: (res) => {
                              let imgArr = res.tempFiles;
                    let xczpOldArr = this.data.xczpArr;
                    if (imgArr != null && imgArr.length > 0) {
                    var xczpNewArr = [...xczpOldArr, ...imgArr];
                    var xczpNowArr = [];

                    for (let i = 0; i < xczpNewArr.length; i++) {
                      if (i < 3) {
                        xczpNowArr.push(xczpNewArr[i]);
                      }
                    }
                    this.setData({
                      xczpCount: this.data.xczpCount + imgArr.length,
                      xczpArr: xczpNowArr
                    });
                  }
                }, fail: (res) => {

                }
              });
// 4.配合小程序提供的wx.chooseMedia方法获取图片路径对象设置成数组，组件内部监听file_path_list的变化，只要更新就会自动压缩
// 5.组件可传属性  
     maxWidth: {
      value: 1080,
      type: Number
      //最大宽
    },
    maxHeight: {
      value: 1080,
      type: Number
      //最大高
    },
    file_path: {
      type: String
      //图片路径
    },
    file_path_list: {
      type: Array
      //图片路径数组
    },
    quality: {
      type: Number,
      value: 0.8
      //图片压缩质量
    },
    size: {
      type: Number,
      value: 50000
      //图片多大开启压缩
    },
    isYaSuoLog: {
      type: Boolean,
      value: true
      //是否开启压缩日志
    }
