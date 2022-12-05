import picture from "../img/label.png";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
var agFeatureLayer;
class AddLable {
  constructor() {
    this.viewer = null;
    this.data = [];
    agFeatureLayer = new AgFeatureLayer(CIM.viewer);
  }
  initialize(viewer) {
    this.viewer = viewer;
    this.data = require("../data/data.json");
    for (let i = 0; i < this.data.length; i++) {
      let x = this.data[i].position.x;
      let y = this.data[i].position.y;
      let z = this.data[i].position.z;
      var position = new Cesium.Cartesian3(x, y, z);
      var lable = agFeatureLayer.addEntity({
        position: position,
        billboard: {
          width: 168,
          height: 264,
          image: picture,
          // scale: 0.8,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.3),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          // pixelOffset: new Cesium.Cartesian2(100, 0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: this.data[i].name,
          font: "18px sans-serif",
          // pixelOffset: new Cesium.Cartesian2(145, -45),
          pixelOffset: new Cesium.Cartesian2(0, -110),
          pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.3),
          // scale: 0.5,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.3),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString("#2658d8"),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    }
  }

  dispose() {
    agFeatureLayer.removeAll();
  }
}

export default new AddLable();