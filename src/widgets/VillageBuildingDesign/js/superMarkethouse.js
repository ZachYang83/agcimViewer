import {initViewer,displayerDefaultUI,add3DTiles,emptyPrimitives} from "./superMarketCommon.js"
export function init(el,bin){
   let homePosition,indexTileset;
   let viewer=initViewer(el);
   displayerDefaultUI(viewer);
   
   if(bin){
    _add3DTiles(bin.url);
   }

   
   function _add3DTiles(url){
     emptyPrimitives(viewer);
     let tileset=add3DTiles(url,viewer);
     tileset.readyPromise.then(function (tileset) {
      
      indexTileset=tileset;
      //tileset._root.transform
      });

   }
   	// 获取相机当前高，经，纬
      function get_camera_height() {
         
         // 获取当前镜头位置的笛卡尔坐标
         var cameraPosition = viewer.camera.position;
         // 获取当前坐标系标准
         var ellipsoid = viewer.scene.globe.ellipsoid;
         // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
         var cartographic = ellipsoid.cartesianToCartographic(cameraPosition);
         // 获取镜头的高度
         var height = cartographic.height;
         // 根据上面当前镜头的位置，获取该中心位置的经纬度坐标
         var centerLon = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(8));
         var centerLat = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(8));
         return { height, centerLon, centerLat };
     };

   function _zoomToHome(){
      if(indexTileset)viewer.zoomTo(indexTileset);
   }
   function _zoomOut(){
      
      if(indexTileset){
         viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(get_camera_height().centerLon, get_camera_height().centerLat, get_camera_height().height / 1.1),
            duration: 1.0
        });
      };
   }
   function _zoomIn(){
      if(indexTileset){
         viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(get_camera_height().centerLon, get_camera_height().centerLat, get_camera_height().height * 1.1),
            duration: 1.0
        });
      };
   }
   return {
    add3DTiles:_add3DTiles,
    zoomToHome:_zoomToHome,
    zoomOut:_zoomOut,
    zoomIn:_zoomIn,
    viewer,

   }
}