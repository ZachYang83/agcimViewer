<template>
  <div>
    <div class="ag-villageBuilding">
      <a-layout>
        <a-layout-content>
          <div>
            <div v-if="showPlanList">
              <div class="filter-search">
                <a-row>
                  <a-col :span="24" align="left">
                    <a-input-search
                      placeholder="输入方案名称搜索"
                      :loading="loading"
                      enterButton
                    />
                  </a-col>
                </a-row>
                <a-row class="ag-option-group">
                  <a-col :span="9" align="center">
                    <a-button
                      class="ag_new_tag"
                      @click="handleNewHousingStatus(true)"
                      >新建房屋</a-button
                    >
                  </a-col>
                  <a-col :span="9" align="center" v-if="!isRemoveActiveSlice">
                    <a-button
                      class="ag_new_tag"
                      @click="handleActiveSlice(true)"
                      >模型剖切</a-button
                    >
                  </a-col>
                  <a-col :span="9" align="center" v-else>
                    <a-button
                      class="ag_new_tag"
                      @click="handleremoveActiveSlice(true)"
                      >撤销剖切</a-button
                    >
                  </a-col>
                </a-row>
              </div>
              <div class="bin_select_panel">
                <a-col
                  class="gutter-row item_t"
                  :span="12"
                  v-for="(item, index) in personPlanArr"
                  :key="item.id"
                >
                  <a-card :title="item.name" size="small">
                    <a
                      slot="extra"
                      v-if="!isNullOrEmpty(item.beferPath)"
                      @click="showPlanDetailPanel(item)"
                      >详情 ></a
                    >

                    <div class="ag-personPlan-list-content">
                      <div
                        class="ag-addHouseInfo"
                        @click="showHousingChoose(index)"
                        v-if="
                          item.beferPath == null ||
                          item.beferPath == undefined ||
                          item.beferPath.length == 0
                        "
                      >
                        <a-icon type="plus" />
                        <a>添加房屋信息{{ item.beferPath }}</a>
                      </div>
                      <a-row v-else>
                        <a-col :span="7" align="left">
                          <!-- <input
                            type="file"
                            :value="item.img"
                            :id="item.id"
                            style="display: none"
                          /> -->
                          <div
                            v-if="!isNullOrEmpty(item.img)"
                            class="img_gg_ss"
                          >
                            <img
                              :src="item.img"
                              width="90%"
                              height="90"
                              class="list_img_item"
                            />
                          </div>
                          <div
                            class="ag-personPlan-addPic"
                            v-else
                            @click="getScreenshot(index)"
                          >
                            <a-icon type="plus" />
                            <div>
                              <a>点击截图</a>
                            </div>
                          </div>
                        </a-col>
                        <a-col :span="16">
                          <p class="ag-groundInfo">
                            地块信息:<a
                              ><a-icon
                                type="environment"
                                @click="handleLocation(item)" /></a
                            >{{
                              item.landInfo == null ||
                              item.landInfo == undefined ||
                              item.landInfo.length == 0
                                ? ""
                                : item.landInfo
                            }}
                          </p>
                          <p class="ag-personPlan-description">
                            方案简介:{{ item.description }}
                          </p>
                          <div>
                            操作：
                            <a @click="loadPlan(item, index)">加载</a>

                            <span v-if="index == chooseNum">
                              <a-divider type="vertical" />
                              <a
                                @click="
                                  materialSMKpanelPopupState(true, 'edit')
                                "
                                >修改材料</a
                              >
                              <a-divider type="vertical" />
                              <a
                                @click="materialSMKpanelPopupState(true, 'add')"
                                >新增设施</a
                              >
                            </span>
                          </div>
                          <p>创建时间:{{ item.createTime }}</p>
                        </a-col>
                      </a-row>
                    </div>
                  </a-card>
                </a-col>
              </div>
            </div>
            <div v-else>
              <planDetail
                :selectPlanPropety="selectPlanPropety"
                :backPlanList="backPlanList"
              ></planDetail>
              <div class="do_group">
                <a-button
                  class="house_compared"
                  value="small"
                  icon="rollback"
                  title="返回方案列表"
                  @click="backPlanList"
                  >返回方案列表</a-button
                >
              </div>
            </div>
            <!-- 新建房屋 -->
            <PlanEditPopup
              :visible="isPlanEditPopup"
              v-on:closePanel_planEditPopup="handleNewHousingStatus(false)"
              v-on:onPlanEditPopupSubmit="onPlanEditPopupSubmit"
            ></PlanEditPopup>
            <!-- 选择房屋 -->
            <BIMHousingChoosePopup
              :visible="isBIMHousingChoosePopup"
              v-on:showIndexBin="showIndexBin"
              v-on:hidePanel_BIMHousingChoose="hidePanel_BIMHousingChoose"
            ></BIMHousingChoosePopup>
            <!-- 构件商店 -->
            <MaterialSMKpanel
              :visible="isMaterialSMKpanelPopup"
              v-on:onCancel="materialSMKpanelPopupState(false)"
              ref="MaterialSMKpanel"
              @replaceIndexMaterialPrev="replaceIndexMaterialPrev"
              @replaceIndexMaterialReset="replaceIndexMaterialReset"
              @replaceIndexMaterial="replaceIndexMaterial(arguments)"
              @addIndexMaterial="addIndexMaterial(arguments)"
              @handleSaveMaterial="handleSaveMaterial"
              :clickMakingInfo="clickMakingInfo"
            ></MaterialSMKpanel>
            <!-- 装配式建筑 -->
            <BuildHousePanel
              :visible="isShowBuildingPanel"
              @closePanel="closeHouseBuilding"
              ref="buildingHose"
            />
          </div>
        </a-layout-content>
      </a-layout>
    </div>
  </div>
