import agCamera from "@/sdk/camera/camera";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import { BUILDING_HOUSE } from "./buildingType.js"

var agFeatureLayer = new AgFeatureLayer(CIM.viewer);
let selectedFeature = {
  feature: null,
  originalColor: null,
};

//改变倾斜摄影位置
export function changeModelPosition() {
  CIM.viewer.scene.globe.depthTestAgainstTerrain = true;
  let layers = CIM.layerTree._aglayers;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].id == "634ad996-642d-4197-94c9-44965085de3e" || layers[i].id == "634ad996-642d-4197-94c9-44965085de3e") {
      let tileset = layers[i]._primitives[0];
      tileset.readyPromise.then(function (tileset) {
        var value = -75;
        var mat = tileset._root.transform;
        var m = Cesium.Matrix4.fromArray([
          1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
          0.0,
          0,
          0,
          value,
          1.0,
        ]);
        tileset._root.transform = Cesium.Matrix4.multiply(mat, m, mat);
      });
    }
    if (layers[i].id == "ce71079a-93d7-41ca-9941-411b4779783d") {
      let tileset = layers[i]._primitives[0];
      tileset.show = false;
    }
  }
}
export function setCameraPosition() {
  let position = {
    latitude: 22.566008792505404,
    longitude: 112.21565993108428,
    height: 125.96299593425498,
    heading: 2.367377629618497,
    pitch: -0.28485080177974353,
    roll: 0.0017290646518759445
  };
  agCamera.setCameraByLongitude(CIM.viewer, position);
}
//获取当前位置高度
export function getCurrentPosition(position) {
  var viewer = CIM.viewer
  var ray = viewer.scene.camera.getPickRay(position);

  var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  var cartographic = Cesium.Cartographic.fromCartesian(cartesian);

  var lon = Cesium.Math.toDegrees(cartographic.longitude);

  var lat = Cesium.Math.toDegrees(cartographic.latitude);
  var height = CIM.viewer.scene.globe.getHeight(cartographic);
  return {
    lon, lat, height
  }
}
//点击3dtiles高亮
export function setHighlighted(feature) {

  if (!feature && !selectedFeature.feature) {
    return;
  }
  //初始化一下selectedFeature对象
  initSelectedFeature();
  try {
    //同一个
    if (feature === selectedFeature.feature) {
      selectedFeature.feature.color = selectedFeature.originalColor;
      selectedFeature.feature = undefined;
      selectedFeature.originalColor = undefined;
      return;
    }
    // //没有
    if (!feature && selectedFeature.feature != null) {
      selectedFeature.feature.color = selectedFeature.originalColor;
      selectedFeature.feature = undefined;
      selectedFeature.originalColor = undefined;
      return;
    }
    //不是同一个
    if (feature) {
      if (selectedFeature.feature) {
        selectedFeature.feature.color = selectedFeature.originalColor;
      }
      selectedFeature.feature = feature;
      selectedFeature.originalColor = Cesium.Color.clone(feature.color);
      feature.color = Cesium.Color.clone(Cesium.Color.YELLOW, feature.color);
    }
  } catch (err) {
  }
  //存储新的Feature对象先判断一下3dtileset对象是否已经销毁
  function initSelectedFeature() {
    if (selectedFeature.feature && selectedFeature.feature.tileset.isDestroyed()) {
      selectedFeature.feature = undefined;
      selectedFeature.originalColor = undefined;
    }
  }

}
/**
   * 生成uuid
   */
export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
/**
 * 获取Feature objectid
 */
export function getselectedFeatureId(selectedFeature) {
  if (!selectedFeature) return;
  if (selectedFeature.primitive instanceof Cesium.Model) {
    return selectedFeature.primitive.id;
  } else if (selectedFeature instanceof Cesium.Cesium3DTileFeature) {
    return selectedFeature.getProperty("id");
  } else if (selectedFeature instanceof Cesium.Model) {
    return selectedFeature.id;
  }

}
/**
  * 获取tableName
  */
export function getTableNameByFeature(selectedFeature) {
  if (!selectedFeature && selectedFeature.primitive) return;
  if (selectedFeature.primitive instanceof Cesium.Model) {
    return selectedFeature.primitive.tableName;
  } else if (selectedFeature instanceof Cesium.Cesium3DTileFeature) {
    return selectedFeature.primitive.tableName;
  }

}

/**
   * 通过PickedFeature房子的id
   */
export function getHouseIdByPickedFeature(pickedFeature) {
  if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
    if (pickedFeature.tileset && pickedFeature.tileset.type == BUILDING_HOUSE) {
      return pickedFeature.tileset.id;
    }
  } else if (pickedFeature.primitive && pickedFeature.primitive instanceof Cesium.Model) {
    return pickedFeature.primitive.houseId;
  } else if (pickedFeature instanceof Cesium.Model) {
    return pickedFeature.houseId;
  }
  return

}

/**
 * 通过id获取房子的3dtileset对象
 */
export function getHouseTilesetById(id) {
  let primitives = CIM.viewer.scene._primitives._primitives;
  for (let i = 0; i < primitives.length; i++) {
    if (primitives[i] instanceof Cesium.Cesium3DTileset && primitives[i].type == BUILDING_HOUSE && primitives[i].id == id) {
      return primitives[i]
    }
  }
}
/**
 * 通过地块包围盒对象
 */

