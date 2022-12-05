<!--
 * @author: 张瀚
 * @description: 二维绘制-二维面绘制
-->
<template>
  <div class="render">
    <a-row align="middle">
      <a-col :span="8">
        <h5>填充颜色</h5>
      </a-col>
      <a-col :span="8">
        <h5>轮廓颜色</h5>
      </a-col>
      <a-col :span="8">
        <h5>透明度(1-100)%</h5>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="8">
        <a-input type="color" v-model="fillColorString" />
      </a-col>
      <a-col :span="8">
        <a-input type="color" v-model="outlineColorString" />
      </a-col>
      <a-col :span="8">
        <a-input-number :min="1" :max="100" v-model="alpha" />
      </a-col>
    </a-row>
    <h5 style="margin-top:5px;">绘制面类型</h5>
    <a-radio-group v-model="polygonType">
      <a-radio-button v-for="item in typeList" :key="item.num" :value="item.num">
        {{item.name}}
      </a-radio-button>
    </a-radio-group>
    <a-button type="primary" @click="draw">开始绘制</a-button>
    <entityList class="entity-list" :entityList="entityList" @removeByEntityId="reloadEntityList" />
  </div>
</template>
<script>
import PolygonRender from "@/adk/render_2D/PolygonRender.js";
import entityList from './entityList.vue'
let polygonRender = new PolygonRender(CIM.viewer);
export default {
  components: {
    entityList
  },
  props: {},
  data() {
    return {
      fillColorString: "#FFFF00",
      outlineColorString: "#000000",
      polygonType: 1,
      entityList: [],
      alpha: 100,
      typeList: [{
        num: 1,
        name: '多边形',
      }, {
        num: 2,
        name: '圆形',
      }, {
        num: 3,
        name: '箭头',
      }, {
        num: 4,
        name: '多箭头',
      },]
    };
  },
  created() {
  },
  mounted() {
    this.reloadEntityList()
  },
  destroyed() {
    polygonRender.cancel()
  },
  computed: {
  },
  watch: {},
  methods: {
    draw() {
      switch (this.polygonType) {
        case 1:
          polygonRender.pickAndDrawPolygon({
            colorString: this.fillColorString,
            outlineColorString: this.outlineColorString,
            alpha: this.alpha / 100,
          }).then(this.reloadEntityList)
          break
        case 2:
          polygonRender.pickAndDrawCircle({
            colorString: this.fillColorString,
            outlineColorString: this.outlineColorString,
            alpha: this.alpha / 100,
          }).then(this.reloadEntityList)
          break
        case 3:
          polygonRender.pickAndDrawArrow({
            colorString: this.fillColorString,
            outlineColorString: this.outlineColorString,
            alpha: this.alpha / 100,
          }).then(this.reloadEntityList)
          break
        case 4:
          polygonRender.pickAndDrawArrows({
            colorString: this.fillColorString,
            outlineColorString: this.outlineColorString,
            alpha: this.alpha / 100,
          }).then(this.reloadEntityList)
          break
      }
    },
    reloadEntityList() {
      this.entityList = polygonRender.getEntityList().map(item => {
        return { id: item.id, name: item.name }
      })
    }
  },
};
</script>
<style scoped>
.entity-list {
  height: 500px;
}
</style>