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
const initPoaLayer = {
  position: {
    arr: [-2323309.5795875224, 5390128.234472786, 2489716.017575635],
    heading: 1.5771698238069627,
    roll: 0.005843586690104985,
    pitch: -1.1437816443413835,
  },
};
const buildingArea1 = [
  new Cesium.Cartesian3(
    -2323270.568447585,
    5389233.9295957815,
    2489464.904794381
  ),
  new Cesium.Cartesian3(
    -2323250.416055437,
    5389244.57203474,
    2489460.7011303124
  ),
  new Cesium.Cartesian3(
    -2323271.4987133914,
    5389274.761689283,
    2489376.238298053
  ),
  new Cesium.Cartesian3(
    -2323292.5548296217,
    5389265.731833034,
    2489376.1365641425
  ),
  new Cesium.Cartesian3(
    -2323328.947601315,
    5389350.1509549245,
    2489415.393722661
  ),
];
const buildingArea2 = [
  new Cesium.Cartesian3(
    -2323407.4823251697,
    5389170.989484063,
    2489473.3236178043
  ),
  new Cesium.Cartesian3(
    -2323365.944356831,
    5389182.840276293,
    2489486.3481156933
  ),
  new Cesium.Cartesian3(
    -2323370.3066417365,
    5389191.048511142,
    2489464.654017375
  ),
];
const buildingArea3 = [
  new Cesium.Cartesian3(
    -2323419.939680506,
    5389200.245910938,
    2489398.8639220567
  ),
  new Cesium.Cartesian3(
    -2323380.209449098,
    5389218.421660493,
    2489396.612005698
  ),
  new Cesium.Cartesian3(
    -2323416.180688261,
    5389218.466422826,
    2489363.167674712
  ),
  new Cesium.Cartesian3(
    -2323481.6798359933,
    5389370.393236209,
    2489433.8179740626
  ),
];
const buildingAreas = [buildingArea1, buildingArea2, buildingArea3];
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
    agcim.ui.widgetConfigHelper.setInitSence(initPoaLayer);
 
  },
  destroyed() {},
  computed: {},
  watch: {},
  methods: {
    draw() {
  
    },
    analysis() {
   
    },
    clear() {
  
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