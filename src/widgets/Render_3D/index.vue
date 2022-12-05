
<!--
 * @author: 谢小龙
 * @description: 三维绘制
-->
<template>
  <div>
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="常规几何体">
        <div class="draw-mode-info">
          <div class="p-draw-mode">
            <p>绘制模式：</p>
          </div>
          <a-radio-group v-model="drawType" @change="onChange">
            <a-radio :value="'Point'">点</a-radio>
            <a-radio :value="'Polyline'">线</a-radio>
            <a-radio :value="'Polygon'">面</a-radio>
          </a-radio-group>
        </div>
        <div class="draw-mode-info commont-param">
          <div class="commont-item">
            <p>模型间隔(m)：</p>
            <a-input-number id="inputNumber" v-model="modelInterval" :min="0" :max="999" />
          </div>
          <div class="commont-item">
            <p>透明度：</p>
            <a-slider v-model="opacity" @change="onChangeOpacity" />

          </div>
          <div class="commont-item">
            <p>自动贴地</p>
            <a-switch default-checked @change="clampTerrain" />
          </div>

          <div class="commont-item">
            <p>填充颜色：</p>
            <a-input type="color" v-model="initPointColor" class="colorInfo" />
          </div>

        </div>
        <div class="collapse">
          <a-collapse accordion default-active-key="2">
            <a-collapse-panel key="2" header="基础点绘制">
              <div v-if="modelType==='Circular'">
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>半径(m)：</p>
                  </div>
                  <a-input-number v-model="Circular.radii" :min="1" :max="100" class="numberInfo" />
                </div>
              </div>
              <div v-if="modelType==='Cylinder'">
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>半径(m)：</p>
                  </div>
                  <a-input-number v-model="Cylinder.radii" :min="1" :max="100" class="numberInfo" />
                </div>
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>高度(m)：</p>
                  </div>
                  <a-input-number v-model="Cylinder.height" :min="1" :max="100" class="numberInfo" />
                </div>
              </div>
              <div v-if="modelType==='Cube'">
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>长度(m)：</p>
                  </div>
                  <a-input-number v-model="Cube.length" :min="1" :max="100" class="numberInfo" />
                </div>
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>宽度(m)：</p>
                  </div>
                  <a-input-number v-model="Cube.width" :min="1" :max="100" class="numberInfo" />
                </div>
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>高度(m)：</p>
                  </div>
                  <a-input-number v-model="Cube.height" :min="1" :max="100" class="numberInfo" />
                </div>
              </div>
              <div v-if="modelType==='Cone'">
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>半径(m)：</p>
                  </div>
                  <a-input-number v-model="Cone.radii" :min="1" :max="100" class="numberInfo" />
                </div>
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>高度(m)：</p>
                  </div>
                  <a-input-number v-model="Cone.height" :min="1" :max="100" class="numberInfo" />
                </div>
              </div>
              <div v-if="modelType==='InvertedCone'">
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>半径(m)：</p>
                  </div>
                  <a-input-number v-model="InvertedCone.radii" :min="1" :max="100" class="numberInfo" />
                </div>
                <div class="draw-mode-info">
                  <div class="p-draw-mode">
                    <p>高度(m)：</p>
                  </div>
                  <a-input-number v-model="InvertedCone.height" :min="1" :max="100" class="numberInfo" />
                </div>
              </div>
              <a-button-group class="button-group-info">
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>绘制球模型</span>
                  </template>
                  <a-button type="dashed" icon="plus-circle" @click="drawModel('Circular')"></a-button>
                </a-tooltip>
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>绘制圆柱模型</span>
                  </template>
                  <a-button type="dashed" icon="play-circle" @click="drawModel('Cylinder')"></a-button>
                </a-tooltip>
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>绘制立方体</span>
                  </template>
                  <a-button type="dashed" icon="dot-chart" @click="drawModel('Cube')"></a-button>
                </a-tooltip>
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>绘制锥体模型</span>
                  </template>
                  <a-button type="dashed" icon="caret-up" @click="drawModel('Cone')"></a-button>
                </a-tooltip>
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>绘制倒锥体模型</span>
                  </template>
                  <a-button type="dashed" icon="caret-down" @click="drawModel('InvertedCone')"></a-button>
                </a-tooltip>
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>绘制钻石模型</span>
                  </template>
                  <a-button type="dashed" icon="sketch" @click="drawModel('Diamonds')"></a-button>
                </a-tooltip>
                <a-tooltip placement="bottom">
                  <template slot="title">
                    <span>绘制四面体模型</span>
                  </template>
                  <a-button type="dashed" icon="menu-unfold" @click="drawModel('Multilateral')"></a-button>
                </a-tooltip>
              </a-button-group>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="复杂几何体" force-render>
        <div class="draw-mode-info">
          <div class="p-draw-mode">
            <p>绘制模式：</p>
          </div>
          <a-radio-group v-model="drawType" @change="onChange">
            <a-radio :value="'Point'">点</a-radio>
            <a-radio :value="'Polyline'">线</a-radio>
            <a-radio :value="'Polygon'">面</a-radio>
          </a-radio-group>
        </div>
        <div class="collapse">
          <a-collapse accordion default-active-key="2">
            <a-collapse-panel key="1" header="图例选择绘制">
              <div class="legend-list-info">
                <img v-for="(item,index) in legendDataList" :key="index" :src="item.url" alt="" @click="drawModel('Model',item)" />
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </a-tab-pane>
      <a-tab-pane key="3" tab="自由绘制">

      </a-tab-pane>
      <a-tab-pane key="4" tab="标注牌">
        <remark-billboard></remark-billboard>
      </a-tab-pane>
    </a-tabs>

  </div>
