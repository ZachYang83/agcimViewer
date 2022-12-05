<template>
  <ag-popup
    v-model="visible"
    title="设备管控"
    @onCancel="onCancel"
    class="popup-box"
  >
    <div class="fire-page vscroll">
      <div class="h4">缓冲区半径</div>
      <a-input placeholder="缓冲区半径" v-model="radius" class="input" />米
      <a-button type="primary" @click.stop="removeBuffer" class="ml10"
        >清除缓冲</a-button
      >

      <div class="h4">模拟起火</div>
      <a-button v-show="!firePFlag" type="primary" @click.stop="onFire"
        >选择着火点</a-button
      >
      <p v-show="firePFlag">
        着火点：高度：{{ firePosition.height }} {{ firePosition.floor }}楼
      </p>
      <a-button
        type="primary"
        @click.stop="toNearestLocation"
        style="margin:10px;"
        >最近消防箱</a-button
      >
      <a-button type="primary" @click.stop="offFire">灭火</a-button>
      <a-collapse accordion>
        <a-collapse-panel key="1" header="消防栓清单">
          <a-table
            :columns="columns"
            :data-source="tableArr"
            :rowKey="(data) => data.id"
            :loading="loading"
            size="small"
            align="center"
            class="table1"
          >
            <span slot="name" slot-scope="text, record">
              {{ record.floor }}-{{ text }}
            </span>
            <span slot="action" slot-scope="text, record">
              <a class="loc" @click="toLocation(record)">定位</a>
            </span>
          </a-table>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </ag-popup>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import AgPopup from "@/views/components/AgPopup.vue";
import turf from "@turf/buffer";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import SimulatedFire from "./js/simulatedFire";

import indoorRoam from "./js/indoorRoam"; //待。。。。
import agWFSLayer from "@/sdk/layer/agWFSLayer";
import Ag3DTilesLayer from "@/sdk/layer/ag3DTilesLayer";
import agMath from "@/sdk/maths/math";
import agCoordinate from "@/sdk/maths/coordinate.js";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);

let viewer = null;
let pickerHelper = null;
let bufferArr = [];
let fire = null;

