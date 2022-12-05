<template>
  <div class="kg-box vscroll">
    <p>用于验证控规盒子内的建筑指标,是否超出控规限制，如建筑高度，建筑退线距离等。</p>
    <p class="tips">提示:请先在场景中选中控规盒子再进行分析</p>
    <div class="option_group">
      <div>
        <p>请选择控规数据加载方式：</p>
        <a-select default-value="all">
          <a-select-option v-for="item in types" :key="item.key" :value="item.key">
            {{ item.value }}
          </a-select-option>
        </a-select>
        <a-button type="primary" @click="getConditionBox">加载</a-button>
        <a-button type="danger" ghost @click="clearBoxLayer">清除</a-button>
      </div>
      <div>
        <p>请选择方案：</p>
        <div>
          <a-select default-value="1">
            <a-select-option v-for="item in programs" :key="item.key" :value="item.key">
              {{ item.value }}
            </a-select-option>
          </a-select>
          <a-button type="primary" disabled>应用方案</a-button>
        </div>
      </div>

    </div>
    <div class="analysis_group" v-show="analysisState">
      <div class="h4">分析</div>
      <a-button type="primary" @click="analysis">控规分析</a-button>
      <a-button @click="download">
        <a-icon type="download" /> 导出结果
      </a-button>
      <a-button type="danger" ghost @click="clearAnaResult">清除</a-button>
      <a-table v-if="tableArrFlag" :columns="columns" :data-source="tableArr" :rowKey="data => data.height" :scroll="{ y: 400 }" size="small" align="center" class="table">
      </a-table>
    </div>
  </div>
</template>
<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import RegulatoryPlanningAnalysis from "./js/regulatoryPlanningAnalysis.js";
import BacklineAnalysis from "../BacklineAnalysis/js/backlineAnalysis";
import axiosWraper from "@/views/js/net/axiosWraper";
// import downloadHelper from "@/sdk/utils/downloadHelper";
import initPoaLayer from "./js/config.js"

