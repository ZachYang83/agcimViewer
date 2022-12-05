<template>
  <div class="static-page">
    <div class="bim-app-main">
      <div class="bim-app-title">
        <p>
          <b>BIM应用菜单</b>
        </p>
      </div>
      <div class="bim-app-button-group">
        <a-button class="bim-app-button" @click="showList()">
          <a-icon type="check-circle" style="font-size: 14px" />轻量化替换
        </a-button>
      </div>
    </div>

    <!-- 清单 -->
    <ag-popup title="已识别的建筑清单" v-model="popVisible" @onCancel="onCancel" class="popup-box">
      <div class="content">
        <div class="top-box">
          <div>
            <a-button v-show="0" type="primary" @click="addModel">添加</a-button>
            <a-button v-show="0" type="danger" ghost class="ml10">删除</a-button>
          </div>
          总数：{{ tableArr1.length }}
        </div>
        <a-table
          :columns="columns1"
          :data-source="tableArr1"
          :rowKey="(data) => data.id"
          :scroll="{ y: 600 }"
          size="small"
          align="center"
          class="table1"
        >
          <span slot="name" slot-scope="text, record">{{ record.floor }}{{ text }}</span>
          <span slot="action" slot-scope="text, record">
            <a class="loc" @click="toLocation(record)">定位</a>
            <a class="loc" @click="handleReplaceComponent(record)">替换</a>
            <!-- <a @click="edit(record)">编辑</a> -->
          </span>
        </a-table>

        <!-- <div class="switch-box">
          <label class="trlable">透明度</label>
        </div>-->
      </div>
    </ag-popup>
  </div>
</template>

