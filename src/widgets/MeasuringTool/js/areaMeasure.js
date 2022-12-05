import Draw from "@/sdk/interactive/draw";
import agMath from "@/sdk/maths/math";
import coordinate from "@/sdk/maths/coordinate";
import AgLabel from "@/sdk/geometry/label";
import AgBillboard from "@/sdk/geometry/billboard";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import picture from "../img/background.png";
var agFeatureLayer;

class AreaMeasure {
  constructor() {
    this.viewer = null;
    this.draw = null;
    agFeatureLayer = new AgFeatureLayer(CIM.viewer);
  }
  initialize(viewer, vm) {
    var _this = this;
    _this.viewer = viewer;
    _this.draw = new Draw(viewer);
    _this.draw.drawPolygon({ perPositionHeight: true }).then(result => {
      var positions = result.positions;
      var tempPoints = [];

      for (let i = 0; i < positions.length; i++) {
        var cartographic = coordinate.cartesian3ToCartographic(positions[i], "Degrees");
        tempPoints.push(cartographic);
      }
      var polygonHeight = tempPoints[0].alt;
      var area = agMath.getArea(positions);
      var textArea = area < 0.01 ? (area * 1000 * 1000).toFixed(1) + "m²" : area.toFixed(2) + "km²"
      vm.area = textArea;
      var lengths=0;
      for (let i = 0; i < positions.length-1; i++) {
        var lengthss =Math.sqrt( Math.pow((positions[i].x -positions[i + 1].x), 2) +  Math.pow((positions[i].y - positions[i + 1].y), 2)+  Math.pow((positions[i].z - positions[i + 1].z), 2));
        var lengths=lengthss+lengths;
      }
      console.log(lengths);
      var lent =Math.sqrt( Math.pow((positions[0].x -positions[positions.length-1].x), 2) +  Math.pow((positions[0].y - positions[positions.length-1].y), 2)+  Math.pow((positions[0].z - positions[positions.length-1].z), 2));
      var distances=lengths+lent;
      var distance =positions.length<3? 0 + "m": distances.toFixed(2) + "m"
      vm.lengths = distance;

      var polyCenter = _this._getPolygonCenter(result.entity);
      var labPosition = Cesium.Cartesian3.fromRadians(
        polyCenter.longitude,
        polyCenter.latitude,
        polygonHeight
      );
      var labelOpt = {
        font: "16px Helvetica",
        pixelOffset: new Cesium.Cartesian2(0, -12),
      };
      var label = new AgLabel("agLabel", labPosition, textArea, labelOpt);
      label.addToLayer(agFeatureLayer);
      var billboardOpt = {
        width: 85,
        height: 25,
      };
      var billboard = new AgBillboard("agBillboard", labPosition, picture, billboardOpt);
      billboard.addToLayer(agFeatureLayer);
    }, error => {
      console.log(error);
    });

  }

  /**
   * 获取多边形中心
   */
  _getPolygonCenter(entity) {
    var polyPositions = entity.polygon.hierarchy.getValue(
      Cesium.JulianDate.now()
    ).positions;
    var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
    polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
    polyCenter = Cesium.Cartographic.fromCartesian(polyCenter);
    return polyCenter;
  }

  dispose() {
    agFeatureLayer.removeAll();
    this.draw.dispose();
  }
}

export default new AreaMeasure();