</template>
<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import schemeServer from "./server/schemeServer";
import modelManager from "./js/modelManager";
import PlanEditPopup from "./planEdit-Popup";
import BIMHousingChoosePopup from "./bIMHousingChoose";
import RepalceMemeber from "./js/repalceMemeber";
import sizeMarkingHouse from "./js/sizeMarkingHouse";
import indoorRoam from "./../../widgets/CommunityCIM/FireRAnalysis/js/indoorRoam";
import MaterialSMKpanel from "./materialSuperMarket";
import loadPlanHelper from "./js/loadPlanHelper";
import planDetail from "./planDetail";
import BuildHousePanel from "./buildingHouse/index";
import sliceTool from "./tool/sliceTool";
import { initPoaLayer } from "./js/config";
import {
  BUILDING_HOUSE,
  BUILDING_METERIAL,
  BUILDING_TREE,
  BUILDING_CAR,
  BUILDING_ENTITYPARCEL,
} from "./js/buildingType";
import {
  setCameraPosition,
  getCurrentPosition,
  setHighlighted,
  getHouseIdByPickedFeature,
  getTableNameByFeature,
  getHouseTilesetById,
  getselectedFeatureId,
} from "./js/common.js";

let tilesetObj = {};
let selectedFeature;
let isMoveModel = false;
let isShowBinSelectPanel = false;
let isActiveSearch = false;
let isSctiveBinSelect = false;
let isActiveComponent = false;
let isActiveTexture = false;
let isActiveStatics = false;
let isActiveGrow = false;
let isActiveHouseBuilding = false;
let isPlantTrees = false;
let isPlantCar = false;
let isPipeLine = false;
let isBuilding = false;
let isAddGltf = false;
let isRepalce = false;
let currentSelectTileset = null;
let selectBinPropety = null;
let modelUrl = null;
let globeStyle = null;

