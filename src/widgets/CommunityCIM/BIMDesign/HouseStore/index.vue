<template>
  <div>
    <!--房屋列表-->
    <div v-show="indexModelPanel===1">
      <div class="list-box vscroll">
        <ul class="bar-ul">
          <li v-for="item in binSuermarketArr" :binid="item.url" :key="item.url">
            <a-item :value="item" @choose="choose" @detail="detail"></a-item>
          </li>
        </ul>
      </div>
    </div>
    <!--房屋详情-->
    <div v-show="indexModelPanel===2">
      <house-detail ref="houseDetail"></house-detail>
      <a-button class="house_compared" v-on:click="backToHouseList" value="small" icon="rollback" title="返回详情列表">返回详情列表</a-button>
    </div>

    <!-- 房屋搭建過程 -->
    <building-house :visible="isShowBuildingPanel" @closePanel="closeHouseBuilding" ref="buildingHose" />
  </div>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import highlightHelper from "@/sdk/renderer/highlightHelper";
import AItem from "../common/AItem";
import HouseDetail from "./detail.vue";
import BuildingHouse from "./BuildingHouse.vue";
import modelManager from "../common/modelManager"; ///////////
import bin_default from "./img/house.png";
let viewer = CIM.viewer;
let isActiveGrow = false;
let selectectTrasfroms = null;
let isActiveHouseBuilding = false;
let currentSelectTileset = null;
let selectBinPropety = null;
let pickerHelper = null;
let isBuilding = false;

let defaultHouse = [
  {
    url:
      "http://106.53.221.204:6700/tileset/country_index/cesium3dtiles/villageBuildingNew/tileset.json",
    name: "示例建造房子过程",
    id: 111111,
    img: bin_default,
    property_url: "/getAll/villageBuilding1",
    tableName: "agcim3dentity_via",
    transform: JSON.parse(
      `{"0":0.4170574188373083,"1":0.5084878545420938,"2":-0.7533280899952831,"3":0,"4":-0.8391398271942255,"5":-0.10298382841103011,"6":-0.5340774115259442,"7":0,"8":-0.349152487903505,"9":0.854888549969519,"10":0.383742240731726,"11":0,"12":-2228070.034721209,"13":5455326.431980324,"14":2432356.1328094,"15":1}`
    ),
  },
];

export default {
  components: {
    "house-detail": HouseDetail,
    "a-item": AItem,
    "building-house": BuildingHouse,
  },
  props: ["indexSuperMarket"],
  data() {
    return {
      isShowModelPanel: false,
      selectBinPropety: null,
      indexModelPanel: 1,
      comparedArr: [],
      binSuermarketArr: [],

      isShowBuildingPanel: false,
    };
  },
  mounted() {
    pickerHelper = new PickerHelper(viewer);
    this.getPropetyData();
    this.addHouseEvent();
  },

  methods: {
    choose(e) {
      //显示建造房子过程
      if (e.id === 111111) {
        isActiveHouseBuilding = true;
      } else {
        isActiveGrow = true; //给鼠标出个状态。。。。种房子中。。
      }
      selectBinPropety = e;
    },
    //加房子到地图上
    addHouseEvent() {
      let vm = this;
      pickerHelper.on("LEFT_CLICK", function (movement) {
        var position = viewer.scene.pickPosition(movement.position);
        var pickedFeature = viewer.scene.pick(movement.position);
        if (!Cesium.defined(pickedFeature)) {
          return;
        }
        let binUrl = pickedFeature.tileset;
        let transform;
        if (pickedFeature.content) {
          transform = pickedFeature.content._tileset._root.transform;
        }
        selectectTrasfroms = transform;
        if (pickedFeature.tileset) currentSelectTileset = pickedFeature.tileset;
        //种模型或者替换模型
        if (isActiveGrow) {
          if (pickedFeature.tileset) {
            //如果点击的是3dtiles就直接替换
            currentSelectTileset = pickedFeature.tileset;
            modelManager.replace3dTiles(selectBinPropety, currentSelectTileset);
            return;
          }
          var cartographic = Cesium.Cartographic.fromCartesian(position);
          modelManager.add3dTiles(selectBinPropety, cartographic, 0);

          selectBinPropety = null;
          isActiveGrow = false;
          return;
        }
        //显示建造房子过程
        if (isActiveHouseBuilding) {
          var cartographic = Cesium.Cartographic.fromCartesian(position);
          if (pickedFeature.tileset) {
            //如果点击的是3dtiles就直接替换
            currentSelectTileset = pickedFeature.tileset;

            modelManager
              .replace3dTiles(selectBinPropety, currentSelectTileset)
              .then((re) => {
                //装配式建筑演示
                vm.isShowBuildingPanel = true;
                isBuilding = true;
                vm.$refs.buildingHose.startBuilding(re);
              });
            return;
          }
          modelManager.add3dTiles(selectBinPropety, cartographic).then((re) => {
            //装配式建筑演示
            vm.isShowBuildingPanel = true;
            isBuilding = true;
            vm.$refs.buildingHose.startBuilding(re);
          });

          isActiveHouseBuilding = false;
          return;
        }
      });
    },
    //關閉房屋建造頁面
    closeHouseBuilding() {
      this.isShowBuildingPanel = false;
    },
    detail(o) {
      this.indexModelPanel = 2;
      this.$refs.houseDetail.getInit(o);
    },

    backToHouseList() {
      this.indexModelPanel = 1;
    },
    //获取模型的服务器路径
    async loadBinBeforPath() {
      let data = await axiosWraper.getData(
        "/agsupport-rest/agsupport/BIM/Project/get",
        {paramType: 2}
      );
      if (data.success) {
        let da = data.content.filter((item) => item.id == "3");
        return da[0].path;
      }
    },
    async getPropetyData() { 
      let data = await axiosWraper.getData(
        "/agsupport-rest/agsupport/BIM/Project/find",
        {
          page: 1,
          rows: 10,
        }
      ); 
      let result = data.content.rows;
      let beferPath = await this.loadBinBeforPath(); 
      let filterDa = result.map((item) => {
        item.url = beferPath + item.storeFullPath;
        item.name = item.hourseName;
        item.img = beferPath + item.thumb;
        item.property_url = "/getAll/" + item.tableName;
        item.beferPath = beferPath;
        if (!item.thumb) {
          item.img = bin_default;
        }
        return item;
      }); 
      this.binSuermarketArr = Array.prototype.concat(defaultHouse, filterDa);
    },
  },
};
</script>
<style scoped>
.list-box {
  height: 450px;
  overflow: auto;
}
.bar-ul {
  margin: 0px;
  padding: 0;
}
.bar-ul li {
  float: left;
  list-style-type: none;
  margin: 5px;
}
</style>