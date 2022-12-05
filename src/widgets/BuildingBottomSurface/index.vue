
<!--
 * @author: ML（梅兰）
 * @description: 文件描述 建筑底面积提取
-->

<template>
  <div class="bottomSurface">
    <div class="gap">
      <p>通过指定三维建筑模型所在的范围或选择单个建筑，自动提取出建筑模型的二维底图</p>
    </div>
    <a-divider />
    <div class="btn-group gap">
      <a-button type="primary" class="left" @click="draw">绘制区域</a-button>
      <a-button type="primary" class="left" @click="pick">拾取建筑</a-button>
      <a-button type="danger" class="right" @click="clear">清除</a-button>
    </div>

    <div class="gap" v-show="analysisState">
      <div class="gap" v-show="tableArr.length>0">
        <span>分析结果</span>
        <a-table :columns="columns" :data-source="tableArr" :customRow="Rowclick" :rowKey="(data) => data.id" :scroll="{ y: 400 }" size="small" align="center" class="table">
        </a-table>
      </div>
    </div>

  </div>
</template>

<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import BuildingBottomSurface from "./js/index.js";
import initPoaLayer from "./js/config";
let viewer = CIM.viewer;
let buildingBottomSurface = new BuildingBottomSurface({
  viewer,
  url: "http://192.168.3.203:8080/geoserver/agcim/ows",
  typename: "agcim:保利天悦基底面2",
});

const columns = [
  {
    title: "建筑名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "基底面积(m)",
    dataIndex: "area",
  },
];
export default {
  components: {},
  props: {},
  data() {
    return {
      tableArr: [],
      columns,
      analysisState: false,
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
      buildingBottomSurface.drawPolygons().then((data) => this.getResult(data));
    },
    //拾取
    pick() {
      this.clear();
      buildingBottomSurface.pickBuilding().then((data) => this.getResult(data));
    },
    // 处理wfs查询结果，并计算建筑底面面积
    getResult(data) {
      buildingBottomSurface
        .queryContainArea(data.points, data.type)
        .then((result) => {
          this.analysisState = true;
          this.tableArr = []; //表格显示数据
          this.tableArr = buildingBottomSurface.createTableDataBywfs(
            result.features
          );
        });
    },
    //点击表格
    Rowclick(record, index) {
      return {
        on: {
          click: () => {
            buildingBottomSurface.flyToEntityByID(record.id);
          },
        },
      };
    },
    //清除
    clear() {
      buildingBottomSurface.remove();
      this.tableArr = [];
    },
  },
};
</script>

<style scoped>
.bottomSurface {
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