//建筑底面模拟数据
let buildingArea = [
  new Cesium.Cartesian3(
    -2322708.8242083667,
    5389847.319913666,
    2488666.383977779
  ),
  new Cesium.Cartesian3(
    -2322720.639849478,
    5389845.328392806,
    2488659.714329704
  ),
  new Cesium.Cartesian3(
    -2322729.6933224043,
    5389837.987696195,
    2488667.112828337
  ),
  new Cesium.Cartesian3(
    -2322721.535639824,
    5389838.7186712185,
    2488673.103076014
  ),
  new Cesium.Cartesian3(
    -2322754.1677685226,
    5389935.7421208015,
    2488713.722964369
  ),
  new Cesium.Cartesian3(
    -2322754.1677685226,
    5389935.7421208015,
    2488713.722964369
  ),
];
//控规盒子数据
let boxArea = [
  new Cesium.Cartesian3(
    -2322686.95780388,
    5389827.590512575,
    2488729.0976790185
  ),
  new Cesium.Cartesian3(
    -2322701.325712467,
    5389861.903515515,
    2488641.962307286
  ),
  new Cesium.Cartesian3(
    -2322845.519058959,
    5389798.281109307,
    2488645.14959729
  ),
  new Cesium.Cartesian3(
    -2322811.0610071546,
    5389775.8728520805,
    2488725.300969179
  ),
  new Cesium.Cartesian3(
    -2322811.0610071546,
    5389775.8728520805,
    2488725.300969179
  ),
];
let layerId = "";
let viewer = CIM.viewer;
const columns = [
  {
    title: "建筑名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "建筑高度",
    dataIndex: "height",
    key: "height",
  },
  {
    title: "建筑退线值",
    dataIndex: "backlineVal",
    key: "backlineVal",
  },
  {
    title: "限高合规性",
    dataIndex: "heightCompliance",
    key: "height",
  },
  {
    title: "退线合规性",
    dataIndex: "backlineCompliance",
    key: "height",
  },
  /*{
    title: "限高值(m)",
    dataIndex: "minh",
  },
  {
    title: "超高值",
    dataIndex: "remark",
    ellipsis: true,
  },*/
];
let backlineAnalysis = new BacklineAnalysis(viewer,"基底面");
let regulatoryPlanningAnalysis = new RegulatoryPlanningAnalysis({
  viewer,
  layerName: "规划管理单元",
});
let programs = [
  { key: "1", value: "默认方案" },
  { key: "2", value: "方案1" },
  { key: "3", value: "方案2" },
];
let types = [
  { key: "all", value: "全图加载" },
  { key: "extent", value: "当前视图范围" },
];
export default {
  data() {
    return {
      columns,
      tableArr: [],
      tableArrFlag: false,
      analysisState: false,
      types,
      programs,
    };
  },
  mounted() {
    viewer.scene.globe.depthTestAgainstTerrain = false;
    widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  methods: {
    //加载数据
    getConditionBox() {
      this.clearBoxLayer();
      regulatoryPlanningAnalysis.getData({
        name: "规划管理单元",
        buildingArea,
        boxArea,
      });
      this.analysisState = true;
    },
    //获取分析结果
    analysis() {
      this.clearAnaResult();
      let that = this;
      let re = regulatoryPlanningAnalysis.analysis(buildingArea) || [];
      that.tableArrFlag = true;
      if (re.length > 0) {
        backlineAnalysis.analysis(
                30, //退线距离
                re[0].box.object._polygon.hierarchy._value.positions, //控规盒子
                [buildingArea] //建筑基底面
        );
      }
      var  backlineResult=backlineAnalysis.result[0][0];
      re.forEach(function (item) {
        that.tableArr.push({
          name: item.building.name,
          height: item.building.height,
          backlineVal:backlineResult.distance,
          heightCompliance:(item.building.height - item.box.height) < 0 ? '合规':'不合规',
          backlineCompliance:(backlineResult.distance - 30) < 0 ? '合规':'不合规',
        });
      });
    },
    //清除分析结果
    clearAnaResult() {
      regulatoryPlanningAnalysis.results = [];
      this.tableArr = [];
      this.tableArrFlag = false;
      backlineAnalysis.clear();
    },
    //清除盒子
    clearBoxLayer() {
      this.clearAnaResult();
      regulatoryPlanningAnalysis.clear();
      this.analysisState = false;
    },
    /**
     * @author: pwz（潘文周）
     * @description: 方法描述 下载控规分析报告
     * @param {*}
     * @return {*}
     */
    download() {
      let result = this.tableArr;
      if (result.length == 0) return;
      let params = [];
      for (let i = 0; i < result.length; i++) {
        params.push({
          name: result[i].name.toString(),
          actualDistance: result[i].height.toString(),
          controlDistance: result[i].minh.toString(),
        });
      }
      this.pdfDownload(params).then(
        (resp) => {
          let href = window.URL.createObjectURL(new Blob([resp]));
          //downloadHelper.downloadByA(href, "控规盒子分析报告.pdf");
        },
        (err) => {}
      );
    },
    /**
     * @author: pwz（潘文周）
     * @description: 方法描述 下载报告接口
     * @param {*}
     * @return {*}
     */
    async pdfDownload(params) {
      let proxyUrl = "/agsupport-rest";
      let url = `/agsupport/applicationManager/analysisReport/download`;
      return axiosWraper.downFile(proxyUrl + url, params);
    },
  },
  destroyed() {},
};
</script>
<style scoped>
.kg-box {
  padding: 10px;
}
.tips {
  margin: 20px 0;
  background: #fdfae9;
  text-align: center;
  font-size: 14px;
  border: 1px solid #e4dba6;
  line-height: 16px;
  padding: 4px;
}
.h4 {
  margin: 20px 0;
}
.ant-btn {
  margin-right: 10px;
}
.table {
  margin-top: 20px;
}
</style>