<!--
 * @author: 张瀚
 * @description: 文字绘制
-->
<template>
  <div class="render">
    <a-row align="middle">
      <a-col :span="8">
        <h5>文字颜色</h5>
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
        <a-input type="color" v-model="textColorString" />
      </a-col>
      <a-col :span="8">
        <a-input type="color" v-model="outlineColorString" />
      </a-col>
      <a-col :span="8">
        <a-input-number :min="1" :max="100" v-model="alpha" />
      </a-col>
    </a-row>
    <a-row align="middle">
      <a-col :span="8">
        <h5>文字大小(像素)</h5>
      </a-col>
      <a-col :span="8">
        <h5>轮廓宽度(像素)</h5>
      </a-col>
    </a-row>
    <a-row align="middle">
      <a-col :span="8">
        <a-input-number :min="1" v-model="textSize" />
      </a-col>
      <a-col :span="8">
        <a-input-number :min="0" v-model="outlineWidth" />
      </a-col>
    </a-row>
    <a-input v-model="text" placeholder="请输入文字内容" allow-clear class="label-input" />
    <a-button type="primary" @click="draw">开始绘制</a-button>
    <entityList class="entity-list" :entityList="entityList" @removeByEntityId="reloadEntityList" />
  </div>
</template>
<script>
import LabelRender from "@/adk/render_2D/LabelRender.js"
import entityList from './entityList.vue'
let labelRender = new LabelRender(CIM.viewer)
export default {
  components: { entityList },
  props: {},
  data() {
    return {
      textColorString: "#0040FF",
      outlineColorString: "#000000",
      textSize: 24,
      outlineWidth: 0,
      alpha: 100,
      text: "",
      entityList: []
    };
  },
  created() {
  },
  mounted() {
    this.reloadEntityList()
  },
  destroyed() { 
    labelRender.cancel()
  },
  computed: {
  },
  watch: {
  },
  methods: {
    draw() {
      if (this.text.length == 0) {
        this.$message.warn("请输入文字内容!")
        return
      }
      labelRender.pickAndDrawLabelOnce(this.text, undefined, {
        fillColorString: this.textColorString,
        pixelSize: this.textSize,
        outlineColorString: this.outlineColorString,
        outlineWidth: this.outlineWidth,
        alpha: this.alpha / 100
      }).then(this.reloadEntityList)
    },
    reloadEntityList() {
      this.entityList = labelRender.getEntityList().map(item => {
        return { id: item.id, name: item.name }
      })
    }
  },
};
</script>
<style scoped>
.entity-list {
  height: 450px;
}
</style>