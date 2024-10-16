# 微信小程序前端图片压缩组件  
  
## 核心原理  
  
利用 `canvas` 重绘实现图片压缩，可以将几千 KB 的图片压缩到几十 KB，同时几乎不损失图片质量。  
  
## 使用说明  
  
### 1. JSON 导入组件  
  
在需要使用该组件的小程序页面的 `json` 文件中导入组件：  
  
```json  
{  
  "usingComponents": {  
    "compressionImage": "path/to/compressionImage/component"  
  }  
}
2. WXML 中使用
```html
<compressionImage file_path_list="{{xczpArr}}" bind:imageCompressedList="handleImageCompressed"></compressionImage>
3. JS 文件
在页面的 JavaScript 文件中，你需要定义处理压缩后图片的函数，并调用 wx.chooseMedia 来选择图片：

```javascript
Page({  
  data: {  
    xczpArr: [],  
    ysimgList: [],  
    xczpCount: 0  
  },  
  
  handleImageCompressed(e) {  
    this.setData({  
      ysimgList: e.detail.res  
    });  
  },  
  
  chooseImages() {  
    wx.chooseMedia({  
      count: 3,  
      mediaType: ['image'],  
      sourceType: ['camera', 'album'],  
      success: (res) => {  
        const imgArr = res.tempFiles;  
        let xczpOldArr = this.data.xczpArr;  
        if (imgArr && imgArr.length > 0) {  
          const xczpNewArr = [...xczpOldArr, ...imgArr];  
          const xczpNowArr = xczpNewArr.slice(0, 3); 
  
          this.setData({  
            xczpCount: this.data.xczpCount + imgArr.length,  
            xczpArr: xczpNowArr  
          });  
        }  
      },  
      fail: (err) => {  
        console.error('选择媒体失败：', err);  
      }  
    });  
  }  
});
4. 配合 wx.chooseMedia 获取图片路径
组件内部会监听 file_path_list 的变化，并自动进行压缩。

5. 组件可传属性
maxWidth
类型：Number
默认值：1080
说明：最大宽度
maxHeight
类型：Number
默认值：1080
说明：最大高度
file_path
类型：String
说明：单张图片路径（此示例中未使用，但组件可能支持）
file_path_list
类型：Array
说明：图片路径数组
quality
类型：Number
默认值：0.8
说明：图片压缩质量
size
类型：Number
默认值：50000（单位：字节）
说明：图片大小超过此值时开启压缩
isYaSuoLog
类型：Boolean
默认值：true
说明：是否开启压缩日志
