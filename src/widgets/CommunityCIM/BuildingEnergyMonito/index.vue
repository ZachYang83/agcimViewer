<template>
  <ag-popup
    v-model="visible"
    title="用电统计"
    @onCancel="onCancel"
    class="popup-box"
  >
    <div class="vscroll">
      <div class="h4">操作面板</div>
      <a-form :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" @click="electricityaAnalysis"
            >用电分析</a-button
          >
          <a-button type="primary" @click="showPrimitives(false)"
            >清除</a-button
          >
        </a-form-item>
      </a-form>
      <div class="lengen">
        <div class="h4">用电图例</div>
        <ul>
          <li v-for="(item, index) in lengenData" :key="index">
            <span :style="{ background: item.color }"></span>
            <label v-if="item.max">{{ item.min }}-{{ item.max }}</label>
            <label v-else-if="!item.max">{{ item.min }}以上</label>
          </li>
        </ul>
        <a-radio-group
          v-model="selYear"
          default-value="2018"
          @change="onChangeYear"
        >
          <a-radio-button value="2018">2018</a-radio-button>
          <a-radio-button value="2019">2019</a-radio-button>
        </a-radio-group>
        <a-slider
          :min="1"
          :max="12"
          :marks="marks"
          :step="null"
          :tipFormatter="null"
          :defaultValue="curMonth"
          @change="onChangeMonth"
        ></a-slider>
      </div>
      <div class="floordataDiv">
        <div class="h4">楼层数据</div>
        <a-form :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item :wrapper-col="{ span: 28, offset: 4 }">
            <a-button type="primary" @click="showTopFloor">去顶层</a-button>
            <a-button type="primary" @click="showAll">显示全部</a-button>
            <a-button type="primary" @click="statistics">统计</a-button>
          </a-form-item>
        </a-form>
        <div class="floordata vscroll">
          <table>
            <tr v-for="(item, index) in electricityList" :key="index">
              <td @click="floorSelect(item, index)">{{ item.floor }}</td>
              <td
                v-for="(list, num) in item.household"
                :key="num"
                :style="{
                  background: getFloorColor(
                    list[curYear][curMonth - 1].electricityNum
                  ),
                }"
                @click="houseSelect(list, index)"
              >
                <label>{{ list.name }}</label>
                <span>{{ list[curYear][curMonth - 1].electricityNum }}</span>
              </td>
            </tr>
          </table>
        </div>
        <div id="demography"></div>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import axiosWraper from "@/views/js/net/axiosWraper";
