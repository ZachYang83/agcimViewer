<!--
 * @author: 张瀚
 * @description: 城市道路视廊管控
-->
<template>
  <div>
    <a-col :span="8">
      <h5>起点高度(米)：</h5>
    </a-col>
    <a-col :span="16">
      <a-input-number placeholder="请输入起点高度" class="visual-corrido-input" v-model="startHeight" :min="0" />
    </a-col>
    <a-col :span="8">
      <h5>起点宽度：</h5>
    </a-col>
    <a-col :span="16">
      <a-input-number placeholder="请输入起点宽度" class="visual-corrido-input" v-model="startWidth" :min="1" />
    </a-col>
    <a-col :span="8">
      <h5>终点高度(米)：</h5>
    </a-col>
    <a-col :span="16">
      <a-input-number placeholder="请输入终点高度" class="visual-corrido-input" v-model="endHeight" :min="0" />
    </a-col>
    <a-col :span="8">
      <h5>终点宽度(米)：</h5>
    </a-col>
    <a-col :span="16">
      <a-input-number placeholder="请输入终点宽度" class="visual-corrido-input" v-model="endWidth" :min="0" />
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
      startHeight: 100,
      startWidth: 50,
      endHeight: 100,
      endWidth: 50,

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
      visualCorridor.pickAndDrawRoadVisualCorridor({
        startHeight: this.startHeight,
        startWidth: this.startWidth,
        endHeight: this.endHeight,
        endWidth: this.endWidth,
      }).catch(e => console.error(e))
    },
    clear() {
      visualCorridor.reset()
    }
  },
};
</script>
<style scoped>
</style>