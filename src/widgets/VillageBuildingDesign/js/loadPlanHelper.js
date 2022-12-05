import axiosWraper from "@/views/js/net/axiosWraper";
import axios from "@/views/js/net/http";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import user from "@/views/js/store/user";
import { BUILDING_HOUSE, BUILDING_METERIAL, BUILDING_TREE, BUILDING_CAR } from "./buildingType"
import schemeServer from "./../server/schemeServer";
import { sliceBox2 } from "./slice";

var agFeatureLayer = new AgFeatureLayer(CIM.viewer);


class LoadPlanHelper {
  async loadDefaultPlan() {
    let param = {
      page: 0,
      rows: 1000000,
      isDefault: "1",
    };
    let data = await schemeServer.findScheme(param);
    let result = data.content.rows;
    for (let i = 0; i < result.length; i++) {
      if (result[i].userId == user.state.userId)
        currentPlanId = result[i].id;
      // this.loadPlanById(null, result[i].id);
      return result[i];
    }
    return null;
  }
  async loadPlanById(vm, id) {
    var result = null;
    let res = schemeServer.getScheme({ id: id, paramType: 2 });
    res.then(
      (resp) => {
        if (resp.success) {
          if (vm != null)
            vm.$message.success("加载成功");
          result = resp.content;
          if (result != null) {
            for (let i = 0; i < result.length; i++) {
              if (result[i].type == "1") {
                this.load3Dtiles(result[i]);
              } else if (result[i].type == "2") {
                this.loadGltf(result[i]);
              } else if (result[i].type == "3") {
                this.loadComponent(result[i]);
              }
            }
          }
        }
      },
      (err) => {
        if (vm != null)
          vm.$message.error("加载失败");
      }
    );
  }
  load3Dtiles(data) {

    var tileset = new Cesium.Cesium3DTileset({//todo可做缓存:添加默认的个人方案
      url: data.url,
      show: true,
    });
    tileset.property_url = data.propertyUrl;
    tileset.userId = data.userId; //用户ID
    tileset.designSchemeId = data.designSchemeId; //设计方案ID
    tileset.tableName = data.tableName;//構件表
    tileset.type = BUILDING_HOUSE;//类型为房屋
    tileset.id = data.id;//房屋id

    if (data.components) {

      // tileset.components = data.components.split(",");//构件ID
      tileset.components = JSON.parse(data.components);//获取房屋的构件信息
    }
    //隐藏构件
    if (data.style) {
      var style = new Cesium.Cesium3DTileStyle();
      style.show = data.style;
      tileset.style = style;
    }
    var subtractArray = data.subtract.split(",");
    var subtract = new Cesium.Cartesian3(
      parseFloat(subtractArray[0]),
      parseFloat(subtractArray[1]),
      parseFloat(subtractArray[2])
    );
    tileset.subtract = subtract;
    var obbCenterArray = data.obbCenter.split(",");
    var obbCenter = new Cesium.Cartesian3(
      parseFloat(obbCenterArray[0]),
      parseFloat(obbCenterArray[1]),
      parseFloat(obbCenterArray[2])
    );

    tileset.obbCenter = obbCenter;
    agFeatureLayer.addPrimitive(tileset);
    tileset.readyPromise.then(function (tileset) {
      var array = data.modelMatrix.split(",");
      var intArr = [];
      array.forEach(function (data, index, arr) {
        intArr.push(+data);
      });
      var modelMatrix = Cesium.Matrix4.fromArray(intArr);
      tileset._root.transform = modelMatrix;
    });
  }
  loadGltf(data) {
    var scale = 1;
    var array = data.position.split(",");
    var position = new Cesium.Cartesian3(
      parseFloat(array[0]),
      parseFloat(array[1]),
      parseFloat(array[2])
    );
    var oriArray = data.orientation.split(",");
    var orientation = new Cesium.Quaternion(
      parseFloat(oriArray[0]),
      parseFloat(oriArray[1]),
      parseFloat(oriArray[2]),
      parseFloat(oriArray[3])
    );
    if (data.name == "tree") {
      scale = 10;
    } else if (data.name == "car") {
      scale = 100;
    }
    if (data.measure != null && data.measure != undefined) {
      scale = parseInt(data.measure)
    }
    let ent = agFeatureLayer.addEntity({
      name: data.name,
      position: position,
      orientation: orientation,
      model: {
        scale: scale,
        uri: data.url,
      },
    });
    ent.deg = parseFloat(data.angle);
    ent.userId = data.userId; //用户ID
    ent.designSchemeId = data.designSchemeId; //设计方案ID
  }
  loadComponent(data) {
    var array = data.modelMatrix.split(",");
    var intArr = [];
    array.forEach(function (data, index, arr) {
      intArr.push(+data);
    });
    var modelMatrix = Cesium.Matrix4.fromArray(intArr);
    Cesium.Resource.fetchArrayBuffer(data.url).then(arraybuffer => {
      var model = new Cesium.Model({
        id: data.componentId,
        gltf: arraybuffer,
        modelMatrix: modelMatrix,
        scale: 1,
        debugShowBoundingVolume: false
      })

      CIM.viewer.scene.primitives.add(model);
      model.componentType = data.componentType;
      model.boundingbox = data.boundingbox;//包围盒
      model.topologyelements = data.topologyelements;//拓扑关系
      // model.type = "material";
      model.relationIds = data.relationIds;//构件和房屋关系

      // model.houseId = data.houseId;//房屋id
      if (model.relationIds) {//selectedFeature.relationIds.split("$$1")[0]
        model.houseId = model.relationIds.split("$$1")[0];//房屋id
      }

      model.type = BUILDING_METERIAL;
      model.url = data.url;
      model.userId = data.userId; //用户ID
      model.designSchemeId = data.designSchemeId; //设计方案ID
      model.tableName = data.tableName;

      if (data.size) {
        var array2 = data.clipMatrix.split(",");
        var intArr2 = [];
        array2.forEach(function (data, index, arr) {
          intArr2.push(+data);
        });
        var boxModelMatrix = Cesium.Matrix4.fromArray(intArr2);

        var clips = sliceBox2(boxModelMatrix, data.size);
        model.clippingPlanes = clips;
      }


    });
  }
  removeByPlanId(id) {
    var planData = CIM.viewer.scene.primitives._primitives;
    for (let i = planData.length - 1; i > -1; i--) {
      if (planData[i] instanceof Cesium.Cesium3DTileset) {
        if (planData[i].designSchemeId == id) {
          CIM.viewer.scene.primitives.remove(planData[i]);
        }
      } else if (planData[i] instanceof Cesium.Model) {
        if (planData[i].id.designSchemeId == id) {
          CIM.viewer.entities.remove(planData[i].id);
        } else if (planData[i].designSchemeId == id) {
          CIM.viewer.scene.primitives.remove(planData[i]);
        }
      }
    }
  }
}
export default new LoadPlanHelper();