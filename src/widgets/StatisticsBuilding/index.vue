
<!--
 * @author: pwz（潘文周）
 * @description: 文件描述 建筑量分析
-->

<template>
  <div class="group">
    <div>
      <p>指在一定范围内，分析改范围的建筑总量，列表范围内单个建筑的类型，建筑面积等信息</p>
    </div>
    <div>
      <a-row>
        <a-col :span="12">
          选择分析范围
        </a-col>
        <a-col :span="12">
          <a-button type="danger" class="clear" @click="clear">清除</a-button>
        </a-col>
      </a-row>
      <div>
        方式一：<a-button type="primary" class="left" @click="draw">绘制范围</a-button>
      </div>
      <div style="margin-top: 10px;">
        方式二：<a-button type="primary" class="right" disabled>导入</a-button>
      </div>
    </div>
    <div class="initerval">
      <a-row>
        <a-col :span="12">
          <a-button type="primary" class="left" @click="analysis" :disabled="areaPolyge.length<1">执行分析</a-button>
        </a-col>
        <a-col :span="12">
          自动分析
          <a-switch :checked="analysisState" @change="analysisStateFn" />
        </a-col>
      </a-row>
    </div>
    <div v-show="tableArr.length>0">
      <p>
        分析结果
      </p>
      <div>
        <p>该区域范围共包含{{buildingCount}}栋建筑，详细信息如下</p>
        <a-table v-show="tableArr.length > 0" :columns="columns" :customRow="Rowclick" :data-source="tableArr" :scroll="{ y: 600 }" size="small" class="table" :rowKey="
        (tableArr, index) => {
          return index;
        }
      ">
          <template slot="title"> 建筑量分析 </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import StatisticsBuilding from "./js/index.js";
import initPoaLayer from "./js/config.js";

var viewer = CIM.viewer;
let statisticsBuilding = new StatisticsBuilding({
  viewer,
  url: "http://192.168.3.203:8080/geoserver/agcim/ows",
  typename: "agcim:保利天悦基底面2",
});

let polygon1 = new Cesium.PolygonHierarchy(
  Cesium.Cartesian3.fromDegreesArray([
    113.3718901891175,
    23.1036722184379,
    113.37288669018035,
    23.103793684171418,
    113.3729207384904,
    23.10564712681597,
    113.37189896619358,
    23.105550360533964,
  ])
);
let polygon2 = new Cesium.PolygonHierarchy(
  Cesium.Cartesian3.fromDegreesArray([
    113.37302129397754,
    23.106078116440674,
    113.37308985431407,
    23.10507895869536,
    113.37516035759143,
    23.105886671054055,
    113.37505008700346,
    23.10656193350198,
    113.37381758816788,
    23.106432165017395,
    113.37381807247802,
    23.10642173769945,
  ])
);
const columns = [
  {
    title: "建筑名称",
    dataIndex: "name",
  },
  {
    title: "建筑类型",
    dataIndex: "type",
  },

  {
    title: "建筑底面/㎡",
    dataIndex: "area",
  },
  {
    title: "建筑总面积/㎡",
    dataIndex: "buildingArea",
  },
];
export default {
  components: {},
  props: {},
  data() {
    return {
      columns,
      tableArr: [],
      buildingCount: 0,
      analysisState: true,
      areaPolyge: [],
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
    //绘制
    draw() {
      this.clear();
      statisticsBuilding.draw().then((data) => {
        this.areaPolyge = data;
        //自动分析状态，直接分析
        if (this.analysisState) this.getResult(this.areaPolyge);
      });
    },
    //分析
    analysis() {
      this.getResult(this.areaPolyge);
    },
    //是否自动分析
    analysisStateFn() {
      this.analysisState = !this.analysisState;
    },
    //计算结果
    getResult(data) {
      statisticsBuilding
        .getResult(data, "SHAPE_Area", "FLOOR")
        .then((result) => {
          this.buildingCount = result.length;
          this.tableArr = result;
        });
    },
    //点击表格
    Rowclick(record, index) {
      return {
        on: {
          click: () => {
            statisticsBuilding.flyToEntityByID(record.id);
          },
        },
      };
    },
    //清除
    clear() {
      this.tableArr = [];
      this.areaPolyge = [];
      statisticsBuilding.clear();
    },
  },
};
</script>

<style scoped>
.group {
  padding: 10px;
}
.clear {
  float: right;
  margin-right: 20px;
}
.initerval {
  margin-top: 10px;
}
</style>