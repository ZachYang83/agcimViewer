/**
 * class LineGrowth 待完善，暂是没用上
 */
class LineGrowth {
    constructor(viewer, points) {
        this.points = [];
        for (var i = 0; i < points.length; i++) {
            if (points[i] instanceof Cesium.Cartesian3) {
                this.points.push(points[i]);
            }
            else {
                var po = Cesium.Cartesian3.fromDegrees(points[i][0], points[i][1], 0);
                this.points.push(po);
            }
        }
        this._viewer = viewer;
        this._stopTime = null;
        this.entity = [];
        this._lastRoundTime = null;
        this._startTime = null;
        this._currentFakeTime = new Cesium.JulianDate();
    }
    start() {
        let viewer = this._viewer;
        let _this = this;
        var property = this.createSampleProperty(this.points);

        var positions = [];
        var material = Cesium.Color.fromBytes(10, 100, 200, 200);
        var line = viewer.entities.add({
            polyline: {
                name: "annimaPolyline",
                positions: new Cesium.CallbackProperty(function (time) {
                    if (!property.property) return null;
                    var position = null;
                    if (_this._lastRoundTime) {
                        _this._currentFakeTime = _this.getRoundTime(time, _this);
                        position = property.property.getValue(_this._currentFakeTime);
                    }
                    else {
                        position = property.property.getValue(time);
                    }
                    if (!position) {
                        _this._lastRoundTime = time.clone();
                        positions=[];
                        return positions;
                    }
                    else {
                        positions.push(position);
                        return positions
                    }
                }, false),
                width: 5,
                material: material
            }
        });
        this.entity.push(line);

        this.setRunTimeRange(viewer, property, 6000);
    }

    getRoundTime(time, _this) {
        return Cesium.JulianDate.addSeconds(_this._startTime, Cesium.JulianDate.secondsDifference(time, _this._lastRoundTime), _this._currentFakeTime);
    }
    setRunTimeRange(viewer, times) {
        let startTime = viewer.clock.currentTime;
        this._startTime = startTime;
        let stop = Cesium.JulianDate.addSeconds(startTime, times, new Cesium.JulianDate());
        viewer.clock.startTime = startTime.clone();
        viewer.clock.stopTime = stop.clone();
        //viewer.clock.currentTime = startTime;
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;// Loop at the end
        this._stopTime = stop;
        viewer.clock.shouldAnimate = true;
    }
    stop() {
        for (let i = 0; i < this.entity.length; i++) {
            this._viewer.entities.remove(this.entity[i]);
        }
    }

    createSampleProperty(positions) {
        var allDis = 0;
        for (var i = 0; i < positions.length - 1; i++) {
            var dis = Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
            allDis += dis;
        }
        var speed = 5000.0;

        var startTime = this._viewer.clock.currentTime;
        var property = new Cesium.SampledPositionProperty();
        var t = 0;
        for (var i = 1; i < positions.length; i++) {
            if (i == 1) {
                property.addSample(startTime, positions[i - 1]);
            }
            var dis = Cesium.Cartesian3.distance(positions[i], positions[i - 1]);
            var time = dis / speed;
            t += time;
            var julianDate = Cesium.JulianDate.addSeconds(startTime, t, new Cesium.JulianDate());
            property.addSample(julianDate, positions[i]);
        }
        return { property: property, startTime: startTime, allTime: allDis / speed };
    }
}
export default LineGrowth;