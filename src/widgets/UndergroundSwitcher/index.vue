<!--
 * @author:
 * @description: 地下模式
-->
<template>
  <div class="content">
    <a-row type="flex" justify="space-around" align="middle">
      <a-col :span="12">
        <h5>地下模式</h5>
      </a-col>
      <a-col :span="12">
        <a-switch v-model="checked" @change="onChange" />
      </a-col>
      <a-col :span="12">
        <h5>图层透明度</h5>
      </a-col>
      <a-col :span="12">
        <a-slider :min="0" :max="1" :step="0.01" :defaultValue="0.3" @afterChange="setMapAlpha" />
      </a-col>
    </a-row>
    <div>
      选择地下模式，进入地下，即可以看到管线之类的地下模型；左键平移，右键旋转、放缩可以观看得更清晰
    </div>
  </div>
</template>
<script>
import UndergroundMode from "@/adk/UndergroundMode.js";
let undergroundMode = new UndergroundMode(CIM.viewer);
export default {
  components: {},
  data() {
    return {
      checked: false,
      buildingVisible: false,
      alpha: 0.5,
    };
  },
  mounted() { },
  methods: {
    setMapAlpha(alpha) {
      undergroundMode.setMapAlpha(alpha);
    },

    onChange(checked) {
      if (checked) {
        undergroundMode.enable()
      } else {
        undergroundMode.cancel()
      }
    },
  },
  beforeDestroy() {
    undergroundMode.cancel();
  },
};
</script>
<style scoped>
.content {
  padding: 0 5px;
}
.ant-slider {
  margin: 0;
  padding: 0;
  width: 80%;
}
.ant-col {
  margin-bottom: 10px;
}
</style>