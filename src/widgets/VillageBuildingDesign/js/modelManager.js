/*
 * @Author:  pwz
 * @Date: 2020-08-18 14:59:59
 * @LastEditTime: 2020-11-24 14:27:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \village-building-design\src\widgets\villageBuilding\src\modelManager.js
 */
//import houseNumber from "../widgets/houseNumber/houseNumber";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import user from "@/views/js/store/user";
import { BUILDING_HOUSE, BUILDING_METERIAL, BUILDING_TREE, BUILDING_CAR, BUILDING_ENTITYPARCEL } from "./buildingType.js"
import RepalceMemeber from "./repalceMemeber"
import { guid } from "./common.js"
import AgMath from "@/sdk/maths/math"
import tableServer from "./../server/tableServer";

var agFeatureLayer;

class ModelManager {
  constructor() {
    this.indexTileTable;
    agFeatureLayer = new AgFeatureLayer(CIM.viewer);
  }
  /**
     * 绑定房屋对象属性
     * @param {*} vm 
     * @param {*} data 
     */
  async initHouseObj(tileset, data) {
    let _this = this;
    let obbCenter = await _this.getObbCenter(data.tableName);
    return await tileset.readyPromise.then(function (tileset) {
      tileset.property_url = data.property_url;
      tileset.tableName = data.tableName;//构件表名称
      tileset.userId = user.state.userId; //用户ID
      currentPlanId = Cesium.createGuid();
      tileset.designSchemeId = currentPlanId; //设计方案ID
      tileset.type = BUILDING_HOUSE;//类型为房屋
      tileset.id = Cesium.createGuid();//房屋id
      tileset.obbCenter = obbCenter;
      return tileset
    })
  }
  /**
       * 绑定构件对象属性
       * @param {*} model 
       * @param {*} option  
       */
  initMaterialObj(model, option) {
    //其中houseId（房屋id） materName （构件名称）level（构件所在层数）objectid（构件替换对应的onjectid位置)
    // model.materialInfor == `${houseId}$$1${materName}$$2${level}$$3${objectid}`
    //$$1 $$2 $$3 分别分割符号

    model.relationIds = option.relationIds;//构件类型信息,包含构件所在房屋，构件的所在楼层，构件类型，构件替换的objectid
    model.boundingbox = option.boundingbox;//包围盒
    model.topologyelements = option.topologyelements;//拓扑关系
    model.url = option.url;//构件的路径
    model.designSchemeId = option.designSchemeId; //设计方案ID
    model.tableName = option.tableName;//对应的构件表名
    //model.houseId = option.houseId;//房屋id
    model.type = BUILDING_METERIAL;
    model.userId = user.state.userId; //用户ID
    model.objectid = option.objectid; //被替换掉的构件id
    model.houseId = option.houseId;//房子id

    if (option.size) {
      model.size = option.size;
      var modelMatrix = option.clips.modelMatrix;
      model.clipMatrix = [
        modelMatrix[0],
        modelMatrix[1],
        modelMatrix[2],
        modelMatrix[3],
        modelMatrix[4],
        modelMatrix[5],
        modelMatrix[6],
        modelMatrix[7],
        modelMatrix[8],
        modelMatrix[9],
        modelMatrix[10],
        modelMatrix[11],
        modelMatrix[12],
        modelMatrix[13],
        modelMatrix[14],
        modelMatrix[15],
      ];

    }

    if (model.relationIds) {//selectedFeature.relationIds.split("$$1")[0]
      model.houseId = model.relationIds.split("$$1")[0];//房屋id
    }
    return option
  }

