<!--
 * @author: pwz（潘文周）
 * @description: 文件描述 退线分析
-->
<!--
 * @author: 张瀚
 * @Bugs: 
 * 1、
 * @Futures: 
 * 1、点击左边列表，应该高亮且置顶对应的线条并且flyTo对应的线
 * 2、左边列表应该默认以违规幅度从大到小排列，序号也是保持一致
 * @Suggestion: 
 * 1、从默认方案加载功能，现在没有的就先隐藏掉
-->
<template>
  <div class="kg-box vscroll">
    <p>
      用于验证建筑红线与用地红线之间的距离,是否超出控制范围。
    </p>
    <p class="tips">
      提示:请先在场景中绘制道路中线再进行分析，以左上角为起点，顺时针绘制
    </p>
    <p>
      <a-button type="primary" @click="drawPolygon">绘制</a-button>
      <a-button type="primary" disabled tile="暂不支持此功能">从默认方案加载</a-button>
    </p>
    <div class="backline-distance">
      退线距离限制(米)：
      <a-input-number v-model="backlineDistance" />
    </div>
    <div v-show="analysisState">
      <div class="h4">分析</div>
      <a-button type="primary" @click="analysis">退线分析</a-button>
      <a-button @click="download" :disabled="backlineResults.length<=0">
        <a-icon type="download" /> 导出结果
      </a-button>
      <a-button type="danger" ghost @click="clear">清除</a-button>

      <a-table v-show="backlineResults.length > 0" :customRow="Rowclick" :columns="columns" :data-source="backlineResults" :rowKey="(data) => data.name" :scroll="{ y: 600 }" size="small" align="center" class="table">
      </a-table>
    </div>
  </div>
</template>
<script>
import BacklineAnalysis from "./js/backlineAnalysis";
import axiosWraper from "@/views/js/net/axiosWraper";
//import downloadHelper from "@/sdk/utils/downloadHelper";
import initPoaLayer from "./js/config.js";
import camera from "@/sdk/camera/camera.js";

let viewer = CIM.viewer;
let backlinePoints = null;
let buildPositions = [];
let backlineAnalysis = new BacklineAnalysis(viewer, "基底面");

const columns = [
  {
    title: "序号",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "距离(m)",
    dataIndex: "distance",
    key: "distance",
  },
  {
    title: "限制(m)",
    dataIndex: "backlineDistance",
    key: "backlineDistance",
  },
  {
    title: "超出(m)",
    dataIndex: "difference",
    key: "difference",
  },
];

export default {
  data() {
    return {
      columns,
      backlineResults: [],
      backlineDistance: 15,
      analysisState: false,
    };
  },
  mounted() {
    agcim.ui.widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  methods: {
    //绘制红线
    drawPolygon() {
      let that = this;
      //绘制退线红线几何图形
      backlineAnalysis.drawBacklinePolygon(function (data, buildingAreas) {
        if (!buildingAreas) return;
        buildPositions = buildingAreas.map((item) => item.positions);
        backlinePoints = data;
        that.analysisState = true;
      });
    },
    //执行分析
    analysis() {
      if (backlinePoints == null) {
        this.$message.error(`请先绘制道路中线！`);
        return;
      }
      backlineAnalysis.analysis(
        this.backlineDistance, //退线距离
        backlinePoints, //红线的范围
        buildPositions, //建筑底面范围
        true
      );

      this.backlineResults = backlineAnalysis.result.flat(3);
    },
    //下载分析结果
    download() {
      let result = backlineAnalysis.result;
      if (result.length == 0) return;
      let params = [];
      for (let i = 0; i < result.length; i++) {
        let data = {};
        data.name = result[i].name.toString();
        data.actualDistance = result[i].distance.toString();
        data.controlDistance = result[i].backlineDistance.toString();
        data.differenceValue = result[i].difference.toString();
        params.push(data);
      }
      this.pdfDownload(params).then(
        (resp) => {
          let href = window.URL.createObjectURL(new Blob([resp]));
         // downloadHelper.downloadByA(href, "退线分析报告.pdf");
        },
        (err) => {}
      );
    },
    //下载分析结果
    async pdfDownload(params) {
      let proxyUrl = "/agsupport-rest";
      let url = `/agsupport/applicationManager/analysisReport/download`;
      return axiosWraper.downFile(proxyUrl + url, params);
    },
    //清除分析结果
    clear() {
      this.backlineResults = [];
      backlinePoints = null;
      backlineAnalysis.clear();
      this.analysisState = false;
    },
    Rowclick(record, index) {
      return {
        on: {
          click: () => {
            backlineAnalysis.flyToLine(record.object);
          },
        },
      };
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
.backline-distance {
  padding: 10px;
}
</style>
