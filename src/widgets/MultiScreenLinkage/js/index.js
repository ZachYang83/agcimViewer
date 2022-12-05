import PickerHelper from "@/sdk/interactive/pickerHelper";
class Linkage {
    constructor() {
        this.handler = null;
        this.pickerHelper = null;
    }
    initialize(view2D, view3D) {
        let _t = this;
        _t.pickerHelper = new PickerHelper(view3D);
        //初始化定位 2D
        _t.sencePan(view2D, view3D);

        _t.pickerHelper.on("MOUSE_MOVE",  function () {
            _t.sencePan(view2D, view3D);
        });
        _t.pickerHelper.on("WHEEL", function () {
            _t.sencePan(view2D, view3D);
        });

        _t.handler = new Cesium.ScreenSpaceEventHandler(view2D.scene.canvas);
        _t.handler.setInputAction(function () {
            _t.mapPan(view2D, view3D);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        _t.handler.setInputAction(function () {
            _t.mapPan(view2D, view3D);
        }, Cesium.ScreenSpaceEventType.WHEEL);
    }
    mapPan(view2D, view3D) {
        let position = this.getCenter(view2D);
        if (position.lon) {
            let height = view2D.camera.positionCartographic.height;
            view3D.scene.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(position.lon, position.lat, height),
            });
        }
    }
    sencePan(view2D, view3D) { 
        let o = this.getCenter(view3D);
        if(o && o.caPosition){
            let distance = Cesium.Cartesian3.distance(
                o.caPosition,
                view3D.scene.camera.positionWC
            );
            view2D.scene.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(
                    o.lon,
                    o.lat,
                    distance
                ),
            });
        } 
    }
    getCenter(viewer) {
        var viewCenter = new Cesium.Cartesian2(
            Math.floor(viewer.canvas.clientWidth / 2),
            Math.floor(viewer.canvas.clientHeight / 2)
        );
        var caPosition = viewer.scene.camera.pickEllipsoid(viewCenter);
        if (Cesium.defined(caPosition)) {
            var cartographic = Cesium.Cartographic.fromCartesian(caPosition);
            var lon = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            return {
                caPosition: caPosition,
                lon: lon,
                lat: lat
            };
        }
    }
    dispose() {
        let _t = this;
        if (_t.handler) {
            _t.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            _t.handler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL);
        }
        _t.pickerHelper.off();
        CIM.view2D = null;
    }
}

export default new Linkage();