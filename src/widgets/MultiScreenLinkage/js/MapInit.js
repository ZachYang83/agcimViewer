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
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: true
        },
        allowTextureFilterAnisotropic: true
      },
      infoBox: true,
      fullscreenButton: false,
      selectionIndicator: false,
      animation: false, //动画器件
      homeButton: false, //返回初始位置按钮
      geocoder: false, //位置查找工具
      timeline: false, //时间线
      navigationHelpButton: false, //导航帮助按钮
      sceneModePicker: false, //
      sceneMode: Cesium.SceneMode.SCENE2D,
      // mapMode2D : Cesium.MapMode2D.ROTATE,
      maximumRenderTimeChange: Infinity,
      baseLayerPicker:false,
    }
  }
  getIonToken() {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlMmQ5OWE1ZS04ODMwLTQ5NmUtODk1Zi05OWVlOWM2NGQ2ZDYiLCJpZCI6MTY0NTgsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzA1ODUxNTJ9.FUzgQG6PqlpXsLAu2-zlAxK8Z3g1aZTC8Hwr7i9cBFc";
  }
  initStyle(viewer) {
    viewer._cesiumWidget._creditContainer.style.display = "none"; //隐藏版权信息
  }
}


var MapInit = {
  creatMap: function (domDiv) {
    var cesiumViewer = new CesiumViewer();
    Cesium.Ion.defaultAccessToken = cesiumViewer.getIonToken();
    var viewer = new Cesium.Viewer(domDiv, cesiumViewer.getViewerParam());
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) { //判断是否支持图像渲染像素化处理
      viewer.resolutionScale = window.devicePixelRatio;
    }
    viewer.scene.postProcessStages.fxaa.enabled = true;
    cesiumViewer.initStyle(viewer);
    CIM.view2D = viewer;

    var layers = CIM.viewer.imageryLayers._layers;
    var layer = layers[layers.length - 1];
    viewer.imageryLayers.addImageryProvider(layer._imageryProvider);

    return viewer;
  }
};
export default MapInit;