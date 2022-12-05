<template>
  <ag-popup v-model="visible" title="人房信息" @onCancel="onCancel" class="popup-box">
    <div class="vscroll">
      <div class="h4">操作面板</div>
      <div class="btn-group">
        <a-button type="primary" @click="pickLevel">选择</a-button>
        <a-button type="primary" @click="onInfoshow">获取数据</a-button>
      </div>
      <div class="bar-body" v-show="infoshow">
        <table border="1" style="width:100%">
          <tr style="width:30%">
            <th>房号</th>
            <th>户主姓名</th>
            <th>性别</th>
            <th>年龄</th>
            <th>工作地点</th>
            <th>联系方式</th>
          </tr>
          <tr v-for="item in infoTable" :key="item.房号" style="width:70%">
            <td>{{ item.房号 }}</td>
            <td>{{ item.户主姓名 }}</td>
            <td>{{ item.性别 }}</td>
            <td>{{ item.年龄 }}</td>
            <td>{{ item.工作地点 }}</td>
            <td>{{ item.联系方式 }}</td>
          </tr>
        </table>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import axiosWraper from "@/views/js/net/axiosWraper";
import agCoordinate from "@/sdk/maths/coordinate";
let viewer = null;
let pickedPrimitives = null;
let highlightPrimitives = null;
export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      visible: true,
      infoshow: false,
      residentList: [],
      infoTable: [],
      positions: [
        113.372788913199, 23.101278681498446,
        113.372788402148, 23.101200090245538,
        113.372820050429, 23.10119548216902,
        113.37281794, 23.10101746,
        113.372588734434, 23.101021839748185,
        113.372588734434, 23.100980839748186,
        113.372514734434, 23.100979839748184,
        113.372512734434, 23.101394681498448,
        113.372590734434, 23.101394681498448,
        113.372592734434, 23.101358681498446,
        113.372637734434, 23.101360681498445,
        113.372637734434, 23.101283860749447,
        113.372721380245, 23.101282587599016,
        113.372780351111, 23.101282630458662],
      positions1: [
        113.372239466801, 23.101279161498443,
        113.372239977852, 23.101200570245535,
        113.37220832957101, 23.10119596216902,
        113.37221044, 23.10101794,
        113.372439645566, 23.101022319748182,
        113.372439645566, 23.100981319748183,
        113.37251364556602, 23.10098031974818,
        113.37251164556601, 23.101395161498445,
        113.37243764556601, 23.101395161498445,
        113.37243764556601, 23.101359161498443,
        113.37239064556601, 23.101361161498442,
        113.37239064556601, 23.101284340749444,
        113.37230699975501, 23.101283067599013,
        113.372248028889, 23.10128311045866],
      electricityList: [],
      level: null,
      roomNum: null,
      centerPoint: null
    };
  },
  mounted() {
    viewer = CIM.viewer;
    if (!CIM.layerTree.zoomToLayerById("2e8b578e-5dd4-4c69-83ab-14c3368f3c61")) {
      CIM.layerTree.addMany(["2e8b578e-5dd4-4c69-83ab-14c3368f3c61"], viewer);
    }
    this._requestData();
  },
  destroyed() {
    this._deleteEntity(pickedPrimitives);
    this._deleteEntity(highlightPrimitives);
  },
  methods: {
    onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
      this._deleteEntity(pickedPrimitives);
      this._deleteEntity(highlightPrimitives);
    },
    onInfoshow() {
      this.infoshow = true;
    },
    pickLevel() {
      var _this = this;
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      var viewerContainer = viewer._element;
      viewerContainer.style.cursor = "pointer";
      handler.setInputAction(function onLeftClick(click) {
        var pick = viewer.scene.pickPosition(click.position);
        _this._deleteEntity(pickedPrimitives);
        _this._addBoxGeometry(pick, Cesium.Color.YELLOW);
        _this.showInfoTable();
        handler.destroy();
        viewerContainer.style.cursor = "default";
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(function onMouseMove(click) {
        var pickedLevel = viewer.scene.pickPosition(click.endPosition);
        _this._addBoxGeometry(pickedLevel, Cesium.Color.CYAN);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    showInfoTable() {
      var room = (eval((this.level + 1) + this.roomNum).toString());
      for (let i = 0; i < this.residentList.length; i++) {
        var b = this.residentList[i];
        if (b["房号"] == room) {
          this.infoTable = []
          this.infoTable.push(b);
          this.infoshow = true;
          break;
        }
      }
    },
    _requestData() {
      var _this = this;
      var promise = axiosWraper.getData("/MongoDBTable/getAll/electricity_user");
      promise.then(function (data) {
        _this.residentList = data;
      });
      var promiseEle = axiosWraper.getData("/MongoDBTable/electricity/list");
      promiseEle.then(function (data) {
        _this.electricityList = data.content;
        for (var i = 0; i < _this.electricityList.length; i++) {
          _this.electricityList[i].household[0].positions = _this.positions1;
          _this.electricityList[i].household[1].positions = _this.positions;
        }
      });
    },
    _isInRectangle(point) {
      var p1 = this._minmaxlnglat(this.positions1);
      var p2 = this._minmaxlnglat(this.positions);
      var r1 = Cesium.Rectangle.fromDegrees(p1[0], p1[1], p1[2], p1[3]);
      var r2 = Cesium.Rectangle.fromDegrees(p2[0], p2[1], p2[2], p2[3]);
      var b1 = Cesium.Rectangle.contains(r1, Cesium.Cartographic.fromCartesian(point));
      var b2 = Cesium.Rectangle.contains(r2, Cesium.Cartographic.fromCartesian(point));
      if (b1 == true) {
        this.roomNum = "01";
        return 1;
      }
      else if (b2 == true) {
        this.roomNum = "02";
        return 0;
      }

    },
    _addBoxGeometry(point, color) {
      var _height = 6;
      var _extrudedHeight = 8.36;
      var ht = this._adjustHeight(point);
      var pos = this._isInRectangle(point);
      var _x = 0, _y = 0;
      if (pos == 1) {
        _x = this.positions1[4];
        _y = this.positions1[5];
      }
      else if (pos == 0) {
        _x = this.positions[4];
        _y = this.positions[5];
      }
      var center = Cesium.Cartesian3.fromDegrees(
        _x,
        _y,
        ht
      )
      if (color == Cesium.Color.CYAN) {
        if (this.centerPoint != null) {
          if (center.x == this.centerPoint.x && center.y == this.centerPoint.y && center.z == this.centerPoint.z) {
            return;
          }
          else {
            this.centerPoint = center;
            this._deleteEntity(highlightPrimitives);
          }
        }
        else {
          this.centerPoint = center;
        }
      }
      this._addPrimitives(center, color, _extrudedHeight);
    },
    _addPrimitives(center, color, height) {
      var scene = viewer.scene;
      var boxGeometry = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        dimensions: new Cesium.Cartesian3(62.6, 50.0, height),
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
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
              show: new Cesium.ShowGeometryInstanceAttribute(true),
            },
          }),
          classificationType: Cesium.ClassificationType.BOTH,
        })
      );
      if (color == Cesium.Color.CYAN) {
        highlightPrimitives = primitives;
      } else {
        pickedPrimitives = primitives;
      }
    },
    _adjustHeight(center) {
      var _height = 6;
      var _extrudedHeight = 8.36;
      var point = agCoordinate.Cartesian3_to_WGS84(center);
      var level = Math.floor(((point.alt - 1.81) / _extrudedHeight));
      this.level = level;
      point.alt = _height + (level * _extrudedHeight);
      center = agCoordinate.WGS84_to_Cartesian3(point);
      return point.alt;
    },
    _minmaxlnglat(list) {
      var minlat = null, minlng = null, maxlat = null, maxlng = null;
      for (let i = 0; i < list.length; i += 2) {
        if (minlng == null && maxlng == null) {
          minlng = list[i];
          maxlng = list[i];
        }
        if (list[i] > maxlng) {
          maxlng = list[i];
        }
        if (list[i] < minlng) {
          minlng = list[i];
        }
      }
      for (let i = 1; i < list.length; i += 2) {
        if (minlat == null && maxlat == null) {
          minlat = list[i];
          maxlat = list[i];
        }
        if (list[i] > maxlat) {
          maxlat = list[i];
        }
        if (list[i] < minlat) {
          minlat = list[i];
        }
      }
      return [minlng, minlat, maxlng, maxlat];
    },
    _deleteEntity(primitives) {
      if (primitives == null) return;
      viewer.scene.primitives.remove(primitives);
      primitives = null;
    },
  },
};
</script>
<style scoped>
.vscroll {
  padding: 10px;
}
.popup-box {
  width: 400px;
}
.content {
  width: 100%;
  height: 100%;
}
.btn-group {
  height: 50px;
  text-align: center;
}
.btn-group button {
  margin: 10px;
}
.bar-body {
  height: auto;
  width: 100%;
  padding: 10px;
  text-align: center;
}
.bar-body table tr {
  display: inline-block;
}
th,
td {
  height: 30px;
  display: block;
}
</style>