export default {
  data() {
    return {
      visible: false,
      showPlanList: true,
      searchValue: "",
      personPlanArr: null,
      isPlanEditPopup: false,
      isBIMHousingChoosePopup: false, //记录选择的视第条数据
      chooseNum: null,
      loading: false,
      isMaterialSMKpanelPopup: false, //构件替换 添加构件状态
      selectPlanPropety: null, //详情列表
      gltfMeasure: 0,
      isShowBuildingPanel: false, //装配式建筑状态
      isActiveSlice: false, //模型剖切状态
      isRemoveActiveSlice: false, //撤销剖切状态
      clickMakingInfo: null, //选中构件的信息
    };
  },
  components: {
    PlanEditPopup, //新建房屋
    BIMHousingChoosePopup,
    MaterialSMKpanel, //构件替换 新增
    planDetail, //详情列表
    BuildHousePanel, //装配式建筑
  },
  mounted() {
    let _this = this;
    if (CIM.viewer) CIM.viewer.scene.debugShowFramesPerSecond = true;
    modelManager.addLandEntities();
    // setCameraPosition();
    this.mapClick();
    this.loadData(); //获取房屋列表数据
    widgetConfigHelper.setInitSence(initPoaLayer, CIM.viewer);
  },
  //props: ["binSuermarketArr", "indexSuperMarket", "agFeatureLayer"],
  methods: {
    // 截图
    base64ToBlob(urlData, type) {
      let arr = urlData.split(',');
      let mime = arr[0].match(/:(.*?);/)[1] || type;
      // 去掉url的头，并转化为byte
      let bytes = window.atob(arr[1]);
      // 处理异常,将ascii码小于0的转换为大于0
      let ab = new ArrayBuffer(bytes.length);
      // 生成视图（直接针对内存）：8位无符号整数，长度1个字节
      let ia = new Uint8Array(ab);
      for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ab], {
        type: mime
      });
    },
    getScreenshot(index) {
      this.chooseNum = index
      currentPlanId = this.personPlanArr[index].id
      this.snapshotObj = new agcim.utils.Snapshot()
      this.snapshotObj.initialize((img, type)=>{
        let image = this.base64ToBlob(img, type)
        this.personPlanArr[index].img = new File([image], Math.random() + '.' + type, {
            type: 'image/png'
        });
        this.handleHouseInfoByServer("edit");
      })
    },
    //判空
    isNullOrEmpty(data) {
      return (
        data == null || data == undefined || data.length == 0 || data == ""
      );
    },
    //点击返回方案列表
    backPlanList() {
      this.showPlanList = true;
      this.loadData();
    },
    //加载
    loadPlan(e, index) {
      this.chooseNum = index;
      if (currentPlanId == e.id) return;
      loadPlanHelper.removeByPlanId(currentPlanId);
      loadPlanHelper.loadPlanById(this, e.id);
      currentPlanId = e.id;
    },
    //保存替换/添加 构件
    handleSaveMaterial() {
      this.handleHouseInfoByServer("edit");
    },
    //点击修改材料
    materialSMKpanelPopupState(state, type) {
      this.isMaterialSMKpanelPopup = state;
      if (!this.isNullOrEmpty(type)) {
        this.$refs.MaterialSMKpanel.type = type;
      }
    },
    //构件替换撤回
    replaceIndexMaterialPrev() {
      RepalceMemeber.prev();
    },
    replaceIndexMaterialReset() {
      RepalceMemeber.reset();
    },
    //关闭房屋建造頁面
    closeHouseBuilding() {
      this.isShowBuildingPanel = false;
      this.handleHouseInfoByServer("add");
    },

    // 移除剖切
    handleremoveActiveSlice() {
      this.isRemoveActiveSlice = false;
      sliceTool.cleanPlane(CIM.viewer);
    },
    //添加构件添加
    addIndexMaterial(data) {
      let e = data[0];
      let index = data[1];
      modelUrl = e.url;
      isAddGltf = true;

      this.gltfMeasure =
        data[0].measure == null ||
        data[0].measure == undefined ||
        data[0].measure.length == 0
          ? 10
          : data[0].measure;
      // if (e.url) {
      //   if (selectedFeature instanceof Cesium.Cesium3DTileFeature) {
      //     RepalceMemeber.Initialize(selectedFeature, e.url, index);
      //   } else {
      //     RepalceMemeber.Initialize(selectedFeature.primitive, e.url, index);
      //   }
      //   this.emptyLeftClickEvent();
      // }
       this.emptyLeftClickEvent();
    },
    //执行构件替换
    replaceIndexMaterial(data) {
      let e = data[0];
      let index = data[1];
      modelUrl = e.url;
      isShowBinSelectPanel = false;
      if ("景观-车" === e.componentType) {
        isPlantCar = true;
        return;
      }
      if ("景观-树" === e.componentType) {
        isPlantTrees = true;
        return;
      }

      if (e.url) {
        if (selectedFeature instanceof Cesium.Cesium3DTileFeature) {
          RepalceMemeber.Initialize(selectedFeature, e, index);
        } else {
          RepalceMemeber.Initialize(selectedFeature.primitive, e, index);
        }
        this.emptyLeftClickEvent();
      }
    },
    //读取房屋列表数据
    async loadData() {
      let _this = this;
      let user = _this.$store.state.user;
      //查询JSON
      let param = {
        page: 0,
        rows: 1000000,
        userId: user.userId,
      };
      if (_this.searchValue != "") {
        param.name = _this.searchValue;
      }
      //农房 我的房屋列表查询
      let data = await schemeServer.findScheme(param);
      let beferPath = schemeServer.previewSchemeUrl + "?thumb=";
      let result = data.content.rows;
      //设置3dtil的路径
      try{
        let filterDa = result.map((item) => {
          item.img = beferPath + item.thumb;
          item.beferPath = beferPath;
          if (!item.thumb) {
            //加载默认缩略图
            item.img = undefined;
          }
          return item;
        });
        _this.personPlanArr = result;
      }catch(e){
        console.log(e)
      }
    },
    //新建房屋显示/关闭 true/false
    handleNewHousingStatus(state) {
      this.isPlanEditPopup = state;
    },
    //添加房屋回调
    onPlanEditPopupSubmit(data) {
      this.personPlanArr.unshift(data);
    },
    //添加房屋信息
    showHousingChoose(index) {
      this.chooseNum = index; //记录选择的视第条数据
      this.isBIMHousingChoosePopup = true;
    },
    showIndexBin(e) {
      let _this = this;
      let tempPersonPlanArr = this.personPlanArr;
      tempPersonPlanArr[this.chooseNum].beferPath = e.beferPath;
      this.personPlanArr = tempPersonPlanArr;

      selectBinPropety = e;
      this.emptyLeftClickEvent();
      isActiveGrow = true;
    },
    hidePanel_BIMHousingChoose() {
      this.isBIMHousingChoosePopup = false;
    },
    //清楚左键点击状态
    emptyLeftClickEvent() {
      isActiveSearch = false;
      isSctiveBinSelect = false;
      isActiveGrow = false;
      isActiveStatics = false;
      isRepalce = false;
      isActiveComponent = false;
      this.isActiveSlice = false;
      isActiveTexture = false;
      isPlantTrees = false;
      isPlantCar = false;
      isMoveModel = false;
      isActiveHouseBuilding = false;
      //关闭漫游
      (this.isActiveRoam = false), (indoorRoam.isActiveRoam = false);
    },
    //保存房屋新增信息（臨時 不存數據庫）
    handleHouseInfo(ret) {
      this.isBIMHousingChoosePopup = false;
      if (!this.isNullOrEmpty(ret) && !this.isNullOrEmpty(ret[1])) {
        let tempPersonPlanArr = this.personPlanArr;
        tempPersonPlanArr[this.chooseNum].landInfo = ret[1].id._name;
        this.personPlanArr = tempPersonPlanArr;
      }
      //上传到服务器上
      // this.handleHouseInfoByServer()
    },
    //点击详情
    showPlanDetailPanel(e) {
      this.showPlanList = false;
      let indexData = this.personPlanArr.filter((i) => i.id == e.id);
      if (indexData.length > 0) {
        this.selectPlanPropety = indexData[0];
      }
    },
    handleHouseInfoByServer(savePath) {
      var modelData = this.getModelData();
      this.spinning = true;
      let landInfo = this.personPlanArr[this.chooseNum].landInfo; //地块名称
      let planName = this.personPlanArr[this.chooseNum].name; //方案名称
      let description = this.personPlanArr[this.chooseNum].description; //方案详情
      const userId = this.$store.state.user.userId; //用户ID
      let file = this.isNullOrEmpty(this.personPlanArr[this.chooseNum].img)
        ? ""
        : this.personPlanArr[this.chooseNum].img; //图片路径 新增保存暂时为空

      const formData = new FormData();
      if (landInfo === undefined || "" === landInfo.trim()) {
        landInfo = "";
      }
      formData.append("landInfo", landInfo);
      if (planName === undefined || "" === planName.trim()) {
        planName = "";
      }
      formData.append("name", planName);
      if (description === undefined || "" === description.trim()) {
        description = "";
      }
      formData.append("description", description);
      formData.append("userId", userId);
      formData.append("file", file);
      for (let i = 0; i < modelData.length; i++) {
        formData.append("materials[" + i + "].type", modelData[i].type);
        formData.append("materials[" + i + "].url", modelData[i].url);
        if (modelData[i].type == "1") {
          formData.append(
            "materials[" + i + "].modelMatrix",
            modelData[i].modelMatrix
          );
          formData.append(
            "materials[" + i + "].propertyUrl",
            modelData[i].propertyUrl
          );
          formData.append(
            "materials[" + i + "].tableName",
            modelData[i].tableName
          );
          formData.append(
            "materials[" + i + "].subtract",
            modelData[i].subtract
          );
          formData.append(
            "materials[" + i + "].obbCenter",
            modelData[i].obbCenter
          );
          if (modelData[i].components) {
            formData.append(
              "materials[" + i + "].components",
              modelData[i].components
            );
          }
          if (savePath != "add") {
            if (modelData[i].style) {
              formData.append("materials[" + i + "].style", modelData[i].style);
            }
          }
          formData.append("materials[" + i + "].id", modelData[i].id);
        } else if (modelData[i].type == "2") {
          formData.append("materials[" + i + "].measure", modelData[i].scale);
          formData.append(
            "materials[" + i + "].position",
            modelData[i].position
          );
          formData.append(
            "materials[" + i + "].orientation",
            modelData[i].orientation
          );
          formData.append("materials[" + i + "].name", modelData[i].name);
          formData.append("materials[" + i + "].angle", modelData[i].angle);
        } else {
          formData.append(
            "materials[" + i + "].componentId",
            modelData[i].componentId
          );
          formData.append(
            "materials[" + i + "].modelMatrix",
            modelData[i].modelMatrix
          );
          formData.append("materials[" + i + "].tileUrl", modelData[i].tileUrl);
          formData.append(
            "materials[" + i + "].componentType",
            modelData[i].componentType
          );
          formData.append(
            "materials[" + i + "].boundingbox",
            modelData[i].boundingbox
          );
          formData.append(
            "materials[" + i + "].topologyelements",
            modelData[i].topologyelements
          );

          formData.append(
            "materials[" + i + "].tableName",
            modelData[i].tableName
          );
          //      component.relationIds = planData[i].relationIds;
          formData.append(
            "materials[" + i + "].relationIds",
            modelData[i].relationIds
          );

          if (modelData[i].size) {
            formData.append("materials[" + i + "].size", modelData[i].size);
            formData.append(
              "materials[" + i + "].clipMatrix",
              modelData[i].clipMatrix
            );
          }
        }
      }
      let res;
      if (savePath == "add") {
        formData.append("id",currentPlanId);
        res = schemeServer.addScheme(formData);
      } else {
        formData.append("id", currentPlanId);
        formData.append("paramType", 1);
        res = schemeServer.updateScheme(formData);
      }
      if (res === undefined) return;
      res
        .then(
          (resp) => {
            if (resp.success) {
              this.$message.success("保存成功");
              this.loadData()
            }
            if (!resp.success) {
            }
          },
          (err) => {}
        )
        .then(() => {
          this.uploading = false;
        });
    },

    getModelData() {
      var modelData = [];
      var planData = CIM.viewer.scene.primitives._primitives;
      for (let i = 0; i < planData.length; i++) {
        if (planData[i] instanceof Cesium.Cesium3DTileset) {
          if (
            !planData[i].userId ||
            planData[i].userId != this.$store.state.user.userId
          )
            continue;
          var primitives = {};
          primitives.type = "1";
          primitives.url = planData[i]._url;
          primitives.tableName = planData[i].tableName;
          primitives.id = planData[i].id; //储存房屋id

          if (planData[i].components) {
            for (let j = planData[i].components.length - 1; j >= 0; j--) {
              if (planData[i].components[j].value.clippingPlane) {
                planData[i].components[j].value.clippingPlane = "[]";
              }
            }
            //primitives.components = planData[i].components; //替换的房屋构件id
            primitives.components = JSON.stringify(planData[i].components);
          }
          if (planData[i].style) {
            primitives.style = planData[i].style.show.expression; //隐藏的房屋构件
          }
          primitives.propertyUrl = planData[i].property_url;
          var subtract = planData[i].subtract;
          primitives.subtract = [subtract.x, subtract.y, subtract.z];
          var obbCenter = planData[i].obbCenter;
          primitives.obbCenter = [obbCenter.x, obbCenter.y, obbCenter.z];
          var transform = planData[i]._root.transform;
          primitives.modelMatrix = [
            transform[0],
            transform[1],
            transform[2],
            transform[3],
            transform[4],
            transform[5],
            transform[6],
            transform[7],
            transform[8],
            transform[9],
            transform[10],
            transform[11],
            transform[12],
            transform[13],
            transform[14],
            transform[15],
          ];
          modelData.push(primitives);
        } else if (planData[i] instanceof Cesium.Model) {
          if (
            planData[i].id.userId &&
            planData[i].id.userId == this.$store.state.user.userId
          ) {
            var entity = {};
            entity.name = planData[i].id.name;
            entity.type = "2";
            entity.angle = planData[i].id.deg;
            entity.url = planData[i]._resource.url;
            var orientation = planData[i].id.orientation._value;
            entity.scale = planData[i].scale;
            entity.orientation = [
              orientation.x,
              orientation.y,
              orientation.z,
              orientation.w,
            ];
            var position = planData[i].id.position._value;
            entity.position = [position.x, position.y, position.z];
            modelData.push(entity);
          } else if (planData[i].userId == this.$store.state.user.userId) {
            var component = [];
            component.type = "3";
            component.componentId = planData[i].id;
            component.url = planData[i].url;
            component.boundingbox = planData[i].boundingbox; //包围盒
            component.topologyelements = planData[i].topologyelements; //拓扑关系
            component.tableName = planData[i].tableName; //表名

            component.designSchemeId = planData[i].designSchemeId; //设计方案ID
            var modelMatrix = planData[i].modelMatrix;
            component.modelMatrix = [
              modelMatrix[0],
              modelMatrix[1],
              modelMatrix[2],
              modelMatrix[3],
              modelMatrix[4],
              modelMatrix[5],
              modelMatrix[6],
              modelMatrix[7],
              modelMatrix[8],
              modelMatrix[9],
              modelMatrix[10],
              modelMatrix[11],
              modelMatrix[12],
              modelMatrix[13],
              modelMatrix[14],
              modelMatrix[15],
            ];
            component.tileUrl = planData[i].tileUrl;
            // component.componentType = planData[i].componentType;

            component.relationIds = planData[i].relationIds;
            component.size = planData[i].size;
            component.clipMatrix = planData[i].clipMatrix;

            modelData.push(component);
          }
        }
      }
      return modelData;
    },
    //模型剖切
    handleActiveSlice() {
      this.isActiveSlice = true;
    },
    //点击构件的信息
    handleClickMakingInfo(ref) {
      if (ref.success == true) {
        this.clickMakingInfo = ref.content.rows[0];
      }
    },
    // 地图点击事件
    mapClick() {
      let viewer = CIM.viewer;
      let _this = this;

      CIM.viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
        movement
      ) {
        var position = viewer.scene.pickPosition(movement.position);
        var pickedFeature;
        // todo  测试
        var pickedFeatures = viewer.scene.drillPick(movement.position); //获取当前坐标下的多个对象
        var currentPosition = getCurrentPosition(movement.position);
        RepalceMemeber.removeMark(); //清除房屋的测量红线
        //先判断是否在地块包围盒里操作
        if (
          pickedFeatures[0] &&
          pickedFeatures[0].id &&
          pickedFeatures[0].id.name === BUILDING_ENTITYPARCEL
        ) {
          pickedFeature = pickedFeatures[1];
          //获取地块包围盒的中心点位置信息
          var polygonPosition =
            pickedFeatures[0].id._polygon.hierarchy._value.positions;
          var cartographic_ = Cesium.Cartographic.fromCartesian(
            Cesium.BoundingSphere.fromPoints(polygonPosition).center
          );
          if (!Cesium.defined(pickedFeature)) {
            return;
          }

          let id = getselectedFeatureId(pickedFeature);
          let tableName = getTableNameByFeature(pickedFeature);

          let houseId = getHouseIdByPickedFeature(pickedFeature);
          currentSelectTileset = getHouseTilesetById(houseId);
          selectedFeature = pickedFeature;

          //点击的是房子
          if (currentSelectTileset) {
            if (pickedFeature.primitive instanceof Cesium.Model) {
              if (id && id.name != BUILDING_TREE && id.name != BUILDING_CAR) {
                setHighlighted(undefined);
                var markingInfo = sizeMarkingHouse.sizeMarking(
                  id,
                  currentSelectTileset,
                  (ref) => {
                    _this.handleClickMakingInfo(ref);
                  }
                );
              }
            } else if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
              setHighlighted(pickedFeature);
              if (id == "1") {
                //点击单体化模型触发事件
                _this.landId = "44532111521200004";
                _this.isShowHouseInfo = true;
              }
              var markingInfo = sizeMarkingHouse.sizeMarking(
                id,
                currentSelectTileset,
                (ref) => {
                  _this.handleClickMakingInfo(ref);
                }
              );
            }
          }

          //种模型或者替换模型
          if (isActiveGrow) {
            _this.handleHouseInfo(pickedFeatures); //臨時保存房屋基本信息
            _this.emptyLeftClickEvent();
            var cartographic = Cesium.Cartographic.fromCartesian(position);

            if (currentSelectTileset) {
              //如果点击的是3dtiles就直接替换
              modelManager
                .replaceHouses(selectBinPropety, currentSelectTileset)
                .then((re) => {
                  //直接保存 如果有装配式建筑请注释掉
                  //_this.handleHouseInfoByServer("add");
                  // //装配式建筑演示
                  _this.isShowBuildingPanel = true;
                  isBuilding = true;
                  _this.$refs.buildingHose.startBuilding(re);
                });
              return;
            }

            modelManager
              .addHouses(selectBinPropety, cartographic_, cartographic.height)
              .then((re) => {
                //直接保存 如果有装配式建筑请注释掉
                //_this.handleHouseInfoByServer("add");
                // //装配式建筑演示
                _this.isShowBuildingPanel = true;
                isBuilding = true;
                _this.$refs.buildingHose.startBuilding(re);
              });

            return;
          }

          //bin点击属性查询
          if (isActiveSearch) {
            _this.isShowBinProtypePanel = true;
            _this.propetyOption = {
              tableName,
              id,
            };
          }
          //纹理替换
          if (isActiveTexture) {
            _this.emptyLeftClickEvent();
          }
          //构件统计
          if (isActiveStatics) {
            _this.isShowBinProtypePanel = true;
            _this.staticsOption = {
              tableName,
              id,
              houseId,
              selectedFeature,
            };
          }
          //模型剖切
          if (_this.isActiveSlice) {
            _this.clippingLayer = undefined;
            if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
              // _this.clippingLayer = binUrl;
              _this.clippingLayer = currentSelectTileset;
            } else {
              if (
                pickedFeature.primitive &&
                pickedFeature.primitive.tableName
              ) {
                var primitives = viewer.scene.primitives._primitives;
                var tableName1 = pickedFeature.primitive.tableName;
                for (var i = 0; i < primitives.length; i++) {
                  if (
                    primitives[i] instanceof Cesium.Cesium3DTileset &&
                    primitives[i].tableName == tableName1
                  ) {
                    _this.clippingLayer = primitives[i];
                  }
                }
              } else {
                _this.$message.info("请点击房屋，否则无法剖切");
              }
            }
            if (_this.clippingLayer) {
              var cartographic = Cesium.Cartographic.fromCartesian(position);
              var floorHeight = cartographic.height;
              sliceTool.createSlice(viewer, _this.clippingLayer, floorHeight);
              _this.isActiveSlice = false;
              _this.isRemoveActiveSlice = true;
            }
          }
          // 室内漫游
          if (_this.isActiveRoam) {
            if (indoorRoam.isActiveRoam) {
              return;
            }
            if (currentSelectTileset) {
              indoorRoam.isActiveRoam = true;
              indoorRoam.Initialize(viewer);
              //打卡阳台门，若从室外到室内，时间为5000
              setTimeout(function () {
                RepalceMemeber.openDoor(currentSelectTileset, "482135");
              }, 43000);
            }
          }
          //种树
          if (isPlantTrees) {
            _this.emptyLeftClickEvent();
            modelManager.addGltf(
              BUILDING_TREE,
              position,
              modelUrl,
              _this.gltfMeasure
            );
          }
          //汽车
          if (isPlantCar) {
            _this.emptyLeftClickEvent();
            modelManager.addGltf(
              BUILDING_CAR,
              position,
              modelUrl,
              _this.gltfMeasure
            );
          }
          ///添加GLTF
          if (isAddGltf) {
            _this.emptyLeftClickEvent();
            modelManager.addGltf(
              BUILDING_CAR,
              position,
              modelUrl,
              _this.gltfMeasure
            );
            isAddGltf = false;
          }
          //移动/旋转
          if (isMoveModel) {
            window.selectMoveEntity(pickedFeature);
          }

          //显示地下管线
          if (isPipeLine) {
            _this.showPiping();
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
  },
};
</script>
<style scoped src="./css/antPro.css"></style> 
<style scoped src="./css/index.css"></style> 
