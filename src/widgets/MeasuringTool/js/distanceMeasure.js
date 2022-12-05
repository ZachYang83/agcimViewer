import Draw from "@/sdk/interactive/draw";
import agMath from "@/sdk/maths/math";
import AgPolyline from "@/sdk/geometry/polyline";
import AgLabel from "@/sdk/geometry/label";
import AgBillboard from "@/sdk/geometry/billboard";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import picture from "../img/background.png";
var agFeatureLayer;
class DistanceMeasure {
    constructor() {
        this.viewer = null;
        this.draw = null;
        agFeatureLayer = new AgFeatureLayer(CIM.viewer);
    }
    initialize(viewer, vm) {
        var _this = this;
        _this.viewer = viewer;
        _this.draw = new Draw(viewer);
        _this.draw.drawPolyline({
            show: true,
            material: Cesium.Color.fromCssColorString('#f99d0d'),
            width: 2,
        }).then(result => {
            var positions = result.positions;
            var tempPoint = _this.point_conf(positions);
            var height = agMath.getHeight(positions); //求出高度差
            var linearDistance = agMath.getDistance(positions[0], positions[1]);//直线距离
            var spaceDistance = agMath.getDistance(tempPoint, positions[1]);//空间距离
            var linearMidPoint = agMath.computeMidPoint(positions[0], positions[1]);
            var linearText = linearDistance.toFixed(2);
            vm.straightDistance = linearText;
            if (height > 0.5 && spaceDistance > 0.5) {
                var heightMidPoint = agMath.computeMidPoint(positions[0], tempPoint);
                var spaceMidPoint = agMath.computeMidPoint(positions[1], tempPoint);
                var styleHeight = new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.fromCssColorString('#7ccf21'),
                });
                var styleSpace = new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.fromCssColorString('#d52c40'),
                });
                var heightText = height.toFixed(2);
                var spaceText = spaceDistance.toFixed(2);
                vm.HorizontalDistance = spaceText;
                vm.verticalDistance = heightText;
                var agPolyline1 = new AgPolyline("agPolyline", [positions[0], tempPoint], { material: styleHeight });
                agPolyline1.addToLayer(agFeatureLayer);
                var agPolyline2 = new AgPolyline("agPolyline", [positions[1], tempPoint], { material: styleSpace });
                agPolyline2.addToLayer(agFeatureLayer);

                _this.addLableEntity(heightMidPoint, heightText);
                _this.addLableEntity(spaceMidPoint, spaceText);
                _this.addLableEntity(linearMidPoint, linearText);
            } else {
                _this.addLableEntity(linearMidPoint, linearText);
            }
        }, error => {
            console.log(error);
        });
    }

    /**
     * 三角测距计算第三点
     * @param {Array} positions 笛卡尔坐标数组
     */
    point_conf(positions) {
        let point_temp
        let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
        let cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
        point_temp = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), cartographic1.height);
        return point_temp;
    }


    /**
     * 添加文字标注
     * @param {Cartesian3} position 标注坐标
     * @param {string} text 标注文字
     */
    addLableEntity(position, text) {
        text = text + "m";
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

export default new DistanceMeasure();