<template>
  <div class="sunshineCal-main">
    <div class="sunshineCal-description">
      <label>
        描述：用于计算三维场景中场地、建筑外立面或窗户在一个真太阳日内的累计有效日照时长
        <br />
      </label>
      <div class="cleanfix" v-show="!tipsExpend">
        <span class="tips-expend" @click="showTips">提示</span>
      </div>
      <div v-show="tipsExpend">
        <span class="tips-pullup" @click="hideTips">收起</span>
      </div>
      <div class="sunshineCal-tip" v-show="tipsExpend">
        <span
          >提示：请先定位到做日照计算的场景，并加载该区域的建筑模型和地形数据</span
        >
      </div>
    </div>
    <div class="sunshineCal-form">
      <a-form-model
        labelAlign="left"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-form-model-item label="当前位置坐标"
          >{{ lng }}E , {{ lat }}N</a-form-model-item
        >
        <!-- <a-form-model-item label="日照标准日">
          <a-date-picker @change="changeDate" v-model="sunshineDay" />
        </a-form-model-item> -->
        <a-form-model-item label="日照标准日">
          <a-radio-group
            name="radioGroup"
            :default-value="1"
            @change="changeDate"
          >
            <a-radio :value="1"> 大寒日 </a-radio>
            <a-radio :value="2"> 冬至日</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item label="有效日照时间带"
          >{{ startTime }} {{ endTime }}</a-form-model-item
        >
        <a-form-model-item label="选择计算类型"></a-form-model-item>
      </a-form-model>
    </div>
    <div class="sunshineCal-tabs">
      <a-tabs default-active-key="1" @tabClick="activePanel">
        <a-tab-pane key="1" tab="窗户">
          <div class="select-options">
            <a-form-model
              labelAlign="left"
              :label-col="formItemLayout.labelCol"
              :wrapper-col="formItemLayout.wrapperCol"
            >
              <a-form-model-item label="请选择要分析的窗户">
                <a-button type="primary" @click="selectWindows"
                  >开始选择</a-button
                >
                <a-button
                  :style="{
                    backgroundColor: 'rgb(238, 44, 44)',
                    color: 'rgb(255, 255, 255)',
                  }"
                  @click="unselectWindows"
                  >取消选择</a-button
                >
              </a-form-model-item>
              <a-form-model-item label="已选择的窗户数量">
                <a-input v-model="selectedFeatureCount" :readOnly="readOnly" />
                窗
              </a-form-model-item>
              <a-form-model-item label="计算起点">
                <a-select v-model="listType">
                  <a-select-option value="geoCenter">几何中心</a-select-option>
                  <a-select-option value="bottomSill"
                    >底层窗台面</a-select-option
                  >
                  <a-select-option value="cornerOfWindow"
                    >窗台左下角</a-select-option
                  >
                </a-select>
              </a-form-model-item>
              <a-form-model-item label="是否要求满窗日照">
                <a-radio-group name="radioGroup" :default-value="1">
                  <a-radio :value="1"> 是 </a-radio>
                  <a-radio :value="2"> 否 </a-radio>
                </a-radio-group>
              </a-form-model-item>
              <a-form-model-item label="结果样式">
                <color-stamp @getStamp="getStamp"></color-stamp>
              </a-form-model-item>
            </a-form-model>
          </div>
          <ag-public
            sweepAngle="12"
            minSunshineTime="12"
            spaceInterval="0.3"
            timeInterval="1"
            :currentTime="currentTime"
            :sunshineDay="sunshineDay"
            :percent="percent"
            :showProcess="showProcess"
            @startAnalysis="startAnalysis"
            @outputReport="outputReport('windows')"
            @cleanAll="cleanAll"
            @visualAnalysis="visualAnalysis"
            @cleanEntities="cleanEntities"
          />
          <windows-panel
            :visible="isShowWindowsPanel"
            @hideModel="hideWindowsPanel"
            @getAllWindows="getAllWindows"
            @getModel="getModel"
            @deselectAll="unselectWindows"
          />
          <chart-panel
            :visible="showChartPanel"
            :windowsId="windowsId"
            :sunDuration="sunDuration"
            @closeChartPanel="closeChartPanel"
            ref="child"
          />
        </a-tab-pane>
        <a-tab-pane key="2" tab="建筑外立面">
          <div class="select-options">
            <a-form-model
              labelAlign="left"
              :label-col="formItemLayout.labelCol"
              :wrapper-col="formItemLayout.wrapperCol"
            >
              <a-form-model-item label="请选择要分析的建筑">
                <a-button type="primary"> 开始选择 </a-button>
                <a-button
                  :style="{
                    backgroundColor: 'rgb(238, 44, 44)',
                    color: 'rgb(255, 255, 255)',
                  }"
                  >取消选择</a-button
                >
              </a-form-model-item>
              <a-form-model-item label="已选择建筑">{{
                seletedBuilding
              }}</a-form-model-item>
            </a-form-model>
          </div>
          <ag-public
            sweepAngle="12"
            minSunshineTime="12"
            spaceInterval="0.3"
            timeInterval="1"
            @startAnalysis="startAnalysis"
            @outputReport="outputReport('building')"
            @cleanAll="cleanAll"
          />
        </a-tab-pane>
        <a-tab-pane key="3" tab="场地">
          <div class="select-options">
            <a-form-model
              labelAlign="left"
              :label-col="formItemLayout.labelCol"
              :wrapper-col="formItemLayout.wrapperCol"
            >
              <a-form-model-item label="请绘制要分析的区域">
                <a-button type="primary">开始绘制</a-button>
                <a-button
                  :style="{
                    backgroundColor: 'rgb(238, 44, 44)',
                    color: 'rgb(255, 255, 255)',
                  }"
                  >取消绘制</a-button
                >
              </a-form-model-item>
              <a-form-model-item label="已绘制区域面积"
                >{{ drawArea }} m²</a-form-model-item
              >
            </a-form-model>
          </div>
          <ag-public
            sweepAngle="12"
            minSunshineTime="12"
            spaceInterval="5"
            timeInterval="1"
            @startAnalysis="startAnalysis"
            @outputReport="outputReport('site')"
            @cleanAll="cleanAll"
          />
          <site-panel :visible="isShowSitePanel" @hideModel="hideSitePanel" />
        </a-tab-pane>
        <a-tab-pane key="4" tab=" "></a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import coordinate from "@/sdk/maths/coordinate.js";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import revitHelper from "@/sdk/bim/revitHelper";
