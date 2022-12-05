<!--
 * @author: 张瀚
 * @description: 城市道路视廊管控
-->
<template>
  <div>
    <a-col :span="8">
      <h5>观察点高度(米)：</h5>
    </a-col>
    <a-col :span="16">
      <a-input-number placeholder="请输入观察点高度" class="visual-corrido-input" v-model="watcherHeight" @change="reDraw" :min="0" />
    </a-col>
    <a-col :span="8">
      <h5>观察点半径(米)：</h5>
    </a-col>
    <a-col :span="16">
      <a-input-number placeholder="请输入观察点半径" class="visual-corrido-input" v-model="watcherRadius" @change="reDraw" :min="1" />
    </a-col>
    <a-col :span="8">
      <h5>景点高度(米)：</h5>
    </a-col>
    <a-col :span="16">
      <a-input-number placeholder="请输入景点高度" class="visual-corrido-input" v-model="targetHeight" @change="reDraw" :min="0" />
    </a-col>
    <a-col :span="8">
      <h5>景点半径(米)：</h5>
    </a-col>
    <a-col :span="16">
      <a-input-number placeholder="请输入景点半径" class="visual-corrido-input" v-model="targetRadius" @change="reDraw" :min="0" />
    </a-col>
    <a-col :span="8">
      <a-button type="primary" @click="pickAndDraw">开始绘制</a-button>
    </a-col>
    <a-col :span="8">
      <a-button type="danger" @click="clear">清除</a-button>
    </a-col>

  </div>
</template>
<script>
import VisualCorridor from './visualCorridor.js'
let visualCorridor = new VisualCorridor(CIM.viewer)
export default {
  components: {},
  props: {},
  data() {
    return {
      watcherHeight: 1.7,
      watcherRadius: 1,
      targetHeight: 200,
      targetRadius: 200,

    };
  },
  created() {
  },
  mounted() { },
  destroyed() {
    visualCorridor.reset()
  },
  computed: {

  },
  watch: {},
  methods: {
    pickAndDraw() {
      visualCorridor.reset()
      this.$message.warn("此功能正在确定需求中。。。")
      // visualCorridor.pickAndDrawLandscapeVisualCorridor({
      //   watcherHeight: this.watcherHeight,
      //   watcherRadius: this.watcherRadius,
      //   targetHeight: this.targetHeight,
      //   targetRadius: this.targetRadius,
      //   lineCount: 40,
      // }).catch(e=>console.error(e))
    },
    reDraw() {
      console.log(this.watcherHeight, this.watcherRadius, this.targetHeight, this.targetRadius);
    },
    clear() {
      visualCorridor.reset()
    }
  },
};
</script>
<style scoped>
</style>