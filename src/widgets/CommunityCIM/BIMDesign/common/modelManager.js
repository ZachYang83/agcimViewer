// import houseNumber from "../widgets/houseNumber/houseNumber";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import user from "@/views/js/store/user";
import axios from "@/views/js/net/http";
var agFeatureLayer;

class ModelManager {
  constructor() {
    this.indexTileTable;
    agFeatureLayer = new AgFeatureLayer(CIM.viewer);
  }
  /**
   * 添加3房屋
   * @param {*} vm 
   * @param {*} data 
   */
  async add3dTiles(data, cartographic, height = 10) {

    var _this = this;
    var tileset = new Cesium.Cesium3DTileset({
      url: data.url,
      show: true
    });
    tileset.property_url = data.property_url;
    tileset.userId = user.state.userId; //用户ID

    tileset.tableName = data.tableName;//构件表名称
    tileset.type = "houses";//类型为房屋

    agFeatureLayer.addPrimitive(tileset);
    return await tileset.readyPromise.then(function (tileset) {
      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          height
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
      let subtract = _this.getBoxSubtract(tileset);
      let obbCenter = _this.getObbCenter();
      subtract.then(da => {
        tileset.subtract = da;
      })
      obbCenter.then(da => {
        tileset.obbCenter = da;
      })
      return tileset
    });
  }

  /**
   * 替换3dtiles
   * @param {*} vm 
   * @param {*} newtiles 
   * @param {*} oldTiles 
   */
  async replace3dTiles(newtiles, oldTiles) {
    var _this = this;
    let viewer = CIM.viewer;
    var tileset = new Cesium.Cesium3DTileset({
      url: newtiles.url,
      show: true,
      property_url: newtiles.property_url,
    });
    tileset.property_url = newtiles.property_url;
    tileset.userId = user.state.userId; //用户ID

    tileset.tableName = newtiles.tableName;//構件表


    agFeatureLayer.addPrimitive(tileset);
    var primitives = agFeatureLayer._primitives;
    for (let i = 0; i < primitives.length; i++) {
      if (oldTiles === primitives[i]) {
        agFeatureLayer._primitives.splice(i, 1);
      }
    }
    var position = oldTiles._root.transform;
    let re = await tileset.readyPromise.then(function (tileset) {
      if (tileset._root != null) tileset._root.transform = position;
      else tileset.transform = position;
      _this.indexTileTable = tileset.tableName;
      let subtract = _this.getBoxSubtract(tileset);
      let obbCenter = _this.getObbCenter();
      subtract.then(da => {
        tileset.subtract = da;
      })
      obbCenter.then(da => {
        tileset.obbCenter = da;
      })
      return tileset
    });
    CIM.viewer.scene.primitives.remove(oldTiles);
    return re;
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
   * 获取obb包围盒中心
   */
  async getObbCenter() {
    let res = await this.getData("agcim3dproject", "projectname", this.indexTileTable)
    let data = res.content && res.content.rows;
    if (!data || !data[0]) return;
    let obb = JSON.parse(data[0].boundingbox)
    let cartList = []
    for (let i = 0; i < obb.length; i++) {
      cartList.push(new Cesium.Cartesian3(obb[i].X, obb[i].Y, obb[i].Z))
    }
    let aabb = Cesium.AxisAlignedBoundingBox.fromPoints(cartList);
    var ce = new Cesium.Cartesian3(aabb.center.x, aabb.center.y, cartList[0].z)
    return ce;
  }
  async getData(tableName, colName, id, isEncode = false) {
    let param = `tableName=` + tableName + `&${colName}=` + encodeURIComponent(id);

    var url = `agsupport-data-manager/agsupport-rest/BIM/dentity/find?` + param;

    let data = await axios.get(url);
    return data;
  }
  /**
   * 添加gltf模型
   * @param {*} name 
   * @param {*} position 
   * @param {*} url 
   */
  addGltf(name, position, url) {
    var scale = 1;
    if (name == "tree") {
      scale = 10;
    } else if (name == "car") {
      scale = 100;
    }
    var orientation = this.createGltfQuaternion(position);
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
  }
  /**
   * 添加人房信息绑定地块
   */
  addLandEntities() {
    var parcelData = [
      {
        id: "44532111521200001",
        height: 96.2,
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
        height: 96.4,
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
        height: 94.6,
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
      var polygon = CIM.viewer.entities.add({
        id: parcelData[i].id,
        name: "entityParcel",
        clampToGround: true,
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(parcelData[i].positions),
          height: _height,
          extrudedHeight: _height + 15,
          material: Cesium.Color.fromCssColorString("#E6E6FA").withAlpha(0.1),
          classificationType: Cesium.ClassificationType.BOTH,
        },
      });
    }
    //门牌号
    // houseNumber.addHouseNumber();
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