import resultHelper from "./js/resultHelpler";
import featureRender from "./js/featureRender";
import selectHelper from "./js/selectHelper";
import sunPositionArr from "./js/sunPositionArr";
import featurePosCal from "./js/featurePosCalc";
import Visibility from "./js/visibility";
import serverData4BIM from "@/views/js/net/serverData4BIM";
import Agpublic from "./components/public.vue";
import WindowsPanel from "./components/windowsPanel.vue";
import ChartPanel from "./components/chartPanel.vue";
import SitePanel from "./components/sitePanel.vue";
import ColorStamp from "./components/ColorStamp.vue";
import { initPoaLayer } from "./js/config";
import moment from "moment";
import suncalc from "suncalc";
import solarLunar from "solarlunar";

let viewer = null;
let pickerHelper = null;
let visibility = null;
let sunInfo = null;
let sunrise = null;
let sunset = null;
let statisticalTable = [];
let selectedModel = [];
let entities = [];
const formItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12, offset: 0 },
};
let selectedFeatures = [];

export default {
  components: {
    "ag-public": Agpublic,
    "windows-panel": WindowsPanel,
    "site-panel": SitePanel,
    "chart-panel": ChartPanel,
    "color-stamp": ColorStamp,
  },
  data() {
    return {
      formItemLayout,
      readOnly: true,
      lng: null,
      lat: null,
      sunshineDay: null,
      startTime: null,
      endTime: null,
      currentTime: null,
      listType: ["geoCenter"],
      seletedBuilding: "华工A",
      drawArea: 168,
      isShowWindowsPanel: false,
      isShowSitePanel: false,
      selectedFeatureCount: 0,
      tipsExpend: false,
      showChartPanel: false,
      windowsId: [],
      sunDuration: [],
      tipsExpend: false,
      percent: 0,
      showProcess: false,
    };
  },
  mounted() {
    this.initialize();
    // widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  methods: {
    initialize() {
      viewer = CIM.viewer;
      pickerHelper = new PickerHelper(viewer);
      visibility = new Visibility(viewer, entities);
      var cartesian3 = viewer.camera.position;
      var cartesian3 = viewer.camera.position;
      var position = coordinate.Cartesian3_to_WGS84(cartesian3);
      this.lng = position.lng.toFixed(2);
      this.lat = position.lat.toFixed(2);
      sunPositionArr.setCity(position.lat, position.lng);
      var date = new Date();
      var year = date.getFullYear();
      var lTermInfo = solarLunar.getTerm(year, 2);
      this.sunshineDay = moment(year + "-01-" + lTermInfo);
      sunInfo = suncalc.getTimes(
        moment(year + "-01-" + (lTermInfo + 1)),
        this.lat,
        this.lng
      );
      this.initSunshineTime();
      this.currentTime = moment(moment().format("LT"), "HH:mm");
    },
    handleTypeClick(e) {
      this.listType = [e.key];
    },
    activePanel() {
      this.isShowWindowsPanel = true;
      this.isShowSitePanel = true;
    },
    hideWindowsPanel() {
      this.isShowWindowsPanel = false;
    },
    hideSitePanel() {
      this.isShowSitePanel = false;
    },
    initSunshineTime() {
      let _this = this;
      sunrise = sunInfo.sunrise;
      sunset = sunInfo.sunset;
      _this.startTime = sunrise.toTimeString().substring(0, 5);
      _this.endTime = " ~ " + sunset.toTimeString().substring(0, 5);
    },
    moment,
    //时间面板变化
    changeDate(e) {
      let _this = this;
      var date = new Date();
      var year = date.getFullYear();
      if (e.target.value === 1) {
        var lTermInfo = solarLunar.getTerm(year, 2);
        _this.sunshineDay = moment(year + "-01-" + lTermInfo);
      } else {
        var lTermInfo = solarLunar.getTerm(year, 24);
        _this.sunshineDay = moment(year + "-12-" + lTermInfo);
      }
      var sunInfo = suncalc.getTimes(_this.sunshineDay, _this.lat, _this.lng);
      sunrise = sunInfo.sunrise;
      sunset = sunInfo.sunset;
      _this.startTime = sunrise.toTimeString().substring(0, 5);
      _this.endTime = " ~ " + sunset.toTimeString().substring(0, 5);
    },
    /**
     * @description: 计算日照时间
     * @param {*} position 源目标位置（窗户、场地等）
     * @return {*} 日照时间
     */
    sunshineDuration(position) {
      var count = 0;
      CIM.agcimScene.setSceneConfig({ depthTestAgainstTerrain: true }); //开启地形深度检测，防止点穿地面
      var targetPos = coordinate.WGS84_to_Cartesian3(position);
      for (var i = 0; i < sunPositionArr.sunDirection.length; i++) {
        if (
          !visibility.isIntersect(targetPos, sunPositionArr.sunDirection[i])
        ) {
          count = count + 1;
        }
      }
      return count;
    },

    selectWindows() {
      let _this = this;
      console.log("selectWindows");
      pickerHelper.on("LEFT_CLICK", function (movement) {
        var pickedFeature = pickerHelper.getPickObject(movement.position);
        console.log(pickedFeature, "pickedFeature");
        var flag = true;
        var a1 = pickedFeature instanceof Cesium.Cesium3DTileFeature;
        if (!a1) return;
        var pickedFeature_id = pickedFeature.getProperty("name");
        var catagory = pickedFeature.getProperty("catagory");
        console.log(pickedFeature_id, catagory, "pickedFeature_id");
        if (selectedFeatures.length > 0) {
          for (let i = 0; i < selectedFeatures.length; i++) {
            if (selectedFeatures[i].id == pickedFeature_id) {
              pickedFeature.color = selectedFeatures[i].color;
              selectedFeatures = selectedFeatures.filter((item) => {
                return item != selectedFeatures[i];
              });
              flag = false;
            }
            _this.selectedFeatureCount = selectedFeatures.length;
          }
        }
        if (flag) {
          var selectFeature = {};
          selectFeature.id = pickedFeature_id;
          selectFeature.color = pickedFeature.color;
          selectFeature.object = pickedFeature;
          selectFeature.modelMatrix =
            pickedFeature.tileset.root.computedTransform;
          selectedFeatures.push(selectFeature);
          _this.selectedFeatureCount = selectedFeatures.length;
          pickedFeature.color = Cesium.Color.RED;
        }
      });
    },

    unselectWindows() {
      let _this = this;
      console.log("unselectWindows");
      if (selectedFeatures.length == 0) return;
      for (let i = 0; i < selectedFeatures.length; i++) {
        selectedFeatures[i].object.color = selectedFeatures[i].color;
      }
      selectedFeatures = [];
      _this.selectedFeatureCount = selectedFeatures.length;
    },

    getModel() {
      let focusModel = [];
      pickerHelper.on("MOUSE_MOVE", function (movement) {
        let pickedFeature = pickerHelper.getPickObject(movement.endPosition);
        if (!Cesium.defined(pickedFeature)) {
          return;
        }
        let pickedModel = pickedFeature.tileset;
        if (pickedModel == selectedModel[0]) {
          return;
        }
        if (focusModel.length == 0) {
          focusModel.push(pickedModel);
          focusModel.push(pickedModel.style);
          pickedModel.style = new Cesium.Cesium3DTileStyle({
            color: "rgba(255, 255, 0, 0.5)",
          });
        } else {
          if (pickedModel !== focusModel[0]) {
            focusModel[0].style = focusModel[1];
            focusModel[1] = pickedModel.style;
            pickedModel.style = new Cesium.Cesium3DTileStyle({
              color: "rgba(255, 255, 0, 0.5)",
            });
            focusModel[0] = pickedModel;
          }
        }
      });

      pickerHelper.on("LEFT_CLICK", function (movement) {
        focusModel[0].style = focusModel[1];
        focusModel = [];
        if (selectedModel.length == 0) {
          selectedModel = [];
        } else {
          selectedModel[0].style = selectedModel[1];
          selectedModel = [];
        }

        let pickedFeature = pickerHelper.getPickObject(movement.position);
        if (!Cesium.defined(pickedFeature)) {
          return;
        }
        let pickedModel = pickedFeature.tileset;
        selectedModel.push(pickedModel);
        selectedModel.push(pickedModel.style);
        selectedModel[0].style = new Cesium.Cesium3DTileStyle({
          color: "rgba(255, 0, 0, 0.5)",
        });
        pickerHelper.remove("LEFT_CLICK");
        pickerHelper.remove("MOUSE_MOVE");
      });
    },

    getAllWindows() {
      let _this = this;
      var modelMatrix;
      selectedModel[0].style = selectedModel[1];
      var tileset = selectedModel[0];
      selectedModel = [];
      console.log(tileset.root.children, "tileset");
      setTimeout(function () {
        selectedFeatures = selectHelper.getComponents(tileset, "幕墙嵌板");
        _this.selectedFeatureCount = selectedFeatures.length;
      }, 500);
      // selectHelper.getAllCompents(tileset,_this); //获取所有类型的构件
    },

    visualAnalysis(standardTime) {
      console.log("时间改了");
      let _this = this;
      for (let i = 0; i < entities.length; i++) {
        viewer.entities.remove(entities[i]);
      }
      if (selectedFeatures.length == 0) {
        return;
      }
      var result = serverData4BIM.getTableName(
        selectedFeatures[0].object.tileset.agMetaData.id
      );
      result.then((ref) => {
        if (!ref.success) return null;
        if (ref.content === null || ref.content == "") {
          _this.$message.info("该模型还没有入库");
        } else {
          var tableName = ref.content.entitytable;
          for (let i = 0; i < selectedFeatures.length; i++) {
            var positionPromise = revitHelper.getComponentPosition(
              selectedFeatures[i].id,
              selectedFeatures[i].modelMatrix,
              tableName
            );
            positionPromise.then((data) => {
              var winCartesian3 = new Cesium.Cartesian3(
                data.center.x,
                data.center.y,
                data.center.z
              );
              var windowPosition = coordinate.Cartesian3_to_WGS84(
                winCartesian3
              );
              var sunPosition = coordinate.WGS84_to_Cartesian3(
                sunPositionArr.getSunPotion(windowPosition, standardTime)
              );
              visibility.getIntersect(winCartesian3, sunPosition);
            });
          }
        }
      });
    },
    cleanEntities() {
      for (let i = 0; i < entities.length; i++) {
        viewer.entities.remove(entities[i]);
      }
    },
    appendToChart(duration, item) {
      let _this = this;
      var durationArr = duration.split(":");
      var time = parseFloat(durationArr.join("."));
      _this.windowsId.push(item.id);
      _this.sunDuration.push(time);
    },
    endShowChart() {
      let _this = this;
      _this.showChartPanel = true;
      _this.$refs.child.analysisChart();
    },
    startAnalysis() {
      if (selectedFeatures.length == 0) {
        return;
      }
      console.log("startAnalysis");
      this.showProcess = true;
      statisticalTable = [];
      this.windowsId = [];
      this.sunDuration = [];
      sunPositionArr.getDirections(
        this.sunshineDay,
        sunrise,
        sunset,
        60,
        selectedFeatures[0].modelMatrix
      );
      let _this = this;
      let analysisCount = 0;
      var result = serverData4BIM.getTableName(
        selectedFeatures[0].object.tileset.agMetaData.id
      );
      result.then((ref) => {
        if (!ref.success) return null;
        if (ref.content === null || ref.content == "") {
          _this.$message.info("该模型还没有入库");
        } else {
          var tableName = ref.content.entitytable;
          for (let i = 0; i < selectedFeatures.length; i++) {
            var positionPromise = revitHelper.getComponentPosition(
              selectedFeatures[i].id,
              selectedFeatures[i].modelMatrix,
              tableName
            );
            positionPromise.then((data) => {
              var cartesian3 = new Cesium.Cartesian3(
                data.center.x,
                data.center.y,
                data.center.z
              );
              var windowPosition = coordinate.Cartesian3_to_WGS84(cartesian3);
              var count = _this.sunshineDuration(windowPosition);
              var duration =
                count === 0
                  ? "0"
                  : parseInt(count / 60) +
                    ":" +
                    (count % 60 < 10 ? "0" + (count % 60) : count % 60);
              var record = {
                窗户编号: selectedFeatures[i].id,
                日照时段: _this.startTime + _this.endTime,
                累计有效日照时长: duration,
              };
              statisticalTable.push(record);
              // console.log(record, "record");
              // console.log(selectedFeatures[i].batchId, "batchId");
              var durationArr = duration.split(":");
              var time = parseFloat(durationArr.join("."));
              _this.windowsId.push(selectedFeatures[i].id);
              _this.sunDuration.push(time);
              analysisCount++;

              _this.percent = parseInt(
                (100 / selectedFeatures.length) * statisticalTable.length
              );
              if (analysisCount == selectedFeatures.length) {
                resultHelper.sortResult(statisticalTable, selectedFeatures);
                featureRender.setWindowColorByValue(
                  statisticalTable,
                  selectedFeatures
                );
                _this.endShowChart();
              }
              // d1.style.width = (++index / length) * 100 + "%";
              // _this.processCount = parseFloat(((index / length) * 100).toFixed(2));
              // d2.innerHTML =  ((index / length) * 100).toFixed(1) + "%";
            });
          }
        }
      });
    },
    computeFeatureItemValue(data, item, _this) {
      var cartesian3 = new Cesium.Cartesian3(
        data.center.x,
        data.center.y,
        data.center.z
      );
      var windowPosition = coordinate.Cartesian3_to_WGS84(cartesian3);
      var count = _this.sunshineDuration(sunrise, 60, sunset, windowPosition);
      var duration =
        count === 0
          ? "0"
          : parseInt(count / 60) +
            ":" +
            (count % 60 < 10 ? "0" + (count % 60) : count % 60);
      var record = {
        窗户编号: item.id,
        日照时段: _this.startTime + _this.endTime,
        累计有效日照时长: duration,
      };
      _this.appendToChart(duration, item);
      statisticalTable.push(record);
      console.log(record, "record");
    },

    outputReport(type) {
      resultHelper.sortResult(statisticalTable, selectedFeatures);
      featureRender.setWindowColorByValue(statisticalTable, selectedFeatures);
      resultHelper.exportToXls(statisticalTable, type);
    },
    showTips() {
      this.tipsExpend = true;
    },
    hideTips() {
      this.tipsExpend = false;
    },
    cleanAll() {
      this.unselectWindows();
    },
    closeChartPanel() {
      this.showChartPanel = false;
      // var processBar = document.getElementsByClassName("process-bar")[0];
      // processBar.style.display = "none";
    },
    getStamp(data) {
      let colors = [];
      for (let i = 0; i < data.arr.length; i++) {
        colors.push(data.arr[i].color.substr(1));
      }
      featureRender.colors = colors;
    },
  },
  destroyed() {
    this.cleanAll();
  },
};
</script>

