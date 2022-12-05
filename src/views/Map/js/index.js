import agcimScene from "@/sdk/scene/scene";
import BaseLayerSwitcherConfig from "@/widgets/BaseLayerSwitcher/config";
import AgCamera from "@/sdk/camera/camera";
import CameraRecord from "@/adk/CameraRecord.js";
import GroundSkyBox from "./SkyBoxOnGround";

class CesiumViewer {
  getViewerParam() {
    return {
      contextOptions: {
        webgl: {
          alpha: true,
          depth: false,
          stencil: true,
          antialias: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: true, //通过canvas.toDataURL()实现截图需要将该项设置为true
          failIfMajorPerformanceCaveat: true
        },
        allowTextureFilterAnisotropic: true
      },
      infoBox: true,  //右侧弹出框
      fullscreenButton: false, //全屏按钮
      selectionIndicator: false, //选取指示器组件
      animation: false, //左下角仪表，动画小器件
      homeButton: false, // 返回（主页）cesium初始位置按钮
      geocoder: false, //位置查找工具
      timeline: false, //下方时间轴
      navigationHelpButton: false, //右上角导航帮助按钮
      sceneModePicker: false, //二维三维投影方式选择器
      // requestRenderMode : true,
      maximumRenderTimeChange: Infinity,
      baseLayerPicker: false
    }
  }
  getIonToken() {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMmQ5OWE1ZS04ODMwLTQ5NmUtODk1Zi05OWVlOWM2NGQ2ZDYiLCJpZCI6MTY0NTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzA1ODUxNTJ9.FUzgQG6PqlpXsLAu2-zlAxK8Z3g1aZTC8Hwr7i9cBFc";
  }
  initStyle(viewer) {
    viewer._cesiumWidget._creditContainer.style.display = "none"; //隐藏版权信息
  }
  //设置天空盒
  setSkyBox(viewer) {
    var skyBox = viewer.scene.skyBox;
    var groundSkyBox = new GroundSkyBox({
      sources: {
        positiveX: require("@/assets/img/SkyBoxOnGround/rightav9.jpg"),
        negativeX: require("@/assets/img/SkyBoxOnGround/leftav9.jpg"),
        positiveY: require("@/assets/img/SkyBoxOnGround/frontav9.jpg"),
        negativeY: require("@/assets/img/SkyBoxOnGround/backav9.jpg"),
        positiveZ: require("@/assets/img/SkyBoxOnGround/topav9.jpg"),
        negativeZ: require("@/assets/img/SkyBoxOnGround/bottomav9.jpg"),
      },
    });
    viewer.scene.postRender.addEventListener(function () {
      var e = viewer.camera.position;
      let _height = Cesium.Cartographic.fromCartesian(e).height;
      if (_height < 10000) {
        CIM.agcimScene.setSceneConfig({ "skyAtmosphere": false, "skyBox": groundSkyBox });//屏蔽掉大气层，否则看不到效果
      } else {
        CIM.agcimScene.setSceneConfig({ "skyAtmosphere": true, "skyBox": skyBox });//大气层打开，恢复到默认状态
      }
    })
  }
}

var MapInit = {
  agcimScene: new agcimScene(),
  creatMap: function (domDiv, data) {
    var cesiumViewer = new CesiumViewer();
    Cesium.Ion.defaultAccessToken = cesiumViewer.getIonToken();
    var viewer = new Cesium.Viewer(domDiv, cesiumViewer.getViewerParam());
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) { //判断是否支持图像渲染像素化处理
      viewer.resolutionScale = window.devicePixelRatio;
    }
    viewer.scene.postProcessStages.fxaa.enabled = true;
    cesiumViewer.initStyle(viewer);
    CIM.viewer = viewer;
    CIM.agcimScene = MapInit.agcimScene;

    CIM.viewer.infoBox._element.hidden = true;

    // flatten.start(viewer);

    MapInit.agcimScene.initialize(viewer, data);

    CIM.agcimScene.setSceneConfig({
      "sun": false, //关闭太阳显示
      "moon": false, //关闭月亮显示
      "fog": false,  //关闭场景的雾显示
      "depthTestAgainstTerrain": true, //默认开启深度检测
      "baseColor": "#fff"// Cesium.Color.WHITE //设置无底图影像时地球的颜色,2种颜色都可
    });

    var layers = viewer.imageryLayers._layers;
    if (layers.length > 0) {
      var layer = layers[layers.length - 1];
      viewer.imageryLayers.remove(layer);
      //将默认图层设置为【天地图矢量】
      viewer.imageryLayers.addImageryProvider(BaseLayerSwitcherConfig.baseLayerArr[5].creationFunction());
    }
    CIM.viewer.clock.currentTime.secondsOfDay = 50400;

    //初始化定位

    //旋转飞到定位点（广州）正上空
    setTimeout(() => {
      AgCamera.cameraFlyTo(viewer, {
        destination: new Cesium.Cartesian3.fromDegrees(113.31545849, 23.12416038, 24212642.887812868),
        duration: 2
      });
    }, 0);
    //垂直下移
    setTimeout(() => {
      AgCamera.cameraFlyTo(viewer, {
        destination: new Cesium.Cartesian3.fromDegrees(113.32445849, 23.12016038, 6000),
        duration: 4,
        complete: function () {
          // 监听相机变化
          if (!CIM.cameraRecord) {
            CIM.cameraRecord = new CameraRecord(CIM.viewer)
            CIM.cameraRecord.listeningViewChange()
          }
          cesiumViewer.setSkyBox(viewer);
        }
      });
    }, 2000);
  }
};
export default MapInit;