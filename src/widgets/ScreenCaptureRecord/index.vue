<template>
  <div>
    <p>截取三维场景全屏效果及提供CIM平台浏览器录制功能</p>
    <a-divider />
    <div class="tabs-container">
      <a-tabs type="card" @change="callback">
        <a-tab-pane key="1" tab="截屏">
          <p class="font-info">请设置截图分辨率：</p>
          <div class="input-container"><a-input class="input-info" v-model="screenWidth" @change="listeningValue"/> x <a-input class="input-info" v-model="screenHeight" @change="listeningValue"/></div>
          <a-button type="primary" class="btn-info" @click="setScreenPixels" :disabled="isDisabled">
            应用设置
          </a-button>
          <a-button type="primary" class="btn-info" @click="getScreenshot">
            截取屏幕
          </a-button>
          <a-button type="primary" class="btn-info">
            <a :href="imgUrl" :download="imgName">下载图片</a>
          </a-button>
          <p>文本标签：</p>
          <img :src="imgUrl" alt=""/>
        </a-tab-pane>
        <a-tab-pane key="2" tab="录屏">
          <p class="font-info-case">请设置截图分辨率：</p>
          <div class="select-info">
            <a-select default-value="1080" style="width: 120px" @change="handleChange">
              <a-select-option value="1080">
                超清(1080P)
              </a-select-option>
              <a-select-option value="720">
                高清(720P)
              </a-select-option>
              <a-select-option value="480">
                标清(480P)
              </a-select-option>
            </a-select>
          </div>
          <div class="clear-div"></div>
          <a-button type="primary" class="btn-info">
            开始录制
          </a-button>
          <a-button type="primary" class="btn-info">
            结束录制
          </a-button>
          <a-button type="primary" class="btn-info">
            取消录制
          </a-button>
          <p>预览：</p>
          <video controls="controls" autoplay="autoplay">
            <source src="" type="video/mp4" />
          </video>
          <a-button type="primary" class="btn-down-info">
            下载
          </a-button>
          <a-button type="primary">
            删除
          </a-button>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
let canvas = CIM.viewer.canvas
export default {
  data() {
    return {
      screenWidth: screen.width,
      screenHeight: screen.height,
      imgUrl: null,
      imgName: null,
      isDisabled: true
    };
  },
  methods: {
    setScreenPixels() {
      canvas.width = this.screenWidth
      canvas.height = this.screenHeight
      this.isDisabled = true
    },
    getScreenshot() {
      // 将canvas转为base64
      this.imgUrl = canvas.toDataURL()
      // 给图片生成随机名字，给下载时用
      this.imgName = new Date().getTime()
    },
    listeningValue() {
      this.isDisabled = false
    },
    callback(key) {
      // console.log(key);
    },
    handleChange(value) {
      // console.log(`selected ${value}`);
    }
  }
}
</script>

<style scoped>

p {
  margin: 7px;
}

.tabs-container {
  margin: 9px;
}

.font-info {
  margin: 7px;
  width: 135px;
  float: left;
  padding-top: 5px;
}

.font-info-case {
  margin: 7px;
  width: 135px;
  float: left;
}

.select-info {
  float: left;
}

.clear-div {
  clear: both;
}

.btn-info {
  margin: 10px 3px 3px 8px;
}

.btn-down-info {
  margin-right: 15px;
  margin-left: 150px;
}

.input-container {
  width: 150px;
  float: left;
}

.input-info {
  width: 57px;
  margin: 5px;
}

img {
  width: 285px;
  height: 200px;
  margin: 10px;
}

video {
  width: 285px;
  height: 200px;
  margin: 10px;
}

</style>