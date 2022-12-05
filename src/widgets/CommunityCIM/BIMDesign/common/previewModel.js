let initModel = null;
class addModel {
   constructor() {

   }
   initViewer(el, op = {}) {
      let viewer = new Cesium.Viewer(el);
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.globe.show = false;
      viewer._cesiumWidget._creditContainer.style.display = "none" //取消版权信息
      viewer.scene.skyBox.show = false;
      viewer.scene.backgroundColor = op.color || Cesium.Color.ALICEBLUE || new Cesium.Color(0, 0, 0);
      viewer.scene.globe.enableLighting = false;
      return viewer;
   }
   displayerDefaultUI(viewer) { 
      viewer.animation.container.style.display = 'none'; //隐藏动画控件
      viewer.timeline.container.style.display = 'none'; //隐藏时间线控件
      viewer.geocoder.container.style.display = 'none'; //隐藏地名查找控件
      viewer._homeButton.container.style.display = 'none'; //隐藏地名查找控件
      viewer._fullscreenButton.container.style.display = 'none'; //隐藏地名查找控件
      viewer.cesiumWidget.creditContainer.style.display = 'none'; //隐藏ceisum标识 
   }
   add3dTiles(viewer, url) {
      var tileset = new Cesium.Cesium3DTileset({
         url: url,
         show: true
      });
      viewer.scene.primitives.add(tileset);
      tileset.readyPromise.then(function (tileset) {
         initModel = tileset;
         viewer.zoomTo(tileset);
      });
      return tileset;
   }
   addEntity(viewer, url) {
      viewer.entities.removeAll();
      var position = Cesium.Cartesian3.fromDegrees(
         113.4004688,
         23.0103453,
         4300.4
      );
      var heading = Cesium.Math.toRadians(-160);
      var pitch = -1.3;
      var roll = 1.2;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(
         position,
         hpr
      );
      var entity = viewer.entities.add({
         name: url,
         position: position,
         orientation: orientation,
         model: {
            uri: url,
            scale: 30,
         },
      });
      viewer.zoomTo(entity);

      initModel = entity;
      return entity;
   }
   zoomToHome(viewer) {
      if (initModel) viewer.zoomTo(initModel);
   }
}

export default new addModel();