import AgSlice from "@/sdk/interactive/slice";
import coordinate from "@/sdk/maths/coordinate";
var echarts = require("echarts"); //引入echarts
let buildPrimitives = [];
let agSlice;
export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      visible: true,
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      positions: [
        [
          113.374543763033,
          23.106845740988597,
          113.374543251982,
          23.10676714973569,
          113.374574900263,
          23.106762541659172,
          113.374572789834,
          23.106584519490153,
          113.374343584268,
          23.106588899238335,
          113.374343584268,
          23.106547899238335,
          113.374269584268,
          23.106546899238335, //前 ，中心点
          113.374267584268,
          23.106961740988597, //后 ，中心点
          113.374345584268,
          23.106961740988597,
          113.374347584268,
          23.106925740988597,
          113.374392584268,
          23.106927740988597,
          113.374392584268,
          23.106850920239598,
          113.374476230079,
          23.106849647089167,
          113.374535200945,
          23.106849689948813,
        ],
        [
          113.373995405503,
          23.106845740988597,
          113.373995916554,
          23.10676714973569,
          113.373964268273,
          23.106762541659172,
          113.373966378702,
          23.106584519490153,
          113.374195584268,
          23.106588899238335,
          113.374195584268,
          23.106547899238335,
          113.374269584268,
          23.106546899238335, //前 ，中心点
          113.374267584268,
          23.106961740988597, //后 ，中心点
          113.374193584268,
          23.106961740988597,
          113.374193584268,
          23.106925740988597,
          113.374146584268,
          23.106927740988597,
          113.374146584268,
          23.106850920239598,
          113.374062938457,
          23.106849647089167,
          113.374003967591,
          23.106849689948813,
        ],
      ],

      center: {
        x: -2328672.2070418904,
        y: 5387920.959191112,
        z: 2487658.759613098,
      },
      centers: [
        {
          alt: 133.9202838933764,
          lat: 23.10120573,
          lng: 113.37236837,
        },
        {
          alt: 151.06442474437515,
          lat: 23.10118744,
          lng: 113.37267125,
        },
      ],
      entyies: [],
      primitives: [],
      lengenData: [
        {
          min: 0,
          max: 200,
          color: "#a08e9a",
        },
        {
          min: 200,
          max: 400,
          color: "#86696e",
        },
        {
          min: 400,
          max: 600,
          color: "#b56e40",
        },
        {
          min: 600,
          max: 700,
          color: "#8d4029",
        },
        {
          min: 700,
          max: 800,
          color: "#7a2d23",
        },
        {
          min: 800,
          color: "#b4442e",
        },
      ],
      curFloor: undefined,
      colorArr: [
        "#a08e9a",
        "#86696e",
        "#b56e40",
        "#8d4029",
        "#7a2d23",
        "#b4442e",
      ],
      selYear: "2018",
      marks: {
        1: { style: { color: "#666" }, label: 1 },
        2: { style: { color: "#666" }, label: 2 },
        3: { style: { color: "#666" }, label: 3 },
        4: { style: { color: "#666" }, label: 4 },
        5: { style: { color: "#666" }, label: 5 },
        6: { style: { color: "#666" }, label: 6 },
        7: { style: { color: "#666" }, label: 7 },
        8: { style: { color: "#666" }, label: 8 },
        9: { style: { color: "#666" }, label: 9 },
        10: { style: { color: "#666" }, label: 10 },
        11: { style: { color: "#666" }, label: 11 },
        12: { style: { color: "#666" }, label: 12 },
      },
      curYear: "_2018",
      curMonth: 1,
      electricityList: [],
      floorHeight: 8.35,
      startHeight: 10,
      statisticsData: [],
    };
  },
  mounted() {
    agSlice = new AgSlice(CIM.viewer);
    if (
      !CIM.layerTree.zoomToLayerById("2e8b578e-5dd4-4c69-83ab-14c3368f3c61")
    ) {
      CIM.layerTree.addMany(["2e8b578e-5dd4-4c69-83ab-14c3368f3c61"]);
    }
    var tileset = CIM.layerTree.getLayerById(
      "2e8b578e-5dd4-4c69-83ab-14c3368f3c61"
    );
    tileset._primitives[0]._readyPromise.then(function(tileset) {
      CIM.viewer.flyTo(tileset, {
        duration: 2,
        offset: new Cesium.HeadingPitchRange(null, null, 400),
      });
    });

    this.getLayer();
    this.getElectricity();
  },
  methods: {
    setInputAction() {
      CIM.viewer.screenSpaceEventHandler.setInputAction(function(movement) {
        var position = CIM.viewer.scene.pickPosition(movement.position);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
      this.delEntities();
      this.showPrimitives(false);
      this.deletePrimitive();
    },
    getElectricity() {
      var _this = this;
      // var promise = axiosWraper.getData(
      //   "http://192.168.3.203:8893/MongoDBTable/electricity/list"
      // );
      var promise = axiosWraper.getData(`/MongoDBTable/electricity/list`);
      promise.then(function(data) {
        _this.electricityList = data.content;
        var centerPoint = coordinate.cartesian3ToCartographic(
          _this.center,
          "Degrees"
        );
        for (var i = 0; i < _this.electricityList.length; i++) {
          var household = _this.electricityList[i].household;
          for (var j = 0; j < household.length; j++) {
            household[j].positions = _this.positions[j];
            household[j].centerPoint = _this.centers[j];
          }
        }
      });
      // return axiosWraper.getData(`/SYSU/electricity/list`);
    },
    getLayer() {
      if (!this.clippingLayer) {
        let primitives = CIM.viewer.scene.primitives._primitives;
        for (let i = 0; i < primitives.length; i++) {
          if (
            primitives[i].agMetaData &&
            primitives[i].agMetaData.id ==
              "2e8b578e-5dd4-4c69-83ab-14c3368f3c61"
          ) {
            this.clippingLayer = primitives[i];
          }
        }
      }
    },
    electricityaAnalysis() {
      // this.addEntities(CIM.viewer);
      this.addBoxGeometry(CIM.viewer);
      this.getLayer();
    },
    addEntities(viewer) {
      this.delEntities();
      var scene = viewer.scene;
      var camera = scene.camera;
      var center = this.positions[0];
      var positions = Cesium.Cartesian3.fromDegreesArray(this.positions[0]);
      var positions1 = Cesium.Cartesian3.fromDegreesArray(this.positions[1]);

      var _height = 2;
      var _extrudedHeight = 8.35;
      for (var i = 0; i < 18; i++) {
        // var color = this.colorArr[parseInt(Math.random() * this.colorArr.length, 10)];
        // var color1 = this.colorArr[parseInt(Math.random() * this.colorArr.length, 10)];
        // this.addEntity(positions,color,_height,_extrudedHeight);
        // this.addEntity(positions1,color1,_height,_extrudedHeight);
        var color = this.colorArr[
          parseInt(Math.random() * this.colorArr.length, 10)
        ];
        var color1 = this.colorArr[
          parseInt(Math.random() * this.colorArr.length, 10)
        ];
        var polygon = CIM.viewer.entities.add({
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            height: _height,
            extrudedHeight: _height + _extrudedHeight,
            material: Cesium.Color.fromCssColorString(color).withAlpha(0.8),
          },
        });
        var polygon1 = CIM.viewer.entities.add({
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(positions1),
            height: _height,
            extrudedHeight: _height + _extrudedHeight,
            material: Cesium.Color.fromCssColorString(color1).withAlpha(0.8),
          },
        });
        this.entyies.push(polygon);
        this.entyies.push(polygon1);
        _height = _height + _extrudedHeight;
      }
    },
    // todo 矩阵转换要调整，设置好高度
    addBoxGeometry(viewer) {
      if (buildPrimitives.length > 0) {
        this.showPrimitives(true);
        return;
      }
      var _height = 6;
      var _extrudedHeight = 8.36;
      for (var i = 0; i < this.electricityList.length; i++) {
        var list = this.electricityList[i].household;
        for (var j = 0; j < list.length; j++) {
          var name = list[j].name;
          var center = Cesium.Cartesian3.fromDegrees(
            list[j].centerPoint.lng,
            list[j].centerPoint.lat,
            _height
          );
          var color = this.getFloorColor(
            list[j][this.curYear][this.curMonth - 1].electricityNum
          );
          this.addPrimitives(center, color, name, _extrudedHeight);
        }
        _height = _height + _extrudedHeight;
      }
    },
    addPrimitives(center, color, name, height) {
      var scene = CIM.viewer.scene;
      var boxGeometry = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        dimensions: new Cesium.Cartesian3(32.36, 57.5, height),
      });
      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
      // 改变矩形方向
      var hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(3.160728786416368, 0.0, 0.0)
      );
      var hrp1 = Cesium.Matrix4.fromRotationTranslation(
        hprRotation,
        new Cesium.Cartesian3(0.0, 0.0, 0.0)
      );
      Cesium.Matrix4.multiply(modelMatrix, hrp1, modelMatrix);
      var primitives = scene.primitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: boxGeometry,
            modelMatrix: modelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString(color).withAlpha(0.8)
              ),
              show: new Cesium.ShowGeometryInstanceAttribute(true),
            },
            id: name,
          }),
          classificationType: Cesium.ClassificationType.BOTH,
        })
      );
      buildPrimitives.push(primitives);
    },
    // 使用该方法，随机颜色不明显(已弃用)
    addEntity(positions, color, height, extrudedHeight) {
      // var _positions = Cesium.Cartesian3.fromDegreesArray(positions);
      // var color = this.colorArr[parseInt(Math.random() * this.colorArr.length, 10)];
      var polygon = CIM.viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(positions),
          height: height,
          extrudedHeight: extrudedHeight,
          material: Cesium.Color.fromCssColorString(color).withAlpha(0.8),
          classificationType: Cesium.ClassificationType.BOTH,
        },
      });
      this.entyies.push(polygon);
    },
    onChangeYear(e) {
      this.curYear = "_" + e.target.value;
      this.onChangePrimitiveColor();
      if (this.statisticsData && this.statisticsData.length > 0) {
        this.statistics();
      }
    },
    onChangeMonth(value) {
      this.curMonth = Number(value);
      this.onChangePrimitiveColor();
    },
    // 改变模型渲染色
    onChangePrimitiveColor() {
      if (buildPrimitives) {
        for (var i = 0; i < this.electricityList.length; i++) {
          var list = this.electricityList[i].household;
          for (var j = 0; j < list.length; j++) {
            var name = list[j].name;
            var color = this.getFloorColor(
              list[j][this.curYear][this.curMonth - 1].electricityNum
            );
            for (var m = 0; m < buildPrimitives.length; m++) {
              var _instanceId = buildPrimitives[m]._primitive._instanceIds[0];
              if (name == _instanceId) {
                var attributes = buildPrimitives[
                  m
                ].getGeometryInstanceAttributes(_instanceId);
                attributes.color = this.hexToRgb(color);
              }
            }
          }
        }
      }
    },
    // 将16进制色值转换成 agba
    hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            255,
          ]
        : [110, 105, 134, 255];
    },
    // 点击楼层
    floorSelect(item, index) {
      this.selFloorTr(index);
      agSlice.removeClippingPlanes();
      if (this.clippingLayer) {
        var heigth = this.startHeight + index * this.floorHeight;
        var cartographic = Cesium.Cartographic.fromCartesian(
          this.clippingLayer.boundingSphere.center
        );
        let viewPointWebMercator = coordinate.cartographicToMercatorCartesian3(
          CIM.viewer,
          cartographic
        );
        // agSlice.initialize(this.clippingLayer, viewPointWebMercator, {
        //   top: heigth - cartographic.height,
        // });
        this.clippingLayer.clippingPlanes = agSlice.createClippingPlane(
          this.clippingLayer,
          viewPointWebMercator,
          {
            top: heigth - cartographic.height,
          }
        );
      }
    },
    // 点击户型
    houseSelect(item, index) {
      this.statisticsData = [];
      var yearData = item[this.curYear];
      for (var i = 0; i < yearData.length; i++) {
        this.statisticsData.push(yearData[i].electricityNum);
      }
      var title = this.curYear + "年" + item.name + "房各月份用电统计";
      this.getDemography(title);
    },
    // 获取楼层颜色
    getFloorColor(num) {
      var color;
      for (let i = 0; i < this.lengenData.length; i++) {
        if (num >= this.lengenData[i].min) {
          color = this.lengenData[i].color;
        }
      }
      return color;
    },
    showTopFloor() {
      if (this.clippingLayer) {
        var index = this.electricityList.length - 1;
        var heigth = this.startHeight + index * this.floorHeight;
        this.selFloorTr(index);
        var cartographic = Cesium.Cartographic.fromCartesian(
          this.clippingLayer.boundingSphere.center
        );
        let viewPointWebMercator = coordinate.cartographicToMercatorCartesian3(
          CIM.viewer,
          cartographic
        );
        // agSlice.initialize(this.clippingLayer, viewPointWebMercator, {
        //   top: heigth - cartographic.height,
        // });
        this.clippingLayer.clippingPlanes = agSlice.createClippingPlane(
          this.clippingLayer,
          viewPointWebMercator,
          {
            top: heigth - cartographic.height,
          }
        );
      }
    },
    showAll() {
      this.selFloorTr();
      agSlice.removeClippingPlanes();
    },
    // 楼层选中颜色列，改变表格选中背景色
    selFloorTr(index) {
      if (this.curFloor != undefined) {
        $(".floordata table tr")
          .eq(this.curFloor)
          .children("td:first")
          .css("background", "#fff");
      }
      if (index != undefined) {
        $(".floordata table tr")
          .eq(index)
          .children("td:first")
          .css("background", "#41c862");
      }
      this.curFloor = index;
    },
    delEntities() {
      for (var i = 0; i < this.entyies.length; i++) {
        CIM.viewer.entities.remove(this.entyies[i]);
      }
      this.entyies = [];
    },
    deletePrimitive() {
      for (var i = 0; i < buildPrimitives.length; i++) {
        CIM.viewer.primitives.remove(buildPrimitives[i]);
      }
      buildPrimitives = [];
    },
    // 显示模型用电分析渲染
    showPrimitives(isShow) {
      for (var i = 0; i < buildPrimitives.length; i++) {
        buildPrimitives[i].show = isShow;
      }
    },
    // 统计 ，统计整年整栋各个月用电量
    statistics() {
      this.statisticsData = [];
      for (var j = 0; j < 12; j++) {
        var sum = 0;
        for (var i = 0; i < this.electricityList.length; i++) {
          var household = this.electricityList[i].household;
          for (var m = 0; m < household.length; m++) {
            var yearData = household[m][this.curYear];
            sum += Number(yearData[j].electricityNum);
          }
        }
        this.statisticsData.push(sum);
      }
      var title = this.curYear + "整栋各月份用电统计";
      this.getDemography(title);
    },
    //各月份用电统计--柱状+折线
    getDemography(title, data) {
      var myChart = echarts.init(document.getElementById("demography"));
      // 指定图表的配置项和数据
      var option = {
        title: {
          text: title,
        },
        color: ["#3398DB"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: [
              "1月",
              "2月",
              "3月",
              "4月",
              "5月",
              "6月",
              "7月",
              "8月",
              "9月",
              "10月",
              "11月",
              "12月",
            ],
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: [
          {
            name: "用电量",
            type: "bar",
            barWidth: "60%",
            data: this.statisticsData,
          },
        ],
      };
      myChart.setOption(option);
    },
  },
};
</script>
<style scoped>
.popup-box {
  width: 400px;
}
.content {
  width: 100%;
  height: 100%;
}
.ant-btn {
  margin-right: 10px;
}
.vscroll {
  padding: 10px;
}
.lengen ul {
  padding-top: 10px;
  padding-left: 10px;
  overflow: hidden;
}
.lengen ul li {
  list-style: none;
  line-height: 20px;
  margin-bottom: 10px;
  float: left;
  width: 100px;
}
.lengen ul li span {
  display: inline-block;
  width: 20px;
  float: left;
  height: 20px;
  margin-right: 10px;
}
.floordata {
  height: 210px;
  overflow-y: scroll;
  padding-left: calc(50% - 90px);
}
.floordata table tr {
  padding-left: 30px;
}
.floordata table td {
  width: 60px;
  height: 40px;
  background: #fff;
  border: 1px solid #f1f1f1;
  text-align: center;
  position: relative;
  color: #000;
  font-size: 14px;
  cursor: pointer;
}
.floordata table td span {
  position: absolute;
  bottom: 0px;
  right: 1px;
  font-size: 12px;
}
#demography {
  width: 100%;
  height: 200px;
  padding-top: 20px;
}
</style>
