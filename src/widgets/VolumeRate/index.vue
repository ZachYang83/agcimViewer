
<!--
 * @author: pwz（潘文周）
 * @description: 文件描述 容积率分析
-->



<template>
  <div class="volumerate">
    <div class="gap">
      <p>容积率是指一定地块内，总建筑面积与区域总面积的比值。</p>
    </div>
    <div>分析范围设定</div>
    <div>
      方式一：绘制计算区域<a-button type="primary" class="left" @click="draw">绘制</a-button>
      <a-button type="danger" class="clear" @click="clear">清除</a-button>
    </div>
    <div style="margin-top:10px">
      方式二：选择计算区域<a-button type="primary" class="right" disabled>导入</a-button>
    </div>
    <div>计算结果</div>
    <a-form-item label="区域总面积（平方米）">
      <a-input v-model="area" disabled />
    </a-form-item>
    <a-form-item label="总建筑面积（平方米）">
      <a-input v-model="buildingAllArea" disabled />
    </a-form-item>
    <a-form-item label="容积率">
      <a-input v-model="volumeRates" disabled />
    </a-form-item>
  </div>
</template>

<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import VolumeRate from "./js/volumeRate.js";
import initPoaLayer from "./js/config";

let viewer = CIM.viewer;
let volumeRate = new VolumeRate({
  viewer,
  url: "http://192.168.3.203:8080/geoserver/agcim/ows",
  typename: "agcim:保利天悦基底面2",
});

export default {
  components: {},
  props: {},
  data() {
    return {
      area: 0,
      buildingAllArea: 0,
      volumeRates: 0,
    };
  },
  created() {},
  mounted() {
    widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  beforeDestroy() {
    volumeRate.clear();
  },
  computed: {},
  watch: {},
  methods: {
    //绘制查询
    draw() {
      this.clear();
      volumeRate.draw().then((data) => this.getResult(data));
    },
    // 处理wfs查询结果，并计算容积率
    getResult(data) {
      volumeRate.getResult(data, "SHAPE_Area", "FLOOR").then((result) => {
        this.area = result.area;
        this.buildingAllArea = result.buildingAllArea;
        this.volumeRates = result.volumeRates;
      });
    },
    //清除
    clear() {
      this.area = 0;
      this.buildingAllArea = 0;
      this.volumeRates = 0;
      volumeRate.clear();
    },
  },
};
</script>

<style scoped>
.volumerate {
  padding: 0 10px;
}

.gap {
  margin: 10px 0;
}

.left {
  margin-left: 10px;
}

.right {
  margin-left: 10px;
}

.clear {
  margin-left: 10px;
}
.volumerate .ant-input[disabled] {
  color: rgba(0, 0, 0, 0.75);
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 1;
}
</style>