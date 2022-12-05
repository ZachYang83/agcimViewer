<template>
  <ag-popup v-model="visible" title="设备管控" @onCancel="onCancel" class="popup-box">
    <div class="map">
      <div id="containCesium"></div>
      <video
        id="trailer"
        autoplay
        loop
        crossorigin
        controls
        style="height:0;width:0;transform:rotate(180deg)"
      >
        <!-- <source src="../../../assets/video/normal-video.webm" type="video/webm" /> -->
      </video>
      <!--  <div
        style="color:#ffffff;position: fixed;right: 100px;top: 200px;background-color: #000;z-index:999;width:300px;padding:10px"
      >
        <a-button type="primary" @click="handlePyramis" style="margin-left:10px">获取视锥体</a-button>
        <div>
          四方广角：
          <a-slider id="test" :value="fov" @change="fovChange" />
        </div>
        <div>
          水平广角
          <a-slider id="test" :value="aspectRatioWidth" @change="aspectRatioWidthChange" />
        </div>
        <div>
          垂直广角
          <a-slider id="test" :value="aspectRatioHeight" @change="aspectRatioHeightChange" />
        </div>
      </div>-->
    </div>

    <div id="table">
      <div class="add">
        <button @click="adddetail">新增</button>
      </div>
      <table cellpadding="0" cellspacing="0">
        <thead>
          <tr>
            <th>序号</th>
            <th>名称</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in videoList" :key="index">
            <td>{{index+1}}</td>
            <td>{{item.title}}</td>
            <td>{{item.note}}</td>
            <td>
              <span class="detail" @click="detail(item)">查看</span>
              <span @click="deletelist(item.id,index)" class="delete">删除</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div id="mask" v-if="editlist">
        <div class="mask">
          <div class="title">
            编辑
            <span @click="editlist=false">X</span>
          </div>
          <div class="content">
            <input type="text" v-model="editDetail.title" name="title" value placeholder="标题" />
            <input type="text" v-model="editDetail.user" name="user" value placeholder="发布人" />
            <input type="date" v-model="editDetail.dates" name="date" value placeholder="发布时间" />
            <button @click="update">更新</button>
            <button @click="editlist=false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import AgcimLayerTree from "@/sdk/scene/layerTree";