const columns = [
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
    scopedSlots: { customRender: "name" },
  },
  {
    title: "功能",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
let curLayer = null;

let mapArray = [
  [113.37217310252332, 23.10165378007259],
  [113.37210878843727, 23.100869008883443],
  [113.37306035014272, 23.100921676547635],
  [113.37305014314428, 23.101646263701422],
  [113.37305715760054, 23.101652154649322],
  [113.37305715760054, 23.101652154649322],
];

export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      visible: true,
      radius: 5,
      aniI: 1,
      firePosition: {},
      firePFlag: false,
      isShowxfBox: false,

      loading: false,
      columns,
      tableArr: [],
      floorHeight: 8.35,
      pagination: {
        pageSize: 10,
        current: 1,
      },
      curModle: {},
    };
  },
  mounted() {
    viewer = CIM.viewer;
    pickerHelper = new PickerHelper(viewer);
    this.init();
    this.getCurModle();
    viewer.camera.flyTo({
      destination: new Cesium.Cartesian3(
        -2328644.6889490956,
        5388268.77832424,
        2486959.0296422723
      ),
      orientation: {
        heading: 6.283185307177968,
        pitch: -0.5000227043868457,
        roll: 6.283185307179586,
      },
    });
  },
  methods: {
    init() {
      let vm = this;
      let arr = ["测试BIM模型", "保利天悦基底面-更新"];
      for (let i = 0; i < arr.length; i++) {
        this.showLayer(arr[i]);
      }
      pickerHelper.on("LEFT_CLICK", function(movement) {
        var pick = viewer.scene.pick(movement.position);
        //缓冲半径
        if (pick && pick.id && pick.id.polygon && pick.id.polygon.hierarchy) {
          vm.addBuffer(pick.id);
        }
        //消防箱
        // if (pick && pick.tileset) {
        //   let str = pick.tileset.agMetaData.text;
        //   if (vm.aniI == 1 && str.indexOf("消防箱") > -1) {
        //     vm.loopShadow(pick);
        //   }
        // }
      });
    },
    async getCurModle() {
      let res = await axiosWraper.getData(
        `/agsupport-rest/agsupport/BIM/materials/statistics`,
        {
          mapArray: encodeURIComponent(JSON.stringify(mapArray)),
          paramType: 1,
        }
      );
      if (res.success) {
        this.curModle = res.content.rows[0];
        this.getList(this.pagination);
      }
    },
    showLayer(layerName) {
      let ly = CIM.layerTree.getLayerByText(layerName);
      let ids = CIM.layerTree._aglayerIds;
      if (ly && ly.id && ids.indexOf(ly.id) == -1) {
        CIM.layerTree.addLayer(ly, viewer);
      }
    },
    async getList(params = {}) {
      this.loading = true;
      let ly = CIM.layerTree.getLayerByText("测试BIM模型");
      let id = ly && ly.id;
      let res = await axiosWraper.getData(
        `/agsupport-rest/agsupport/BIM/materials/find`,
        {
          mapArray: encodeURIComponent(JSON.stringify(mapArray)),
          sourceId: this.curModle.id,
          rows: params.pageSize,
          page: params.current,
        }
      );
      this.tableArr = [];
      if (res.success) {
        this.loading = false;
        const pagination = { ...this.pagination };
        pagination.total = res.content.total;
        this.pagination = pagination;

        let arr = res.content.rows;
        for (let i = 0; i < arr.length; i++) {
          let o = arr[i].coordinates.split(",");
          arr[i].coordinates = [
            parseFloat(o[0]),
            parseFloat(o[1]),
            parseFloat(o[2]),
          ];
        }
        this.tableArr = arr;
        this.onMdShowList();
      }
    },
    onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
    },
    //最近消防箱
    toNearestLocation() {
      let vm = this;
      //计算 着火点 和 清单点 最近距离
      let arr = this.tableArr;
      var nearestObj = {
        index: 0,
        min: 0,
        poa: {},
      };
      for (var i = 0; i < arr.length; i++) {
        let distance = vm.firePosition.height - arr[i].coordinates[2];
        //0 - floorHeight
        if (distance > 0 && distance < vm.floorHeight) {
          let p1 = agCoordinate.WGS84_to_Cartesian3({
            lng: arr[i].coordinates[0],
            lat: arr[i].coordinates[1],
            alt: arr[i].coordinates[2],
          });
          let p2 = vm.firePosition.position;

          if (nearestObj.min == 0) {
            nearestObj.min = agMath.getDistance([p1.x, p1.y], [p2.x, p2.y]);
            nearestObj.index = i;
            nearestObj.poa = p1;
          } else {
            let min1 = agMath.getDistance([p1.x, p1.y], [p2.x, p2.y]);
            if (nearestObj.min > min1) {
              nearestObj.min = min1;
              nearestObj.index = i;
              nearestObj.poa = p1;
            }
          }
        }
      }

      this.toLocation(arr[nearestObj.index]);
      var lable = agFeatureLayer.addEntity({
        label: {
          text: this.firePosition.floor + "楼" + arr[nearestObj.index].name,
          font: "bold 20px sans-serif",
          pixelOffset: new Cesium.Cartesian2(145, -45),
          backgroundColor: Cesium.Color.fromCssColorString("#f99d0d"),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        position: nearestObj.poa,
        billboard: {
          width: 208,
          height: 60,
          image: require("./img/label.png"),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(100, 0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    },
    //加缓冲区
    addBuffer(entity) {
      let vm = this;
      let arrEntity = entity.polygon.hierarchy._value.positions;
      let geoArr = [];
      for (let j = 0; j < arrEntity.length; j++) {
        geoArr.push(vm.changeToLngLat(arrEntity[j]));
      }
      let geojson = {
        type: "Feature",
        id: entity.id,
        geometry: {
          type: "MultiPolygon",
          coordinates: [[geoArr]],
        },
        geometry_name: "the_geom",
        properties: entity.properties.getValue(""),
      };

      var polygon = turf(geojson, vm.radius * 0.001);
      var arr = polygon.geometry.coordinates[0];
      var arr2 = arr.reduce(function(a, b) {
        return a.concat(b);
      });
      let entityB = viewer.entities.add({
        name: entity.id,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(arr2),
          material: Cesium.Color.CYAN.withAlpha(0.5),
          outline: true,
          outlineColor: Cesium.Color.BLACK,
        },
      });
      bufferArr.push(entityB);
    },
    //点击消防栓后效果
    loopShadow(pick) {
      if (this.aniI % 2 === 1) {
        pick.originalColor = pick.color;
        pick.color = Cesium.Color.RED;
      } else {
        pick.color = pick.originalColor;
      }
      this.aniI++;
      if (this.aniI < 7) {
        setTimeout(() => {
          this.loopShadow(pick);
        }, 400);
      } else {
        this.aniI = 1;
        indoorRoam.marks = [
          {
            lng: 113.37231295753084,
            lat: 23.101917299946567,
            height: 35,
            flytime: 5,
          },
          {
            lng: 113.37231092899538,
            lat: 23.101952937304958,
            height: 32,
            flytime: 5,
          },
          {
            lng: 113.37232149241302,
            lat: 23.102043995709536,
            height: 32,
            flytime: 5,
          },
          {
            lng: 113.3723727739534,
            lat: 23.102010394417857,
            height: 32,
            flytime: 5,
          },
          {
            lng: 113.37234640420877,
            lat: 23.101886029310943,
            height: 32,
            flytime: 5,
          },
        ];
        indoorRoam.Initialize(viewer);
        return;
      }
    },
    //移除缓冲区
    removeBuffer() {
      bufferArr.forEach(function(element) {
        CIM.viewer.entities.remove(element);
      });
    },
    changeToLngLat(cartesian3) {
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
      var lat = Cesium.Math.toDegrees(cartographic.latitude);
      var lng = Cesium.Math.toDegrees(cartographic.longitude);
      return [lng, lat];
    },
    //点火
    onFire() {
      let vm = this;
      vm.firePFlag = true;
      pickerHelper.on("LEFT_CLICK", function(movement) {
        var position = viewer.scene.pickPosition(movement.position);
        var cartographic = Cesium.Cartographic.fromCartesian(position);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;

        let floor = Math.floor(alt / vm.floorHeight) + 1;
        vm.firePosition = {
          lat: lat,
          lng: lng,
          height: alt,
          floor: floor,
          position: position,
        };
        fire = new SimulatedFire();
        let option = {
          staticPosition: position, //着火点
          distance: 200, //看到火的距离
          imageSize: 20, //火的尺寸
        };
        fire.initialize(option, viewer);
        pickerHelper.remove("LEFT_CLICK");
      });
    },
    //灭火
    offFire() {
      this.firePosition = {};
      this.firePFlag = false;
      if (fire) {
        fire.off();
        agFeatureLayer.removeAll();
      }
    },
    //加载消防栓到地图上
    onMdShowList() {
      let data = this.tableArr;
      let o = this.curModle;
      var layer;
      let tarr = CIM.layerTree._aglayers;
      for (let i = 0; i < tarr.length; i++) {
        if (tarr[i].id == o.id) {
          layer = tarr[i];
          break;
        }
      }
      if (!layer) {
        layer = new agWFSLayer(viewer);
        layer.id = o.id;
        tarr.push(layer);
      }
      curLayer = layer;
      layer.set3dTilesStyle(
        { arr: data, id: o.id },
        {
          url: o.url,
          styleManagerId: o.styleManagerId,
        },
        true
      );
    },
    //定位到消防栓
    toLocation(row) {
      let lytree = CIM.layerTree._aglayers;
      for (let k = lytree.length - 1; k > 0; k--) {
        if (lytree[k].id == this.curModle.id) {
          let arr = lytree[k]._primitives;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].agMetaData.id == row.id) {
              let tileset = arr[i];
              viewer.flyTo(tileset, {
                duration: 2,
              });
              return;
            }
          }
        }
      }
    },
    clear() {
      this.offFire();
      this.removeBuffer();
      pickerHelper.remove("LEFT_CLICK");
    },
  },
  watch: {
    $route(to, from) {
      if (to.name == "FireRAnalysis") {
        this.init();
      } else {
        this.clear();
      }
    },
  },
  beforeDestroy() {
    // this.clear();
    // pickerHelper.off();
  },
};
</script>
<style scoped>
.popup-box {
  width: 400px;
}
.popup-box .content {
  width: 100%;
  height: 100%;
}
.fire-page {
  padding: 20px;
  max-height: 610px;
  overflow: auto;
}
.fire-page .h4 {
  margin-bottom: 10px;
}
.fire-page .input {
  width: 120px;
  margin: 10px 10px 10px 0;
}
.fire-page .ant-btn-primary {
  margin-bottom: 10px;
}
.fire-page .ml10 {
  margin-left: 10px;
}
.fire-page .ant-collapse > .ant-collapse-item > .ant-collapse-header {
  color: rgba(0, 0, 0, 0.85);
}
</style>
