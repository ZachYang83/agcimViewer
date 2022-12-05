<template>
  <div class="infoBox">
    <div>
      <a-form :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item :wrapper-col="{ span: 12, offset: 2 }">
          <a-button type="primary" size="small" @click="ondraw">绘制</a-button>
          <a-button
            style="margin-left: 10px;"
            type="primary"
            size="small"
            @click="addModify"
            v-show="!isAnalysis"
          >修改</a-button>
          <a-button style="margin-left: 10px;" size="small" @click="clearDraw">清除</a-button>
        </a-form-item>
        <a-form-item label="最小高度(米)" :label-col="{ span: 10, offset: 2 }">
          <a-input-number :min="-1000" :max="1000" :step="0.1" v-model="minHeight" />
        </a-form-item>
        <a-form-item label="最大高度(米)" :label-col="{ span: 10, offset: 2 }">
          <a-input-number :min="-1000" :max="1000" :step="0.1" v-model="maxHeight" />
        </a-form-item>
        <a-form-item label="淹没速度(米/秒)" :label-col="{ span: 10, offset: 2 }">
          <a-input-number :min="1" :max="1000" v-model="speed" />
        </a-form-item>
        <a-form-item label="当前高度(米)" :label-col="{ span: 10, offset: 2 }" v-show="isAnalysis">
          <a-input v-model="curHeight" style="width:90px;" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 12, offset: 2 }">
          <a-button type="primary" size="small" @click="onAnalysis">开始分析</a-button>
          <a-button style="margin-left: 10px;" size="small" @click="saveWaters">保存水域</a-button>
          <a-button style="margin-left: 10px;" size="small" @click="onclose">关闭</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script>
var viewer = null;
var draw;
var createPolygon;

