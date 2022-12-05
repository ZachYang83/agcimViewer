<template>
  <div>
    <div class="map">
      <div id="containCesium"></div>
    </div>
    <div id="videoLibrary"></div>
    <div id="table">
      <div v-show="!editState">
        <div class="add">
          <a-button @click="adddetail" type="primary">新增</a-button>
        </div>
        <a-table
          :columns="columns"
          :bordered="true"
          size="small"
          :data-source="videoList"
        >
          <span slot="option" slot-scope="text, record">
            <a
              class="clear"
              @click="handleClear(record)"
              v-if="getExist(record)"
              >清空</a
            >
            <a class="detail" @click="detail(record)" v-else>查看</a>

            <!-- <a @click="deletelist(item.id,index)" class="delete">删除</a> -->
          </span>
        </a-table>
      </div>

      <div v-show="editState" class="ag-edit">
        <div v-if="!createState">
          <div>
            视频名称：
            <a-input
              style="width: 240px"
              v-model="videoName"
              placeholder="请输入融合视频名称"
            />
          </div>
          <div>
            视频拍摄起点：
            <a-select v-model="videoMode" style="width: 120px">
              <a-select-option value="sxt">自选点</a-select-option>
              <a-select-option value="wrj">固定点</a-select-option>
            </a-select>
          </div>
          <div v-if="videoMode == 'wrj'">
            <div class="ag-vertical-item">
              固定点经度：
              <a-input-number class="ag-number-input" v-model="UAVLng" />
            </div>
            <div class="ag-vertical-item">
              固定点纬度：
              <a-input-number class="ag-number-input" v-model="UAVLat" />
            </div>
            <div class="ag-vertical-item">
              固定点高程：
              <a-input-number class="ag-number-input" v-model="UAVheight" />
            </div>
          </div>
          <div>
            垂直投影：
            <a-switch
              disabled
              :checked="verticalState"
              @change="handleVerticalState"
            />
          </div>
          <div>
            视频格式：
            <a-select v-model="videoType" style="width: 120px">
              <a-select-option value="video/webm">webm</a-select-option>
              <a-select-option value="video/mp4">MP4</a-select-option>
            </a-select>
          </div>
          <div>
            视频路径：
            <a-input
              style="width: 240px"
              v-model="videoAddress"
              placeholder="请输入视频路径"
            />
          </div>
        </div>
        <div v-if="createState">
          <div>
            FOV:
            <a-slider :value="fov" @change="fovChange" />
          </div>
          <div>
            pitch
            <a-slider
              :value="pitch"
              @change="pitchChange"
              :min="-360"
              :max="360"
            />
          </div>
          <div>
            heading
            <a-slider
              :value="heading"
              @change="headingChange"
              :min="-360"
              :max="360"
            />
          </div>
          <div>
            roll
            <a-slider
              :value="roll"
              @change="rollChange"
              :min="-360"
              :max="360"
            />
          </div>

          <!-- <a-button class="ag-option-btn" @click="handlefly" type="primary"
            >转到视点位置</a-button
          > -->
          <!-- 
          <a-button
            class="ag-option-btn"
            @click="handleCalibrationPoint"
            type="primary"
            >校準</a-button
          > -->
        </div>
        <a-button
          class="ag-option-btn"
          v-if="!createState"
          @click="handleDrawVertebrae"
          type="primary"
          >绘制视椎体</a-button
        >
        <!-- <a-button
          class="ag-option-btn"
          @click="handleVideoInfo"
          v-if="createState"
          type="primary"
          >保存视频信息</a-button
        > -->
        <a-button class="ag-option-btn" @click="handleEditState(false)"
          >取消</a-button
        >
      </div>
      <video
        id="myVideo"
        muted=""
        autoplay=""
        loop=""
        crossorigin="anonymous"
        controls=""
        style="height: 0; width: 0"
      >
        <source
          src="http://192.168.3.170:8083/video/1-1cz.MP4"
          type="video/mp4"
        />
      </video>
    </div>
  </div>