  /**
   * 添加3房屋
   * @param {*} data 房屋数据 
   * @param {*} cartographic 建造的坐标
   * @param {*} height 建造高度 
   */
  async addHouses(data, cartographic, height) {
    var _this = this;
    var tileset = new Cesium.Cesium3DTileset({
      url: data.url,
      show: true
    });
    tileset = await _this.initHouseObj(tileset, data);
    if (!tileset.subtract) {
      let subtract = await _this.getBoxSubtract(tileset);
      tileset.subtract = subtract;
    }
    designPlanChange = true; //设计方案改变
    agFeatureLayer.addPrimitive(tileset);
    //计算房子高度
    let offheight = await _this.getObbHeight(tileset.tableName) / 2 - 1;
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        height + offheight
      )
    );
    var m1 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(-133));
    modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
      modelMatrix,
      m1,
      modelMatrix
    );
    tileset._root.transform = modelMatrix;
    _this.indexTileTable = tileset.tableName;
    return tileset

  }
  /**
 * 替换3dtiles
 * @param {*} vm 
 * @param {*} newtiles 
 * @param {*} oldTiles 
 */
  async replaceHouses(newtiles, oldTiles) {
    var _this = this;
    let viewer = CIM.viewer;
    var tileset = new Cesium.Cesium3DTileset({
      url: newtiles.url,
      show: false,
      property_url: newtiles.property_url,
    });
    tileset = await _this.initHouseObj(tileset, newtiles);

    if (!tileset.subtract) {
      let subtract = await _this.getBoxSubtract(tileset);
      tileset.subtract = subtract;
    }
    tileset.show = true;
    designPlanChange = true; //设计方案改变

    agFeatureLayer.addPrimitive(tileset);
    var primitives = agFeatureLayer._primitives;
    for (let i = 0; i < primitives.length; i++) {
      if (oldTiles === primitives[i]) {
        agFeatureLayer._primitives.splice(i, 1);
      }
    }
    var position = oldTiles._root.transform;
    // let re = await tileset.readyPromise.then(function (tileset) {
    if (tileset._root != null) tileset._root.transform = position;
    else tileset.transform = position;
    _this.indexTileTable = tileset.tableName;


    _this.removeHouses(oldTiles);
    return tileset

  }
  /**
    * 移除房屋
    * @param {*} vm 
    * @param {*} data 
    */
  async removeHouses(oldTiles) {
    CIM.viewer.scene.primitives.remove(oldTiles);//移除房屋
    this.removeMaterials(oldTiles);//移除构件
    RepalceMemeber.removeMark();
  }
  /**
    * 移除构件
    * @param {*} vm 
    * @param {*} data 
    */
  removeMaterials(Tiles) {
    let components = Tiles.components;
    if (!components) return;
    var primitives = CIM.viewer.scene.primitives._primitives;
    for (let i = primitives.length - 1; i >= 0; i--) {
      components.map(item => {
        if (primitives[i] instanceof Cesium.Model && primitives[i].type && primitives[i].type == "material" &&
          primitives[i].id &&
          primitives[i].id.includes(item)) {
          CIM.viewer.scene.primitives.remove(primitives[i]);
        }
      })
    }

  }


  /**
   * 获取rvt模型中心与3dtiles模型中心差
   * @param {*} tileset 
   */
  async getBoxSubtract(tileset) {
    if (!tileset || !tileset instanceof Cesium.Cesium3DTileset) {
      return
    }
    var url = tileset.root.tileset.url;
    let data = await Cesium.Resource.fetchJson(url);
    var boundingVolume1 = data.root.boundingVolume;
    var boundingVolume2 = data.root.children[0].boundingVolume;
    var subtract = new Cesium.Cartesian3(
      boundingVolume2.box[0] - boundingVolume1.box[0],
      boundingVolume2.box[1] - boundingVolume1.box[1],
      boundingVolume2.box[2] - boundingVolume1.box[2]);
    return subtract;
  }
  /**
   * @description: 获取包围盒
   * @param {type} 
   * @return {type} 
   */
  async getObb(indexTileTable) {
    let param = { entitytable: encodeURIComponent(indexTileTable), paramType: 1 };
    let res = await tableServer.findDentity(param);
    let data = res.content;
    if (!data || data == null) return;
    let obb = JSON.parse(data.boundingbox);
    console.log(obb);
    return obb;

  }
  /**
   * 获取obb包围盒中心
   */
  async getObbCenter(indexTileTable) {
    let obb = await this.getObb(indexTileTable);
    let cartList = []
    for (let i = 0; i < obb.length; i++) {
      cartList.push(new Cesium.Cartesian3(obb[i].X, obb[i].Y, obb[i].Z))
    }

    let aabb = Cesium.AxisAlignedBoundingBox.fromPoints(cartList);
    console.log(aabb);
    return aabb.center;
  }
  /**
   * @description: 获取包围盒高度的一半
   * @param {type} 
   * @return {type} 
   */
  async getObbHeight(indexTileTable) {
    let obb = await this.getObb(indexTileTable);
    let zArr = obb.map(item => item.Z);
    let zArrSort = zArr.sort((a, b) => b - a);
    console.log(zArrSort);
    return (zArrSort[0] - zArrSort[zArrSort.length - 1])
  }
  /**
   * 添加gltf模型
   * @param {*} name 
   * @param {*} position 
   * @param {*} url 
   * @param {*} measure //gltf 尺寸
   */
  addGltf(name, position, url, measure = 10) {
    var scale = 1;
    // if (name == "tree") {
    //   scale = 10;
    // } else if (name == "car") {
    //   scale = 100;
    // }
    if (measure != null && measure != undefined) {
      scale = parseInt(measure)
    }
    var orientation = this.createGltfQuaternion(position);
    var ec3 = CIM.viewer.scene.globe.ellipsoid.cartesianToCartographic(position)
    ec3.height = ec3.height + 0.5
    position = Cesium.Cartographic.toCartesian(ec3, CIM.viewer.scene.globe.ellipsoid)
    let ent = agFeatureLayer.addEntity({
      name: name,
      position: position,
      orientation: orientation,
      model: {
        scale: scale,
        uri: url,
      },
    });
    ent.deg = 0;
    ent.userId = user.state.userId; //用户ID
    ent.designSchemeId = currentPlanId; //设计方案ID 
    designPlanChange = true; //设计方案改变
  }
  /**
   * 添加人房信息绑定地块
   */
  addLandEntities() {
    var parcelData = [
      {
        id: "44532111521200001",
        height: 98.8,
        name: "地块一",
        positions: [
          new Cesium.Cartesian3(
            -2228076.425170286,
            5455317.5844999375,
            2432356.8037129766
          ),
          new Cesium.Cartesian3(
            -2228066.7516260706,
            5455318.471791953,
            2432362.6769523257
          ),
          new Cesium.Cartesian3(
            -2228056.2894274746,
            5455330.136783932,
            2432346.6171237747
          ),
          new Cesium.Cartesian3(
            -2228065.703036593,
            5455330.9004658535,
            2432339.6710718554
          ),
        ],
      },
      {
        id: "44532111521200002",
        height: 98.0,
        name: "地块二",
        positions: [
          new Cesium.Cartesian3(
            -2228088.385074162,
            5455306.048327851,
            2432372.595129051
          ),
          new Cesium.Cartesian3(
            -2228076.3632837483,
            5455307.274297762,
            2432380.2161678416
          ),
          new Cesium.Cartesian3(
            -2228067.2790058404,
            5455317.610896598,
            2432364.85359405
          ),
          new Cesium.Cartesian3(
            -2228077.0389760835,
            5455316.962312487,
            2432357.6623026915
          ),
        ],
      },
      {
        id: "44532111521200003",
        height: 96.6,
        name: "地块三",
        positions: [
          new Cesium.Cartesian3(
            -2228064.686861479,
            5455306.500791699,
            2432387.573601064
          ),
          new Cesium.Cartesian3(
            -2228056.7568319305,
            5455306.463094865,
            2432393.2401805837
          ),
          new Cesium.Cartesian3(
            -2228045.6213452527,
            5455317.772657494,
            2432378.3245447264
          ),
          new Cesium.Cartesian3(
            -2228055.924235173,
            5455317.496219974,
            2432371.806755154
          ),
        ],
      },
    ];

    for (var i = 0; i < parcelData.length; i++) {
      var _height = parcelData[i].height;
      //盒子
      var polygon = CIM.viewer.entities.add({
        // id: parcelData[i].id,
        name: BUILDING_ENTITYPARCEL,
        clampToGround: true,
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(parcelData[i].positions),
          height: _height,
          extrudedHeight: _height + 15,
          material: Cesium.Color.fromCssColorString("#E6E6FA").withAlpha(0.01),
          classificationType: Cesium.ClassificationType.BOTH,
        },
      });
      // 地块
      var polygon1 = CIM.viewer.entities.add({
        // id: parcelData[i].id,
        name: parcelData[i].name,
        clampToGround: true,
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(parcelData[i].positions),
          height: _height,
          extrudedHeight: _height + 0.2,
          material: Cesium.Color.fromCssColorString("#FF8C00").withAlpha(0.5),
          classificationType: Cesium.ClassificationType.BOTH,
        },
      });
    }
    //门牌号
    //houseNumber.addHouseNumber();
  }

  createGltfQuaternion(position) {
    var headingCar = Cesium.Math.toRadians(0);
    var pitchCar = Cesium.Math.toRadians(0);
    var rollCar = Cesium.Math.toRadians(0);
    var hprCar = new Cesium.HeadingPitchRoll(headingCar, pitchCar, rollCar);
    var orientationCar = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hprCar
    );
    return orientationCar;
  }




}
export default new ModelManager();