<template>
  <div>
    <!-- 属性查看 -->
  </div>
</template>
<script>
import PickerHelper from "@/sdk/interactive/pickerHelper";
import StyleCondition from "@/sdk/renderer/styleCondition";
let viewer = null;
let tileset = null;
let pickerHelper = null;
let styleCondition = null;
let cn = require("./ZHCN.json");

export default {
  mounted() {
    viewer = CIM.viewer;
    let _this = this;
    pickerHelper = new PickerHelper(viewer);
    pickerHelper.on("LEFT_CLICK", function(movement) {
      let pickedFeature = viewer.scene.pick(movement.position);
      if (!pickedFeature || !pickedFeature.getProperty) return;

      if (tileset != pickedFeature.primitive) {
        if (tileset) styleCondition.resetColorStyle("WHITE");
        tileset = pickedFeature.primitive;
        styleCondition = new StyleCondition(tileset);
      }

      let idField = "id";
      let id = pickedFeature.getProperty("id")
        ? pickedFeature.getProperty("id")
        : undefined;
      if (id == undefined) {
        var propertyValue = pickedFeature.getProperty("ID");
        idField = propertyValue ? "ID" : pickedFeature.getPropertyNames()[0];
        id = pickedFeature.getProperty(idField);
      }
      if (id == undefined) {
        var propertyValue = pickedFeature.getProperty("elementId");
        idField = propertyValue
          ? "elementId"
          : pickedFeature.getPropertyNames()[0];
        id = pickedFeature.getProperty(idField);
      }
      styleCondition.resetColorStyle("WHITE");
      styleCondition.addColorStyleByKeyValue(idField, id, "YELLOW");
      _this.pickProperty(pickedFeature);
    });
  },
  methods: {
    pickProperty(feature) {
      CIM.viewer.infoBox._element.hidden = false; //显示infobox
      var strings = [];
      var selectedEntity = new Cesium.Entity();
      selectedEntity.name = feature.getProperty("name");
      CIM.viewer.selectedEntity = selectedEntity;
      selectedEntity.description =
        'Loading <div class="cesium-infoBox-loading"></div>';

      strings.push('<table class="cesium-infoBox-defaultTable"><tbody>');

      var propertyNames = feature.getPropertyNames();
      var length = propertyNames.length;
      for (var i = 0; i < length; ++i) {
        var propertyName = propertyNames[i];
        var property = feature.getProperty(propertyName);
        var cnName = cn[propertyNames[i]]
          ? cn[propertyNames[i]]
          : propertyNames[i];
        strings.push(`<tr><th>${cnName}</th><td>${property}</td></tr>`);
      }

      strings.push("</tbody></table>");
      selectedEntity.description = strings.join("");
    },
  },
  destroyed() {
    CIM.viewer.infoBox._element.hidden = true; //隐藏infobox
    CIM.viewer.selectedEntity = null;
    styleCondition.resetColorStyle("WHITE");
    pickerHelper.off();
  },
};
</script>
