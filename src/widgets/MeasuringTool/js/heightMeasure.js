import Draw from "@/sdk/interactive/draw";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import AgLabel from "@/sdk/geometry/label";
import AgBillboard from "@/sdk/geometry/billboard";
import picture from "../img/background.png";
var agFeatureLayer;

class HeightMeasure {
    constructor() {
        this.viewer = null;
        this.draw = null;
        agFeatureLayer = new AgFeatureLayer(CIM.viewer);
    }
    initialize(viewer, vm) {
        var _this = this;
        let heightImage = require("../img/height.png");
        _this.viewer = viewer;
        _this.draw = new Draw(viewer);
        _this.draw.drawPoint({
            show: false
        }).then(result => {
            var positions = result.positions;
            var cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
            var height = cartographic.height.toFixed(1);
            vm.height = height;
            var options = {
                distanceDisplayCondition: 100,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                pixelOffset: new Cesium.Cartesian2(25, -0),
                height: 20,
            };
            var billboard1 = new AgBillboard("agBillboard", positions[0], heightImage, options);
            billboard1.addToLayer(agFeatureLayer);
            var labelOpt = {
                font: "16px Helvetica",
                pixelOffset: new Cesium.Cartesian2(25, -37),
            };
            var label = new AgLabel("agLabel", positions[0], height + " m", labelOpt);
            label.addToLayer(agFeatureLayer);
            var billboardOpt = {
                width: 85,
                height: 25,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                pixelOffset: new Cesium.Cartesian2(25, -25),
            }
            var billboard2 = new AgBillboard("agBillboard", positions[0], picture, billboardOpt);
            billboard2.addToLayer(agFeatureLayer);
        }, error => {
            console.log(error);
        });

    }

    dispose() {
        agFeatureLayer.removeAll();
        this.draw.dispose();
    }
}

export default new HeightMeasure();