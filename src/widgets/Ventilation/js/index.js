import ChildArea from "../area";
import ChildBuilding from "../building";
import ag3DTilesLayer from "@/sdk/layer/ag3DTilesLayer";
import agFeatureLayer from "@/sdk/layer/featureLayer";
import agRenderer from "@/sdk/renderer/renderer";
import agGeometry from "@/sdk/geometry/geometry";
import AgPopup from "@/views/components/AgPopup.vue";

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
      resultimg: require("../img/result.png"),
      config: require('../data/config.json'),
      resultLGimg: require("../img/legend.png"),
      projList: [],
      buildingLayer: null,
      ventilationLayer: null,
    };
  },
  mounted() {
    this.projList = this.config.projList;
    for (var i = 0; i < this.projList.length; i++) {
      this.projList[i].imglink = require("../img/" + this.projList[i].imgUrl);
    }
    this.buildingLayer = new ag3DTilesLayer(CIM.viewer);
    this.ventilationLayer = new agFeatureLayer(CIM.viewer);
    CIM.layerTree.addMany(["c7361615-141c-45eb-ad2e-f4da6061ad2b", "8ad45762-d0d5-4e97-bf33-c60ff33ff93c"]); //加载模型
  },
  destroyed() {
    agRenderer.setOpacity(this.currentCommunity, 0);
    agRenderer.setOpacity(this.currentCommunityLG, 0);
    this.currentCommunity = [];
    this.currentCommunityLG = [];
  },
  methods: {
    onCancel() {
      this.visible = false;
      this.state = "isVentilation";
    },
    stateFromChild(changestate) {
      this.state = changestate;
      if (changestate == "isBuilding") {
        var viewAngle = new Cesium.HeadingPitchRange(0, -0.5, 150);
        CIM.viewer.zoomTo(this.currentBuildingTileset, viewAngle);
      }
    },
    gotoCommunity() {
      var _this = this;
      var viewer = CIM.viewer;
      var viewAngle = new Cesium.HeadingPitchRange(0, -0.5, 150);
      //清理最后一个数组的图元
      this.ventilationLayer.removeAll(viewer);
      this.buildingLayer.removeAll(viewer);
      var tileset;

      tileset = CIM.layerTree.getLayerById("8ad45762-d0d5-4e97-bf33-c60ff33ff93c")._primitives[0];
      tileset.readyPromise.then(function (argument) {
        _this.currentBuildingTileset = tileset;
        viewer.zoomTo(tileset, viewAngle);
      });
      var newPrimitive = agGeometry.buildPrimitiveFromRectangle(113.37133143, 23.10260095, 113.37730265, 23.10695694);
      var newLGPrimitive = agGeometry.buildPrimitiveFromRectangle(113.36991274, 23.10383656, 113.37108731, 23.10683681);
      this.currentCommunity = this.ventilationLayer.addPrimitive(viewer, newPrimitive);
      this.currentCommunityLG = this.ventilationLayer.addPrimitive(viewer, newLGPrimitive);

      agRenderer.setMaterialFromImage(this.currentCommunity, this.resultimg);
      agRenderer.setMaterialFromImage(this.currentCommunity, this.resultLGimg);

      agRenderer.setOpacity(this.currentCommunity, 0.5);
      agRenderer.setOpacity(this.currentCommunityLG, 1);

    },
    ClearOldData: function () {
      var viewer = CIM.viewer;
      if (this.currentCommunity != null) {
        this.currentCommunity.destroy();
      }

      if (this.currentBuildingTileset != null) {
        this.currentBuildingTileset.destroy();
      }
    }
  }
};