import axios from "@/views/js/net/http.js";
import qs from "qs"; // 根据需求是否导入qs模块
import Draw from "@/sdk/interactive/draw";
import projectionHelper from "@/sdk/maths/coordinate.js";
import CreatePolygon from "./waters/createPolygon";
viewer = CIM.viewer;
export default {
  data() {
    return {
      labelCol: { span: 6 },
      wrapperCol: { span: 10 },
      minHeight: 0,
      maxHeight: 0,
      speed: 1,
      hegth: 0,
      waterHeight: 100,
      curHeight: 0,
      isAnalysis: false,
      isEndAnalysis: false,
      positions: [],
    };
  },
  mounted() {
    this.Initialize();
  },
  methods: {
    Initialize() {
      viewer = CIM.viewer;
      draw = new Draw(viewer);
      createPolygon = new CreatePolygon(viewer, {
        material: new Cesium.Color.fromBytes(64, 157, 253, 150),
      });
    },
    ondraw() {
      this.drawPolygonStringAndCallBack();
    },
    adddraw() {
      createPolygon.remove();
      createPolygon.start(function (positions) {
        // console.log(createPolygon.positions);
      });
    },
    addModify() {
      createPolygon.startModify();
    },
    setInputAction() {
      var _this = this;
      this.handler = new Cesium.ScreenSpaceEventHandler(
        CIM.viewer.scene.canvas
      );
      this.handler.setInputAction(function (evt) {},
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    // 绘制面及回调
    drawPolygonStringAndCallBack() {
      var _this = this;
      createPolygon.destroy();
      createPolygon.start(function (positions) {
        _this.positions = createPolygon.positions;
        _this.comMinAndMax(_this.positions);
      });
    },
    // 计算最小矩形范围内的最高最低点
    comMinAndMax(positions) {
      var _this = this;
      var cartographics = [];
      for (var i = 0; i < positions.length; i++) {
        var cartographic = projectionHelper.cartesian3ToCartographic(
          positions[i],
          "Degrees"
        );
        cartographics.push(cartographic);
      }
      var rectangle = Cesium.Rectangle.fromCartographicArray(cartographics);
      var east = projectionHelper.toDegrees(rectangle.east);
      var west = projectionHelper.toDegrees(rectangle.west);
      var south = projectionHelper.toDegrees(rectangle.south);
      var north = projectionHelper.toDegrees(rectangle.north);
      var points = this._getPoints(east, west, south, north);
      this._getHeights(points, (d) => {
        if (d && d.length > 0) {
          var min = d[0].value;
          var max = 0;
          for (var i = 0; i < d.length; i++) {
            if (d[i].value > max) {
              max = d[i].value;
            }
            if (d[i].value < min) {
              min = d[i].value;
            }
          }
          _this.minHeight = parseFloat(min.toFixed(1));
          _this.maxHeight = parseFloat(max.toFixed(1));
        }
      });
    },
    // 根据矩形范围得到行列数点坐标和高程信息
    _getPoints(xmin, xmax, ymin, ymax) {
      const x_count = 10;
      const y_count = 10;
      let cartesians = new Array(x_count * y_count);
      const x_d = (xmax - xmin) / x_count;
      for (var i = 0; i < x_count; ++i) {
        const start_pt = { x: xmin + i * x_d, y: ymax };
        const end_pt = { x: xmin + i * x_d, y: ymin };
        for (let j = 0; j < y_count; j++) {
          const offset = j / (y_count - 1);
          const x = Cesium.Math.lerp(start_pt.x, end_pt.x, offset);
          const y = Cesium.Math.lerp(start_pt.y, end_pt.y, offset);
          cartesians[j + i * y_count] = Cesium.Cartographic.fromDegrees(x, y);
        }
      }
      return cartesians;
    },
    _getHeights(cartesians, callback) {
      var terrainProvider = new Cesium.createWorldTerrain({
        requestVertexNormals: true,
      });
      // 根据地形计算某经纬度点的高度
      var promise = Cesium.sampleTerrainMostDetailed(
        terrainProvider,
        cartesians
      );
      Cesium.when(promise, function (updatedPositions) {
        let positions = updatedPositions.filter((d) => {
          const cartographic = d;
          if (cartographic) {
            const h_d = cartographic.height;
            return h_d > 0;
          }
        });
        positions = positions.map((d) => {
          const cartographic = d;
          let h = cartographic.height;
          return {
            x: Cesium.Math.toDegrees(cartographic.longitude),
            y: Cesium.Math.toDegrees(cartographic.latitude),
            value: h,
          };
        });
        if (callback) {
          callback(positions);
        }
      });
    },
    onAnalysis() {
      if (this.positions.length == 0) {
        this.$message.info("请先绘制淹没范围");
        return;
      }
      if (this.isAnalysis) {
        this.clearDraw();
      }
      this.isAnalysis = true;
      this.isEndAnalysis = false;
      this.createWaterPrimitive(this.positions, "false");
    },
    // 创建水淹效果
    createWaterPrimitive(positionWord, isExtrudedHeight) {
      var _this = this;
      isExtrudedHeight = isExtrudedHeight || "true";
      if (isExtrudedHeight == "false") {
        _this.height = _this.minHeight;
      }
      _this.waterHeight = _this.minHeight;
      function changePolygonPrimitive(options) {
        this.positions = options.positions;
        this.material = options.material;
        this.minHeight = options.minHeight || _this.minHeight;
        this.maxHeight = options.maxHeight || _this.maxHeight;
      }
      changePolygonPrimitive.prototype.getGeometry = function () {
        if (isExtrudedHeight && isExtrudedHeight == "false") {
          //只显示水面效果
          _this.height += _this.speed / 100;
          _this.curHeight = Number(_this.height.toFixed(1));
          if (_this.height > _this.maxHeight) {
            _this.height = _this.maxHeight;
            _this.curHeight = _this.height;
            if (!_this.isEndAnalysis) {
              _this.$message.info("已完成分析");
            }
            _this.isEndAnalysis = true;
          }
          _this.waterHeight = undefined;
        } else {
          _this.waterHeight += _this.speed / 100;
          _this.height = _this.minHeight;
          _this.curHeight = _this.waterHeight.toFixed(1);
          if (_this.waterHeight >= _this.maxHeight) {
            _this.curHeight = Math.floor(_this.waterHeight);
            _this.waterHeight = _this.maxHeight;
            if (!_this.isEndAnalysis) {
              _this.$message.info("已完成分析");
            }
            _this.isEndAnalysis = true;
          }
        }
        return new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(this.positions),
          height: _this.height,
          extrudedHeight: _this.waterHeight, //注释掉此属性可以只显示水面
        });
      };
      changePolygonPrimitive.prototype.update = function (context, frameState) {
        var geometry = this.getGeometry();
        if (!geometry) {
          return;
        }
        var material = this.material;

        this._primitive = new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: geometry,
          }),
          // 可以设置内置的水面shader
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: material,
          }),
          asynchronous: false, //必需开启
        });
        var primitive = this._primitive;
        primitive.update(context, frameState);
      };
      // 水波纹材质，不可放到属性值里去改变（如创建一个changePolygonPrimitive.prototype.getMaterial方法）或者直接放到appearance中的material属性里，
      // 只能在外部变量传进去，否则不起效果
      var material = new Cesium.Material({
        fabric: {
          type: "Water",
          uniforms: {
            baseWaterColor: new Cesium.Color(
              64 / 255,
              157 / 255,
              253 / 255,
              150 / 255
            ),
            normalMap: "/Assets/Textures/waterNormalsSmall.jpg",
            frequency: 1000.0,
            animationSpeed: 0.01,
            amplitude: 10.0,
          },
        },
      });
      var primitive = new changePolygonPrimitive({
        positions: positionWord,
        material: material,
      });
      this.primitive = primitive;
      viewer.scene.primitives.add(primitive);
    },

    // 清除淹没效果
    clearDraw() {
      createPolygon.destroy();
      this.positions = [];
      this.isAnalysis = false;
      this.isEndAnalysis = false;
      if (this.primitive) {
        viewer.scene.primitives.remove(this.primitive);
        this.primitive = undefined;
      }
    },
    // 关闭事件
    onclose() {
      this.isActiveRoam = false;
      this.clearDraw();
      this.$store.state.mainBoxState = false;
      this.$options.parent.currentTabComponent = "";
    },
    saveWaters() {
      var _this = this;
      if (this.positions && this.positions.length > 0) {
        var objId = Number(
          new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0)
        );
        let list = {
          id: objId,
          height: this.curHeight,
          extrudedHeight: undefined,
          positions: this.positions,
        };
        let params = {
          name: "",
          domain: "GZ",
          usage: "waters",
          json: JSON.stringify(list),
          tag: "",
        };
        let promise = _this.saveJsonStore(params);
        // promise.then(
        //   function (data) {
  
        //   }.bind(this)
        // );
      } else {
        this.$message.info("请先绘制水域范围");
      }
    },
    // 新增json管理数据
    saveJsonStore(params) {
      let promise = axios.post(
        `/agsupport-rest/io/jsonstore/save`,
        qs.stringify(params)
      );
      return promise;
    },
  },
  destroyed() {
    this.onclose();
  },
};
</script>
<style scoped>
.infoBox {
  position: fixed;
  bottom: 150px;
  left: 180px;
  width: 270px;
  background: #fff;
  padding-top: 10px;
}
.ant-form-item {
  margin-bottom: 10px;
}
.ant-btn {
  color: #009687;
  background-color: #fff;
  border-color: #009687;
}
.ant-btn-primary {
  background-color: #009687;
  border-color: #009687;
  color: #fff;
}
</style>