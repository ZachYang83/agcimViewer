<!--
 * @author: pwz（潘文周）
 * @description:  建筑密度计算
-->

<template>
  <div class="buildingdenity">
    <div class="gap">
      <p>计算指定区域内建筑密度。</p>
    </div>
    <div>
      方式一：绘制区域<a-button type="primary" class="left" @click="draw">绘制</a-button>
      <a-button type="danger" class="clear" @click="clear">清除</a-button>
    </div>
    <div style="margin-top:10px">
      方式二：选择区域<a-button type="primary" class="right" disabled>导入</a-button>
    </div>

    <div class="gap" v-show="analysisState">
      <div class="gap">
        <span>计算结果</span>
        <a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-model-item label="区域总面积(平方米)">
            <a-input v-model="form.allArea" disabled />
          </a-form-model-item>
          <a-form-model-item label="建筑基底总面积(平方米)">
            <a-input v-model="form.buildingAllArea" disabled />
          </a-form-model-item>
          <a-form-model-item label="总建筑面积(平方米)">
            <a-input v-model="form.buildingAllArea" disabled />
          </a-form-model-item>
          <a-form-model-item label="建筑密度(%)">
            <a-input v-model="form.buidingDesnsity" disabled />
          </a-form-model-item>
          <a-form-model-item label="建筑面积密度(平方米/公顷)">
            <a-input v-model="form.buidingAreaDesnsity" disabled />
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>
  </div>
</template>

<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import BuildingDensity from "./js/buildingDensity.js";
import initPoaLayer from "./js/config";
let viewer = CIM.viewer;
let buildingDensity = new BuildingDensity({
  viewer,
  url: "http://192.168.3.203:8080/geoserver/agcim/ows",
  typename: "agcim:保利天悦基底面2",
});
export default {
  components: {},
  props: {},
  data() {
    return {
      analysisState: true,
      labelCol: { span: 10 },
      wrapperCol: { span: 8 },
      form: {
        allArea: 0, //区域总面积
        baseAllArea: 0, //建筑基底总面积
        buildingAllArea: 0, //总建筑面积
        buidingDesnsity: 0, //建筑密度
        buidingAreaDesnsity: 0, //建筑面积密度
      },
    };
  },
  created() {},
  mounted() {
    widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  destroyed() {
    this.clear();
  },
  computed: {},
  watch: {},
  methods: {
    //绘制区域
    draw() {
      buildingDensity.draw().then((data) => {
        buildingDensity
          .getResult(data, "SHAPE_Area", "FLOOR")
          .then((result) => {
            this.form = Object.assign({}, this.form, result);
          });
      });
    },
    //清除
    clear() {
      buildingDensity.clear();
      this.form = {
        allArea: 0,
        baseAllArea: 0,
        buildingAllArea: 0,
        buidingDesnsity: 0,
        buidingAreaDesnsity: 0,
      };
    },
  },
};
</script>

<style  scoped>
.buildingdenity {
  padding: 0 10px;
}
.btn-group {
  text-align: center;
}
.btn-group .left {
  margin-right: 10px;
}
.gap {
  margin: 10px 0;
}
.clear {
  float: right;
  margin-right: 20px;
}
.buildingdenity .ant-input[disabled] {
  color: rgba(0, 0, 0, 0.75);
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 1;
}
</style>