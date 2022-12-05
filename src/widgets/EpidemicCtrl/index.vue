<template>
  <div class="epidemic-ctrl-box">
    <div>
      <a-button
        class="epidemic-home-btn"
        icon="home"
        v-show="
          curEpidmicCtrlLayer != 'province' &&
          (monitorObject == 'epidemicMap' || monitorObject == 'community')
        "
        @click="backEpidemicHome"
        >去疫情首页</a-button
      >
    </div>
    <div class="sel-monitor-object" v-show="selMonitorObjectShow">
      <a-radio-group @change="switchMonitorObject" :value="monitorObject">
        <a-radio-button class="epidemic-btn" id="chart-list" value="epidemicMap"
          >疫情地图</a-radio-button
        >
        <!-- v-show ="showEchartsCanavas" -->
        <a-radio-button class="epidemic-btn" value="returnWorkSituation"
          >复工情况</a-radio-button
        >
      </a-radio-group>
    </div>
    <div class="chart-box" v-show="chartBoxShow">
      <div class="chart-title">{{ this.detailTitle }}多种趋势</div>

      <div id="data-list" class="vscroll">
        <div id="first" style="width: 350px; height: 200px"></div>
        <div id="second" style="width: 350px; height: 200px"></div>
        <div id="third" style="width: 350px; height: 200px"></div>
        <div id="fourth" style="width: 350px; height: 200px"></div>
        <div id="fifth" style="width: 350px; height: 200px"></div>
        <div id="sixth" style="width: 350px; height: 200px"></div>
        <div id="seventh" style="width: 350px; height: 200px"></div>
        <div id="eighth" style="width: 350px; height: 200px"></div>
      </div>
    </div>
    <div v-if="monitorObject == 'epidemicMap'">
      <a-radio-group
        size="small"
        @change="handleEpidemicMapChange"
        :value="diagnosisState"
      >
        <a-radio-button class="epidemic-btn" value="alreadyDiagnosis"
          >已有确诊</a-radio-button
        >
        <a-radio-button class="epidemic-btn" value="cumulativeDiagnosis"
          >累计确诊</a-radio-button
        >
        <a-radio-button class="epidemic-btn" value="overseasInput"
          >境外输入</a-radio-button
        >
      </a-radio-group>
      <!-- <p class="epidemicMap-msg">{{ curEpidemicMapMsg }}</p> -->
    </div>
    <div v-else-if="monitorObject == 'returnWorkSituation'">
      <a-radio-group
        size="small"
        @change="handleReturnWorkSituationChange"
        :value="returnWorkState"
      >
        <a-radio-button class="epidemic-btn" value="returnWorkMgrationMap"
          >复工迁徙图</a-radio-button
        >
        <a-radio-button class="epidemic-btn" value="returnWorkAndLabor"
          >复工复产</a-radio-button
        >
        <!-- <a-radio-button class="epidemic-btn" value="communityControl">社区管控</a-radio-button>
        <a-radio-button class="epidemic-btn" value="trafficTrip">交通出行</a-radio-button>
        <a-radio-button class="epidemic-btn" value="medicalService">医疗服务</a-radio-button>-->
      </a-radio-group>
    </div>
    <div
      class="epidemic-lengend"
      v-show="
        monitorObject == 'epidemicMap' && curEpidmicCtrlLayer != 'community'
      "
    ></div>

    <div class="returnWork-box" v-show="monitorObject == 'returnWorkSituation'">
      <div>
        <a-date-picker
          size="small"
          @change="onChangeData"
          :defaultValue="moment(getCurrentData(), 'YYYY-MM-DD')"
        />
        <a-input
          size="small"
          placeholder="迁入城市"
          @input="updateMigrate()"
          v-model="moveInCityName"
          style="width:120px;margin-left"
        />
      </div>
      <div class="datalist">
        <a-tabs defaultActiveKey="moveIn" @change="migrateAction">
          <a-tab-pane tab="迁入" key="moveIn"></a-tab-pane>
          <a-tab-pane tab="迁出" key="moveOut"></a-tab-pane>
        </a-tabs>
        <div class="table-box">
          <table class="migrate-table">
            <thead>
              <tr>
                <td></td>
                <td>路线</td>
                <td>数量</td>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="personMonitor-box" v-show="personMonitorTableShow">
      <div class="personMonitor-list vscroll">
        <div class="peopletable">
          <table
            class="peopleitem"
            style="border-top: 1px solid rgba(128, 128, 128, 0.37)"
          >
            <!-- <tr><td colspan="4">{{this.communityDoorName}}出入流动人口表</td></tr>
            <td>姓名</td>
            <td>楼号</td>
            <td>状态</td>
            <td >操作</td>-->

            <!-- <caption>{{this.communityDoorName}}出入流动人口表</caption> -->
            <tr>
              <th colspan="4">{{ this.communityDoorName }}出入流动人口表</th>
            </tr>
            <tr>
              <th>姓名</th>
              <th>楼号</th>
              <th>状态</th>
              <th colspan="2">操作</th>
            </tr>
          </table>
          <table
            v-for="person in people"
            :key="person.id_card"
            class="peopleitem"
          >
            <tr>
              <td>{{ person.name }}</td>
              <td>{{ person.room_number }}</td>
              <td>{{ person.comfirmed_status }}</td>
              <td
                style="width＝80px"
                @click="findPeople(person)"
                id="humanitem"
              >
                <a>查看</a>
              </td>
              <td style="width＝80px" @click="showPersonTrack" id="humanitem">
                <a>轨迹</a>
              </td>
            </tr>
          </table>
        </div>
      </div>
      <track-map v-if="showTrack" @hideTrack="hideTrackMap" />
    </div>
  </div>
