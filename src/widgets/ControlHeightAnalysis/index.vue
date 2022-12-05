<!--
 * @author: pwz（潘文周）
 * @description: 文件描述 空高分析
-->

<template>
  <div class="controlheight">
    <div class="gap">
      <p>根据地块的控制性高度要求，对建筑的高度进行分析，监
        测其是否在控高范围。</p>
    </div>
    <div class="btn-group gap">
      <a-button type="primary" class="left" @click="draw">绘制区域</a-button>
      <a-button type="danger" class="right" @click="clear">清除区域</a-button>
    </div>
    <div class="gap">
      <div>限高值(米)：</div>
      <a-input-number v-model="limitHeight" />
    </div>

    <div class="gap" v-show="analysisState">
      <span>执行分析</span>
      <a-button type="primary" ghost class="right" @click="analysis">开始分析</a-button>
      <div class="gap" v-show="tableArr.length>0">
        <span>分析结果</span>
        <a-table :columns="columns" :data-source="tableArr" :scroll="{ y: 400 }" size="small" align="center" class="table">
        </a-table>
      </div>
    </div>
  </div>
</template>

<script>
import ControlHeightAnalysis from "./js/index.js";

let viewer = CIM.viewer;
const initPoaLayer = {
  position: {
    arr: [-2329000.1834026324, 5388929.478025527, 2487315.993270583],
    heading: 6.197010507346985,
    roll: 6.282665961080708,
    pitch: -1.1560179672688338,
  },
};
let controlHeightAnalysis = new ControlHeightAnalysis({
  viewer,
  buildingAreaName: "基底面",
  boxLayerName: "二类居住用地",
});
const columns = [
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "实际高度(m)",
    dataIndex: "height",
  },
  {
    title: "限高值(m)",
    dataIndex: "limitHeight",
  },
  {
    title: "超高值(m)",
    dataIndex: "moreHeight",
  },
];

let buildingAreas;
export default {
  components: {},
  props: {},
  data() {
    return {
      tableArr: [],
      columns,
      limitHeight: 100,
      analysisState: false,
    };
  },
  created() {},
  mounted() {
    agcim.ui.widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  destroyed() {},
  computed: {},
  watch: {},
  methods: {
    draw() {
      let that = this;
      //绘制控高盒子
      controlHeightAnalysis.drawControlHeightPolygon(function (
        data,
        buildingArea
      ) {
        that.analysisState = true;
        controlHeightAnalysis.addBoxLayer({
          points: data,
          limitHeight: that.limitHeight,
        });
        buildingAreas = buildingArea.map(item=>item.positions);
      });
    },
    analysis() {
      let that = this;
      //进行控高分析
      controlHeightAnalysis.analysis(buildingAreas);
      this.tableArr = controlHeightAnalysis.results.map(function (item) {
        return {
          name: "建筑A",
          height: item.building.height,
          limitHeight: that.limitHeight,
          moreHeight: (
            Number.parseFloat(item.building.height) - that.limitHeight
          ).toFixed(2),
        };
      });
    },
    clear() {
      //清除控高数据
      controlHeightAnalysis.clear();
      this.tableArr = [];
      this.analysisState = false;
    },
  },
};
</script>

<style scoped>
.controlheight {
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
</style>