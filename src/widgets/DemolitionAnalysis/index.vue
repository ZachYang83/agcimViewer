
<!--
 * @author: ydy (袁达懿)
 * @description: 拆迁量分析
-->
<template>
  <div class='controlheight'>
    <div class="gap">
      <p>在指定的区域范围内，设置拆迁单位并获取该区域范围的房屋总建筑面积，计算出预估拆迁费用，并将结果数据显示在页面上</p>
    </div>
    <div>
      方式一：绘制计算区域<a-button type="primary" class="left" @click="draw">绘制</a-button>
      <a-button type="danger" class="clear" @click="clear">清除</a-button>
    </div>
    <div style='margin-top: 10px'>
      方式二：选择计算区域<a-button type="primary" class="right" disabled>导入</a-button>

    </div>

    <a-form-item label="设置拆迁价（万元）：">
      <a-input v-model="demoliMoney" placeholder="请输入拆迁价" prefix="￥" type="number" />
      <a-button @click='getResult' type="primary" :disabled="!(demoliMoney>0 && result.length>0)">执行分析</a-button>

    </a-form-item>

    <div v-show="showresult">
      <div>计算结果</div>
      <a-form-item label="区域总面积（平方米）">
        <a-input v-model="buildingAllArea" disabled />
      </a-form-item>
      <a-form-item label="拆迁面积（平方米）">
        <a-input v-model="demoliAllArea" disabled />
      </a-form-item>
      <a-form-item label="预估拆迁费用（万元）">
        <a-input v-model="demoliMoneyByAllCost" disabled />
      </a-form-item>
    </div>
  </div>
</template>

<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import DemolitionAnalysis from "./js/index.js";
import initPoaLayer from "./js/config.js";
import * as turf from "@turf/turf";

var viewer = CIM.viewer;
let demolitionAnalysis = new DemolitionAnalysis({
  viewer,
  buildingAreaName: "基底面",
  url: "http://192.168.3.203:8080/geoserver/agcim/ows",
  // url: "/test_bm/ows",
  typename: "agcim:保利天悦基底面2",
  // typename: "test_bm:bm2",
});

export default {
  components: {},
  props: {},
  data() {
    return {
      buildingAllArea: 0, // 区域总面积
      demoliAllArea: 0, // 拆迁面积
      demoliMoneyByAllCost: 0, //拆迁总费用
      demoliMoney: "",
      result: [],
      showresult: false,
    };
  },
  created() {},
  mounted() {
    widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  destroyed() {
    demolitionAnalysis.clear();
  },
  computed: {},
  watch: {},
  methods: {
    async getResult() {
      if (this.result.length > 0) {
        this.showresult = true;
        //直接计算结果
        if (this.demoliAllArea && this.demoliMoney) {
          this.demoliMoneyByAllCost = demolitionAnalysis.getDemoliCost(
            this.demoliMoney,
            this.demoliAllArea
          );
          return;
        }
        let result = await demolitionAnalysis.getResult(
          this.result,
          this.demoliMoney
        );
        this.demoliAllArea = result.demoliAllArea; //拆迁面积
        this.buildingAllArea = result.buildingAllArea; //区域总面积
        //拆迁总费用
        this.demoliMoneyByAllCost = result.demoliMoneyByAllCost;
      }
    },
    // 绘制
    draw() {
      this.clear();
      demolitionAnalysis.draw().then((data) => (this.result = data));
    },
    //清除
    clear() {
      this.showresult = false;
      this.result = [];
      this.buildingAllArea = 0; // 区域总面积
      this.demoliAllArea = 0; // 拆迁面积
      this.demoliMoneyByAllCost = 0; //拆迁总费用
      demolitionAnalysis.remove();
    },
  },
};
</script>

<style scoped>
.clear {
  margin-left: 10px;
}
.left {
  margin-left: 10px;
}
.result-font {
  color: rgba(0, 0, 0, 0.85);
}
.gap {
  margin: 10px 0;
}
.controlheight {
  padding: 0 10px;
}
.controlheight .ant-input[disabled] {
  color: rgba(0, 0, 0, 0.75);
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 1;
}
</style>