</template>

<script>
import agMath from "@/sdk/maths/math";
import agMigrateLayer from "@/sdk/layer/migrateLayer.js";
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import agPointLayer from "@/sdk/layer/pointLayer";
import cesLayer from "@/sdk/layer/cesLayer.js";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import villageModel from "./js/villageModel.js";
import resident from "./js/resident.js";
import chartData from "./js/chartData.js";
import bubble from "./js/bubble";
import nameOverly from "./js/nameOverly";
import migrateData from "./js/migrateData";
import legendData from "./js/legendData";
import serverLayer from "./js/serverLayer";
import picker from "./js/picker";
import TrackMap from "./trackmap.vue";
import { DatePicker } from "ant-design-vue";
import serverData from "./js/serverData";
// 设置中文
import moment from "moment";
import "moment/locale/zh-cn";
import popup from "./js/popup";

moment.locale("zh-cn");

let viewer = CIM.viewer;
var pickerHelper = null;
export default {
  name: "EpidemicCtrl",
  components: { "a-date-picker": DatePicker, TrackMap },
  data() {
    return {
      epidmicCtrlLayer: null,
      epidmicCtrlLayer_Province: null,
      selMonitorObjectShow: true,
      chartBoxShow: true, //echart图表显示开关
      personMonitorTableShow: false, //小区人员信息列表开关
      people: resident.people, //小区人员信息列表的数据
      showTrack: false,
      curCode: {}, //选中的是否是同一个点
      curEpidmicCtrlLayer: "province",
      curTableName: "epidemic_s_province", //疫情数据接口表名 [epidemic_s_province,epidemic_s_city,epidemic_s_county]  表名
      curPointCommunity: "epidemic_s_county",
      monitorObject: "epidemicMap", //默认选中疫情地图
      diagnosisState: "alreadyDiagnosis", //疫情地图选中状态
      returnWorkState: "returnWorkMgrationMap", //复工情况选中状态
      epidemicMapMsg: {
        alreadyDiagnosis: "当前现有确诊病例数，排除治愈、死亡",
        cumulativeDiagnosis: "累计确诊病例数，包含治愈、死亡",
        overseasInput: "境外输入病例数，包含治愈、死亡",
      },
      curEpidemicMapMsg: "当前现有确诊病例数，排除治愈、死亡",
      lengendContent: "",
      moveInCityName: "广州市",
      moveInOrMoveOut: "moveIn",
      moveInFieldName: "move_in_city_name",

      communityDoorName: "南门", //小区南北门的名字

      cumComfireArr: [], //累计确诊病例
      existComArr: [], //现有确诊
      existSuspectArr: [], //现有疑似
      existServeArr: [], //现有重症
      cumServerArr: [], //累计重症
      cumDeathArr: [], //累计死亡
      cumRecoveredArr: [], //累计治愈
      cumImportedArr: [], // 累计境外输入
      dateArr: [], //日期
      dataListCountry: [], //接收country的封装好的数据
      detailTitle: "全国", //用来传递省市区的layer层的title
      districtDataList: [], //获取省市县（全国不要）的echarts的datalist
      _wfsLayerUrl: "http://192.168.3.203:8080/geoserver/agcim/ows?service=WFS",
    };
  },
  created() {
    let vm = this;
    pickerHelper = new PickerHelper(viewer);
    widgetConfigHelper.getConfigTo(
      "EpidemicCtrl-fullscreen",
      vm._data,
      function (a) {
        vm.addData();
        chartData.getCountryMsg(vm.detailTitle);
      }
    );
  },
  mounted() {},
  methods: {
    addData() {
      var _this = this;
      serverLayer.viewer = viewer;
      this.epidmicCtrlLayer_Province = cesLayer.getDatasourceById(
        viewer,
        "epidmicCtrlLayer_Province"
      );
      serverLayer.setViewportOfProvince();

      if (this.epidmicCtrlLayer_Province) {
        this.epidmicCtrlEntities = this.epidmicCtrlLayer_Province._entityCollection._entities._array;
        this.setLayerVisible(this.epidmicCtrlLayer_Province, true);
        this.curEpidmicCtrlLayer = "province";
        this.epidmicCtrlLayer = cesLayer.getDatasourceById(
          viewer,
          "epidmicCtrlLayer"
        );
        cesLayer.removeLayer(viewer, this.epidmicCtrlLayer);
      } else {
        cesLayer.addWFSLayer(
          this._data._wfsLayerUrl,
          "epidmicCtrlLayer_Province",
          "agcim:" + this.curEpidmicCtrlLayer,
          {
            cql_filter: "Code like '%0%'",
          },
          this.afterLayerLoad
        );
      }
      bubble.initialize(viewer);
      popup.initialize(viewer);
      this.onResourcesLoad(viewer);

      serverData.getEpidemicData(this.curTableName, this, "epidemicData");
      legendData.loadLengend();
      // if (this.curEpidmicCtrlLayer == "community") {
      //   this.getInfoCommunity();
      // }
      //nameOverly.initialize(viewer);
    },
    moment,
    getCurrentData() {
      return new Date().toLocaleDateString();
    },
    // 返回疫情首页
    backEpidemicHome() {
      //清除图层
      cesLayer.removeLayer(viewer, this.epidmicCtrlLayer);
      // 移除所有加载的模型
      villageModel.removeAll(viewer);
      resident.removeAll(viewer);
      //关闭小区人口出入面板
      this.personMonitorTableShow = false;
      //echarts中国范围
      this.detailTitle = "全国";
      chartData.getCountryMsg(this.detailTitle);

      // //判断当前是否为小区视图
      // if (this.monitorObject == "community") {
      //   // 移除所有加载的模型
      //   villageModel.removeAll(viewer);
      //   resident.removeAll(viewer);
      // }

      // if(this.monitorObject == "city"){
      //    cesLayer.removeLayer(viewer, this.epidmicCtrlLayer);
      // }

      //判断当前是否为小区视图
      if (this.monitorObject == "community") {
        // 移除所有加载的模型
        villageModel.removeAll(viewer);
        resident.removeAll(viewer);
      }
      this.exitCommunity();
      this.selMonitorObjectShow = true;
      this.chartBoxShow = true;
      this.monitorObject = "epidemicMap";
      this.curEpidmicCtrlLayer = "province";
      this.curTableName = "epidemic_s_province";
      serverData.getEpidemicData(this.curTableName, this, "epidemicData");
      let typeName = this.curEpidmicCtrlLayer;
      let filter = "Code like '%0%'";
      // let filter = "ProvinceNa = '广东省'";
      this.resetEpidemicMap(typeName, filter);
      // 定位到中国范围
      serverLayer.setViewportOfProvince();
    },
    /**
     * 疫情地图/复工情况 切换操作
     */
    switchMonitorObject(e) {
      let _this = this;
      this.monitorObject = e.target.value;
      if (this.monitorObject == "epidemicMap") {
        this.chartBoxShow = true;
        if (this.curEpidmicCtrlLayer == "province") {
          this.setLayerVisible(this.epidmicCtrlLayer_Province, true);
        } else {
          this.setLayerVisible(this.epidmicCtrlLayer, true);
        }
        migrateData.setVisible(false);
      } else {
        this.chartBoxShow = false;
        bubble.hide();
        if (this.curEpidmicCtrlLayer == "province") {
          this.setLayerVisible(this.epidmicCtrlLayer_Province, false);
        } else {
          this.setLayerVisible(this.epidmicCtrlLayer, false);
        }
        if (migrateData.isMigrate) {
          migrateData.setVisible(true);
        } else {
          migrateData.sort();
          this.updateMigrate();
        }
      }
    },
    setLayerVisible(layer, visible) {
      if (!layer) return;
      layer.show = visible;
    },
    // 疫情地图 子项 切换操作
    handleEpidemicMapChange(e) {
      this.diagnosisState = e.target.value;
      this.curEpidemicMapMsg = this.epidemicMapMsg[e.target.value];
      if (this.epidmicCtrlLayer_Province || this.epidmicCtrlLayer) {
        this.renderLayer();
      }
      this.setLayerVisible(this.epidmicCtrlLayer_Province, true);
      this.setLayerVisible(this.epidmicCtrlLayer, true);
    },
    // 复工情况 子项 切换操作
    handleReturnWorkSituationChange(e) {
      this.returnWorkState = e.target.value;
    },
    /**
     * 更新迁徙数据
     */
    updateMigrate() {
      if (this.moveInOrMoveOut == "moveIn") {
        this.moveInFieldName = "move_in_city_name";
      } else {
        this.moveInFieldName = "move_out_city_name";
      }
      migrateData.resetMigrate(
        viewer,
        this.moveInOrMoveOut,
        this.moveInFieldName,
        this.moveInCityName
      );
    },
    // 修改时间
    onChangeData() {},
    //显示人物所在剖面，高亮选中人物模型
    findPeople(person) {
      resident.locateTo(viewer, person, villageModel.tileset);
    },
    showPersonTrack(index) {
      this.showTrack = true;
    },
    hideTrackMap() {
      this.showTrack = false;
    },
    migrateAction(key) {
      this.moveInOrMoveOut = key;
      this.updateMigrate();
    },
    // 重置疫情地图
    resetEpidemicMap(typeName, filter) {
      let _this = this;
      cesLayer.removeLayer(viewer, this.epidmicCtrlLayer);
      if (typeName == "province") {
        this.setLayerVisible(this.epidmicCtrlLayer_Province, true);
        return;
      }
      bubble.hide();
      if (this.curEpidmicCtrlLayer == "community") {
        serverLayer.addCommunityLayer(typeName, filter);
        return;
      }
      this.setLayerVisible(this.epidmicCtrlLayer_Province, false);
      cesLayer.addWFSLayer(
        this._data._wfsLayerUrl,
        "epidmicCtrlLayer",
        "agcim:" + typeName,
        {
          cql_filter: filter,
        },
        this.afterLayerLoad
      );
    },
    // 已有确诊、累计确诊、境外输入数据计算
    computeDiagnosisData(item) {
      var num = 0;
      if (this.diagnosisState == "alreadyDiagnosis") {
        //已有确诊
        num = item.existing_confirmed;
      } else if (this.diagnosisState == "cumulativeDiagnosis") {
        //累计确诊
        num = item.cumulative_confirmed;
      } else if (this.diagnosisState == "overseasInput") {
        //境外输入
        num = item.cumulative_imported;
      }
      return num;
    },
    // 渲染地图颜色
    renderLayer() {
      let colorHash = {};
      let heigthHash = {};
      let epidemicDataData = this.epidemicData;
      for (let i = 0; i < epidemicDataData.length; i++) {
        let code = Number(epidemicDataData[i].code);
        let num = this.computeDiagnosisData(epidemicDataData[i]);
        colorHash[code] = legendData.getRGBColor(num);
        heigthHash[code] = num;
      }

      serverLayer.setExtractWithColor(
        this.epidmicCtrlEntities,
        colorHash,
        heigthHash
      );
    },
    afterLayerLoad(dataSource, id) {
      dataSource.name = id;
      viewer.dataSources.add(dataSource); //向地图加载要素
      let entities = dataSource._entityCollection.values;
      viewer.flyTo(dataSource.entities.values, { duration: 2 });

      this.epidmicCtrlEntities = entities;
      this.epidmicCtrlLayer_Province = cesLayer.getDatasourceById(
        viewer,
        "epidmicCtrlLayer_Province"
      );
      this.epidmicCtrlLayer = cesLayer.getDatasourceById(
        viewer,
        "epidmicCtrlLayer"
      );
      this.renderLayer();
    },
    onResourcesLoad(viewer) {
      var _this = this;
      picker.initialize(viewer, function (movement, pickedFeature) {
        villageModel.handleEntityPick(viewer, movement, pickedFeature);
        if (pickedFeature) {
          _this.setDetailBubblePosition(
            viewer,
            movement.position,
            pickedFeature
          );
          return;
        }
        bubble.hide();
      });
    },
    setDetailBubblePosition(viewer, position, pickedFeature) {
      let _this = this;
      let entity = pickedFeature.id;
      let properties = entity.properties;
      let code;
      if (
        this.curEpidmicCtrlLayer == "province" ||
        this.curEpidmicCtrlLayer == "city" ||
        this.curEpidmicCtrlLayer == "county"
      ) {
        // if (this.curEpidmicCtrlLayer != "province" ) {
        code = properties.Code._value;
      } else if (this.curEpidmicCtrlLayer == "community") {
        code = entity.name;
      }
      //小区model人口流动表名字
      else if (this.curEpidmicCtrlLayer == "communityModel") {
        code = entity.name;
        this.communityDoorName = entity.name;
      }

      if (bubble.isVisible() && code == this.curCode) {
        bubble.hide();
      } else {
        // entity.polygon.material =Cesium.Color.BLUE;
        let regionNameVal = "";
        if (this.curEpidmicCtrlLayer == "province") {
          regionNameVal = properties.ProvinceNa._value;
          this.detailTitle = properties.ProvinceNa._value;
          //省的echarts渲染
          chartData.getProvinceMsg(this.detailTitle);
        } else if (this.curEpidmicCtrlLayer == "city") {
          regionNameVal = properties.CityNa._value;
          this.detailTitle = properties.CityNa._value;
          //市的echarts渲染
          chartData.getCityMsg(this.detailTitle);
        } else if (this.curEpidmicCtrlLayer == "county") {
          regionNameVal = properties.CountyNa._value;
          this.detailTitle = properties.CountyNa._value;
          //县的echarts渲染
          chartData.getCountyMsg(this.detailTitle);
        } else if (this.curEpidmicCtrlLayer == "community") {
          regionNameVal = entity.name;
          this.detailTitle = entity.name;
          //小区的echarts渲染
          chartData.getCommunityMsg(this.detailTitle);
        }
        //出入人口流动表头名字
        else if ((this.curEpidmicCtrlLayer = "communityModel")) {
          this.personMonitorTableShow = true;
        }

        bubble.showAt(position.x, viewer.canvas.clientHeight - position.y);
        bubble.setRegionName(regionNameVal);

        // if (this.curEpidmicCtrlLayer != "community") {
        if (
          this.curEpidmicCtrlLayer == "province" ||
          this.curEpidmicCtrlLayer == "city" ||
          this.curEpidmicCtrlLayer == "county"
        ) {
          bubble.setRegionNum(
            this.getDiagnosisDataByCode(properties.Code._value)
          );
        } else {
          bubble.setRegionNum("");
        }
        // this.curCode = code;
        bubble.bindDetailHandler(function () {
          if (_this.curEpidmicCtrlLayer == "province") {
            _this.curEpidmicCtrlLayer = "city";
            _this.curTableName = "epidemic_s_city";
            _this.filter = "ProvinceNa = '" + regionNameVal + "'";
          } else if (_this.curEpidmicCtrlLayer == "city") {
            _this.curEpidmicCtrlLayer = "county";
            _this.curTableName = "epidemic_s_county";

            _this.filter = "CityNa = '" + regionNameVal + "'";

            var curEpidmicCtrlLayer = "community";
            var filter = "1=1";
            serverLayer.addCommunityLayer(curEpidmicCtrlLayer, filter);
            _this.filter = "CityNa = '" + regionNameVal + "'";
          } else if (_this.curEpidmicCtrlLayer == "county") {
            _this.curEpidmicCtrlLayer = "community";
            // _this.filter = "1=1";
            // _this.resetEpidemicMap(_this.curEpidmicCtrlLayer, _this.filter);
            return;
          } else if (_this.curEpidmicCtrlLayer == "community") {
            // 测试进入保利天悦小区
            _this.clearCommunityPoint();
            villageModel.initialize(viewer);
            _this.gotoCommunity();
            _this.curEpidmicCtrlLayer = "communityModel"; //构建小区模型，确定小区出入人口面板出现

            _this.filter = "1=1";
            _this.resetEpidemicMap(_this.curEpidmicCtrlLayer, _this.filter);
            return;
          } else if (_this.curEpidmicCtrlLayer == "community") {
            // 测试进入保利天悦小区
            _this.clearCommunityPoint();
            villageModel.initialize(viewer);
            _this.gotoCommunity();
            return;
          }
          serverData.getEpidemicData(_this.curTableName, _this, "epidemicData");
          _this.resetEpidemicMap(_this.curEpidmicCtrlLayer, _this.filter);
        });
      }
    },
    /**
     * 进入小区级别
     */
    gotoCommunity() {
      resident.initialize();
    },
    /**
     * 退出小区的级别
     */
    exitCommunity() {
      this.personMonitorTableShow = false;
      serverLayer.removeCommunityLayer();
    },
    //小区视图下隐藏控件
    clearCommunityPoint() {
      cesLayer.removeLayer(viewer, this.epidmicCtrlLayer);
      this.chartBoxShow = false;
      this.selMonitorObjectShow = false;
      // this.personMonitorTableShow = true;
      this.monitorObject = "community";
      bubble.hide();
    },
    // 通过地区编码查找疫情数量
    getDiagnosisDataByCode(code) {
      let diagnosisData;
      let epidemicDataData = this.epidemicData;
      for (let i = 0; i < epidemicDataData.length; i++) {
        if (code == Number(epidemicDataData[i].code)) {
          diagnosisData = this.computeDiagnosisData(epidemicDataData[i]);
          break;
        }
      }
      return diagnosisData;
    },
    // 渲染表格数据
    setTableItem() {
      let table = "";
      let data = this.curMigrateData;
      if (data && data.length > 0) {
        let len = data.length > 10 ? 10 : data.length;
        for (let i = 0; i < len; i++) {
          table +=
            "<tr><td>" +
            (i + 1) +
            "</td>" +
            "<td>" +
            data[i].move_out_city_name +
            "-" +
            data[i].move_in_city_name +
            "</td>" +
            "<td>" +
            data[i].new_migrated +
            "</td></tr>";
        }
      } else {
        table += "<tr><td></td><td>暂无数据</td><td></td></tr>";
      }

      document
        .getElementsByClassName("migrate-table")[0]
        .getElementsByTagName("tbody")[0].innerHTML = table;
    },
    // 按最大值排序
    sortByMaxiMum() {
      let data = this.migrateData;
      let max;
      for (let i = 0; i < data.length; i++) {
        for (let j = i; j < data.length; j++) {
          if (data[i].new_migrated < data[j].new_migrated) {
            max = data[j];
            data[j] = data[i];
            data[i] = max;
          }
        }
      }
      this.migrateData = data;
    },
    // 筛选迁出、迁入城市为选定城市的数据
    screenMigrateDataByCity(inOrOut) {
      let data = [];
      let migrateData = this.migrateData;
      for (let i = 0; i < migrateData.length; i++) {
        if (migrateData[i][inOrOut] == this.moveInCityName) {
          data.push(migrateData[i]);
        }
      }
      return data;
    },
    // 重置渲染添加，添加迁徙图
    resetMigrate() {
      this.curMigrateData = this.screenMigrateDataByCity(this.moveInFieldName);
      this.setTableItem();
      this.removeMigrateEntities();
      if (this.curMigrateData && this.curMigrateData.length) {
        // 迁入
        if (this.moveInOrMoveOut == "moveIn") {
          this.addmigrate(viewer, this.curMigrateData);
          return;
        }
        // 迁出
        for (let i = 0; i < this.curMigrateData.length; i++) {
          this.addmigrate(viewer, [this.curMigrateData[i]]);
        }
      }
    },
    // 添加迁徙图
    addmigrate: function (viewer, outPntsList) {
      let _this = this;
      let location = outPntsList[0].move_in_city_location.split(",");
      let gzCentrePnt = [Number(location[0]), Number(location[1])];
      let gdOtherCityPntsList = outPntsList;
      let arcs = [];
      gdOtherCityPntsList.forEach((city) => {
        let Longitude = city.move_out_city_location.split(",")[0];
        let Latitude = city.move_out_city_location.split(",")[1];
        let cityPnt = [Number(Longitude), Number(Latitude)];
        let arc = drawArc.get3DArc(gzCentrePnt, cityPnt, 12000, 10);
        arcs.push(arc);
      });
      for (let arc of arcs) {
        var glowingLine = viewer.entities.add({
          name: "migrateEntitie",
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(arc),
            width: 10,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.5,
              taperPower: 0.5,
              color: Cesium.Color.AQUAMARINE,
            }),
          },
        });
      }
      this.isMigrate = true;
    },
    // 设置迁徙图是否显示
    setMigrateIsShow(isShow) {
      let getMigrateEntities = this.getMigrateEntities();
      for (let i = 0; i < getMigrateEntities.length; i++) {
        getMigrateEntities[i].show = isShow;
      }
    },
    // 移除迁徙图
    removeMigrateEntities() {
      let getMigrateEntities = this.getMigrateEntities();
      for (let i = 0; i < getMigrateEntities.length; i++) {
        viewer.entities.remove(getMigrateEntities[i]);
      }
    },
    // 获取迁徙图所有实体
    getMigrateEntities() {
      let entities = viewer.entities._entities._array;
      let migrateEntities = [];
      for (let i = 0; i < entities.length; i++) {
        if (entities[i].name == "migrateEntitie") {
          migrateEntities.push(entities[i]);
        }
      }
      return migrateEntities;
    },
    //加载geoserver 发布的wfs服务
    addWFSLayer: function (viewer, option, callback) {
      let resource = Cesium.Resource.fetchJson({
        url: "http://192.168.3.203:8080/geoserver/agcim/ows?service=WFS",
        id: option.id,
        queryParameters: {
          request: "GetFeature",
          version: "1.0.0",
          typeName: option.typeName,
          // 'MAXFEATURES': 10,
          outputFormat: "application/json",
          cql_filter: option.cql_filter, //例如"ProvinceNa = '广东省'";
        },
      });
      resource.then((json) => {
        Cesium.GeoJsonDataSource.load(json, {
          clapToGround: true,
        }).then((dataSource) => {
          if (callback) {
            callback(dataSource, option.id);
          }
        });
      });
    },
    // 定位到中国范围
    setViewProvince() {
      viewer.camera.setView({
        destination: Cesium.Rectangle.fromDegrees(
          73.50114210012788,
          6.323625505013069,
          135.08851148002088,
          53.56090105044318
        ),
      });
    },
    // 根据表名称 获取防疫数据信息
    async getEpidemicData() {
      this.epidemicData = await article.getInfoByTableName(this.curTableName);
      return this.epidemicData;
    },
    // 根据表名称 获取防疫数据信息、迁徙数据
    async getMigrationData() {
      this.migrateData = await article.getInfoByTableName(
        "epidemic_d_migration"
      );
    },
    // 转码
    str2Unicode(str) {
      var es = [];
      for (var i = 0; i < str.length; i++)
        es[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
      return "\\u" + es.join("\\u");
    },
    nameOverlyLoad(viewer) {
      // Information about the currently selected feature
      var selected = {
        feature: undefined,
        originalColor: new Cesium.Color(),
      };
      // An entity object which will hold info about the currently selected feature for infobox display
      var selectedEntity = new Cesium.Entity();
      // HTML overlay for showing feature name on mouseover
      var nameOverlay = document.createElement("div");
      viewer.container.appendChild(nameOverlay);
      nameOverlay.className = "backdrop";
      nameOverlay.style.display = "none";
      nameOverlay.style.position = "absolute";
      nameOverlay.style.bottom = "0";
      nameOverlay.style.left = "0";
      nameOverlay.style["pointer-events"] = "none";
      nameOverlay.style.padding = "4px";
      nameOverlay.style.backgroundColor = "yellowgreen";
      // If silhouettes are supported, silhouette features in blue on mouse over and silhouette green on mouse click.
      // If silhouettes are not supported, change the feature color to yellow on mouse over and green on mouse click.
      if (Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)) {
        // Silhouettes are supported
        var silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
        silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
        silhouetteBlue.uniforms.length = 0.01;
        silhouetteBlue.selected = [];
        var silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
        silhouetteGreen.uniforms.color = Cesium.Color.LIME;
        silhouetteGreen.uniforms.length = 0.01;
        silhouetteGreen.selected = [];
        viewer.scene.postProcessStages.add(
          Cesium.PostProcessStageLibrary.createSilhouetteStage([
            silhouetteBlue,
            silhouetteGreen,
          ])
        );
        // Silhouette a feature blue on hover.
        pickerHelper.on("MOUSE_MOVE", function (movement) {
          // If a feature was previously highlighted, undo the highlight
          silhouetteBlue.selected = [];
          // Pick a new feature
          var pickedFeature = viewer.scene.pick(movement.endPosition);
          if (!Cesium.defined(pickedFeature)) {
            nameOverlay.style.display = "none";
            return;
          }
          // A feature was picked, so show it's overlay content
          nameOverlay.style.display = "block";
          nameOverlay.style.bottom =
            viewer.canvas.clientHeight - movement.endPosition.y + "px";
          nameOverlay.style.left = movement.endPosition.x + "px";
          nameOverlay.textContent = pickedFeature.id._id;
          // Highlight the feature if it's not already selected.
          if (pickedFeature !== selected.feature) {
            silhouetteBlue.selected = [pickedFeature];
          }
        });
      }
    },
  },

  destroyed() {
    if (villageModel.tileset) {
      villageModel.removeAll(viewer);
    }
    nameOverly.dispose();
    picker.dispose();
    cesLayer.removeLayer(viewer, this.epidmicCtrlLayer);
  },
};
</script>
<style scoped src="./css/index.css"></style>
<style scoped src="./css/style.css"></style>
<style scoped>
#data-list {
  height: 90%;
  overflow-y: auto;
}
</style>
