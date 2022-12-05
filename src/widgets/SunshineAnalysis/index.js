import clock from "./js/clock"
var _this;
class SunshineSimulation {
    constructor() {
        this.viewer = null;
    }
    init(vm, viewer) {
        _this = this;
        _this.viewer = viewer;
        _this.mapActive(viewer);

        if (_this.clock) {
            clearInterval(_this.clock._interval);
            delete _this.clock;
        }
        _this.clock = new clock({
            el: "clock",
            hour: "timeHour",
            day: "timeDay",
            skin: require("./js/clock.svg"),
            time: new Date().getTime()
        });

        _this.clock.on("time-change", function (time) {
            vm.time = time;
            viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(time));
        });

    }
    updateTimebyEnvirment(vm) {
        _this.clock.mode = "manual";
        var setdate = Cesium.JulianDate.toDate(CIM.viewer.clock.currentTime);
        setdate.setMonth(vm.month - 1);
        setdate.setDate(vm.day);
        _this.clock.time = setdate.getTime();
        CIM.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date(setdate.getTime()));
    }
    mapActive(viewer) {
        viewer.scene.globe.enableLighting = true;
        viewer.shadows = true;
    }
    remove() {
        let viewer = this.viewer;
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
        if (_this.clock) {
            clearInterval(_this.clock._interval);
            delete _this.clock;
        }
        viewer.scene.globe.enableLighting = false;
        viewer.shadows = false;
    }
}
export default new SunshineSimulation()