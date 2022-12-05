import Cartesian3 from "../../cesium/Source/Core/Cartesian3";

/**
 * 获取点集的最小凸包
 * @author 蔡周峻
 */
class GrahamScan {
    constructor() {
        this.anchorPoint = undefined;
        this.reverse = false;
        this.points = [];
    }

     /**
     * 添加点
     * @param {Cartesian3} point 点
     * @function addPoint
     * @memberof GrahamScan
     */
    addPoint(point) {
        //Check for a new anchor
        var newAnchor =
            (this.anchorPoint === undefined) ||
            (this.anchorPoint.y > point.y) ||
            (this.anchorPoint.y === point.y && this.anchorPoint.x > point.x);

        if (newAnchor) {
            if (this.anchorPoint !== undefined) {
                this.points.push(new Cesium.Cartesian3(this.anchorPoint.x, this.anchorPoint.y,this.anchorPoint.z));
            }
            this.anchorPoint = point;
        } else {
            this.points.push(point);
        }
    }

      /**
     * 获取凸包
     * @function getHull
     * @memberof GrahamScan
     * @return {Cartesian3[]} 多边形点数组 
     */
    getHull() {
        var hullPoints = [],
            points,
            pointsLength;

        this.reverse = this.points.every(function (point) {
            return (point.x < 0 && point.y < 0);
        });

        points = this._sortPoints();
        pointsLength = points.length;

        //If there are less than 3 points, joining these points creates a correct hull.
        if (pointsLength < 3) {
            points.unshift(this.anchorPoint);
            return points;
        }

        //move first two points to output array
        hullPoints.push(points.shift(), points.shift());

        //scan is repeated until no concave points are present.
        while (true) {
            var p0,
                p1,
                p2;

            hullPoints.push(points.shift());

            p0 = hullPoints[hullPoints.length - 3];
            p1 = hullPoints[hullPoints.length - 2];
            p2 = hullPoints[hullPoints.length - 1];

            if (this._checkPoints(p0, p1, p2)) {
                hullPoints.splice(hullPoints.length - 2, 1);
            }

            if (points.length == 0) {
                if (pointsLength == hullPoints.length) {
                    //check for duplicate anchorPoint edge-case, if not found, add the anchorpoint as the first item.
                    var ap = this.anchorPoint;
                    //remove any udefined elements in the hullPoints array.
                    hullPoints = hullPoints.filter(function (p) {
                        return !!p;
                    });
                    if (!hullPoints.some(function (p) {
                            return (p.x == ap.x && p.y == ap.y);
                        })) {
                        hullPoints.unshift(this.anchorPoint);
                    }
                    return hullPoints;
                }
                points = hullPoints;
                pointsLength = points.length;
                hullPoints = [];
                hullPoints.push(points.shift(), points.shift());
            }
        }
    }

    _findPolarAngle(a, b) {
        var ONE_RADIAN = 57.295779513082;
        var deltaX, deltaY;

        //if the points are undefined, return a zero difference angle.
        if (!a || !b) return 0;

        deltaX = (b.x - a.x);
        deltaY = (b.y - a.y);

        if (deltaX == 0 && deltaY == 0) {
            return 0;
        }

        var angle = Math.atan2(deltaY, deltaX) * ONE_RADIAN;

        if (this.reverse) {
            if (angle <= 0) {
                angle += 360;
            }
        } else {
            if (angle >= 0) {
                angle += 360;
            }
        }

        return angle;
    }
    _checkPoints(p0, p1, p2) {
        var difAngle;
        var cwAngle = this._findPolarAngle(p0, p1);
        var ccwAngle = this._findPolarAngle(p0, p2);

        if (cwAngle > ccwAngle) {

            difAngle = cwAngle - ccwAngle;

            return !(difAngle > 180);

        } else if (cwAngle < ccwAngle) {

            difAngle = ccwAngle - cwAngle;

            return (difAngle > 180);

        }

        return true;
    }
    _sortPoints() {
        var self = this;

        return this.points.sort(function (a, b) {
            var polarA = self._findPolarAngle(self.anchorPoint, a);
            var polarB = self._findPolarAngle(self.anchorPoint, b);

            if (polarA < polarB) {
                return -1;
            }
            if (polarA > polarB) {
                return 1;
            }

            return 0;
        });
    }
}
export default GrahamScan;