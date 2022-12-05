<template>
  <div class="visual-analysis-box">
    <div class="sel-monitor-object">
      <a-radio-group @change="handleMonitorObjectChange" :value="monitorObject">
        <a-radio-button class="visual-map" value="add3dObservePiont">选取3dtile观察位置点</a-radio-button>
        <a-radio-button class="visual-map" value="addViewTargetPiont" >添加3dtile通视分析目标点</a-radio-button>
        <a-radio-button class="visual-map" value="addVisualTargetPiont" >添加可视域分析目标点</a-radio-button> 
        <a-radio-button class="visual-map" value="deleteResults">清除</a-radio-button>
        <!-- <a-radio-button class="visual-map" value="VisualAnalysis" >可视域分析</a-radio-button>
        <a-radio-button class="visual-map" value="deleteResults">清除</a-radio-button> -->
      </a-radio-group>
  </div>
  <div class="terrian-monitor-object">
  <a-radio-group @change="handleMonitorTerrianChange" :value="monitorObjectTerrian">
  <a-radio-button class="terrian-map" value="addTerrianObservePiont">选取地形图观察位置点</a-radio-button>
  <a-radio-button class="terrian-map" value="addTerrianTargetPiont"  >添加地形图通视分析目标点</a-radio-button>
  <a-radio-button class="terrian-map" value="deleteResults">清除</a-radio-button>
 </a-radio-group>
 </div>   
  </div>
</template>