import agShadow from "@/sdk/renderer/videoFusion";
import AgPopup from "@/views/components/AgPopup.vue";
export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      visible: true,
      Projection_height: 100,
      Projection_near: 1,
      Projection_far: 50.0,
      Projection_clientWidth: 100,
      Projection_clientHeight: 100,
      Projection_pitch: 1.0,
      startPos: null,
      endPos: null,
      video: null,
      far: null,
      newFrustumGeometry: null,
      newPerspectiveFrustum: null,

      startPoint: null,
      startPointTP: null, //转制后得坐标
      endPoint: null,
      endPointTP: null, //转制后得坐标
      vertexInfo: null,
      startPolygon: null,
      fov: 30,
      aspectRatioHeight: 10,
      aspectRatioWidth: 10,

      addDetail: {},
      editlist: false,
      editDetail: {},
      videoList: require("./data/videoData.json"),
      editid: "",
      hierarchysv2: null,
      entityList: [],
    };
  },
  mounted() {
    // this.initMap();
    // this.initStartsUp();
  },
  methods: {
     onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
    },
    aspectRatioWidthChange(value) {
      var viewer = CIM.viewer;
      this.aspectRatioWidth = value;
      let cameraInfo = {
        near: 1,
        aspectRatioHeight: this.aspectRatioHeight,
        aspectRatioWidth: value,
        far: Cesium.Cartesian3.distance(
          new Cesium.Cartesian3(
            this.startPoint.x,
            this.startPoint.y,
            this.startPoint.z
          ),
          new Cesium.Cartesian3(
            this.endPoint.x,
            this.endPoint.y,
            this.endPoint.z
          )
        ),
        fov: Cesium.Math.toRadians(this.fov),
      };
      this.vertexInfo = agShadow.addVideoWithCamera(
        viewer,
        this.startPoint,
        this.endPoint,
        cameraInfo
      );
    },
    aspectRatioHeightChange(value) {
      var viewer = CIM.viewer;
      this.aspectRatioHeight = value;
      let cameraInfo = {
        near: 1,
        aspectRatioHeight: value,
        aspectRatioWidth: this.aspectRatioWidth,
        far: Cesium.Cartesian3.distance(
          new Cesium.Cartesian3(
            this.startPoint.x,
            this.startPoint.y,
            this.startPoint.z
          ),
          new Cesium.Cartesian3(
            this.endPoint.x,
            this.endPoint.y,
            this.endPoint.z
          )
        ),
        fov: Cesium.Math.toRadians(this.fov),
      };
      this.vertexInfo = agShadow.addVideoWithCamera(
        viewer,
        this.startPoint,
        this.endPoint,
        cameraInfo
      );
    },
    fovChange(value) {
      var viewer = CIM.viewer;
      this.fov = value;
      let cameraInfo = {
        near: 1,
        aspectRatioHeight: this.aspectRatioHeight,
        aspectRatioWidth: this.aspectRatioWidth,
        far: Cesium.Cartesian3.distance(
          new Cesium.Cartesian3(
            this.startPoint.x,
            this.startPoint.y,
            this.startPoint.z
          ),
          new Cesium.Cartesian3(
            this.endPoint.x,
            this.endPoint.y,
            this.endPoint.z
          )
        ),
        fov: Cesium.Math.toRadians(value),
      };
      this.vertexInfo = agShadow.addVideoWithCamera(
        viewer,
        this.startPoint,
        this.endPoint,
        cameraInfo
      );
    },
    handlePyramis() {
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
                material: new Cesium.Color(0.0, 1.0, 0.0, 0.5),
              },
            });
          }

          handler.setInputAction((movEvt) => {
            var movRay = viewer.scene.camera.getPickRay(movEvt.endPosition);
            var movPickFromRay = viewer.scene.pickFromRay(movRay);
            if (movPickFromRay == undefined) {
              movPickFromRay = viewer.scene.globe.pick(movRay, viewer.scene);
            } else {
              movPickFromRay = movPickFromRay.position;
            }
            this.endPoint = movPickFromRay;
            this.endPointTP = agShadow.cartesianToDeggre(
              movPickFromRay,
              viewer
            );
            let cameraInfo = {
              near: 1,
              aspectRatioHeight: this.aspectRatioHeight,
              aspectRatioWidth: this.aspectRatioWidth,
              far: Cesium.Cartesian3.distance(
                new Cesium.Cartesian3(
                  this.startPoint.x,
                  this.startPoint.y,
                  this.startPoint.z
                ),
                new Cesium.Cartesian3(
                  this.endPoint.x,
                  this.endPoint.y,
                  this.endPoint.z
                )
              ),
              fov: Cesium.Math.toRadians(this.fov),
            };
            this.vertexInfo = agShadow.addVideoWithCamera(
              viewer,
              this.startPoint,
              this.endPoint,
              cameraInfo
            );
            if (this.startPolygon == null) {
              var vertexEndPoint1 = agShadow.cartesianToDeggre(
                this.vertexInfo.endPointList[0],
                viewer
              );
              var vertexEndPoint2 = agShadow.cartesianToDeggre(
                this.vertexInfo.endPointList[1],
                viewer
              );
              var vertexEndPoint3 = agShadow.cartesianToDeggre(
                this.vertexInfo.endPointList[2],
                viewer
              );
              var vertexEndPoint4 = agShadow.cartesianToDeggre(
                this.vertexInfo.endPointList[3],
                viewer
              );
              /*  hierarchys.push( this.vertexInfo.endPointList[0]);
              hierarchys.push( this.vertexInfo.endPointList[1]);
              hierarchys.push( this.vertexInfo.endPointList[2]);
              hierarchys.push( this.vertexInfo.endPointList[3]); */

              var hierarchys = new Cesium.CallbackProperty(() => {
                var vertexEndPoint1 = agShadow.cartesianToDeggre(
                  this.vertexInfo.endPointList[0],
                  viewer
                );
                var vertexEndPoint2 = agShadow.cartesianToDeggre(
                  this.vertexInfo.endPointList[1],
                  viewer
                );
                var vertexEndPoint3 = agShadow.cartesianToDeggre(
                  this.vertexInfo.endPointList[2],
                  viewer
                );
                var vertexEndPoint4 = agShadow.cartesianToDeggre(
                  this.vertexInfo.endPointList[3],
                  viewer
                );
                this.hierarchysv2 = [
                  vertexEndPoint1.lng,
                  vertexEndPoint1.lat,
                  vertexEndPoint1.alt,
                  vertexEndPoint2.lng,
                  vertexEndPoint2.lat,
                  vertexEndPoint2.alt,
                  vertexEndPoint3.lng,
                  vertexEndPoint3.lat,
                  vertexEndPoint3.alt,
                  vertexEndPoint4.lng,
                  vertexEndPoint4.lat,
                  vertexEndPoint4.alt,
                ];
                return new Cesium.PolygonHierarchy(
                  Cesium.Cartesian3.fromDegreesArrayHeights(this.hierarchysv2)
                );
              }, false);
              this.startPolygon = viewer.entities.add({
                //多边形
                polygon: {
                  hierarchy: hierarchys,
                  outlineColor: Cesium.Color.BLACK.withAlpha(0.0),
                  classificationType: Cesium.ClassificationType.BOTH,
                  material: document.getElementById("trailer"),

                  // perPositionHeight: true
                },
              });
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }

        if (clickTime == 2) {
          handler.destroy();
          clickTime = 0;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    handleChangeNear(value) {
      this.Projection_pitch = value;
    },

    //地图
    initMap: function () {
      if (!window.CIM.layerTree)
        window.CIM.layerTree = new AgcimLayerTree();
    },

    initStartsUp: function () {
      let _this = this; //yq
      /* for (let i = 0; i < 1; i++) {
        import("../../widgets/BIM/startsUp").then((model) => {
          var a = new model.default();
          a.start(CIM.viewer, _this);
        });
      }
      //sxy 临时
      import("../../widgets/PickHightLight/startsUp").then((model) => {
        var a = new model.default();
        a.start(CIM.viewer, _this);
      }); */
    },
    adddetail: function name(params) {},
    detail: function () {
      for (var i = 0; i < this.videoList.length; i++) {
        var positons = this.videoList[i].polygonHierarchy;
        var mat = this.videoList[i].material;
        this.AddVoide(positons, mat);
      }
    },
    AddVoide: function name(positions, matName) {
      var viewer = CIM.viewer;
      var entity = viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArrayHeights(positions)
          ),
          outlineColor: Cesium.Color.BLACK.withAlpha(0.0),
          classificationType: Cesium.ClassificationType.BOTH,
          material: document.getElementById(matName),
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
.map {
  height: 100%;
}
.map #containCesium {
  height: 100%;
}
#table table {
  width: 100%;
  font-size: 14px;
  border: 1px solid #eee;
}

#table {
  padding: 0 10px 30px;
  margin-top: 10px;
  width: 100%;
}

table thead th {
  background: #f5f5f5;
  padding: 10px;
  text-align: left;
}

table tbody td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
}

table tbody td span {
  margin: 0 10px;
  cursor: pointer;
}

.delete {
  color: red;
}

.detail {
  color: #008cd5;
}

.add {
  border: 1px solid #eee;
  margin: 5px 0;
  padding: 7px;
}

input {
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 3px;
  margin-right: 15px;
}

button {
  background: #008cd5;
  border: 0;
  padding: 4px 15px;
  border-radius: 3px;
  color: #fff;
}

#mask {
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 4;
  top: 0;
  left: 0;
}

.mask {
  width: 300px;
  height: 250px;
  background: rgba(255, 255, 255, 1);
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  z-index: 47;
  border-radius: 5px;
}

.title {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.title span {
  float: right;
  cursor: pointer;
}

.content {
  padding: 10px;
}

.content input {
  width: 270px;
  margin-bottom: 15px;
}
</style>
