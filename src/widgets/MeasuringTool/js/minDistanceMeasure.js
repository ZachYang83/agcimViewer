import agMath from "@/sdk/maths/math";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import axiosWraper from "@/views/js/net/axiosWraper";
import AgPoint from "@/sdk/geometry/point";
import AgPolyline from "@/sdk/geometry/polyline";
import AgLabel from "@/sdk/geometry/label";
import AgBillboard from "@/sdk/geometry/billboard";
import picture from "../img/background.png";
var agFeatureLayer;
let selectedFeature = {
    feature: [],
    originalColor: [],
};

class MinDistanceMeasure {
    constructor() {
        this.viewer = null;
        this.pickerHelper = null;
        this.viewerContainer = null;
        agFeatureLayer = new AgFeatureLayer(CIM.viewer);
    }
    initialize(viewer, vm) {
        this.viewer = viewer;
        this.viewerContainer = this.viewer._element;
        this.pointArr = [];
        this.minDistance(vm);
    }
    //最小距离
    minDistance(vm) {
        let _this = this;
        let viewer = _this.viewer;
        let pointArr = [];
        // 取消双击事件-追踪该位置
        _this.pickerHelper = new PickerHelper(viewer);
        _this.pickerHelper.remove("LEFT_DOUBLE_CLICK");
        //改变鼠标指针样式
        _this.pickerHelper.setCursor("crosshair");
        _this.pickerHelper.on("LEFT_CLICK", function (movement) {
            let pickedFeature = _this.pickerHelper.getPickObject(movement.position);
            if (!pickedFeature || pickedFeature === selectedFeature.feature[0]) {
                return;
            }
            _this.setHighlighted(pickedFeature);
            let id = pickedFeature.getProperty("name");
            let modelMatrix = pickedFeature.tileset.root.computedTransform;
            _this.getProperty(id).then((res) => {
                if (!res.success) return;
                var data = res.content[0];
                let geometry = JSON.parse(data.geometry);
                let vertices = geometry.Vertices;//构件顶点
                let positions = _this.transLocalToWorld(vertices, modelMatrix);
                pointArr.push(positions);
                if (pointArr.length >= 2) {
                    _this.pickerHelper.off();
                    //鼠标指针设为默认
                    _this.pickerHelper.setCursor("default");
                    let result = _this.computeMinDistance(pointArr);
                    _this.drawPolyLinePrimitive(result.positions);
                    _this.drawPoint(result.positions[0]);
                    _this.drawPoint(result.positions[1]);
                    let midPoint = _this.getMidPoint(result.positions[0], result.positions[1]);
                    vm.minDistance = result.minDistance.toFixed(2);
                    _this.addLableEntity(midPoint, result.minDistance.toFixed(2));
                }
            });
        });
    }

    computeMinDistance(pointArr) {
        let positions = [];
        let minDistance = 999999999;
        for (let i = 0; i < pointArr[0].length; i++) {
            for (let j = 0; j < pointArr[1].length; j++) {
                let distance = agMath.getDistance(pointArr[0][i], pointArr[1][j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    positions[0] = pointArr[0][i];
                    positions[1] = pointArr[1][j];
                }
            }
        }
        return { positions, minDistance };
    }

    /**
     * 将局部坐标转换为世界坐标
     * @param {*} localPosition 局部坐标数组
     */
    transLocalToWorld(localPositions, modelMatrix) {
        let positions = [];
        for (let i = 0; i < localPositions.length; i++) {
            let position = CoordTrans.getWorldPosition(localPositions[i], modelMatrix);
            positions.push(position);
        }
        return positions;
    }
    /**
     * 获取两点中点坐标
     * @param {Cartesian3} p1 笛卡尔坐标
     * @param {Cartesian3} p2 笛卡尔坐标
     */
    getMidPoint(p1, p2) {
        let x = (p1.x + p2.x) / 2;
        let y = (p1.y + p2.y) / 2;
        let z = (p1.z + p2.z) / 2;
        let point = new Cesium.Cartesian3(x, y, z);
        return point;
    }
    /**
     * 添加文字标注
     * @param {Cartesian3} position 标注坐标
     * @param {string} text 标注文字
     */
    drawPoint(position) {
        var pointOpt = {
            color: Cesium.Color.NAVAJOWHITE,
        }
        var agPoint = new AgPoint("agPoint", position, pointOpt);
        agPoint.addToLayer(agFeatureLayer);
    }
    drawPolyLinePrimitive(positions) {
        var polylineOpt = {
            show: true,
            material: Cesium.Color.fromCssColorString('#f99d0d'),
            width: 3,
        }
        var polyline = new AgPolyline("agPolyline", positions, polylineOpt);
        polyline.addToLayer(agFeatureLayer);
        return polyline.agPolyline;
    }
    /**
     * 添加文字标注
     * @param {Cartesian3} position 标注坐标
     * @param {string} text 标注文字
     */
    addLableEntity(position, text) {
        var labelOpt = {
            font: "16px Helvetica",
            pixelOffset: new Cesium.Cartesian2(0, -12),
        };
        var label = new AgLabel("agLabel", position, text + "m", labelOpt);
        label.addToLayer(agFeatureLayer);
        var billboardOpt = {
            width: 85,
            height: 25,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }
        var billboard = new AgBillboard("agBillboard", position, picture, billboardOpt);
        billboard.addToLayer(agFeatureLayer);
    }
    setHighlighted(feature) {
        selectedFeature.feature.push(feature);
        selectedFeature.originalColor.push(Cesium.Color.clone(feature.color));
        feature.color = Cesium.Color.clone(Cesium.Color.YELLOW, feature.color);
    }
    cancelHighlighted() {
        if (selectedFeature.feature == 0) return;
        selectedFeature.feature[0].color = selectedFeature.originalColor[0];
        selectedFeature.feature[1].color = selectedFeature.originalColor[1];
        selectedFeature.feature = [];
        selectedFeature.originalColor = [];
    }
    async getProperty(id) {
        var sql = `objectid=${id}`;
        let data = await axiosWraper.getData(
            `/agsupport-rest/agsupport/BIM/dentitya/find?${sql}`
        );
        return data;
    }

    /**
     * 清除绘制
     */
    _clearDrawing() {
        agFeatureLayer.removeAll();
    }

    dispose() {
        this._clearDrawing();
        this.cancelHighlighted();
        //鼠标指针设为默认
        this.pickerHelper.setCursor("default");
        this.pickerHelper.off();
    }
}

export default new MinDistanceMeasure();