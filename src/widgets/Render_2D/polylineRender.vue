<!--
 * @author: 张瀚
 * @description: 线绘制
-->
<template>
  <div class="render">
    <a-row align="middle">
      <a-col :span="8">
        <h5>颜色选择</h5>
      </a-col>
      <a-col :span="8">
        <h5>线宽度(像素)</h5>
      </a-col>
      <a-col :span="8">
        <h5>透明度(1-100)%</h5>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="8">
        <a-input type="color" v-model="lineColorString" />
      </a-col>
      <a-col :span="8">
        <a-input-number :min="1" v-model="lineWidth" />
      </a-col>
      <a-col :span="8">
        <a-input-number :min="1" :max="100" v-model="alpha" />
      </a-col>
    </a-row>
    <h5 style="margin-top:5px;">线条类型</h5>
    <a-radio-group v-model="lineType">
      <a-radio-button v-for="item in typeList" :key="item.num" :value="item.num">
        {{item.name}}
      </a-radio-button>
    </a-radio-group>
    <a-button type="primary" @click="draw">开始绘制</a-button>
    <entityList class="line-list" :entityList="entityList" @removeByEntityId="reloadEntityList" />
  </div>
</template>
<script>
import PolylineRender from "@/adk/render_2D/PolylineRender.js"
import entityList from './entityList.vue'
let polylineRender = new PolylineRender(CIM.viewer)
export default {
  components: { entityList },
  props: {},
  data() {
    return {
      lineColorString: "#FFFF00",
      lineWidth: 4,
      lineType: 1,
      alpha: 100,
      entityList: [],
      typeList: [{
        num: 1,
        name: '折线',
      }, {
        num: 2,
        name: '自由线',
      }, {
        num: 3,
        name: '圆弧',
      }, {
        num: 4,
        name: '贝塞尔曲线',
      }]
    };
  },
  created() {
  },
  mounted() {
    this.reloadEntityList()
  },
  destroyed() {
    polylineRender.cancel()
  },
  computed: {
  },
  watch: {
  },
  methods: {
    draw() {
      let options = {
        colorString: this.lineColorString,
        width: this.lineWidth,
        alpha: this.alpha / 100
      }
      switch (this.lineType) {
        case 1:
          polylineRender.pickAndDrawPolyline(0, options).then(this.reloadEntityList)
          break
        case 2:
          polylineRender.pickAndDrawFreeline(0, options).then(this.reloadEntityList)
          break
        case 3:
          polylineRender.pickAndDrawArc(0, options).then(this.reloadEntityList)
          break
        case 4:
          this.$message.warning('贝塞尔曲线正在开发中!')
          break
      }
    },
    reloadEntityList() {
      this.entityList = polylineRender.getEntityList().map(item => {
        return { id: item.id, name: item.name }
      })
    }
  },
};
</script>
<style scoped>
.line-list {
  height: 500px;
}
</style>