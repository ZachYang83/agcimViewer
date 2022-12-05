<template>
  <div id="roamContent" class="vscroll">
    <div class="roam-action" v-show="isListPanel">
      <a-dropdown>
        <a-menu slot="overlay" @click="handleAddListClick">
          <a-menu-item key="record">录制</a-menu-item>
          <a-menu-item key="draw">绘制</a-menu-item>
        </a-menu>
        <a-button type="primary">
          <a-icon type="plus" />
        </a-button>
      </a-dropdown>
      <a-dropdown style=" margin: 0 10px;">
        <a-menu slot="overlay" @click="handleTypeClick" v-model="listType">
          <a-menu-item key="thumbnail">缩略图</a-menu-item>
          <a-menu-item key="list">列表</a-menu-item>
        </a-menu>
        <a-button>
          排列方式
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-spin tip="Loading..." :spinning="spinning" />
    </div>
    <div class="roam-list" v-show="isListPanel">
      <div v-for="(item,index) in roamList" :key="item.id">
        <div v-if="listType[0] == 'thumbnail'" class="list-item list-thumbnail">
          <div class="list-com" @click="itemClick(item,index)">
            <a-icon type="play-circle" class="play-icon" v-if="listPlay[index]=='play'" />
            <a-icon type="close-circle" class="play-icon" v-else />
            <img :src="item.json.code" class="list-img" />
            <p v-if="item.json.roamType=='record'">{{item.name}}(录制)</p>
            <p v-else>{{item.name}}(绘制)</p>
          </div>
          <div class="list-action">
            <span class="ibox" v-if="item.json.roamType=='draw'">
              <a-icon type="edit" class="icon" @click="editItem(item,index)" />
            </span>
            <span class="ibox">
              <a-popconfirm title="是否确认要删除？" @confirm="deleteItem(item)" @cancel="deleteCancel" okText="确认" cancelText="取消">
                <a-icon type="delete" class="icon" />
              </a-popconfirm>
            </span>
          </div>
        </div>
        <div v-else class="list-item list">
          <div class="list-com" @click="itemClick(item,index)">
            <div class="list-left">
              <a-icon type="play-circle" class="play-icon" v-if="listPlay[index]=='play'" />
              <a-icon type="close-circle" class="play-icon" v-else />
              <img :src="item.json.code" class="list-img" />
            </div>
            <div class="list-right">
              <label v-if="item.json.roamType=='record'">{{item.name}}(录制)</label>
              <label v-else>{{item.name}}(绘制)</label>
            </div>
          </div>
          <div class="list-action">
            <span class="ibox" v-if="item.json.roamType=='draw'">
              <a-icon type="edit" class="icon" @click="editItem(item,index)" />
            </span>
            <span class="ibox">
              <a-popconfirm title="是否确认要删除？" @confirm="deleteItem(item)" @cancel="deleteCancel" okText="确认" cancelText="取消">
                <a-icon type="delete" class="icon" />
              </a-popconfirm>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="record-panel" v-show="isRecordPanel">
      <div class="h4">录制漫游</div>
      <a-form :model="recordForm" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="名称">
          <a-input v-model="recordForm.name" />
        </a-form-item>
        <!-- <a-form-item label="平滑次数">
          <a-input v-model="recordForm.smoothNumber" />
        </a-form-item> -->
        <a-form-item label="快照效果">
          <img :src="recordForm.code" />
        </a-form-item>
        <a-form-item label="节点数量">
          <p>{{recordForm.nodeNumber}}</p>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 18, offset: 4 }">
          <a-button type="primary" @click="onCaptureNode">捕捉节点</a-button>
          <a-button type="primary" style="margin-left: 10px;" @click="delCaptureNode">删除上一节点</a-button>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 18, offset: 4 }">
          <a-button style="margin-left: 10px;" @click="onSubmitRecor">完成</a-button>
          <a-button style="margin-left: 10px;" @click="onCancelRecor">取消</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="draw-panel" v-show="isDrawPanel">
      <div style="padding-left:10px;margin:-5px 0 10px 0;">
        <a-icon type="arrow-left" @click="onCancelDraw" style="margin-right:10px" />
        <label>绘制漫游</label>
      </div>
      <a-form :model="drawForm" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="名称">
          <a-input v-model="drawForm.name" />
        </a-form-item>
        <a-form-item label="漫游模型">
          <a-select v-model="drawForm.modelType" @change="modelTypeChange">
            <a-select-option value="empty">无</a-select-option>
            <a-select-option value="car">小汽车</a-select-option>
            <a-select-option value="aircraft">飞机</a-select-option>
            <a-select-option value="groundVehicle">装甲车</a-select-option>
            <a-select-option value="balloon">热气球</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="飞行高度" v-show="isFlyHeight==true">
          <a-input-number :min="0.1" v-model="drawForm.flyheight" />
        </a-form-item>
        <a-form-item label="飞行速度">
          <a-input-number :min="1" v-model="drawForm.speed" @change="speedChange" />
        </a-form-item>
        <a-form-item label="视角">
          <a-select v-model="drawForm.visualAngleType" @change="visualAngleTypeChange">
            <a-select-option value="empty">无</a-select-option>
            <!-- <a-select-option value="follow">跟随视角</a-select-option> -->
            <a-select-option value="lockFirst">锁定第一视角</a-select-option>
            <a-select-option value="lockGod">锁定上帝视角</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="视角距离" v-show="drawForm.visualAngleType=='lockFirst'">
          <a-input-number v-model="drawForm.width" @change="widthChange" />
        </a-form-item>
        <a-form-item label="视角高度">
          <a-input-number v-model="drawForm.height" />
        </a-form-item>
        <a-form-item label="显示路线">
          <a-radio-group v-model="drawForm.isShowRoute" @change="showRouteChange">
            <a-radio value="true">是</a-radio>
            <a-radio value="false">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" @click="onPauseOrContinue" id="btnRoad">开始漫游</a-button>
          <a-button type="primary" @click="onRedraw">重新绘制</a-button>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button @click="onSubmitDraw">保存</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script>