</template>
<script>
import AgcimLayerTree from "../../sdk/scene/layerTree";
import agShadow from "@/sdk/renderer/videoFusion";
import { Modal } from "ant-design-vue";
import { isNullOrEmpty, newGuid, newVideoDemo } from "./js/tools";
import draw from "@/sdk/interactive/draw";
import drawCamera from "@/sdk/interactive/drawFrustum";

var videoShed3d = [];
export default {
  data() {
    return {
      startPos: null,
      endPos: null,
      video: null,
      far: null,

      startPoint: null,
      startPointTP: null, //转制后得坐标
      endPoint: null,
      endPointTP: null, //转制后得坐标
      vertexInfo: null,
      startPolygon: null,
      fov: 70,
      aspectRatioHeight: 1530,
      aspectRatioWidth: 2720,

      addDetail: {},
      editState: false,
      editDetail: {},
      videoList: require("./data/videoData.json"),
      hierarchysv2: null,
      entityList: [],
      stRotation: 65,

      //影像信息
      videoAddress: "http://192.168.3.170:8083/video/1-1cz.MP4",
      videoType: "video/mp4",
      videoName: "",

      //垂直视频投影
      verticalState: true,
      videoMode: "wrj",
      fusionObject: "dm",

      //无人机参数
      UAVLng: 113.37185427727357,
      UAVLat: 23.102316132975393,
      UAVheight: 190,

      createState: false,
      tempGuid: null,
      drawcamera: null,

      columns: [
        {
          title: "序号",
          customRender: function (t, r, index) {
            return parseInt(index + 1);
          },
          align: "center",
        },
        {
          title: "名称",
          dataIndex: "title",
          key: "title",
          align: "center",
        },
        {
          title: "操作",
          align: "center",
          scopedSlots: { customRender: "option" },
        },
      ],

      heading: -110,
      pitch: 110,
      roll: 0,
      ExistItem: [],
    };
  },
  mounted() {
    this.initMap();
    this.initStartsUp();
  },
  methods: {
    pitchChange(value) {
      this.pitch = value;
      this.drawcamera.cameraRotate(CIM.viewer, {
        pitch: value,
      });
    },
    headingChange(value) {
      this.heading = value;
      this.drawcamera.cameraRotate(CIM.viewer, {
        heading: value,
      });
    },
    rollChange(value) {
      this.roll = value;
      this.drawcamera.cameraRotate(CIM.viewer, {
        roll: value,
      });
    },
    //修改值-添加状态
    handleEditState(state) {
      this.editState = state;
      if (state == false) {
        this.drawcamera.destroy();
      }
    },
    //修改值-垂直投影状态
    handleVerticalState(state) {
      this.verticalState = state;
    },
    // 前往視椎體的位置
    handlefly() {
      var viewer = CIM.viewer;
      viewer.camera.flyTo({
        destination: this.startPoint,
        orientation: {
          heading: Cesium.Math.toRadians(this.heading),
          pitch: Cesium.Math.toRadians(this.pitch),
          roll: this.roll,
        },
      });
    },
    handleDrawVertebrae() {
      this.drawcamera = new drawCamera();
      this.drawcamera.initialize();
      switch (this.videoMode) {
        case "sxt":
          this.drawcamera.addFrustumWithCustom(CIM.viewer, (ref) => {
            console.log(ref);
          });
          break;

        default:
          this.drawcamera.addFrustumWithFiexdAllPoint(
            CIM.viewer,
            {
              lng: 113.3718259,
              lat: 23.1022827,
              alt: 190,
            },
            {
              lng: 113.3718259,
              lat: 23.1022827,
              alt: 0,
            },
            (ref) => {
              console.log(ref);
            }
          );
          break;
      }

      //  this.drawcamera.addFrustumWithFiexdStartPoint(CIM.viewer, {
      //     lng: 113.3718259,
      //     lat: 23.1022827,
      //     alt: 190,
      //   }, (ref)=>{
      //   console.log(ref)
      // })
    },

    handleVideoInfo() {
      Modal.success({
        title: "创建成功，请保存融合视频JSON数据",
        content: JSON.stringify({
          title: this.videoName,
          note: "融合",
          id: this.tempGuid,
          polygonHierarchy: [...this.hierarchysv2],
          url: this.videoAddress,
          material: this.tempGuid,
          stRotation: this.stRotation,
          startPoint: this.startPoint,
          endPoint: this.endPoint,
          fov: this.fov,
        }),
      });
    },
    fovChange(value) {
      this.fov = value;
      this.drawcamera.cameraRotate(CIM.viewer, {
        fov: value,
      });
    },
    handlePyramis(id) {
      var viewer = CIM.viewer;
      var clickTime = 0;
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      var endPos;
      handler.setInputAction((evt) => {
        clickTime += 1;
        var ray = viewer.scene.camera.getPickRay(evt.position);
        var pickFromRay = viewer.scene.pickFromRay(ray);
        if (pickFromRay == undefined) {
          pickFromRay = viewer.scene.globe.pick(ray, viewer.scene);
        } else {
          pickFromRay = pickFromRay.position;
        }

        var cartesian = null;
        if (clickTime == 1) {
          this.startPoint = pickFromRay;
          this.endPoint = pickFromRay;
          this.startPointTP = agShadow.cartesianToDeggre(pickFromRay, viewer);
          this.endPointTP = agShadow.cartesianToDeggre(pickFromRay, viewer);
          //创建一条方向线
          viewer.entities.add({
            polyline: {
              positions: new Cesium.CallbackProperty(() => {
                return Cesium.Cartesian3.fromDegreesArrayHeights([
                  this.startPointTP.lng,
                  this.startPointTP.lat,
                  this.startPointTP.alt,
                  this.endPointTP.lng,
                  this.endPointTP.lat,
                  this.endPointTP.alt,
                ]);
              }, false),
              width: 1.0,
              material: new Cesium.Color(0.0, 1.0, 0.0, 0.5),
            },
          });
          this.vertexInfo = {
            startPointList: [
              this.startPoint,
              this.startPoint,
              this.startPoint,
              this.startPoint,
            ],
            endPointList: [
              this.endPoint,
              this.endPoint,
              this.endPoint,
              this.endPoint,
            ],
          };
          this.eventMouseMove(id, handler);
          //划是椎体线
          for (let index = 0; index <= 3; index++) {
            viewer.entities.add({
              polyline: {
                positions: new Cesium.CallbackProperty(() => {
                  var vertexStartPoint = agShadow.cartesianToDeggre(
                    this.vertexInfo.startPointList[index],
                    viewer
                  );
                  var vertexEndPoint = agShadow.cartesianToDeggre(
                    this.vertexInfo.endPointList[index],
                    viewer
                  );
                  return Cesium.Cartesian3.fromDegreesArrayHeights([
                    vertexStartPoint.lng,
                    vertexStartPoint.lat,
                    vertexStartPoint.alt,
                    vertexEndPoint.lng,
                    vertexEndPoint.lat,
                    vertexEndPoint.alt,
                  ]);
                }, false),
                width: 1.0,
                material: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
              },
            });
          }
        }

        if (clickTime == 2) {
          let inverseFrustumMatrix = Cesium.Matrix4.inverse(
            this.vertexInfo.frustumMatrix,
            new Cesium.Matrix4()
          );
          handler.destroy();
          clickTime = 0;
          this.createState = true;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    //绘制固定点视椎体
    handleFixedPyramis(id) {
      var agshadow = new agShadow().initialize();
      new agshadow(Cesium, CIM.viewer, {
        type: 3,
        url: "http://81.71.142.155:6700/video/featureIdentification/1_1cz.mp4",
        position: {
          x: 113.3718259,
          y: 23.1022827,
          z: 190,
        },
        endPosition: {
          x: 113.3718259,
          y: 23.1022827,
          z: 190,
        },
        rotation: {
          x: -90,
          y: 0,
          z: 0,
        },
        fov: Cesium.Math.toRadians(80),
        far: 300,
        near: 1,
        aspectRatio: 1,
        alpha: 1,
        debugFrustum: true,
        orientation: {
          heading: Cesium.Math.toRadians(-112),
          pitch: Cesium.Math.toRadians(112),
          roll: 0.0,
        },
      });
    },
    eventLeftClick() {},
    //地图
    initMap: function () {
      if (!window.CIM.layerTree)
        window.CIM.layerTree = new AgcimLayerTree();
    },

    initStartsUp: function () {
      let _this = this;
    },
    adddetail: function name(params) {
      this.handleEditState(true);
    },
    detail: function (record) {
      var viewer = CIM.viewer;
      var agshadow = new agShadow().initialize();
      this.ExistItem.push(record.id);
      viewer.camera.flyTo({
        destination: new Cesium.Cartesian3.fromDegrees(
          record.position.x,
          record.position.y,
          record.position.z
        ),
      });
      var tempVideoShed3d = videoShed3d;
      tempVideoShed3d.push({
        id: record.id,
        videoShed3dItem: new agshadow(Cesium, viewer, {
          type: record.type,
          url: record.url,
          position: record.position,
          rotation: record.rotation,
          fov: Cesium.Math.toRadians(record.fov),
          far: record.far,
          near: record.near,
          aspectRatio: record.aspectRatio,
          alpha: record.alpha,
          debugFrustum: record.debugFrustum,
          endPosition: record.endPosition,
          orientation: {
            heading: Cesium.Math.toRadians(record.orientation.heading),
            pitch: Cesium.Math.toRadians(record.orientation.pitch),
            roll: record.orientation.roll,
          },
        }),
      });
      videoShed3d = tempVideoShed3d;
    },
    //清理加载的视频
    handleClear(record) {
      var videoShed3dItem = videoShed3d.find((e) => {
        return e.id == record.id;
      });
      if (videoShed3dItem != undefined && videoShed3dItem != null) {
        videoShed3dItem.videoShed3dItem._clearShadowMap();
        var tempVideoShed3d = videoShed3d;
        this.ExistItem.splice(
          this.ExistItem.findIndex((item) => item === record.id),
          1
        );
        tempVideoShed3d.splice(
          tempVideoShed3d.findIndex((item) => item.id === record.id),
          1
        );
        videoShed3d = tempVideoShed3d;
      }
    },
    //判断是否已经加载
    getExist(record) {
      if (
        this.ExistItem == null ||
        this.ExistItem == undefined ||
        this.ExistItem.length == 0
      ) {
        return false;
      }
      var videoShed3dItem = this.ExistItem.find((e) => {
        return e == record.id;
      });
      if (videoShed3dItem != undefined && videoShed3dItem != null) {
        return true;
      } else {
        return false;
      }
    },
    AddVoide: function name(positions, matName, stRotation) {
      var viewer = CIM.viewer;
      var entity = viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArrayHeights(positions)
          ),
          outlineColor: Cesium.Color.BLACK.withAlpha(0.0),
          classificationType: Cesium.ClassificationType.BOTH,
          material: document.getElementById(matName),
          stRotation: Cesium.Math.toRadians(stRotation),
        },
      });
      this.entityList.push(entity);
    },
  },
  destroyed() {
    var viewer = CIM.viewer;
    for (var i = 0; i < this.entityList.length; i++) {
      viewer.entities.remove(this.entityList[i]);
    }
    for (let index = 0; index < videoShed3d.length; index++) {
      if (
        videoShed3d[index] != undefined &&
        videoShed3d[index] != null &&
        videoShed3d[index].videoShed3dItem != undefined &&
        videoShed3d[index].videoShed3dItem != null
      ) {
        videoShed3d[index].videoShed3dItem._clearShadowMap();
      }
    }
    videoShed3d = [];
  },
};
</script>

<style src="./index.css" scoped>
</style>