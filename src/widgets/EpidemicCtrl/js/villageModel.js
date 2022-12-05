import AgFeatureLayer from "@/sdk/layer/featureLayer";
import Ag3DTilesLayer from "@/sdk/layer/ag3DTilesLayer"
import Popup from "../js/popup";
import agCamera from "@/sdk/camera/camera"

var agFeatureLayer;
var ag3DTilesLayer = null;

class VillageModel {
  constructor() {
    this.tileset = null;
    this.data = require('../data/village_baolitianyue.json');
    agFeatureLayer = new AgFeatureLayer(CIM.viewer);
  }
  /**
   * 添加数据方法入口
   * @param viewer 
   * 
   */
  initialize(viewer) {
    ag3DTilesLayer = new Ag3DTilesLayer(viewer);
    this.initializeVillageRail(viewer);
    this.initializeCameraEntity(viewer);
    this.initializeVillageBuildModel(viewer);
  }

  /**
   * 添加小区围栏、出口
   * @param viewer 
   */
  initializeVillageRail(viewer) {
    var villageRailData = this.data['villageRailData'];
    var name, state, startX, startY, endX, endY, height, material;
    var cornerType;
    height = 5;
    for (var i = 0; i < villageRailData.length; i++) {
      var wall = "wall" + i;
      name = villageRailData[i].name;
      state = villageRailData[i].state;
      startX = villageRailData[i].startPointX;
      startY = villageRailData[i].startPointY;
      endX = villageRailData[i].endPointX;
      endY = villageRailData[i].endPointY;
      //判断是否为出口，渲染不同的颜色
      if (state == 0) {
        material = Cesium.Color.RED;
        cornerType = Cesium.CornerType.ROUNDED;
      } else {
        material = Cesium.Color.GREEN;
        cornerType = Cesium.CornerType.MITERED;
      }
      agFeatureLayer.addEntity({
        id: wall,
        name: name,
        corridor: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            startX, startY,
            endX, endY,
          ]),
          height: 0,//离地面高度
          extrudedHeight: height,//拉伸高度
          width: 3,//墙体宽度
          cornerType: cornerType,
          material: material,
        }
      });
    };
    //设置围栏在屏幕中心
    agCamera.setCameraByRectangle(
      viewer,
      startX,
      startY,
      endX,
      endY
    )
  }

  /**
   * 添加出口摄像头
   * @param viewer 
   */
  initializeCameraEntity(viewer) {
    var cameraData = this.data['cameraData'];
    var cameraImage = require("../images/camera.png");

    var name, X, Y;
    var height = 8;
    for (var i = 0; i < cameraData.length; i++) {
      var id = "camera" + i;
      name = cameraData[i].name;
      X = cameraData[i].X;
      Y = cameraData[i].Y;
      agFeatureLayer.addEntity({
        id: id,
        name: name,
        position: Cesium.Cartesian3.fromDegrees(X, Y, height),
        billboard: {
          image: cameraImage,
          distanceDisplayCondition: 100,
          width: 30,
          height: 30
        },
        label: {
          text: name,
          font: '12pt monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(40, 0)
        }
      });
    };
  }

  /**
   * 添加建筑模型
   * @param  viewer 
   */
  initializeVillageBuildModel(viewer) {
    var _this = this;
    let longitude = this.data['model'].x;
    let latitude = this.data['model'].y;
    let height = 0;
    let tileset = ag3DTilesLayer.add(this.data['model'].url, {
      show: true,
      maximumScreenSpaceError: 2, //最大的屏幕空间误差
      maximumNumberOfLoadedTiles: 200, //最大加载瓦片个数
    });
    this.tileset = tileset;
    // 模型加载完毕后的回调
    tileset.readyPromise
      .then(function (tileset) {
        agFeatureLayer.addPrimitive(tileset)
        // 1、旋转
        let hpr = new Cesium.Matrix3();
        // new Cesium.HeadingPitchRoll(heading, pitch, roll)
        // heading围绕负z轴的旋转。pitch是围绕负y轴的旋转。Roll是围绕正x轴的旋转
        let hprObj = new Cesium.HeadingPitchRoll(Math.PI, Math.PI, Math.PI);

        //  Cesium.Matrix3.fromHeadingPitchRoll （headingPitchRoll，result）
        hpr = Cesium.Matrix3.fromHeadingPitchRoll(hprObj, hpr);
        // 2、平移
        // 2.3储存平移的结果
        let modelMatrix = Cesium.Matrix4.multiplyByTranslation(
          // 2.1从以度为单位的经度和纬度值返回Cartesian3位置
          // 2.2计算4x4变换矩阵
          Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
          ),
          new Cesium.Cartesian3(),
          new Cesium.Matrix4()
        );
        /// 3、应用旋转
        // Cesium.Matrix4.multiplyByMatrix3 （矩阵，旋转，结果）
        Cesium.Matrix4.multiplyByMatrix3(modelMatrix, hpr, modelMatrix);
        tileset._root.transform = modelMatrix;
        _this.tileset = tileset;
      })
      .otherwise(function (error) {
      });
    viewer.flyTo(tileset, { duration: 1 });
    let val = {
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
    }
    agCamera.setCamera(viewer, val)
  }

  handleEntityPick(viewer, movement, pickedFeature) {
    if (pickedFeature) {
      //判断点击物体为南门摄像头时，显示视频弹窗
      if (pickedFeature.id && pickedFeature.id._name == "南门") {
        this.data = require("../data/village_baolitianyue.json");
        var url = this.data["monitorVideo"].url;
        var content =
          '<video style="width:400px;height:300px" controls="controls" autoplay="autoplay" src="' +
          url +
          '"></video>';
        var title = pickedFeature.id._name;
        Popup.show(viewer, movement, content, title);//调用显示弹窗方法
        return;
      }
      //调用关闭弹窗方法
      Popup.hide();
    }
  }
  /**
   * 移除加载模型方法
   * @param  viewer 
   */
  removeAll(viewer) {
    agFeatureLayer.removeAll();
    ag3DTilesLayer.removeAll(viewer);
  }
}
export default new VillageModel();