<template>
  <ag-popup
    v-model="visible"
    title="通风模拟"
    @onCancel="onCancel"
    class="popup-box1"
  >
    <div class="index-page">
      <a-icon
        type="home"
        class="home-icon"
        @click="state = 'isVentilation'"
        v-if="state != 'isVentilation'"
      />
      <a-icon
        type="backward"
        class="home-icon"
        @click="state = 'isArea'"
        v-if="state == 'isBuilding'"
      />
      <div v-if="state === 'isVentilation'" style="height:100%">
        <div class="search-boxbar">
          <a-input-search placeholder="请搜索要分析的项目" />
        </div>
        <div class="list vscroll">
          <div
            class="item"
            v-for="item in projList"
            :key="item.id"
            @click="
              state = 'isArea';
              transname = item.name;
            "
          >
            <div class="lt">
              <img
                width="150px"
                height="90px"
                :src="item.imglink"
                @click="gotoCommunity"
              />
            </div>
            <div class="rt">
              <p>{{ item.name }}</p>
              <div class="btm">
                <a-button type="primary" class="locate" @click="gotoCommunity"
                  >定位
                  <a-icon type="environment" style="font-size: 14px;" />
                </a-button>
                <a-button
                  type="primary"
                  class="locate"
                  @click="
                    state = 'isArea';
                    transname = item.name;
                  "
                  >详情</a-button
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <child-area
        v-if="state === 'isArea'"
        :idName="transname"
        @backToIndex="stateFromChild"
        :currentCommunity="currentCommunity"
        :currentCommunityLG="currentCommunityLG"
      ></child-area>

      <child-building
        v-if="state === 'isBuilding'"
        @backToIndex="stateFromChild"
        :buildingTileset="currentBuildingTileset"
        :buildState="state"
      ></child-building>
    </div>
  </ag-popup>
</template>

<script>
import ChildArea from "./area";
import ChildBuilding from "./building";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import agRenderer from "@/sdk/renderer/renderer";
import agGeometry from "@/sdk/geometry/geometry";
import AgPopup from "@/views/components/AgPopup.vue";

let resultimg = require("./img/result.png");
let config = require("./data/config.json");
let resultLGimg = require("./img/legend.png");
let agFeatureLayer = new AgFeatureLayer(CIM.viewer);
let viewer = CIM.viewer;
let viewAngle = new Cesium.HeadingPitchRange(0, -0.5, 150);

export default {
  components: {
    "child-area": ChildArea,
    "child-building": ChildBuilding,
    "ag-popup": AgPopup,
  },
  data() {
    return {
      visible: true,
      state: "isVentilation",
      transname: "",
      currentCommunity: null,
      currentBuildingTileset: null,
      projList: [],
    };
  },
  mounted() {
    this.projList = config.projList;
    for (var i = 0; i < this.projList.length; i++) {
      this.projList[i].imglink = require("./img/" + this.projList[i].imgUrl);
    }

    CIM.layerTree.addMany([
      "c7361615-141c-45eb-ad2e-f4da6061ad2b",
      "8ad45762-d0d5-4e97-bf33-c60ff33ff93c",
    ]); //加载模型
  },
  methods: {
    onCancel() {
      CIM.agcimScene.setSceneConfig({ depthTestAgainsTerrain: true }); //开启地形检测
      this.currentCommunity = [];
      this.currentCommunityLG = [];
      agFeatureLayer.removeAll();
      this.visible = false;
      this.state = "isVentilation";
    },
    stateFromChild(changestate) {
      this.state = changestate;
      if (changestate == "isBuilding") {
        viewer.zoomTo(this.currentBuildingTileset, viewAngle);
      }
    },
    gotoCommunity() {
      var _this = this;
      //清理最后一个数组的图元
      agFeatureLayer.removeAll();
      var tileset = CIM.layerTree.getLayerById(
        "8ad45762-d0d5-4e97-bf33-c60ff33ff93c"
      )._primitives[0];
      tileset.readyPromise.then(function(argument) {
        _this.currentBuildingTileset = tileset;
      });
      CIM.agcimScene.setSceneConfig({ depthTestAgainsTerrain: false }); //关闭地形检测

      var newPrimitive = agGeometry.buildPrimitiveFromRectangle(
        113.37133143,
        23.10260095,
        113.37730265,
        23.10695694
      );
      var newLGPrimitive = agGeometry.buildPrimitiveFromRectangle(
        113.36991274,
        23.10383656,
        113.37108731,
        23.10683681
      );
      this.currentCommunity = agFeatureLayer.addPrimitive(newPrimitive);
      this.currentCommunityLG = agFeatureLayer.addPrimitive(newLGPrimitive);

      agRenderer.setMaterialFromImage(this.currentCommunity, resultimg);
      agRenderer.setMaterialFromImage(this.currentCommunityLG, resultLGimg);
    },
  },
  destroyed() {
    CIM.agcimScene.setSceneConfig({ depthTestAgainsTerrain: true }); //开启地形检测
    agFeatureLayer.removeAll();
    this.currentCommunity = [];
    this.currentCommunityLG = [];
  },
};
</script>

<style scoped src="./css/index.css"></style>
