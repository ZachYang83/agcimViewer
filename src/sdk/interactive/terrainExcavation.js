/**
 *  Class TerrainExcavation 地形开挖类
 */
import coordinate from "@/sdk/maths/coordinate";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import wallImg from "@/assets/img/sdk/interactive/side_min.jpg";
import bottomImg from "@/assets/img/sdk/interactive/bottom_min.jpg";
var agFeatureLayer;

class TerrainExcavation {
  constructor(viewer) {
    this.viewer = viewer;
    this.height = 0;
    this.excavateMinHeight = 9999;
    this.wellData = {};
    this.wellWall = null;
    this.bottomSurface = null;
    agFeatureLayer = new AgFeatureLayer(viewer);
  }

  /**
   * 添加地形开挖面
   * @param {array} points 逆时针方向笛卡尔坐标数组
   * @param {number} height 开挖深度，以米为单位
   */
  add(points, height) {
    this.height = height;
    var pointsLength = points.length;
    var clippingPlanes = []; // 存储ClippingPlane集合
    for (var i = 0; i < pointsLength; ++i) {
      var nextIndex = (i + 1) % pointsLength;
      var midpoint = Cesium.Cartesian3.add(points[i], points[nextIndex], new Cesium.Cartesian3());
      midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

      var cartographic = Cesium.Cartographic.fromCartesian(points[i]);
      var height = this.viewer.scene.globe.getHeight(cartographic) || cartographic.height;
      if (height < this.excavateMinHeight) {
        this.excavateMinHeight = height;
      }

      var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
      var right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
      right = Cesium.Cartesian3.normalize(right, right);

      var normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
      normal = Cesium.Cartesian3.normalize(normal, normal);

      var originCenteredPlane = new Cesium.Plane(normal, 0.0);
      var distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);

      clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
    }
    this.viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: clippingPlanes,
      edgeWidth: 1.0,
      edgeColor: Cesium.Color.WHITE,
      enabled: true,
    });

    this._prepareWell(points);

    this._createWell(this.wellData);
  }

  /**
   * 创建开挖面贴图相关数据
   * @param {object} points 
   * @private
   */
  _prepareWell(points) {
    var splitNum = 50; //点插值密度
    var pointsLength = points.length;
    if (pointsLength != 0) {
      var diffHeight = this.excavateMinHeight - this.height;
      var no_height_top = [];
      var bottom_pos = [];
      var lerp_pos = [];
      for (let i = 0; i < pointsLength; i++) {
        var u = i == pointsLength - 1 ? 0 : i + 1;
        var cartographic1 = Cesium.Cartographic.fromCartesian(points[i]);
        var cartographic2 = Cesium.Cartographic.fromCartesian(points[u]);
        var lon1 = cartographic1.longitude;
        var lat1 = cartographic1.latitude;
        var lon2 = cartographic2.longitude;
        var lat2 = cartographic2.latitude;

        if (i == 0) {
          lerp_pos.push(new Cesium.Cartographic(lon1, lat1));
          bottom_pos.push(Cesium.Cartesian3.fromRadians(lon1, lat1, diffHeight));
          no_height_top.push(Cesium.Cartesian3.fromRadians(lon1, lat1, 0));
        }
        for (var j = 1; j <= splitNum; j++) {
          var m = Cesium.Math.lerp(lon1, lon2, j / splitNum);
          var g = Cesium.Math.lerp(lat1, lat2, j / splitNum);
          lerp_pos.push(new Cesium.Cartographic(m, g));
          bottom_pos.push(Cesium.Cartesian3.fromRadians(m, g, diffHeight));
          no_height_top.push(Cesium.Cartesian3.fromRadians(m, g, 0));
        }
      }
      this.wellData = {
        lerp_pos: lerp_pos,
        bottom_pos: bottom_pos,
        no_height_top: no_height_top
      }
    }
  }

  /**
   * 创建开挖面贴图
   * @param {object} points 
   * @private
   */
  _createWell(wellData) {
    if (Boolean(this.viewer.terrainProvider._layers)) {
      var _this = this;
      this._createBottomSurface(wellData.bottom_pos);
      var promise = Cesium.sampleTerrainMostDetailed(_this.viewer.terrainProvider, wellData.lerp_pos);
      Cesium.when(promise, function (updatedPositions) {
        var positions = [];
        for (let i = 0; i < updatedPositions.length; i++) {
          var position = Cesium.Cartesian3.fromRadians(
            updatedPositions[i].longitude,
            updatedPositions[i].latitude,
            updatedPositions[i].height
          );
          positions.push(position);
        }
        _this._createWellWall(wellData.bottom_pos, positions)
      })
    } else {
      this._createBottomSurface(wellData.bottom_pos);
      this._createWellWall(wellData.bottom_pos, wellData.no_height_top)
    }
  }

  /**
   * 获取最小高度
   * @param {object} points 
   * @private
   */
  _getMinHeight(points) {
    let minHeight = 5000000;
    let minPoint = null;
    for (let i = 0; i < points.length; i++) {
      let height = points[i]['z'];
      if (height < minHeight) {
        minHeight = height;
        minPoint = coordinate.cartesian3ToCartographic(points[i], "Degrees");
      }
    }
    return minPoint.alt;
  }

  _createWellWall(bottom_pos, no_height_top) {
    let minHeight = this._getMinHeight(bottom_pos);
    let maxHeights = [];
    let minHeights = [];
    for (let i = 0; i < no_height_top.length; i++) {
      var alt = coordinate.cartesian3ToCartographic(no_height_top[i], "Degrees").alt;
      maxHeights.push(alt);
      minHeights.push(minHeight);
    }
    let wall = new Cesium.WallGeometry({
      positions: no_height_top,
      maximumHeights: maxHeights,
      minimumHeights: minHeights,
    });
    let geometry = Cesium.WallGeometry.createGeometry(wall);
    var material = new Cesium.Material({
      fabric: {
        type: "Image",
        uniforms: {
          image: wallImg
        }
      }
    });
    var appearance = new Cesium.MaterialAppearance({
      translucent: false,
      flat: true,
      material: material
    });
    this.wellWall = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREY)
        },
        id: "PitWall"
      }),
      appearance: appearance,
      asynchronous: false
    });
    agFeatureLayer.addPrimitive(this.wellWall);
  }

  _createBottomSurface(bottom_pos) {
    if (bottom_pos.length) {
      let minHeight = this._getMinHeight(bottom_pos);
      let positions = [];
      for (let i = 0; i < bottom_pos.length; i++) {
        let position = coordinate.cartesian3ToCartographic(bottom_pos[i], "Degrees");
        positions.push(position.lng);
        positions.push(position.lat);
        positions.push(minHeight);
      }
      let polygon = new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArrayHeights(positions)
        ),
        perPositionHeight: true
      });
      let geometry = Cesium.PolygonGeometry.createGeometry(polygon);
      var material = new Cesium.Material({
        fabric: {
          type: "Image",
          uniforms: {
            image: bottomImg
          }
        }
      });
      var appearance = new Cesium.MaterialAppearance({
        translucent: false,
        flat: true,
        material: material
      });
      this.bottomSurface = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: geometry
        }),
        appearance: appearance,
        asynchronous: false
      });
      agFeatureLayer.addPrimitive(this.bottomSurface);
    }
  }

  /**
   * 移除地形开挖面
   */
  remove() {
    if (this.viewer && this.viewer.scene.globe.clippingPlanes) {
      this.viewer.scene.globe.clippingPlanes.removeAll();
      agFeatureLayer.removeAll();
      this.viewer.scene.globe.clippingPlanes = undefined;
    }
  }

}
export default TerrainExcavation;