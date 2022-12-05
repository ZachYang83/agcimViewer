<template>
  <div class="ex-page">
    <!-- 视频 -->
    <ag-popup
      v-model="visible"
      :title="name"
      @onCancel="onCancel"
      class="popup-box"
    >
      <div class="content">
        <video id="video" muted autoplay="autoplay" name="media" width="100%">
          <source
            src="http://81.71.142.155:6700/video/featureIdentification/result.mp4"
            type="video/mp4"
          />
          您的浏览器不支持此种视频格式。
        </video>
        <!-- <img id="target" width="100%" alt="result" />
        <div id="statistics" class="box"></div> -->
      </div>
    </ag-popup>
  </div>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import videoRecognite from "./js/videoRecognite";
import PickerHelper from "@/sdk/interactive/pickerHelper";

import AgFeatureLayer from "@/sdk/layer/featureLayer";
// import agCamera from "@/sdk/camera/camera";
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);
let vrData = require("./data/village_baolitianyue.json");

import echarts from "echarts/lib/echarts";
require("echarts/lib/chart/line");
require("echarts/lib/component/title");
require("echarts/lib/component/tooltip");

let viewer = null;
let pickerHelper = null;
let handler = null;
let ws = null;
var myChart = null;
var xarr = [];
var yarr = [];
export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: false,
      name: "南门摄像头2",
    };
  },
  mounted() {
    viewer = CIM.viewer;
    pickerHelper = new PickerHelper(viewer);
    this.addVillageRail();
    this.addEvent();
    // myChart = echarts.init(document.getElementById("statistics"));
    this.video(0.5);
  },
  methods: {
    video(t) {
      var video = document.getElementById("video");
      video.playbackRate = t;
    },
    onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
      if (ws) {
        ws.close();
        ws = null;
      }
    },
    addEvent() {
      let vm = this;
      pickerHelper.on("LEFT_CLICK", function(movement) {
        var pick = viewer.scene.pick(movement.position);
        if (pick && pick.tileset && pick.tileset.agMetaData) {
          vm.name = pick.tileset.agMetaData.nameCn;
          let vObj = null;
          switch (vm.name) {
            case "南门摄像头2":
              vObj = {
                type: "pedestrian",
                video_path: "video/pedestrian2.mp4",
              };
              vm.visible = true;
              break;
            case "北门摄像头1":
              vObj = {
                type: "pedestrian",
                video_path: "video/pedestrian2.mp4",
              };
              break;
            case "东门摄像头1":
              vObj = {
                type: "car",
                video_path: "video/car1.mp4",
              };
              break;
            case "西一门摄像头1":
              vObj = {
                type: "car",
                video_path: "video/car1.mp4",
              };
              break;
            case "西二门摄像头2":
              vObj = {
                type: "car",
                video_path: "video/car1.mp4",
              };
              break;
          }

          // if (!vObj) {
          //   return;
          // } else {
          //   if (ws) {
          //     ws.close();
          //     ws = null;
          //   }
          //   xarr = [];
          //   yarr = [];
          //   ws = videoRecognite(vObj, vm);
          //   vm.visible = true;
          // }
        }
      });
    },
    addChart(data) {
      xarr.push(data.frame);
      yarr.push(data.count);
      let option = {
        title: {
          text: "流量",
          textStyle: {
            color: "#333333",
            fontSize: 14,
          },
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: xarr,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: yarr,
            type: "line",
            itemStyle: {
              normal: {
                color: "#1890ff", //折点颜色
                lineStyle: {
                  color: "#1890ff", //折线颜色
                },
              },
            },
          },
        ],
      };

      myChart.setOption(option);
      window.addEventListener("resize", function() {
        myChart.resize();
      });
    },
    addVillageRail() {
      var villageRailData = vrData["villageRailData"];
      var name, state, startX, startY, endX, endY, height, material;
      var cornerType;
      height = 5;
      for (var i = 0; i < villageRailData.length; i++) {
        var wall = "wall" + i;
        name = villageRailData[i].name;
        state = villageRailData[i].state;
        startX = villageRailData[i].startPointX;
        startY = villageRailData[i].startPointY;
        endX = villageRailData[i].endPointX;
        endY = villageRailData[i].endPointY;
        //判断是否为出口，渲染不同的颜色
        if (state == 0) {
          material = new Cesium.GridMaterialProperty({
            color: Cesium.Color.WHITE,
            cellAlpha: 0.2,
            lineCount: new Cesium.Cartesian2(8, 8),
            lineThickness: new Cesium.Cartesian2(2.0, 2.0),
          });
          cornerType = Cesium.CornerType.ROUNDED;
        } else {
          material = Cesium.Color.fromAlpha(
            Cesium.Color.fromCssColorString("#0022fc"),
            0.0
          );
          cornerType = Cesium.CornerType.MITERED;
        }
        agFeatureLayer.addEntity({
          id: wall,
          name: name,
          corridor: {
            positions: Cesium.Cartesian3.fromDegreesArray([
              startX,
              startY,
              endX,
              endY,
            ]),
            height: 0, //离地面高度
            extrudedHeight: height, //拉伸高度
            width: 3, //墙体宽度
            cornerType: cornerType,
            material: material,
          },
        });

        if (state === 1) {
          agFeatureLayer.addEntity({
            id: wall + name,
            name: name,
            position: Cesium.Cartesian3.fromDegrees(startX, startY, 25),
            label: {
              text: name,
              font: "bold 14px Helvetica",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 1,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              scaleByDistance: new Cesium.NearFarScalar(10, 2.0, 100, 1.0),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0,
                1500
              ),
            },
          });
        }
      }
      //设置围栏在屏幕中心
      // agCamera.setCameraByRectangle(viewer, startX, startY, endX, endY);
    },
  },
  watch: {
    $route(to, from) {
      this.onCancel();
    },
  },
  beforeDestroy() {
    this.visible = false;
    if (ws) {
      ws.close();
      ws = null;
    }
    pickerHelper.off();
    agFeatureLayer.removeAll();
  },
};
</script>
<style scoped>
.popup-box {
  width: 1200px;
}
.content {
  width: 100%;
  height: 100%;
}
.box {
  margin: 10px auto 0;
  width: 480px;
  height: 180px;
}
.ex-page {
  padding: 20px;
}
</style>
