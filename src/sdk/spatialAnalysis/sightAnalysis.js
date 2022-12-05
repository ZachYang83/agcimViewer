/**
 * Class SightAnalysis 通视分析
 */
import AgFeatureLayer from "@/sdk/layer/featureLayer"
import AgPolyline from "@/sdk/geometry/polyline";
import agCoordinate from "@/sdk/maths/coordinate";
import agMath from "@/sdk/maths/math"

class SightAnalysis {
  constructor(viewer) {
    this.viewer = viewer;
    this.agRectangle = null;
    this.agFeatureLayer = new AgFeatureLayer(viewer);
  }
  /**
   * @description 射线求交分析
   * @param {object} options 通视分析相关参数  
   * @param {object} options.start 观察点笛卡尔坐标 
   * @param {object} options.end 目标点笛卡尔坐标
   * @param {object} options.limt 射线相交交点限制数量
   * @param {object} options.lineName 线名称，方便用来移除
   */
  analysis(options) {
    this.positions = [];
    this.startPoint = options.start;
    this.endPoint = options.end;
    this.lineName = options.lineName || ['agPolyline'];
    var limt = options.limt || 10;
    this.agRectangle = Cesium.Rectangle.fromCartesianArray([this.startPoint, this.endPoint]);//以观察点、目标点为对角创建矩形，判断矩形内是否有交点
    var startHeight = agCoordinate.Cartesian3_to_WGS84(this.startPoint).alt;
    var endHeight = agCoordinate.Cartesian3_to_WGS84(this.endPoint).alt;
    var ray, oriPoint, tarPoint;
    if (startHeight > endHeight) {
      oriPoint = this.endPoint;
      tarPoint = this.startPoint;
    } else {
      oriPoint = this.startPoint;
      tarPoint = this.endPoint;
    }
    var subtract = Cesium.Cartesian3.subtract(tarPoint, oriPoint, new Cesium.Cartesian3());
    var direction = Cesium.Cartesian3.normalize(subtract, new Cesium.Cartesian3());
    //创建射线
    ray = new Cesium.Ray(oriPoint, direction);
    //不进行交集计算的对象
    var objectsToExclude = [];
    //检查交集结果, 表示最多输出结果个数
    var result = this.viewer.scene.drillPickFromRay(ray, limt, objectsToExclude);
    for (let i = 0; i < result.length; i++) {
      if (!result[i].object)
        continue;
      var isContains = this._isContains(result[i].position);
      if (isContains) {
        var disToStart = agMath.getDistance(result[i].position, this.startPoint);
        var disToend = agMath.getDistance(result[i].position, this.endPoint);
        if (disToStart > 0.1 && disToend > 0.1) {
          this.positions.push(result[i].position);
        }
      }
    }
    this._showResult();
  }

  /**
   * @description 判断点是否在矩形内
   * @param {Cartesian3} position 笛卡尔坐标
   * @returns true/false
   * @memberof SightAnalysis
   * @private
   */
  _isContains(position) {
    if (!position)
      return false;
    position = Cesium.Cartographic.fromCartesian(position);
    let result = Cesium.Rectangle.contains(this.agRectangle, position);
    return result;
  }

  /**
   * @description 显示分析结果
   * @memberof SightAnalysis
   * @private
   */
  _showResult() {
    var optionsVisual = {
      width: 8,
      material: new Cesium.PolylineArrowMaterialProperty(
        Cesium.Color.GREEN
      ),
    }
    var optionsHides = {
      width: 8,
      material: new Cesium.PolylineArrowMaterialProperty(
        Cesium.Color.RED
      ),
    }
    //positions长度为0，无遮挡
    if (this.positions.length == 0) {
      var agPolyline = new AgPolyline(this.lineName.startName + 'to' + this.lineName.endName, [this.startPoint, this.endPoint], optionsVisual);
      agPolyline.addToLayer(this.agFeatureLayer);
    } else {
      var distance = Number.MAX_VALUE;
      //获取离观察点最近的点
      var nearPoint;
      for (let i = 0; i < this.positions.length; i++) {
        var dis = agMath.getDistance(this.positions[i], this.startPoint);
        if (dis < distance) {
          distance = dis;
          nearPoint = this.positions[i];
        }
      }
      var visualPolyline = new AgPolyline(this.lineName.startName + 'to' + this.lineName.endName, [this.startPoint, nearPoint], optionsVisual);
      visualPolyline.addToLayer(this.agFeatureLayer);
      var hidePolyline = new AgPolyline(this.lineName.startName + 'and' + this.lineName.endName, [nearPoint, this.endPoint], optionsHides);
      hidePolyline.addToLayer(this.agFeatureLayer);
    }
  }

  /**
   * @description 移除所有
   */
  remove() {
    this.agFeatureLayer.removeAll();
  }
}
export default SightAnalysis;