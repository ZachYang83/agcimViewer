class SimulatedFire {
    constructor() {
        this.viewer = null;
        this.entityFire = null;
        this._listeners = null;
    }
    initialize(option, viewer) {
        let _t = this;
        _t.viewer = viewer;
        // this._listeners = function () {
        //     let camPosition = viewer.camera.position;
        //     let distance = _t.getSpaceDistance(camPosition, option.staticPosition);
        //     if (distance < option.distance) {
        //         if (!_t.entityFire) {
        //             _t.on(option);
        //         } else {
        //             _t.entityFire.show = 1;
        //         }
        //     } else {
        //         if (_t.entityFire) {
        //             _t.entityFire.show = 0;
        //         }
        //     }
        // }
        // viewer.camera.changed.addEventListener(this._listeners); 
        _t.on(option);
    }
    /**
     * 着火效果
     * @param {object} o 火的参数 
     */
    on(o) {
        let viewer = this.viewer;
        viewer.showRenderLoopErrors = false;
        viewer.clock.shouldAnimate = true;

        let staticPosition = o.staticPosition || Cesium.Cartesian3.fromDegrees(
            113.37415040388001,
            23.106671779399736,
            35.33603121843157
        );
        let imageSize = o.imageSize || 55;

        function computeEmitterModelMatrix() {
            let hpr = Cesium.HeadingPitchRoll.fromDegrees(0, 0, 0);
            let trs = new Cesium.TranslationRotationScale();
            trs.translation = Cesium.Cartesian3.fromElements(0, 0, 0);
            trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr);
            let result = Cesium.Matrix4.fromTranslationRotationScale(trs);
            return result;
        }
        this.entityFire = viewer.scene.primitives.add(
            new Cesium.ParticleSystem({
                image: require("../img/fire.png"),
                startColor: Cesium.Color.RED.withAlpha(0.7),
                endColor: Cesium.Color.YELLOW.withAlpha(0.3),
                startScale: 0,
                endScale: 10,
                minimumParticleLife: 1,
                maximumParticleLife: 6,
                minimumSpeed: 1,
                maximumSpeed: 4,
                imageSize: new Cesium.Cartesian2(imageSize, imageSize),
                emissionRate: 4,
                lifetime: 160.0,
                emitter: new Cesium.CircleEmitter(2.0),
                modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
                    staticPosition
                ),
                emitterModelMatrix: computeEmitterModelMatrix(),
            })
        );
    }
    /**
     * 计算空间两点位置
     * @param {*} p1
     * @param {*} p2
     */
    getSpaceDistance(p1, p2) {
        var distance = 0;
        var point1cartographic = Cesium.Cartographic.fromCartesian(p1);
        var point2cartographic = Cesium.Cartographic.fromCartesian(p2);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
        distance = distance + s;
        return distance.toFixed(2);
    }
    /**
     * 移除火和相关事件
     */
    off() {
        if (this.entityFire) {
            this.viewer.scene.primitives.remove(this.entityFire);
            this.entityFire = null;
        }
        // this.viewer.camera.changed.removeEventListener(this._listeners);
    }
}

export default SimulatedFire;