</template>

<script>
import { LegendDataList } from "@/widgets/Render_3D/js/LegendDataList";
import Render3D from "@/adk/render_3D/index.js";
import RemarkBillboard from '../SnapShotTagging/0index'
let render3D;
let baseUrl = "https://augurdev.cn/augurData/3d/Render3D/";
export default {
  components: {
    RemarkBillboard
  },
  data() {
    return {
      drawType: "Point",
      modelType: "",
      modelInterval: 3,
      opacity: 50,
      initPointColor: "#FFA200",
      figureDateInfo: "图例选择",
      legendDataList: LegendDataList,
      autoclampTerrain: true,
      transform: {
        x: 0,
        y: 0,
        z: 0,
      },
      rotating: {
        x: 0,
        y: 0,
        z: 0,
      },
      Circular: {
        radii: 1,
      },
      Cylinder: {
        radii: 1,
        height: 1,
      },
      Cube: {
        length: 2,
        width: 2,
        height: 2,
      },
      Cone: {
        radii: 1,
        height: 2,
      },
      InvertedCone: {
        radii: 1,
        height: 2,
      },
      Model: {
        scale: 1,
        uri: "",
      },
    };
  },
  mounted() {
    render3D = new Render3D(CIM.viewer);
  },
  computed: {},
  watch: {},
  methods: {
    onChange(e) {
      this.drawType = e.target.value;
    },
    onChangeOpacity(value) {
      this.opacity = value;
    },
    async drawModel(type, val) {
      this.modelType = type;

      let params = this[type];
      if (val && val.modelUrl) {
        params.uri = baseUrl + val.modelUrl;
      } else {
        let color = Cesium.Color.fromCssColorString(this.initPointColor);
        params.material = Cesium.Color.fromAlpha(color, this.opacity / 100);
      }

      switch (this.drawType) {
        case "Point":
          render3D.selected(
            await render3D.drawPoint(type, this.autoclampTerrain, params, {
              color: Cesium.Color.RED,
            })
          );
          break;
        case "Polyline":
          render3D.selected(
            await render3D.drawPolyline(
              type,
              this.autoclampTerrain,
              this.modelInterval,
              params,
              { material: Cesium.Color.RED },
              { color: Cesium.Color.YELLOW }
            )
          );
          break;
        case "Polygon":
          render3D.selected(
            await render3D.drawPolygon(
              type,
              this.autoclampTerrain,
              this.modelInterval,
              params
            )
          );
          break;
      }
    },
    clampTerrain(value) {
      this.autoclampTerrain = value;
    },

    deleteModel() {
      render3D.removeModel((entity) => {
        this.$message.info("确认删除");
        return true;
      });
    },
    revoke() {},
    clear() {
      render3D.clear();
    },
  },
  destroyed() {
    this.clear();
  },
};
</script>

<style scoped>
p {
  padding: 5px;
}

.p-draw-mode {
  float: left;
}
.commont-param {
  display: block;
  height: 170px;
}
img {
  width: 60px;
  height: 70px;
  margin: 7px;
  cursor: pointer;
}

::v-deep .ant-radio-group {
  padding-top: 5px;
}

.draw-mode-info {
  margin: 15px;
}

.collapse {
  height: 435px;
}

.button-update-info {
  margin-top: 15px;
  margin-left: 30px;
}

.button-group-info {
  margin-left: 20px;
  margin-top: 20px;
}

::v-deep .ant-collapse-content > .ant-collapse-content-box {
  padding: 5px;
  /* height: 300px; */
}

.colorInfo {
  width: 150px;
  margin-left: 5px;
}

.numberInfo {
  width: 150px;
}

.legend-list-info {
  /* height: 300px; */
  overflow-y: auto;
}

.legend-list-info::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px;
  /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
  border: 0;
}

.legend-list-info::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 2px #999999;
  border: 0;
  background: #999999;
}

.legend-list-info::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 2px #999999;
  border: 0;
  border-radius: 5px;
  background: #ffffff;
}
.btn_group_do {
  text-align: center;
  margin-top: 50px;
}
.clear {
  margin: 0 3px;
}
.ant-collapse-content {
  height: 100%;
}
</style>