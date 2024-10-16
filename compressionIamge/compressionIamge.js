// components/compressionIamge.js
const fs = wx.getFileSystemManager()
Component({

  /**
   * 组件的属性列表
   */
  properties: {
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
  },

  /**
   * 组件的初始数据
   */
  data: {
    overSize: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    compressionIamge1(file_path) {
      const that = this
      // 等比例压缩图片 可指定图片宽高
      const { isYaSuoLog, quality, maxWidth, maxHeight, overSize } = this.data
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: file_path,
          success: (imgInfo) => {
            // 原图的宽高
            let originWidth = imgInfo.width
            let originHeight = imgInfo.height

            // 按比例压缩后图片的默认大小
            let targetWidth = originWidth
            let targetHeight = originHeight

            // 根据最大宽高计算按比例压缩后图片的实际大小
            if (originWidth > maxWidth || originHeight > maxHeight) {
              if (originWidth / originHeight > maxWidth / maxHeight) {
                targetWidth = maxWidth
                targetHeight = Math.round(
                  maxWidth * (originHeight / originWidth)
                )
              } else {
                targetHeight = maxHeight
                targetWidth = Math.round(
                  maxHeight * (originWidth / originHeight)
                )
              }
            }
            const canvas = wx.createOffscreenCanvas({ type: '2d', width: targetWidth, height: targetHeight })
            // canvas.width = targetWidth //压缩后宽
            // canvas.height = targetHeight //压缩后高
            const ctx = canvas.getContext('2d')
            let img = canvas.createImage();
            img.src = file_path; //要压缩的图片路径
            img.onload = function () {
              // 将图片绘制到canvas
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              // 生成图片
              wx.canvasToTempFilePath({
                canvas,
                destWidth: targetWidth, //压缩后宽
                destHeight: targetHeight, //压缩后高
                fileType: 'jpg',
                quality: quality, //质量，可自定义
                success: (res) => {
                  console.log('压缩后的图片路径:', res.tempFilePath);
                  fs.open({
                    filePath: res.tempFilePath,
                    flag: 'a+',
                    success(res) {
                      // 获取文件的状态信息
                      fs.fstat({
                        fd: res.fd,
                        success(res) {
                          let nextSize = Math.round(res.stats.size / 1024, 2)
                          isYaSuoLog && console.log('压缩后图片大小', nextSize + 'kb')
                          isYaSuoLog && console.log('压缩比', Math.round((overSize - nextSize) / overSize * 100) + '%')
                        },
                        fail: (e) => {
                          console.error(e)
                        }
                      })
                    }
                  })
                  that.triggerEvent('imageCompressed', { file_path: res.tempFilePath });
                  resolve(res.tempFilePath)
                },
                fail: (res) => reject(file_path),
                complete: () => {
                  wx.hideLoading()
                }
              })
              //大于4096的先转base64，再写入文件
              // if (canvas.width > 4096 || canvas.height > 4096) {
              //   //转成base64图片后的质量和类型
              //   const base64Data = canvas.toDataURL('image/jpeg', 0.8);
              //   const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
              //   const buffer = wx.base64ToArrayBuffer(base64);
              //   try {
              //     const res = fs.writeFileSync(
              //       file_path,
              //       buffer,
              //       'binary'
              //     )
              //   } catch (e) {
              //     console.error(e)
              //   }
              // } else {
              //   // 生成图片
              //   wx.canvasToTempFilePath({
              //     canvas,
              //     destWidth: targetWidth, //压缩后宽
              //     destHeight: targetHeight, //压缩后高
              //     fileType: 'jpg',
              //     quality: quality, //质量，可自定义
              //     success: (res) => {
              //       console.log('压缩后的图片路径:', res.tempFilePath);
              //       fs.open({
              //         filePath: res.tempFilePath,
              //         flag: 'a+',
              //         success(res) {
              //           // 获取文件的状态信息
              //           fs.fstat({
              //             fd: res.fd,
              //             success(res) {
              //               let nextSize = Math.round(res.stats.size / 1024, 2)
              //               isYaSuoLog && console.log('压缩后图片大小', nextSize + 'kb')
              //               isYaSuoLog && console.log('压缩比', Math.round((overSize - nextSize) / overSize * 100) + '%')
              //             },
              //             fail: (e) => {
              //               console.error(e)
              //             }
              //           })
              //         }
              //       })
              //       that.triggerEvent('imageCompressed', { file_path: res.tempFilePath });
              //       resolve(res.tempFilePath)
              //     },
              //     fail: (res) => reject(file_path),
              //     complete: () => {
              //       wx.hideLoading()
              //     }
              //   })
              // }
            }
            // const query = this.createSelectorQuery()
            // let dom = query.select('#myCanvas') //画布id
            // dom.fields({ node: true, size: true })
            //   .exec((res) => {

            //   })
          }
        })
      })
    },
    compressionIamge2(file_path) {
      const that = this
      // 等比例压缩图片 可指定图片宽高
      const { isYaSuoLog, quality, maxWidth, maxHeight, size } = this.data
      return new Promise((resolve, reject) => {
        const fd = fs.openSync({
          filePath: file_path,
          flag: 'a+',
        })
        const stats = fs.fstatSync({ fd: fd })
        let overSize = Math.round(stats.size / 1024, 2)
        that.setData({
          overSize: overSize
        })
        if (overSize > size) {
          resolve({
            file_path: file_path,
            overSize: overSize,
            nextSize: 0
          })
        }
        wx.getImageInfo({
          src: file_path,
          success: (imgInfo) => {
            // 原图的宽高
            let originWidth = imgInfo.width
            let originHeight = imgInfo.height

            // 按比例压缩后图片的默认大小
            let targetWidth = originWidth
            let targetHeight = originHeight

            // 根据最大宽高计算按比例压缩后图片的实际大小
            if (originWidth > maxWidth || originHeight > maxHeight) {
              if (originWidth / originHeight > maxWidth / maxHeight) {
                targetWidth = maxWidth
                targetHeight = Math.round(
                  maxWidth * (originHeight / originWidth)
                )
              } else {
                targetHeight = maxHeight
                targetWidth = Math.round(
                  maxHeight * (originWidth / originHeight)
                )
              }
            }
            let canvas = wx.createOffscreenCanvas({ type: '2d', width: targetWidth, height: targetHeight })
            // 获取 context。注意这里必须要与创建时的 type 一致
            // const context = canvas.getContext('2d')
            // console.log(canvas)
            // console.log(111)
            // console.log(context)
            // this.canvas = res[0].node
            // this.canvas.width = targetWidth //压缩后宽
            // this.canvas.height = targetHeight //压缩后高
            let ctx = canvas.getContext('2d')
            let img = canvas.createImage();
            img.src = file_path; //要压缩的图片路径
            img.onload = () => {
              // 将图片绘制到canvas
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              // 生成图片
              wx.canvasToTempFilePath({
                canvas: canvas,
                destWidth: targetWidth, //压缩后宽
                destHeight: targetHeight, //压缩后高
                fileType: 'jpg',
                quality: quality, //质量，可自定义
                success: (res) => {
                  const fd = fs.openSync({
                    filePath: res.tempFilePath,
                    flag: 'a+',
                  })
                  const stats = fs.fstatSync({
                    fd: fd,
                  })
                  let nextSize = Math.round(stats.size / 1024, 2)
                  resolve({ tempFilePath: res.tempFilePath, nextSize, overSize })
                },
                fail: (res) => reject(file_path),
              })


              // //大于4096的先转base64，再写入文件
              // if (canvas.width > 4096 || canvas.height > 4096) {
              //   //转成base64图片后的质量和类型
              //   const base64Data = canvas.toDataURL('image/jpeg', 0.8);
              //   const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
              //   const buffer = wx.base64ToArrayBuffer(base64);
              //   try {
              //     const res = fs.writeFileSync(
              //       file_path,
              //       buffer,
              //       'binary'
              //     )
              //   } catch (e) {
              //     console.error(e)
              //   }
              // } else {

              // }
            }



            // this.query = this.createSelectorQuery()
            // this.dom = this.query.select('#myCanvas') //画布id
            // this.dom.fields({ node: true, size: true })
            //   .exec((res) => {
            //     if (!res || res.length == 0 || res == 'null' || res == null) {
            //       console.error('页面有误')
            //       return
            //     }
            //     this.canvas = res[0].node
            //     this.canvas.width = targetWidth //压缩后宽
            //     this.canvas.height = targetHeight //压缩后高
            //     this.ctx = this.canvas.getContext('2d')
            //     this.img = this.canvas.createImage();
            //     this.img.src = file_path; //要压缩的图片路径
            //     this.img.onload = () => {
            //       // 将图片绘制到canvas
            //       this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height)
            //       //大于4096的先转base64，再写入文件
            //       if (this.canvas.width > 4096 || this.canvas.height > 4096) {
            //         //转成base64图片后的质量和类型
            //         const base64Data = canvas.toDataURL('image/jpeg', 0.8);
            //         const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
            //         const buffer = wx.base64ToArrayBuffer(base64);
            //         try {
            //           const res = fs.writeFileSync(
            //             file_path,
            //             buffer,
            //             'binary'
            //           )
            //         } catch (e) {
            //           console.error(e)
            //         }
            //       } else {
            //         // 生成图片
            //         wx.canvasToTempFilePath({
            //           canvas: this.canvas,
            //           destWidth: targetWidth, //压缩后宽
            //           destHeight: targetHeight, //压缩后高
            //           fileType: 'jpg',
            //           quality: quality, //质量，可自定义
            //           success: (res) => {
            //             const fd = fs.openSync({
            //               filePath: res.tempFilePath,
            //               flag: 'a+',
            //             })
            //             const stats = fs.fstatSync({
            //               fd: fd,
            //             })
            //             let nextSize = Math.round(stats.size / 1024, 2)
            //             resolve({ tempFilePath: res.tempFilePath, nextSize, overSize })
            //           },
            //           fail: (res) => reject(res.tempFilePath),
            //         })
            //       }
            //     }
            //   })
          }
        })
      })
    },
  },
  observers: {
    'file_path': function (file_path) {
      const { size, isYaSuoLog } = this.data
      const that = this
      if (file_path == '' || typeof file_path == 'undefined' || file_path == null) {
        return
      }
      const fs = wx.getFileSystemManager()
      fs.open({
        filePath: file_path,
        flag: 'a+',
        success(res) {
          // 获取文件的状态信息
          fs.fstat({
            fd: res.fd,
            success(res) {
              isYaSuoLog && console.log('压缩前图片大小', Math.round(res.stats.size / 1024, 2) + 'kb')
              that.setData({
                overSize: Math.round(res.stats.size / 1024, 2)
              })
              if (res.stats.size > size) {
                that.compressionIamge1(file_path)
              }
            },
            fail: (e) => {
              console.error(e)
            }
          })
        }
      })

    },
    'file_path_list': async function (file_path_list) {
      const { size, isYaSuoLog } = this.data
      const that = this
      let _file_path_list = []
      if (file_path_list && Array.isArray(file_path_list) && file_path_list.length > 0) {
        file_path_list.forEach((item, index) => {
          let file_path = item.tempFilePath
          if (file_path == '' || typeof file_path == 'undefined' || file_path == null) {
            return
          }
          _file_path_list.push({ index: index, path: file_path })
        })
      } else {
        return
      }

      let promiseAllList = _file_path_list.map((item) => {
        return this.compressionIamge2(item.path)
      })
      Promise.all(promiseAllList).then(res => {
        res.forEach((item, index) => {
          isYaSuoLog && console.log(`第${index}张压缩前图片大小`, item.overSize + 'kb')
          isYaSuoLog && console.log(`第${index}张压缩后图片大小`, item.nextSize + 'kb')
          isYaSuoLog && console.log(`第${index}张压缩比`, Math.round((item.overSize - item.nextSize) / item.overSize * 100) + '%')
        })
        that.triggerEvent('imageCompressedList', { res });
      })
    }
  },
})