<script>
const tableArr1 = [];
let highlightBoxList = [];
import agMath from "@/sdk/maths/math";
import agCamera from "@/sdk/camera/camera";
import agWFSLayer from "@/sdk/layer/agWFSLayer";
import Ag3DTilesLayer from "@/sdk/layer/ag3DTilesLayer";
import highlightHelper from "@/sdk/renderer/highlightHelper";
import AgHighlightBoxHelper from "@/sdk/renderer/highlightBoxHelper";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import AgPopup from "@/views/components/AgPopup.vue";
import projectServer from "./server/projectServer";
import tableServer from "./server/tableServer";
import {
  BUILDING_HOUSE,
  BUILDING_METERIAL,
  BUILDING_TREE,
  BUILDING_CAR,
  BUILDING_ENTITYPARCEL,
} from "./js/buildingType";
import info from "./config.json";
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);
let viewer = CIM.viewer;
var agHighlightBoxHelper = new AgHighlightBoxHelper(viewer);
let pickerHelper = null;
let curLayer = null;
let columns = info.columns;
let columns1 = info.columns1;
let tableArr = info.tableArr;
export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      columns,
      tableArr,
      selectedRowKeys: [],

      columns1,
      tableArr1,
      selectedRowKeys1: [],

      curModle: {},
      popVisible: false,
      list: [],
    };
  },
  mounted() { },
  methods: {
    showList() {
      this.tableArr1 = info.VillageBuilding;
      this.popVisible = true;
      this.curModle = info.curModle;
      for (let i = 0; i < info.boxPointList.length; i++) {
        let pbox = info.boxPointList[i];
        let center = Cesium.Cartesian3.fromDegrees(pbox[0], pbox[1], pbox[2]);
        let box = agHighlightBoxHelper.addBox(
          center,
          new Cesium.Cartesian3(12.4, 12, 14),
          new Cesium.HeadingPitchRoll(35.160728786416368, 0.0, 0.0),
          Cesium.Color.YELLOW.withAlpha(0.3)
        );
        box.show = false;
        highlightBoxList.push(box);
      }
    },
    onCancel() {
      agHighlightBoxHelper.removeAllBoxes();
      this.popVisible = false;
    },
    flatten() {
      this.hideHighlightBoxes("all");
      window.isFlat = !window.isFlat;
    },
    toLocation(row) {
      this.hideHighlightBoxes(parseInt(row.id));
      let lytree = CIM.layerTree._aglayers;
      for (let k = 0; k < lytree.length; k++) {
        if (
          lytree[k].id == this.curModle.id ||
          lytree[k].id == "86fa70d7-1a16-4d37-9514-1d14323c5185"
        ) {
          let arr = lytree[k]._primitives;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].agMetaData.id == row.id) {
              let tileset = arr[i];
              viewer.flyTo(tileset, {
                duration: 2,
              });
              return;
            }
            //定位高亮房屋
            let tileset = arr[i];
            tileset.style = new Cesium.Cesium3DTileStyle({
              color: {
                conditions: [
                  ["${ID} ===" + row.batchId + "", "rgba(255,255, 0, 1)"],
                  ["true", "rgb(255, 255, 255)"],
                ],
              },
            });
          }
        }
      }
      agCamera.setCameraByPosition(viewer, row.coordinates);
    },
    edit() { },
    async getObb(indexTileTable) {
      let param = { entitytable: encodeURIComponent(indexTileTable), paramType: 1 };
      let res = await tableServer.findDentity(param);
      let data = res.content;
      if (!data || data == null) return;
      let obb = JSON.parse(data.boundingbox);
      console.log(obb);
      return obb;

    },
    /**
     * 获取obb包围盒中心
     */
    async getObbCenter(indexTileTable) {
      let obb = await this.getObb(indexTileTable);
      let cartList = [];
      for (let i = 0; i < obb.length; i++) {
        cartList.push(new Cesium.Cartesian3(obb[i].X, obb[i].Y, obb[i].Z));
      }

      let aabb = Cesium.AxisAlignedBoundingBox.fromPoints(cartList);
      return aabb.center;
    },
    async initHouseObj(tileset, data) {
      let _this = this;
      let obbCenter = await _this.getObbCenter(data.tableName);
      return await tileset.readyPromise.then(function (tileset) {
        tileset.property_url = data.property_url;
        tileset.tableName = data.tableName; //构件表名称
        tileset.type = BUILDING_HOUSE; //类型为房屋
        tileset.id = Cesium.createGuid(); //房屋id
        tileset.obbCenter = obbCenter;
        console.log(tileset);
        return tileset;
      });
    },
    async getObbHeight(indexTileTable) {
      let obb = await this.getObb(indexTileTable);
      let zArr = obb.map((item) => item.Z);
      let zArrSort = zArr.sort((a, b) => b - a);

      return zArrSort[0] - zArrSort[zArrSort.length - 1];
    },
    //添加替换的房屋
    async addHouses(data, row) {
      var _this = this;
      var tileset = new Cesium.Cesium3DTileset({
        url: data.url,
        show: true,
      });
      let rowHeight = 99;
      tileset = await _this.initHouseObj(tileset, data);
      agFeatureLayer.addPrimitive(tileset);
      //计算房子高度
      let offheight = (await _this.getObbHeight(tileset.tableName)) / 2 - 1;
      var ellipsoid = viewer.scene.globe.ellipsoid;
      //  row.coordinates[3]  =  row.coordinates[3]  + offheight
      if (row.id == 1) {
        rowHeight = 98.8;
      } else if (row.id == 2) {
        rowHeight = 96.8;
      } else if (row.id == 3) {
        rowHeight = 94.3;
      }
      var cartographic = Cesium.Cartographic.fromDegrees(
        row.coordinates[0],
        row.coordinates[1],
        rowHeight
      );
      // var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(row.coordinates[0],row.coordinates[1], row.coordinates[3] , ellipsoid) )
      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          cartographic.height + offheight
        )
      );
      var m1 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(-133));
      modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
        modelMatrix,
        m1,
        modelMatrix
      );
      tileset._root.transform = modelMatrix;
    },
    //替换构件
    handleReplaceComponent(row) {
      //请求房屋商店Promise对象
      this.hideHighlightBoxes("all");
      this.getPropetyData().then((ref) => {
        let lytree = CIM.layerTree._aglayers;
        for (let k = 0; k < lytree.length; k++) {
          if (
            lytree[k].id == this.curModle.id ||
            lytree[k].id == "8d5320b1-e752-4d4a-8136-c5e8ee61dfd4"
          ) {
            let arr = lytree[k]._primitives;
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].agMetaData.id == row.id) {
                let tileset = arr[i];
                arr[i];
                agCamera.agFlyToTileset(viewer, tileset, { duration: 2 });
                return;
              }
              this.addHouses(ref[0], row);
              //定位高亮房屋
              let tileset = arr[i];
              tileset.style = new Cesium.Cesium3DTileStyle({
                color: {
                  conditions: [
                    ["${ID} ===" + row.batchId + "", "rgba(255,255, 0, 1)"],
                    ["true", "rgb(255, 255, 255)"],
                  ],
                },
              });
            }
          }
        }
      });
    },
    //获取模型的服务器路径
    async loadBinBeforPath() {
      let data = await projectServer.findProjectById({ paramType: 2 });
      if (data.success) {
        let da = data.content.filter((item) => item.id == "3");
        return da[0].path;
      }
    },
    //  获取房屋列表
    async getPropetyData() {
      let _this = this;
      let user = this.$store.state.user;
      let param = {
        page: 0,
        rows: 100000,
        userId: user.userId,
      };

      let data = await projectServer.findProject(param);
      let beferPath = await this.loadBinBeforPath();
      let result = data.content.rows;
      let filterDa = result.map((item) => {
        item.url = beferPath + item.storeFullPath;
        item.name = item.hourseName;
        item.img = beferPath + item.thumb;
        item.property_url = "/getAll/" + item.tableName;
        //如果有位置信息
        item.beferPath = beferPath;
        return item;
      });
      return filterDa;
    },
    addModel() {
      let vm = this;
      pickerHelper = new PickerHelper(viewer);
      pickerHelper.on("LEFT_CLICK", function (movement) {
        let pickedFeature = viewer.scene.pick(movement.position);
        var position = viewer.scene.pickPosition(movement.position);
        var cartographic = Cesium.Cartographic.fromCartesian(position);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;

        if (position) {
          let row = {
            name: "消防栓",
            coordinates: [lng, lat, alt],
            feature: "",
            floor: "",
          };

          let layer = new Ag3DTilesLayer(viewer);
          let tileset = layer.add(
            vm.curModle.url,
            {},
            vm.curModle.styleManagerId
          );
          tileset.readyPromise.then(function (tileset) {
            var cartographic = Cesium.Cartographic.fromCartesian(
              tileset.boundingSphere.center
            );
            var surface = Cesium.Cartesian3.fromRadians(
              cartographic.longitude,
              cartographic.latitude,
              cartographic.height
            );
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var cartographic = Cesium.Cartographic.fromDegrees(lng, lat, alt);
            var offset = ellipsoid.cartographicToCartesian(cartographic);
            var translation = Cesium.Cartesian3.subtract(
              offset,
              surface,
              new Cesium.Cartesian3()
            );
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
            tileset.agMetaData = row;
            curLayer.push(tileset);
          });
          pickerHelper.off();
        }
      });
    },
    hideHighlightBoxes(key) {
      if (key == "all") {
        for (let k = 0; k < highlightBoxList.length; k++) {
          let hbox = highlightBoxList[k];
          agHighlightBoxHelper.hideBox(hbox);
        }
      } else {
        for (let k = 0; k < highlightBoxList.length; k++) {
          let hbox = highlightBoxList[k];
          if (key - 1 == k) {
            agHighlightBoxHelper.showBox(hbox);
          } else {
            agHighlightBoxHelper.hideBox(hbox);
          }
        }
      }
    },
  },
};
</script>
<style scoped>
.table /deep/ .ant-table-column-title .ant-table-selection {
  display: none;
}
.static-page .h4 {
  margin: 0 10px 10px;
}
.popup-box {
  width: 470px;
  background: #fff;
}
.popup-box .content {
  padding: 20px;
}
.popup-box .top-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ml10 {
  margin-left: 10px;
}
.table1 .loc {
  margin-right: 10px;
}
.bim-app-main {
}
.bim-app-main .bim-app-title {
  margin: 20px;
}
.bim-app-main .bim-app-button-group {
  margin: 20px;
}
.bim-app-main .bim-app-button-group .bim-app-button {
  background-color: rgb(24, 144, 255);
  color: white;
  border: 0;
  margin-right: 5px;
}
</style>
