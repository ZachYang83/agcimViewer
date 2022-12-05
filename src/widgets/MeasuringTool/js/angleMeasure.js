import Draw from "@/sdk/interactive/draw";
import agMath from "@/sdk/maths/math";
import AgLabel from "@/sdk/geometry/label";
import AgBillboard from "@/sdk/geometry/billboard";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import picture from "../img/background.png";
var agFeatureLayer;
class AngleMeasure {
  constructor() {
    this.viewer = null;
    this.draw = null;
    agFeatureLayer = new AgFeatureLayer(CIM.viewer);
  }
  initialize(viewer, vm) {
    this.viewer = viewer;
    this.draw = new Draw(viewer);
    this.draw.drawPolyline({
      show: true,
      material: Cesium.Color.fromCssColorString('#f99d0d'),
      width: 2,
      pointCount: 3
    }).then(result => {
      var positions = result.positions;
      var angle = agMath.computeAngle(positions[0], positions[1], positions[2]).toFixed(2);
      vm.angle = angle;
      this.addLableEntity(positions[1], angle);
    }, error => {
      console.log(error);
    });
  }

  /**
   * 添加文字标注
   * @param {Cartesian3} position 标注坐标
   * @param {string} text 标注文字
   */
  addLableEntity(position, text) {
    text = text + "°";
    var labelOpt = {
      font: "16px Helvetica",
      pixelOffset: new Cesium.Cartesian2(0, -12),
    };
    var label = new AgLabel("agLabel", position, text, labelOpt);
    label.addToLayer(agFeatureLayer);
    var billboardOpt = {
      width: 85,
      height: 25,
    }
    var billboard = new AgBillboard("agBillboard", position, picture, billboardOpt);
    billboard.addToLayer(agFeatureLayer);
  }

  dispose() {
    agFeatureLayer.removeAll();
    this.draw.dispose();
  }
}

export default new AngleMeasure();