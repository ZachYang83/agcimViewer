<template>
  <div class="locationbar">
      <div class="locationbar-content" v-if="contentVisibel">
          <div class="location">经度：{{longitude}}</div>
          <div class="location">纬度：{{latitude}}</div>
          <div class="location">海拔：{{height}}米</div>
          <div class="camera">方向：{{heading}}度</div>
          <div class="camera">俯仰角：{{pitch}}度</div>
          <div class="camera">视高：{{distance}}米</div>
      </div>
  </div>
</template>

<script>
import PickerHelper from "@/sdk/interactive/pickerHelper";
import CesiumNavigation from "@/widgets/CesiumNavigation";
let viewer = null;
let pickerHelper = null;
let options = {};
export default {
    name:"Location",
    data(){
        return{
            longitude:'',
            latitude:'',
            height:'',
            heading:'',
            pitch:'',
            distance:'',
            contentVisibel:false,
        }
    },
    mounted(){
        viewer = CIM.viewer;
        // viewer.scene.debugShowFramesPerSecond = true;
        options.defaultResetView = Cesium.Cartographic.fromDegrees(113.31545849, 23.12416038, 6000); // 用于在使用重置导航重置地图视图时设置默认视图控制。
        options.enableCompass = true;// 用于启用或禁用罗盘。
        options.enableZoomControls = true;// 用于启用或禁用缩放控件。
        options.enableDistanceLegend = true;// 用于启用或禁用距离图例。
        options.enableCompassOuterRing = true; // 用于启用或禁用指南针外环。
        CesiumNavigation(viewer, options);
        this.getPosition();
    },
    methods:{
        getPosition(){
            let _t = this;
            var scene = viewer.scene;
            var ellipsoid = scene.globe.ellipsoid;
            var cartesian = null;
            pickerHelper = new PickerHelper(viewer);
            pickerHelper.on("MOUSE_MOVE",function(movement) {
                _t.contentVisibel = true;
                //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
                cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                if (cartesian) {
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                    _t.longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                    _t.latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
                    var height = viewer.scene.globe.getHeight(cartographic);
                    if( height ){
                         _t.height = height.toFixed(1);
                    }
                    _t.heading = Cesium.Math.toDegrees(viewer.camera.heading).toFixed(2);
                    _t.pitch = Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(2);
                    _t.distance= viewer.camera.positionCartographic.height.toFixed(1);
                }
            },10)
        }
    },
    destroyed(){
        pickerHelper.off();
    }
}
</script>

<style scoped>

    .locationbar{
        position: absolute;
        width: 100%;
        height:30px;
        bottom:0px;
        background-color: rgba(0, 0, 0, 0.3);
        color: rgba(255, 255, 255, 1);
        padding: 2px 15px;
        padding-right:10px;
        z-index: 3;
    }

    .locationbar .locationbar-content{
        float:right;
        line-height: 26px;
        box-sizing: border-box;
    }

     .locationbar .locationbar-content div{
         float:left;
         width:auto;
         margin-right:20px;
         box-sizing: border-box;
         font-size: 14px;
         font-weight: 400;
         font-family: sans-serif;
     }

     .locationbar .locationbar-content .scale{
         float:left;
         width:auto;
         margin-left:167px;
         box-sizing: border-box;
         font-size: 14px;
         position: absolute;
         left:147px;
         bottom:0px;
     }
</style>

<style>
    .cesium-performanceDisplay-defaultContainer {
        position: absolute;
        height: 30px;
        bottom: 0px;
        right: 15px;
        top:unset;
        text-align: unset;
        z-index: 999;
        display: none;
    }

    .cesium-performanceDisplay {
        padding:2px 0px 2px 0px;
        line-height: 26px;
        background-color:unset;
        border-radius: unset;
        border:unset;
        font: unset;
    }

    .cesium-performanceDisplay-fps {
        width:auto;
        margin-right:20px;
        float:right;
        line-height: 26px;
        font-size: 14px;
        font-family: sans-serif;
        color: rgba(255, 255, 255, 1);
    }

    .cesium-performanceDisplay-ms {
        width:auto;
        float:right;
        line-height: 26px;
        font-size: 14px;
        font-family: sans-serif;
        color: rgba(255, 255, 255, 1);
    }
</style>