<script>
// import EllipseGeometryLibrary from "./js/ellipseGeometryLibraryEx.js";
import SysMathTool from "./js/mathTools.js";
import TerrainToolCopy from "./js/terrainToolCopy.js";
import PrimitivePoints from "./js/primitivePoints.js";
import DrawDynamicClampGround from "./js/drawDynamicPrimitive.js";
import TooltipDiv from "./js/tooltipDiv.js";
import Draw from "@/sdk/interactive/draw.js";
import EllipseGeometryLibraryEx from "./js/ellipseGeometryLibraryEx.js";
let viewer = CIM.viewer;
let draw = new Draw(viewer);
export default {
  name: "VisualAnalysis",
  data() {
    return {
      monitorObject: "deleteResults",
      monitorObjectTerrian: "deleteResults",
      primitiveKSY: [], //可视域集合点,
      destPoints: [],
      viewPoint: Cesium.Cartesian3.fromDegrees(
        73.50114210012788,
        135.08851148002088,
        53.56090105044318
      ),
      activeShapePoints: [],
      floatingPoint: {},
      activeShape: {},
      point: {},
      shape: {},
      destPoints: [], //可视域集合
      radius: 100, //视距1000米
      toPoint: {}, //到的点
      viewPoint: Cesium.Cartesian3.fromDegrees(113.4004688, 23.0103453, 23.4),  //华工
      // viewPoint: Cesium.Cartesian3.fromDegrees(135.4004688, 53.0103453, 23.4) //琶洲
      // viewPoint:  Cesium.cartesian3.clone(-2325238.0849348493,  5389551.20498884, 2486956.729045034)
      observePosition:{},  //通视分析-观察点
      targetPosition:{},    //通视分析-目标点
      visualTargetPosition:{},  //简单可视域分析-目标点
      observePositionTerrian:{},
      targetPositionTerrian:{},

    };
  },
  mounted() {
    // this.addTilesData(viewer)
    this.addTerrianData(viewer)
    // this.analysisShadowmap(viewer)
  },
  methods: {
    //添加3dtiles 地图
    addTilesData(viewer) {   
      // var tileset2 = viewer.scene.primitives.add(
      //   new Cesium.Cesium3DTileset({
      //     url: "http://192.168.3.203:7280/Models/Pazhouxi_qx/tileset.json"
      //   })
      // );
      var tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url:
            "http://192.168.3.203:7280/Models/Huagong_bim/V1/BuildingA/BuildingA/tileset.json"
        })
      );
      //设置初始位置-广州的位置
     viewer.camera.setView({
      //  destination: new Cesium.Cartesian3(-2325386.4518317846,  5389378.96745023,2487189.6792497267) //琶洲
       destination:Cesium.Cartesian3.fromDegrees(113.4004688, 23.0103453, 23.4) //华工
      });
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
       73.50114210012788,
       6.323625505013069,
       135.08851148002088,
       53.56090105044318
      );
      // Get default left click handler for when a feature is not picked on left click
      //求算获取feature的信息
      viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
        var newPosition = viewer.scene.camera.pickEllipsoid(
          movement.position,
          viewer.scene.globe.ellipsoid
        );
        var pickedFeature = viewer.scene.pick(movement.position); 
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
     
      // tileset2.readyPromise.then(function() {
      //     var boundingSphere = tileset.boundingSphere;
      //     viewer.camera.viewBoundingSphere(boundingSphere,new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius)
      //     );
      //     viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      //   })
      //   .otherwise(function(error) {
      //     throw error;
      //   });
     viewer.scene.globe.depthTestAgainstTerrain=true   //解决在3dTile模型下的笛卡尔坐标不准问题。
    },
    //添加terrian 地形图
    addTerrianData(viewer) {
       var terrainProvider= new Cesium.CesiumTerrainProvider({
          terrainExaggeration : 2.0,
          url: "http://192.168.3.203:7280/Dem/Pazhouxi", // 琶洲西dem-terrian
          requestWaterMask: true,
          requestVertexNormals: true
       })
       viewer.terrainProvider = terrainProvider;//地形数据源 terrainProvider

        // set lighting to true
       viewer.scene.globe.enableLighting = true;
       viewer.scene.fxaa = false;//抗锯齿
       viewer.scene.fog.enabled = false;
       viewer.scene.globe.depthTestAgainstTerrain = true;
    
       //求算获取feature的信息
       
      //  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      //  handler.setInputAction(function (movement) {
      //   // var newPosition = viewer.scene.camera.pickEllipsoid(movement.position,viewer.scene.globe.ellipsoid);
      //   var ray=viewer.camera.getPickRay(movement.position)
      //   var newPosition = viewer.scene.globe.pick(ray, viewer.scene);
      // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      viewer.camera.setView({
        destination:new Cesium.Cartesian3(-2325754.7340460913,5389096.7749950485,2487454.9800728615) //琶洲
        // destination:Cesium.Cartesian3.fromDegrees(113.4004688, 23.0103453, 23.4) //华工
      });
       Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
       73.50114210012788,
       6.323625505013069,
       135.08851148002088,
       53.56090105044318
      );  
    },

    //基于shadowmap定性分析-模拟太阳光阴影，调整lighterCenter的位置
    analysisShadowmap(viwer){
      var camera = viewer.scene.camera;
      viewer.scene.debugShowFramesPerSecond = true;
      viewer.shadows = true;
      viewer.terrainShadows = true
        ? Cesium.ShadowMode.ENABLED
        : Cesium.ShadowMode.DISABLED;
      //光源位置-产生阴影
      var lightCenter = new Cesium.Cartesian3(-2325238.0849348493,5389551.20498884,2486956.729045034
      );
      var camera = new Cesium.Camera(viewer.scene);
      camera.position = lightCenter;

      var shadowMapTemp = new Cesium.ShadowMap({
        context: viewer.scene.context,
        lightCamera: camera,
        maxmimumDistance: 10000.0,    //Determines the maximum distance of the shadow map
        pointLightRadius: 1000.0,
        darkness: 0.3, //The shadow darkness.
        cascadesEnabled: false, //是否使用多个阴影贴图覆盖视锥的不同分区
        isPointLight: true, //Point light shadows do not use cascades
        softShadows: false
      });
      shadowMapTemp.enabled = true;
      shadowMapTemp.debugShow = true;
      viewer.scene.shadowMap = shadowMapTemp;
    },

    //简单可视域分析定性分析-射线求交法,基于起点（viewPoint，radius）调整位置 
    analysisKSYSimple(viewer,observe,target) { 
      //获取半径
      var radius =  Cesium.Cartesian3.distance(observe,target)   
      //观察点-世界坐标转换成经纬度（投影坐标）
      var webMercatorProjection = new Cesium.WebMercatorProjection( viewer.scene.globe.ellipsoid);
      var viewPointWebMercator = webMercatorProjection.project(Cesium.Cartographic.fromCartesian(observe));
      for (var i = 0; i < 360; i++) {
        // 度数转弧度
        var radians = Cesium.Math.toRadians(i);
        // 计算目标点（经纬度-投影坐标）-根据半径0-360度计算一圈目标点
        var toPoint = new Cesium.Cartesian3(
          viewPointWebMercator.x + radius * Math.cos(radians),
          viewPointWebMercator.y + radius * Math.sin(radians),
          30
        );
        // 投影坐标转世界坐标
        toPoint = webMercatorProjection.unproject(toPoint);
        this.destPoints.push(Cesium.Cartographic.toCartesian(toPoint.clone()));
      }
      for (var i = 0; i < this.destPoints.length; i++) {
        // 计算射线的方向，目标点left 视域点right
        var direction = Cesium.Cartesian3.normalize(
          Cesium.Cartesian3.subtract(this.destPoints[i],observe,new Cesium.Cartesian3()),new Cesium.Cartesian3()
        );
        // 建立射线
        var ray = new Cesium.Ray(observe, direction);
        var result = viewer.scene.pickFromRay(ray); // 计算交互点，返回第一个
        this.showIntersection(result, this.destPoints[i], observe);
      }
    },
    showIntersection(result, destPoint, viewPoint) {
      // 如果是场景模型的交互点，排除交互点是地球表面
      if (Cesium.defined(result) && Cesium.defined(result.object)) {
        this.drawLine(result.position, viewPoint, Cesium.Color.GREEN); // 可视区域
        this.drawLine(result.position, destPoint, Cesium.Color.RED); // 不可视区域
      } else {
        this.drawLine(viewPoint, destPoint, Cesium.Color.GREEN);
      }
    },
    drawLine(leftPoint, secPoint, color) {
      viewer.entities.add({
        polyline: {
          positions: [leftPoint, secPoint],
          arcType: Cesium.ArcType.NONE,
          width: 5,
          material: color,
          depthFailMaterial: color
        }
      });
    },
    // 可视域分析-基于dem 插值分析-代码和各种包正常放进来了，存在画圆条件和dem数据要求
    analysisDem(viewer) {
      if (this.primitiveKSY.length > 0) {
        return;
      }
      var viewHeight = 1.5;
      var cartographicCenter = Cesium.Cartographic.fromDegrees(
        113.340381, 23.098367
      );
      var cartesianCenterH0 = Cesium.Cartesian3.fromRadians(
        cartographicCenter.longitude,
        cartographicCenter.latitude
      );
      var cartesianPointH0 = Cesium.Cartesian3.fromDegrees(
       113.4004688, 23.0103453,
      );

      var ab = Cesium.Cartesian3.distance(cartesianCenterH0, cartesianPointH0);
      var eopt = {};
      eopt.semiMinorAxis = ab;
      eopt.semiMajorAxis = ab;
      eopt.rotation = 0;
      eopt.center = cartesianCenterH0;
      eopt.granularity = Math.PI / 45.0; //间隔
      var ellipse = EllipseGeometryLibraryEx.computeEllipseEdgePositions(eopt);

      for (var i = 0; i < ellipse.outerPositions.length; i += 3) {
        //逐条计算可视域
        var cartesian = new Cesium.Cartesian3(
          ellipse.outerPositions[i],
          ellipse.outerPositions[i + 1],
          ellipse.outerPositions[i + 2]
        );
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var deltaRadian = (0.00005 * Math.PI) / 180.0; //Cesium.Math.RADIANS_PER_DEGREE
        var cartographicArr = SysMathTool.InterpolateLineCartographic(
          cartographicCenter,
          cartographic,
          deltaRadian
        );
        //弧度转换
        TerrainToolCopy.CartographicPointsTerrainData(cartographicArr, function(
          terrainData
        ) {
          if (terrainData.length > 0) {
            var preVisible = true;
            var cartesiansLine = [];
            var colors = [];
            for (var j = 1; j < terrainData.length; j++) {
              //逐点计算可见性
              var visible = true; //该点可见性
              if (j > 1) {
                var cartographicCenterHV = new Cesium.Cartographic(
                  terrainData[0].longitude,
                  terrainData[0].latitude,
                  terrainData[0].height + viewHeight
                );
                //
                if (preVisible) {
                  //
                  var curPoint = SysMathTool.InterpolateIndexLineHeightCartographic(
                    cartographicCenterHV,
                    terrainData[j],
                    j,
                    j - 1
                  );
                  if (curPoint.height >= terrainData[j - 1].height) {
                    preVisible = true;
                    visible = true;
                  } else {
                    preVisible = false;
                    visible = false;
                  }
                } else {
                  //插值到当前
                  var curPointArr = SysMathTool.Interpolate2IndexLineHeightCartographic(
                    cartographicCenterHV,
                    terrainData[j],
                    j,
                    j - 1
                  );
                  for (var k = 0; k < curPointArr.length; k++) {
                    if (curPointArr[k].height >= terrainData[k].height) {
                      preVisible = true;
                      visible = true;
                    } else {
                      preVisible = false;
                      visible = false;
                      break;
                    }
                  }
                }
              }
              var cartesianTemp = Cesium.Cartesian3.fromRadians(
                terrainData[j].longitude,
                terrainData[j].latitude,
                terrainData[j].height + 0.1
              );
              cartesiansLine.push(cartesianTemp);
              //绘制点
              if (visible) {
                colors.push(0);
                colors.push(0);
                colors.push(1);
                colors.push(1);
              } else {
                colors.push(1);
                colors.push(0);
                colors.push(0);
                colors.push(1);
              }
            }

            //绘制结果
            var pointsKSY = new PrimitivePoints({
              viewer: viewer,
              Cartesians: cartesiansLine,
              Colors: colors
            });
            this.primitiveKSY.push(pointsKSY);
          } else {
            alert("高程异常！");
          }
        });
      }
    },
    clearAll() {
      if (this.primitiveKSY.length > 0) {
        for (var i = 0; i < this.primitiveKSY.length; i++) {
          this.primitiveKSY[i].remove();
          this.primitiveKSY[i] = null;
        }
        this.primitiveKSY = [];
      }
    },
    //创造点-观察点
    createPoint(worldPosition) {
      var point = viewer.entities.add({
        position: worldPosition,
        point: {
          color: Cesium.Color.BLUE,
          pixelSize: 10,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
      return point;
    },
    //创造点-目标点
    createTargetPoint(worldPosition) {
      var point = viewer.entities.add({
        position: worldPosition,
        point: {
          color: Cesium.Color.RED,
          pixelSize: 10,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
      return point;
    },
  //通视分析-射线求交法
    viewAnalysisRay(target,observe){
        // 计算射线的方向，目标点left 视域点right
        var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(target, observe,new Cesium.Cartesian3()),new Cesium.Cartesian3());
        // 建立射线
        var ray = new Cesium.Ray(observe, direction);
        var result = viewer.scene.pickFromRay(ray); // 计算交互点，返回第一个
        this.showIntersection(result, target, observe);      
    },
    
    //获取观察位置点-通视分析Terrian
    getObservePointTerrian(viewer){
      var _this = this;
      // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      viewer.screenSpaceEventHandler.setInputAction(function (movement) {
          //加载地形图之后-地形坐标
        var ray=viewer.camera.getPickRay(movement.position)
        var observePointTerrian = viewer.scene.globe.pick(ray, viewer.scene);
        _this.createPoint(observePointTerrian)
        _this.observePositionTerrian = observePointTerrian
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
     // 获取目标点-通视分析Terrian
    getTargetPointTerrian(viewer){
      var _this = this;
      // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      viewer.screenSpaceEventHandler.setInputAction(function (movement) {
        var ray=viewer.camera.getPickRay(movement.position)
        var targetPointTerrian = viewer.scene.globe.pick(ray, viewer.scene);
        _this.createTargetPoint(targetPointTerrian)
        _this.viewAnalysisRay(targetPointTerrian,_this.observePositionTerrian)
        _this.targetPositionTerrian = targetPointTerrian   
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);  
    },
    //获取观察位置点-3dtiles
    getObservePoint(viewer){
      var _this = this;
      // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
     viewer.screenSpaceEventHandler.setInputAction(function (movement) {
        //3dtiles 模型坐标-场景坐标
        var observePoint = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        _this.createPoint(observePoint)
        _this.observePosition = observePoint
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    // 获取目标点-3ditles通视分析
    getTargetPoint(viewer){
      var _this = this;
      // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      viewer.screenSpaceEventHandler.setInputAction(function (movement) {
        var targetPoint = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        _this.createTargetPoint(targetPoint)
        _this.viewAnalysisRay(targetPoint,_this.observePosition)
        _this.targetPosition = targetPoint
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);  
    },
    // 获取目标点-可视域分析
    getVisualTargetPoint(viewer){
      var _this = this;
      viewer.screenSpaceEventHandler.setInputAction(function (movement) {
        var targetPoint = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        _this.createTargetPoint(targetPoint)
        _this.visualTargetPosition = targetPoint
        _this.analysisKSYSimple(viewer,_this.observePosition,_this.visualTargetPosition)
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    handleMonitorTerrianChange(e){
       this.monitorObjectTerrian = e.target.value;
       if(this.monitorObjectTerrian == "addTerrianObservePiont"){
        this.getObservePointTerrian(viewer)
        }
      else if(this.monitorObjectTerrian =="addTerrianTargetPiont"){   
        this.getTargetPointTerrian(viewer) 
      }  
      else if (this.monitorObjectTerrian == "deleteResults") {
        viewer.entities.removeAll();  
      }
    },
    handleMonitorObjectChange(e) {
      this.monitorObject = e.target.value;
      if (this.monitorObject == "add3dObservePiont") {
        this.getObservePoint(viewer)
        }
       else if(this.monitorObject =="addViewTargetPiont"){  
        this.getTargetPoint(viewer)       
      }
      else if(this.monitorObject =="addVisualTargetPiont"){ 
        this.getVisualTargetPoint(viewer)
      }
      else if (this.monitorObject == "deleteResults") {
        viewer.entities.removeAll();
        
      }
    }
  }
};
</script>
<style scoped src="./css/index.css"></style>
