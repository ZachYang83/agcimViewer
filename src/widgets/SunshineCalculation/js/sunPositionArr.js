import coordinate from "@/sdk/maths/coordinate.js";
import PlantPointAxis from "./plantPoinAxis";
import Sun from "./sun";
import calSunAzEl from "./calSunAzEl"

class SunPositionArr {
    constructor() {
        this.sunDirection = [];
    }
    setCity(latitude, longitude) {
        this.lat = latitude;
        this.lng = longitude;
    }

    /**
     * @description: 获取每个时刻太阳光的方向
     * @param {*} sunshineDay 
     * @param {*} start 
     * @param {*} end 
     * @param {*} timer 
     * @param {*} modelMatrix 
     */
    getDirections(sunshineDay, start, end, timer, modelMatrix) {
        this.sunDirection.splice(0, this.sunDirection.length);
        this.sunshineDay = sunshineDay;

        var windowPos = {
            x: modelMatrix[12],
            y: modelMatrix[13],
            z: modelMatrix[14]
        };
        var windowPosition = coordinate.Cartesian3_to_WGS84(windowPos);

        var tmpDir = new Cesium.Cartesian3();

        while (this.compareDate(start, end)) {
            var sunLocation = this.getSunPotion(windowPosition, start);
            var sunDir = this.getDirection(windowPos, sunLocation, tmpDir);
            this.sunDirection.push(sunDir);
            var seconds = Date.parse(start);
            var totals = timer * 1000 + seconds;
            start = new Date(totals);
        }
    }

    /**
     * 转换为Cesium的射线
     * @param {xyz} targetPos 
     * @param {lla} sunLocation 
     */
    getDirection(targetPos, sunLocation, tmpC3) {
        var sunPos = coordinate.WGS84_to_Cartesian3(sunLocation);
        var sdir = new Cesium.Cartesian3();
        tmpC3 = Cesium.Cartesian3.subtract(sunPos, targetPos, tmpC3)
        var direction = Cesium.Cartesian3.normalize(tmpC3, sdir);
        return direction;
    }

    //比较两个时间大小
    compareDate(d1, d2) {
        let date1 = new Date(Date.parse(d1));
        let date2 = new Date(Date.parse(d2));
        return date1 < date2;
    }
    /**
     * @description: 获取当前位置下的太阳位置
     * @param {*} position 源目标位置
     * @param {*} time 当前时间
     * @return {*}
     */
    getSunPotion(position, time) {
        let lineLen = 2000;
        var ppa = new PlantPointAxis();
        var height = position.alt;
        var lat = position.lat;
        var lng = position.lng;

        ppa.setWorldPos(lat, lng, height);
        var sunAzEl = this.sunElevationandAzimuth(position, time);
        var elevation = sunAzEl.elevation;
        var azimuth = sunAzEl.azimuth;
        var asDeg = azimuth;
        asDeg = (90 - asDeg + 360) % 360;
        var p2L = ppa.rotate(azimuth, 90 - elevation, lineLen);
        var sunLacation_V = ppa.toLatLon(p2L);
        var sunLacation = {
            lat: sunLacation_V.X,
            lng: sunLacation_V.Y,
            alt: sunLacation_V.Z,
        };
        return sunLacation;
    }
    // 获取太阳高度角和方位角
    sunElevationandAzimuth2(time) {
        let _this = this;
        var currentYear = time.getFullYear().toString();
        var timeUTC = new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate()))
        var dayOfYear = Math.ceil((timeUTC - new Date(currentYear)) / 86400000);
        var b = ((360 * dayOfYear) / 365).toFixed(12);
        var sunLatitude = Sun.sunDirectLatitude(b); //太阳赤纬
        var elevation = Sun.sunElevation(
            _this.lng,
            _this.lat,
            sunLatitude,
            dayOfYear + 1,
            new Date(time)
        ); //太阳高度角
        var azimuth = Sun.sunAzimuth(
            _this.lng,
            _this.lat,
            sunLatitude,
            dayOfYear + 1,
            new Date(time)
        ); //太阳高度角
        console.log(elevation, azimuth, "高度角方位角");
        return [elevation, azimuth];
    }

    sunElevationandAzimuth(position, time) {
        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var date = time.getDate();
        var hour = time.getHours();
        var minutes = time.getMinutes();
        var sunAzEl = calSunAzEl(year, month, date, hour, minutes, 0, position.lat, position.lng, 8)
        return sunAzEl;
    }
}
export default new SunPositionArr();