<style>
.sunshineCal-main {
  height: 100%;
}
.tips-expend,
.tips-pullup {
  color: rgb(54, 141, 218);
  cursor: pointer;
  float: right;
}
.cleanfix::after {
  content: "";
  display: block;
  clear: both;
}
.sunshineCal-description {
  margin: 10px 10px 0px 10px;
  padding: 0px 5px;
  background-color: #ececeb;
  color: #4aa5f3;
}

.sunshineCal-tip {
  background-color: rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  text-align: center;
}

.sunshineCal-form {
  margin: 0 20px;
}

.sunshineCal-form .ant-form-item {
  margin-bottom: 0px;
}

.sunshineCal-form .ant-radio-wrapper span {
  padding: 0px;
}

.sunshineCal-tabs {
  margin: 0 20px;
}

.sunshineCal-tabs .ant-tabs-nav .ant-tabs-tab-active {
  color: #fff;
  background: rgba(53, 104, 151, 1) !important;
}

.sunshineCal-tabs .ant-tabs-nav .ant-tabs-tab {
  position: relative;
  display: inline-block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  padding: 0;
  text-decoration: none;
  cursor: pointer;
  -webkit-transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 90px;
  text-align: center;
  line-height: 30px;
  height: 30px;
  background: rgba(238, 238, 238, 1);
  font-size: 14px;
}

.sunshineCal-tabs .ant-tabs-nav .ant-tabs-tab:last-child {
  width: 0px;
}

.select-options .ant-form-item {
  margin-bottom: 0px;
}

.select-options input {
  width: 100px;
}

.select-options button:nth-child(odd) {
  width: 65px;
  margin-right: 10px;
  padding: 0px 2px;
  font-size: 14px;
}

.select-options button:nth-child(even) {
  width: 65px;
  padding: 0px 2px;
  font-size: 14px;
}
</style>
