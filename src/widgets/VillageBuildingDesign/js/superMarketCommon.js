

//加载3d times
export function add3DTiles(url, viewer) {

  var tileset = new Cesium.Cesium3DTileset({
    url: url,
    show: true
  });
  viewer.scene.primitives.add(tileset);

  // var position = this.selectectTiles;

  tileset.readyPromise.then(function (tileset) {
    //   if (tileset._root != null) tileset._root.transform = position;
    //   else tileset.transform = position;
    zoomTo(viewer, tileset);
  });
  return tileset
  // this.tilesetObj[this.selectedIndex] = tileset;
}
//清除所有实体
export function emptyPrimitives(viewer) {

  viewer.scene.primitives.removeAll();
}
//初始化cesium
export function initViewer(el, op = {}) {
  var viewer = new Cesium.Viewer(el);
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.show = false;
  viewer._cesiumWidget._creditContainer.style.display = "none"//取消版权信息
  viewer.scene.skyBox.show = false;
  viewer.scene.backgroundColor = op.color || Cesium.Color.ALICEBLUE || new Cesium.Color(0, 0, 0);
  viewer.scene.globe.enableLighting = false;
  return viewer
}
//视图移动到物体
export function zoomTo(viewer, Primitive) {
  viewer.zoomTo(Primitive)
}
//屏蔽掉viewer的所有默认组件
export function displayerDefaultUI(viewer) {

  viewer.animation.container.style.display = 'none';//隐藏动画控件
  viewer.timeline.container.style.display = 'none';//隐藏时间线控件
  viewer.geocoder.container.style.display = 'none';//隐藏地名查找控件
  viewer._homeButton.container.style.display = 'none';//隐藏地名查找控件
  viewer._fullscreenButton.container.style.display = 'none';//隐藏地名查找控件
  viewer.cesiumWidget.creditContainer.style.display = 'none';//隐藏ceisum标识

}
//平移model
export function panModel(viewer) {

  let handler = viewer.screenSpaceEventHandler;
  handler.setInputAction((movement) => {

    let pick = viewer.scene.pick(movement.position);
    if (pick != undefined) {

      pick.primitive.silhouetteColor = Cesium.Color.RED; //选中模型后高亮
      pick.primitive.silhouetteSize = 3.0;
      handler.setInputAction((movement) => { //点击模型后添加鼠标移动事件
        const m1 = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Matrix4.getTranslation(pick.primitive.modelMatrix, new Cesium.Cartesian3()), Cesium.Ellipsoid.WGS84, new Cesium.Matrix4());
        const m3 = Cesium.Matrix4.multiply(Cesium.Matrix4.inverse(m1, new Cesium.Matrix4()), pick.primitive.modelMatrix, new Cesium.Matrix4());
        const mat3 = Cesium.Matrix3.getRotation(m3, new Cesium.Matrix3());
        const q = Cesium.Quaternion.fromRotationMatrix(mat3);
        const hpr = Cesium.HeadingPitchRoll.fromQuaternion(q);
        const headingPitchRoll = new Cesium.HeadingPitchRoll(hpr.heading, hpr.pitch, hpr.roll);// 获取当前模型heading，pitch，roll
        var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);// 获取鼠标移动后的点
        const m = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
        pick.primitive.modelMatrix = m;
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)


}
//创建模型
export function createModel(viewer, url, height) {

  viewer.entities.removeAll();
  var position = Cesium.Cartesian3.fromDegrees(
    113.4004688,
    23.0103453,
    4300.4
  );
  var heading = Cesium.Math.toRadians(90);
  var pitch = Cesium.Math.toRadians(45);
  var roll = 0;
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );

  var entity = viewer.entities.add({
    name: url,
    position: position,
    orientation: orientation,
    //  scale:0.0245,
    model: {
      uri: url,
      scale: 30,
      //minimumPixelSize: 208,
      // maximumScale: 20000,
    },
  });

  viewer.zoomTo(entity)
  return entity
  // viewer.scene.camera.setView({
  //     destination: new Cesium.Cartesian3.fromDegrees(
  //         113.4004688,
  //         23.0103453,
  //         23.4
  //     ),
  //    hpr,
  //   });
  //点击事件获取坐标
  // viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
  //     movement
  //   ) {

  //     var pickedFeature = viewer.scene.pick(movement.position);
  //     movement.position;//屏幕坐标
  //     var position = viewer.scene.pickPosition(movement.position);//笛卡尔坐标 屏幕坐标转迪卡尔
  //     var cartographic = Cesium.Cartographic.fromCartesian(position);//弧度坐标 笛卡尔转弧度
  //     //弧度转经纬度
  //     Cesium.Math.toDegrees(0.4016467102981159)
  //     //经纬度转笛卡尔坐标
  //     Cesium.Cartesian3.fromDegrees(-123.0744619,  44.0503706,1000.0);

  //   },
  //   Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
  //     Cesium.Cartesian3.fromDegrees(-123.0744619,  44.0503706,1000.0));

  // var object = viewer.entities.add(
  //     Cesium.Model.fromGltf({
  //         url : url,
  //         modelMatrix : modelMatrix,
  //         //scale:0.0245,
  //     })
  //   );

  //   viewer.zoomTo(object)

  //   object.readyPromise.then(item=>{
  //     item

  //     viewer.zoomTo(item)
  //   })

  //   scene.primitives.add(Cesium.Model.fromGltf({
  //     url : './duck/duck.gltf'
  //   }));
  // viewer.flyTo(t)
  // viewer.trackedEntity = entity;
}

