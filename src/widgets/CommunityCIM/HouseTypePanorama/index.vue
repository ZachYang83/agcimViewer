<template>
  <ag-popup
    v-model="visible"
    title="户型查看"
    @onCancel="onCancel"
    class="popup-box"
  >
    <div class="vscroll">
      <div class="floordataDiv">
        <!-- <a-button type="primary" @click.stop="addModelMark">添加标注</a-button>
        <a-button type="default" @click.stop="removeModelMark">移除标注</a-button> -->

        <!-- <div class="h4">户型图/全景图</div> -->
        <a-button type="primary" @click="chooseHouse">选择房子</a-button>
        <!-- 楼 -->
        <section class="qj-box">
          <span
            v-for="(item, index) in buildingList"
            :key="item.id"
            @click="showBuildDetail(item, index)"
            :class="{ active: index === bIndex }"
            >{{ item.name }}</span
          >
        </section>
        <!-- 楼层 -->
        <section class="qj-box">
          <span
            v-for="(item, index) in floorList"
            :key="item.id"
            @click="showFloorDetail(item, index)"
            :class="{ active: index === fIndex }"
            >{{ item.name }}</span
          >
        </section>

        <div class="house">{{ bfsName }}</div>
        <!-- 房间 -->
        <section class="qj-box">
          <span
            v-for="(item, index) in houseList"
            :key="index"
            @click="showHouseDetail(item, index)"
            :class="{ active: index === hIndex }"
            >{{ item.name }}</span
          >
        </section>

        <section class="qj-box">
          <img-box></img-box>
        </section>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import ImgBox from "./ImgBox";
import AgSlice from "@/sdk/interactive/slice";
import coordinate from "@/sdk/maths/coordinate";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);
var markerArr = [];
let agSlice;
let viewer = null;
const startHeight = 10;
const floorHeight = 8.35;
export default {
  components: {
    "img-box": ImgBox,
    "ag-popup": AgPopup,
  },
  data() {
    return {
      visible: true,
      //楼
      buildingList: require("./data/building.json"),
      bIndex: 0,
      curBuild: {},
      //楼层
      floorList: [],
      fIndex: 0,
      curFloor: {},
      //房间
      houseList: [],
      hIndex: 0,
    };
  },
  computed: {
    bfsName() {
      return this.buildingList[this.bIndex].name + " " + this.curFloor.name;
    },
  },
  mounted() {
    viewer = CIM.viewer;
    agSlice = new AgSlice(viewer);
    this.showBuildDetail(this.buildingList[this.bIndex], this.bIndex);
    this.showFloorDetail(this.curBuild.floor[this.fIndex], this.fIndex);

    this.getLayer();
  },
  methods: {
    onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
    },
    showBuildDetail(o, i) {
      this.bIndex = i;
      this.floorList = o.floor;
      this.curBuild = o;
    },
    showFloorDetail(o, i) {
      this.fIndex = i;
      this.houseList = o.household;
      this.curFloor = o;
      agSlice.removeClippingPlanes();
      if (this.clippingLayer) {
        var heigth = startHeight + this.fIndex * floorHeight;
        var cartographic = Cesium.Cartographic.fromCartesian(
          this.clippingLayer.boundingSphere.center
        );
        let viewPointWebMercator = coordinate.cartographicToMercatorCartesian3(
          viewer,
          cartographic
        );
        // agSlice.initialize(this.clippingLayer, viewPointWebMercator, {
        //   top: heigth - cartographic.height,
        // });
        this.clippingLayer.clippingPlanes = agSlice.createClippingPlane(
          this.clippingLayer,
          viewPointWebMercator,
          {
            top: heigth - cartographic.height,
          }
        );
      }
    },
    showHouseDetail(o, i) {
      this.hIndex = i;
    },
    chooseHouse() {
      this.getLayer();
    },
    getLayer() {
      if (!this.clippingLayer) {
        let primitives = viewer.scene.primitives._primitives;
        for (let i = 0; i < primitives.length; i++) {
          if (
            primitives[i].agMetaData &&
            primitives[i].agMetaData.id ==
              "2e8b578e-5dd4-4c69-83ab-14c3368f3c61"
          ) {
            this.clippingLayer = primitives[i];
          }
        }
      }
    },
    //临时标注，待数据
    addModelMark() {
      let arr = CIM.layerTree._aglayers;
      for (let i = 0; i < arr.length; i++) {
        let name =
          arr[i]._primitives[0].agMetaData &&
          arr[i]._primitives[0].agMetaData.nameCn;
        let flag = false;
        if (name.indexOf("保利天悦") > -1) {
          for (let j = 0; j < markerArr; j++) {
            if (markerArr[j].id == name) {
              flag = true;
              break;
            }
          }

          if (!flag) {
            let tt = arr[i]._primitives[0];
            tt.readyPromise.then((tileset) => {
              let t = tileset._root.transform;
              let position = new Cesium.Cartesian3(
                t[12] - 30,
                t[13] + 60,
                t[14] + 40
              );
              let lableEntity = agFeatureLayer.addEntity({
                id: name,
                name: name,
                position: position,
                label: {
                  text: name.replace("保利天悦", ""), //待后台配正确的值
                  font: "normal 24px MicroSoft YaHei",
                  scale: 0.5,
                  pixelOffset: new Cesium.Cartesian2(0, -20),
                  showBackground: true,
                  backgroundColor: Cesium.Color.fromCssColorString("#103F9B"),
                  scaleByDistance: new Cesium.NearFarScalar(10, 2.0, 1000, 1.0),
                  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                    0,
                    1000
                  ),
                },
                billboard: {
                  width: 90,
                  height: 30,
                  image: require("./img/background.png"),
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                  scaleByDistance: new Cesium.NearFarScalar(10, 2.0, 1000, 1.0),
                  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                    0,
                    1000
                  ),
                },
              });
              markerArr.push(lableEntity);
            });
          }
        }
      }
    },
    removeModelMark() {
      markerArr.forEach(function(element) {
        CIM.viewer.entities.remove(element);
      });
    },
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
.vscroll {
  padding: 10px 10px 50px;
  overflow: scroll;
}
.qj-box {
  border: 1px solid rgb(214, 214, 214);
  border-radius: 2px;
  padding: 5px 0;
  margin: 5px 10px;
}
.qj-box span {
  display: inline-block;
  width: 42px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  margin-left: 10px;
  border: 1px solid transparent;
}
.qj-box span:hover {
  cursor: pointer;
  color: #005def;
}
.qj-box span.active {
  color: #005def;
  background-color: #eef4ff;
  border-radius: 2px;
  border-color: #8fb8ff;
}
.hx-box span {
  display: inline-block;
  margin: 10px;
}
.hx-box span:hover {
  cursor: pointer;
}
.house {
  text-align: center;
  font-weight: bold;
}
.ant-btn {
  margin: 10px;
}
</style>