import canvas2Image from "@/views/js/extension/canvas2Image.js";
import Draw from "@/sdk/interactive/draw.js";
import Roaming from "./roaming";
import agCamera from "@/sdk/camera/camera";
import agMath from "@/sdk/maths/math";
import serverData from "./js/serverData";
let viewer = CIM.viewer;
let draw = new Draw(viewer);
let roam = null;
export default {
  data() {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
      recordForm: {
        name: "",
        smoothNumber: 2,
        nodeNumber: 1,
        roamType: "record",
        code: "",
        captureNodeList: [],
      },
      drawForm: {
        name: "",
        code: "",
        width: 100,
        height: 100,
        modelType: "empty",
        roamType: "draw",
        flyheight: 1,
        visualAngleType: "lockFirst",
        isShowRoute: "true",
        speed: 50,
        sumDistance: 0,
        sumTime: 0,
        entities: null,
      },
      deleteVisible: false,
      isListPanel: true,
      isRecordPanel: false,
      isDrawPanel: false,
      size: "large",
      tabPosition: "bottom",
      listType: ["thumbnail"],
      addListType: "record",
      modal1Visible: false,
      isContinue: false,
      modal1mask: false,
      range: 1000.0,
      timeLen: 120,
      modelUrl: "",
      roamList: [],
      curList: null,
      curListIndex: null,
      listPlay: [],
      curViewerWidth: 100,
      followedX: -1,
      followedY: 0,
      followedZ: 0,
      isFlyHeight: false,
      spinning: true,
    };
  },
  mounted() {
    this.roamList = this.getPathRoamData();
    this.roamList.then(
      function (data) {
        this.resetPlayIcon();
      }.bind(this)
    );
  },
  methods: {
    // 选择排列方式
    handleTypeClick(e) {
      this.listType = [e.key];
    },
    // 获取列表数据
    async getPathRoamData() {
      this.spinning = true;
      let data = await serverData.getJsonStore("name=pathRoam&page=1&rows=1000");
      let rows = data.content.rows;
      for (let i = 0; i < rows.length; i++) {
        rows[i].json = JSON.parse(rows[i].json);
      }
      this.roamList = rows;
      this.spinning = false;
      return this.roamList;
    },
    // 编辑列表项
    editItem(item, index) {
      this.curList = item;
      this.curListIndex = index;
      if (item && item.json.roamType == "draw") {
        this.drawPanelState = "edit";
        this.setFollowed(this.drawForm.visualAngleType);
        this.openDrawPanel(item);
        this.creatRoaming(item.json.positions);
        this.stopRoam();
      }
    },
    // 取消删除视点列表
    deleteCancel() {
      this.deleteVisible = false;
    },
    // 删除视点列表
    deleteItem(event) {
      let _this = this;
      let param = "paramId=" + event.id;
      let promise = serverData.deleteJsonStore(param);
      promise.then(function (data) {
        _this.getPathRoamData();
      });
      this.deleteVisible = false;
      this.onclose();
    },
    resetPlayIcon() {
      this.listPlay = [];
      for (let i = 0; i < this.roamList.length; i++) {
        this.listPlay[i] = "play";
      }
    },
    // 点击列表
    itemClick(item, index) {
      agCamera.resetCamera(viewer);
      if (index == this.curListIndex) {
        if (this.listPlay[index] == "play") {
          this.resetPlayIcon();
          this.listPlay[index] = "close";
          this.palyList(item);
        } else {
          this.resetPlayIcon();
          this.closeList(item);
        }
      } else {
        this.closeList(item);
        this.resetPlayIcon();
        this.listPlay[index] = "close";
        this.palyList(item);
      }
      this.curList = item;
      this.curListIndex = index;
    },
    palyList(item) {
      if (item.json.roamType == "record") {
        let captureNodes = item.json.captureNodeList;
        this.flyToCaptureNode(captureNodes, 0);
      } else {
        this.creatRoaming(item.json.positions);
        this.setFollowed(this.drawForm.visualAngleType);
        this.startRoam();
      }
    },
    closeList(item) {
      viewer.camera.cancelFlight();
      if (roam) {
        this.onCancelDraw();
      }
    },
    // 打开绘制漫游页面
    openDrawPanel(item) {
      this.isListPanel = false;
      this.isDrawPanel = true;
      if (this.drawPanelState == "add") {
        this.drawForm = {
          name: "",
          code: "",
          width: 100,
          height: 100,
          visualAngleType: "lockFirst",
          isShowRoute: "true",
          speed: this.drawForm.speed,
          sumDistance: 0,
          sumTime: 0,
          entities: null,
        };
      } else {
        this.drawForm = item.json;
      }
    },
    //定位到节点
    flyToCaptureNode(captureNodes, i) {
      let _this = this;
      let captureNode = captureNodes[i];
      let position = captureNode.position;
      let posiotion = new Cesium.Cartesian3(position.x, position.y, position.z);
      let heading = captureNode.heading;
      let pitch = captureNode.pitch;
      let roll = captureNode.roll;

      if (i == 0) {
        viewer.scene.camera.setView({
          destination: position,
          orientation: {
            heading: heading,
            pitch: pitch,
            roll: roll,
          },
          duration: 1,
        });
      }

      viewer.camera.flyTo({
        destination: posiotion,
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: roll,
        },
        duration: 2,
        easingFunction: Cesium.EasingFunction.LINEAR_NONE, // 不加执行完一个之后会停顿
        complete: function () {
          if (i < captureNodes.length - 1) {
            _this.flyToCaptureNode(captureNodes, i + 1);
          } else {
            _this.resetPlayIcon();
          }
        },
      });
    },
    // 添加漫游选择
    handleAddListClick(e) {
      this.addListType = e.key;
      if (this.addListType == "draw") {
        this.drawPanelState = "add";
        this.drawLineStringAndCallBack();
      } else {
        this.isListPanel = false;
        this.isRecordPanel = true;
        let genimg = canvas2Image.capturePng(viewer, "200", null, 0.8);
        this.recordForm.code = genimg.src;
        var s = agCamera.getCameraAsJSON(viewer);
        this.recordForm.captureNodeList.push(s);
      }
    },
    // 创建漫游
    creatRoaming(positions) {
      this.drawForm.sumDistance = 0;
      this.drawForm.sumTime = 0;
      var disArr = [];
      this.drawForm.sumDistance = agMath.getDistances(positions, disArr);
      this.drawForm.sumTime = this.drawForm.sumDistance / this.drawForm.speed;
      this.getModelUrl();
      if (roam) {
        roam.EndRoaming();
        roam = undefined;
      }
      let isShowRoute = this.drawForm.isShowRoute === "false" ? false : true;
      roam = new Roaming(viewer, {
        time: this.drawForm.sumTime,
        entityType: this.drawForm.modelType,
        modelUrl: this.modelUrl,
        Lines: positions,
        flyheight: this.drawForm.flyheight,
        speed: this.drawForm.speed,
        disArr: disArr,
        isPathShow: isShowRoute,
      });
    },

    // 录制漫游完成
    onSubmitRecor() {
      let _this = this;
      this.isListPanel = true;
      this.isRecordPanel = false;
      let roamList = {
        id: this.roamList.length + 1,
        name: this.recordForm.name,
        code: this.recordForm.code,
        captureNodeList: this.recordForm.captureNodeList,
        roamType: "record",
      };
      agCamera.resetCamera(viewer);

      let params = {
        name: this.recordForm.name,
        domain: "GZ",
        usage: "pathRoam",
        url: "",
        sort: "",
        json: JSON.stringify(roamList),
        tag: "",
      };
      let promise = serverData.saveJsonStore(params);
      promise.then(
        function (data) {
          this.getPathRoamData();
        }.bind(this)
      );
    },
    // 取消添加录制漫游
    onCancelRecor() {
      this.isListPanel = true;
      this.isRecordPanel = false;
      this.recordForm = {
        name: "",
        // smoothNumber: 2,
        nodeNumber: 1,
        roamType: "record",
        code: "",
        captureNodeList: [],
      };
    },
    // 绘制漫游完成
    onSubmitDraw() {
      let roamList = {
        name: this.drawForm.name,
        code: this.drawForm.code,
        modelType: this.drawForm.modelType,
        roamType: "draw",
        isShowRoute: this.drawForm.isShowRoute,
        speed: this.drawForm.speed,
        sumDistance: this.drawForm.sumDistance,
        sumTime: this.drawForm.sumTime,
        width: this.drawForm.width,
        height: this.drawForm.height,
        flyheight: this.drawForm.flyheight,
        visualAngleType: this.drawForm.visualAngleType,
        positions: this.drawForm.positions,
      };
      let params = {
        name: this.drawForm.name,
        domain: "GZ",
        usage: "pathRoam",
        url: "",
        sort: "",
        json: JSON.stringify(roamList),
        tag: "",
      };
      let promise;
      if (this.drawPanelState == "add") {
        promise = serverData.saveJsonStore(params);
      } else {
        params.id = this.curList.id;
        promise = serverData.updateJsonStore(params);
      }
      promise.then(
        function (data) {
          this.getPathRoamData();
        }.bind(this)
      );
      this.isListPanel = true;
      this.isDrawPanel = false;
      // viewer.entities.removeAll();
      draw.removeAll();
      roam.PauseOrContinue(false);
    },
    // 取消添加绘制漫游
    onCancelDraw() {
      // viewer.entities.remove(this.drawForm.entities);
      // viewer.entities.removeAll();
      draw.removeAll();
      this.removeEndRoaming();
      this.isListPanel = true;
      this.isDrawPanel = false;
      this.stopRoam();
    },
    // 开始或暂停漫游
    onPauseOrContinue() {
      if (this.isContinue) {
        this.stopRoam();
      } else {
        this.startRoam();
      }
    },
    // 开始漫游
    startRoam() {
      this.isContinue = true;
      if (roam) {
        roam.PauseOrContinue(this.isContinue);
      }
      document.getElementById("btnRoad").innerText = "停止漫游";
      this.preUpdateListener();
    },
    // 停止漫游
    stopRoam() {
      this.isContinue = false;
      if (!roam) {
        return;
      }
      roam.PauseOrContinue(this.isContinue);
      document.getElementById("btnRoad").innerText = "开始漫游";
      agCamera.resetCamera(viewer);
    },
    // 重新绘制
    onRedraw() {
      this.removeEndRoaming();
      this.stopRoam();
      // viewer.entities.removeAll();
      draw.removeAll();
      this.drawLineStringAndCallBack();
    },
    // 绘制线段及回调
    drawLineStringAndCallBack() {
      var _this = this;
      draw.drawMultiPolyline().then(result => {
        var positions = result.positions;
        let genimg = canvas2Image.capturePng(viewer, "318", null, 0.8);
        _this.openDrawPanel(_this.curList);
        _this.drawForm.code = genimg.src;
        _this.drawForm.positions = positions;
        _this.creatRoaming(positions);
      },error => {
        console.log(error);
      })
    },

    // 点击捕捉节点按钮
    onCaptureNode() {
      var s = agCamera.getCameraAsJSON(viewer);
      this.recordForm.captureNodeList.push(s);
      this.recordForm.nodeNumber = this.recordForm.nodeNumber + 1;
    },
    // 删除上一节点
    delCaptureNode() {
      this.recordForm.captureNodeList.pop();
      this.recordForm.nodeNumber = this.recordForm.nodeNumber - 1;
      var lastCaptureNode = this.recordForm.captureNodeList[
        this.recordForm.captureNodeList.length - 1
      ];
      viewer.scene.camera.setView({
        destination: lastCaptureNode.position,
        orientation: {
          heading: lastCaptureNode.heading,
          pitch: lastCaptureNode.pitch,
          roll: lastCaptureNode.roll,
        },
        duration: 1,
      });
    },
    // 修改模型类型
    modelTypeChange(value) {
      this.drawForm.modelType = value;
      this.getModelUrl();
      if (this.drawPanelState == "edit") {
        roam.ChangeEntityModel(value, this.modelUrl);
      }
      //
    },
    getModelUrl() {
      if (this.drawForm.modelType == "aircraft") {
        this.modelUrl = "./model3d/CesiumAir/Cesium_Air.glb";
        this.isFlyHeight = true;
      } else if (this.drawForm.modelType == "car") {
        this.modelUrl = "./model3d/CesiumMilkTruck/CesiumMilkTruck.glb";
        this.isFlyHeight = false;
        this.drawForm.flyheight = 0;
      } else if (this.drawForm.modelType == "balloon") {
        //热气球
        this.modelUrl = "./model3d/CesiumBalloon/CesiumBalloon.glb";
        this.isFlyHeight = true;
      } else if (this.drawForm.modelType == "groundVehicle") {
        //装甲车
        this.modelUrl = "./model3d/GroundVehicle/GroundVehicle.glb";
        this.isFlyHeight = false;
        this.drawForm.flyheight = 0;
      } else if (this.drawForm.modelType == "empty") {
        this.modelUrl = "";
        this.isFlyHeight = false;
        this.drawForm.flyheight = 0;
      }
    },
    // 修改视角类型
    visualAngleTypeChange(value) {
      this.drawForm.visualAngleType = value;
      this.setFollowed(value);
    },
    // 修改飞行速度
    speedChange(value) {
      roam.ChangeRoamingSpeed(value);
    },
    // 修改视角距离
    widthChange(value) {
      this.followedX = -value;
    },
    // 修改显示路线
    showRouteChange(value) {
      let isPathShow = value.target.value;
      this.drawForm.isShowRoute = isPathShow;
      isPathShow = isPathShow === "false" ? false : true;
      roam.ChangeEntityPathShow(isPathShow);
    },
    setFollowed(value) {
      if (value == "empty") {
        //无
        this.isLock = false;
        // viewer.trackedEntity = undefined;
        viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      } else if (value == "lockFirst") {
        //锁定第一视角
        this.isLock = true;
        this.followedX = -this.drawForm.width;
        this.followedY = 0;
        this.followedZ = this.drawForm.height;
      } else if (value == "lockGod") {
        //上帝视角
        this.isLock = true;
        this.followedX = -1;
        this.followedY = 0;
        // this.drawForm.height = 9999;
        this.followedZ = this.drawForm.height;
      }
    },
    // 获取模型矩阵
    getModelMatrix(entity, time, result) {
      let matrix3Scratch = new Cesium.Matrix3();
      let scratch = new Cesium.Matrix4();
      if (!entity) return undefined;
      let position = Cesium.Property.getValueOrUndefined(
        entity.position,
        time,
        new Cesium.Cartesian3()
      );
      if (!Cesium.defined(position)) {
        return undefined;
      }
      let lnglat = Cesium.Cartographic.fromCartesian(position);
      position = Cesium.Cartesian3.fromRadians(
        lnglat.longitude,
        lnglat.latitude,
        lnglat.height
      );
      let orientation = Cesium.Property.getValueOrUndefined(
        entity.orientation,
        time,
        new Cesium.Quaternion()
      );
      if (!Cesium.defined(orientation)) {
        result = Cesium.Transforms.eastNorthUpToFixedFrame(
          position,
          undefined,
          result
        );
      } else {
        result = Cesium.Matrix4.fromRotationTranslation(
          Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch),
          position,
          result
        );
      }
      return result;
    },
    preUpdateListener() {
      var _this = this;
      let matrix3Scratch = new Cesium.Matrix3();
      let scratch = new Cesium.Matrix4();
      // doto 模型会不见问题，强制显示
      var primitives = viewer.scene.primitives._primitives;
      var cesium3DTilesets = [];
      for (var i = 0; i < primitives.length; i++) {
        if (primitives[i] instanceof Cesium.Cesium3DTileset) {
          if (primitives[i].show == true) {
            cesium3DTilesets.push(primitives[i]);
          }
          // cesium3DTilesets.push(primitives[i]);
        }
      }
      // 监听并设置当前时间点的相机位置
      let listenerRoaming = function () {
        if (_this.isContinue == true) {
          var center = roam.entity.position.getValue(viewer.clock.currentTime);
          if (center) {
            if (_this.isLock == true) {
              for (var i = 0; i < cesium3DTilesets.length; i++) {
                if (cesium3DTilesets[i].show == false) {
                  cesium3DTilesets[i].show = true;
                }
              }
              _this.getModelMatrix(
                roam.entity,
                viewer.clock.currentTime,
                scratch
              );
              viewer.scene.camera.lookAtTransform(
                scratch,
                new Cesium.Cartesian3(
                  _this.followedX,
                  _this.followedY,
                  _this.drawForm.height
                )
              );
            }
          } else {
            agCamera.resetCamera(viewer);
            _this.resetPlayIcon();
            viewer.scene.preUpdate.removeEventListener(listenerRoaming);
          }
        }
      };
      viewer.scene.preUpdate.addEventListener(listenerRoaming);
    },
    setModal1Visible(modal1Visible) {
      this.modal1Visible = modal1Visible;
    },
    // 删除所有实体
    delAllEntity() {
      viewer.entities.removeAll();
    },
    // 移除绘制漫游实体
    removeEndRoaming() {
      if (roam) {
        roam.EndRoaming();
      }
    },
    onclose() {
      this.removeEndRoaming();
      this.stopRoam();
      if (draw) {
        // draw._removeAllEntitiesFromDraw();
        draw.removeAll();
      }
    },
  },
  destroyed() {
    this.onclose();
  },
};
</script>
<style scoped src="./index.css">