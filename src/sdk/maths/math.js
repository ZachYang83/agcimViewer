import coordinate from "./coordinate"
import cartesian3Helper from "@/sdk/spatialAnalysis/cartesian3Helper";
/**
 * 数学计算相关的方法
 * @namespace Math
 */
class AgMath {

    /**
     * 获取2点的距离 (Math.getDistance).
     * @function getDistance
     * @memberof Math
     * @param {Number[]} fromPnt 起始点
     * @param {Number[]} toPnt 目标点
     */
    getDistance(fromPnt, toPnt) {
        if (Array.isArray(fromPnt)) {
            let x2 = Math.pow((toPnt[0] - fromPnt[0]), 2);
            let y2 = Math.pow((toPnt[1] - fromPnt[1]), 2);
            let z2 = Math.pow((toPnt[2] - fromPnt[2]), 2);
            let distance = Math.sqrt(x2 + y2 + z2);
            return distance
        } else {
            return Cesium.Cartesian3.distance(fromPnt, toPnt);
        }
        throw "不能识别的格式";
    }
    /**
     * 获得整段点的距离
     * @function getDistances
     * @memberof Math
     * @param {Number[]} points 连接线段上的点
     * @param {Number[]} [outSegmentDistances] 连接线段上每两点之间的距离
     */
    getDistances(points, outSegmentDistances) {
        outSegmentDistances = outSegmentDistances || [];
        var sumDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            var dis = this.getDistance(points[i], points[i + 1]);
            sumDistance += dis;
            outSegmentDistances.push(dis);
        }
        return sumDistance;
    }

    /**
     * 从给定的起始点和插值数量、中点高度计算折线拟合的弧段
     * @function _get3DArc
     * @memberof Math
     * @param {Number[]} fromPnt 平面起始点
     * @param {Number[]} toPnt 平面结束点
     * @param {Number} midHeight 中点需要架高的高度
     * @param {Number} count 中间插值数量，默认
     * @returns {Number[]} 返回插值完毕的count+2个点，数组一共(count+2)*3个值
     * @private
     */
    _get3DArc(fromPnt, toPnt, midHeight, count) {
        // 判断是否是二维数组
        if (fromPnt.length > 2 || toPnt.length > 2) {
            fromPnt = [fromPnt[0], fromPnt[1], 0]
            toPnt = [toPnt[0], toPnt[1], 0]
        }

        let resultArr = []
        if (count <= 0) {
            resultArr.push(...fromPnt, ...toPnt)
            return resultArr
        } else if (count === 1) {
            resultArr.push(...fromPnt, ...[(fromPnt[0] + toPnt[0]) / 2, (fromPnt[1] + toPnt[1]) / 2, midHeight], ...toPnt)
            return resultArr
        } else {
            resultArr = []
            resultArr.push(...fromPnt, 0)
            let midXYArr = this._getMidXY(fromPnt, toPnt, count)
            let midHeightArr = this._getMidH(midXYArr, midHeight, fromPnt, toPnt)

            // 按理说，midXYArr.lenght = 2 * count = 2 * midHeightArr.length
            for (let i = 0; i < count; i++) {
                resultArr.push(midXYArr[2 * i], midXYArr[2 * i + 1], midHeightArr[i])
            }

            resultArr.push(...toPnt, 0)
            return resultArr
        }
    }

    /**
     * 给定三点构造一条二次函数方程，拟合所有的中间点高度
     * @param {Number[]} midXYArr 
     * @param {Number} midHeight 
     * @returns {Number[]}
     * @private
     */
    _getMidH(midXYArr, midHeight) {
        let arr = []
        let firstP = [midXYArr[0], midXYArr[1]]
        let secondP = [midXYArr[2], midXYArr[3]]
        let midPntCount = midXYArr.length / 2
        let deltaDistance = this.getDistance(firstP, secondP)

        let midPnt = [],
            endPnt = []
        // 奇数个
        if (midPntCount % 2 === 1) {
            // 构造中点和结束点，计算二次函数表达式
            let midPntIndex = Math.floor(midPntCount / 2) + 1
            midPnt = [deltaDistance * midPntIndex, midHeight]
            endPnt = [deltaDistance * (midPntCount + 1), 0]

        } else { // 偶数个，midHeight要分给中间两个
            // 构造中点，计算二次函数表达式
            let midLeftPntX = deltaDistance * midPntCount / 2
            midPnt = [midLeftPntX + deltaDistance / 2, midHeight]
            endPnt = [deltaDistance * (midPntCount + 1), 0]
        }
        let _a = midHeight / (midPnt[0] * (midPnt[0] - endPnt[0])) // 计算二次函数二次项系数
        let fx = (x) => _a * x * x - _a * x * endPnt[0] // 二次函数方程

        for (let i = 0; i < midPntCount; i++) {
            let step = deltaDistance * (i + 1)
            let height = fx(step)
            arr.push(height) // 中间一共midPntCount项
        }

        return arr
    }

    /**
     * 获取两点中点坐标
     * @param {Cartesian3} point1 
     * @param {Cartesian3} point2 
     */
    computeMidPoint(point1, point2) {
        let midPoint = Cesium.Cartesian3.midpoint(point1, point2, new Cesium.Cartesian3(0, 0, 0));
        return midPoint;
    }
    /**
     * @param {Number[]} fromPnt 
     * @param {Number[]} toPnt 
     * @param {Number[]} count 
     * @private
     */
    _getMidXY(fromPnt, toPnt, count) {

        let arr = []
        let deltaX = (toPnt[0] - fromPnt[0]) / (count + 1),
            deltaY = (toPnt[1] - fromPnt[1]) / (count + 1)

        let baseX = fromPnt[0],
            baseY = fromPnt[1]

        for (let i = 0; i < count; i++) {
            arr.push(baseX + (i + 1) * deltaX, baseY + (i + 1) * deltaY)
        }

        return arr
    }

    /**
     * 点到直线的垂足点
     * @param {Cartesian3} point 
     * @param {Cartesian3} start 
     * @param {Cartesian3} end 
     */
    computeFootPoint(point, start, end) {
        point = coordinate.cartesian3ToCartographic(point, "Radians");
        start = coordinate.cartesian3ToCartographic(start, "Radians");
        end = coordinate.cartesian3ToCartographic(end, "Radians");
        var A = end.latitude - start.latitude;
        var B = start.longitude - end.longitude;
        var C = end.longitude * start.latitude - start.longitude * end.latitude;
        if (A * A + B * B < 1e-13) {
            return coordinate.cartographicToCartesian3(start); // start与end重叠
        } else if (Math.abs(A * point.longitude + B * point.latitude + C) < 1e-13) {
            return coordinate.cartographicToCartesian3(point); // point在直线上(start_end)
        } else {
            var longitude = (B * B * point.longitude - A * B * point.latitude - A * C) / (A * A + B * B);
            var latitude = (-A * B * point.longitude + A * A * point.latitude - B * C) / (A * A + B * B);
            var height = point.height;
            return coordinate.cartographicToCartesian3({
                longitude: longitude,
                latitude: latitude,
                height: height
            });
        }
    }
    /**
     * 连续路段
     * @param {*} linePath 
     * @private
     */
    getRoutingPath(linePath) {
        var items = [];
        var gotoIndex = 1;
        var lastPos = linePath.paths[0][0];
        while (true) {
            var isOk = false;
            var stepDis = 50;
            var pc = [0, 0];
            var dir = 180;
            while (isOk == false) {
                var p = linePath.paths[0][gotoIndex];
                var pe = lastPos;
                var dis = Math.sqrt((p[0] - pe[0]) * (p[0] - pe[0]) + (p[1] - pe[1]) * (p[1] - pe[1]));
                if (dis == 0) {
                    return items;
                }
                if (dis >= stepDis || gotoIndex == linePath.paths[0].length - 1) {
                    var t = (stepDis / dis);
                    t = t > 1 ? 1 : t;
                    pc[0] = t * (p[0] - pe[0]) + pe[0];
                    pc[1] = t * (p[1] - pe[1]) + pe[1];
                    isOk = true;
                    lastPos = pc;


                    dir = -Math.atan2(p[1] - pe[1], p[0] - pe[0]) * 180 / Math.PI + 90;
                    if (dir < 0)
                        dir = 360 + dir;
                    if (dir > 360)
                        dir = dir - 360;

                } else {
                    lastPos = p;
                    gotoIndex++;
                    if (gotoIndex >= linePath.paths[0].length) {
                        return items;
                    }
                    p = linePath.paths[0][gotoIndex];
                    stepDis -= 20;
                }
            }
            items.push({
                pos: pc,
                dir: dir
            })
        }
    }
    /**
     * @function getRoutingInterpolation
     * @memberof Math
     * 获得路径插值;
     * 支持高度插值
     * @private
     */
    getRoutingInterpolation(linePath, splitDistance) {
        splitDistance = splitDistance || 20;
        var items = [];
        var prevDistance = 0;
        for (var i = 1; i < linePath.length; i++) {
            var p = linePath[i];
            var pe = linePath[i - 1];
            var dis = Math.sqrt((p[0] - pe[0]) * (p[0] - pe[0]) + (p[1] - pe[1]) * (p[1] - pe[1]));
            var count = 1;
            var dir = 0;
            while (prevDistance + dis > splitDistance * count) {
                var leftDistance = splitDistance * count - prevDistance;
                var radio = leftDistance / dis;
                var np = {
                    x: p[0] * radio + pe[0] * (1 - radio),
                    y: p[1] * radio + pe[1] * (1 - radio),
                    z: 0
                }
                if (p[2] != undefined) {
                    np.z = p[2] * radio + pe[2] * (1 - radio)
                }
                dir = -Math.atan2(p[1] - pe[1], p[0] - pe[0]) * 180 / Math.PI + 90;
                items.push({
                    pos: np,
                    dir: dir,
                    index: i - 1
                })
                count++;
            }
            prevDistance += dis - splitDistance * (count - 1);
            if (i == linePath.length - 1) {
                var dir = -Math.atan2(p[1] - pe[1], p[0] - pe[0]) * 180 / Math.PI + 90;
                items.push({
                    pos: {
                        x: p[0],
                        y: p[1],
                        z: p[2] == undefined ? 0 : p[2]
                    },
                    dir: dir,
                    index: i
                })
            }
        }
        return items;

    }
    /**
     * 获得向量长度
     * @private
     */
    getLength(vec) {
        if (vec instanceof Array && vec.length > 0) {
            let sqr = 0;
            for (let i = 0; i < vec.length; i++) {
                sqr += vec[i] * vec[i];
            }
            return Math.sqrt(sqr);
        }
        if (vec instanceof Object) {
            let sqr = 0;
            if ('x' in vec)
                sqr += vec.x * vec.x;
            if ('y' in vec)
                sqr += vec.y * vec.y;
            if ('z' in vec)
                sqr += vec.z * vec.z;
            return Math.sqrt(sqr);
        }
        throw new Error('unrecognized vector');
    }

    /**
     * 计算三点之间角度(向量p2p1与向量p2p3)
     * @function computeAngle
     * @memberof Math
     * @param {cartesian3} p1 笛卡尔空间坐标
     * @param {cartesian3} p2 笛卡尔空间坐标
     * @param {cartesian3} p3 笛卡尔空间坐标
     * @return angle角度
     */
    computeAngle(p1, p2, p3) {
        var v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z }; //向量p2p1
        var v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z }; //向量p2p3
        var abs1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z); //向量p1p2的模
        var abs2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);//向量p2p3的模
        var d = (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z); //向量v1、v2的数量积
        var radians = Math.acos(d / (abs1 * abs2));
        var angle = radians * 180 / Math.PI;
        return angle ? angle : 0;
    }

    /**
     * 根据三点求得平面法向量
     * @function getNormalVector
     * @memberof Math
     * @param {*} p1 第一个点
     * @param {*} p2 第二个点
     * @param {*} p3 第三个点
     */
    getNormalVector(p1, p2, p3) {
        let x = ((p2.y - p1.y) * (p3.z - p1.z) - (p2.z - p1.z) * (p3.y - p1.y));
        let y = ((p2.z - p1.z) * (p3.x - p1.x) - (p2.x - p1.x) * (p3.z - p1.z));
        let z = ((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x));
        return new Cesium.Cartesian3(x, y, z);
    }
    /**
     * 求线面交点 线面平行返回undefined
     * @param planeVector 平面的法线向量
     * @param planePoint 平面经过的一点坐标
     * @param lineVector 直线的方向向量
     * @param linePoint 直线经过的一点坐标
     * @returns {Array}  返回交点坐标
     */
    _getLinePlaneIntersectionPoint(lineVector, linePoint, planeVector, planePoint) {
        let lvx = lineVector.x,
            lvy = lineVector.y,
            lvz = lineVector.z,
            lpx = linePoint.x,
            lpy = linePoint.y,
            lpz = linePoint.z,
            pvx = planeVector.x,
            pvy = planeVector.y,
            pvz = planeVector.z,
            ppx = planePoint.x,
            ppy = planePoint.y,
            ppz = planePoint.z;
        var k = lvx * pvx + lvy * pvy + lvz * pvz;
        let result = {};
        if (k === 0) {
            return undefined;
        } else {
            t = ((ppx - lpx) * pvx + (ppy - lpy) * pvy + (ppz - lpz) * pvz) / k;
            result.x = lpx + lvx * t;
            result.y = lpy + lvy * t;
            result.z = lpz + lvz * t;
        }
        return result;
    }

    /**
     * 直线和平面交点
     * @function getPointInPlane
     * @memberof Math
     * @param {*} line 直线点
     * @param {*} plane 多边形点集
     */
    getPointInPlane(line, plane) {
        var planeNVector = this.getNormalVector(plane[0], plane[1], plane[2]);
        let lineX = line[0].x - line[1].x;
        let lineY = line[0].y - line[1].y;
        let lineZ = line[0].z - line[1].z;
        let lineNVector = {
            "x": lineX,
            "y": lineY,
            "z": lineZ
        };
        let result = this._getLinePlaneIntersectionPoint(lineNVector, line[0], planeNVector, plane[0]);
        if (result) {
            return result;
        }
        return false;
    }

    /**
     * 两点间航向角
     * @function getHeading
     * @memberof Math
     * @param {*} pointA  Cartesian3
     * @param {*} pointB  Cartesian3
     */
    getHeading(pointA, pointB) {
        //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
        //向量AB
        const positionvector = Cesium.Cartesian3.subtract(
            pointB,
            pointA,
            new Cesium.Cartesian3()
        );
        //为什么需要使用逆矩阵还未弄清楚
        const vector = Cesium.Matrix4.multiplyByPointAsVector(
            Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()),
            positionvector,
            new Cesium.Cartesian3()
        );
        //归一化
        const direction = Cesium.Cartesian3.normalize(
            vector,
            new Cesium.Cartesian3()
        );
        //heading
        const heading =
            Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
        return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
    }

    /**
     * 两点间的俯仰角
     * @function getPitch
     * @memberof Math
     * @param {*} pointA  Cartesian3
     * @param {*} pointB  Cartesian3
     */
    getPitch(pointA, pointB) {
        let transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
        const vector = Cesium.Cartesian3.subtract(
            pointB,
            pointA,
            new Cesium.Cartesian3()
        );
        let direction = Cesium.Matrix4.multiplyByPointAsVector(
            Cesium.Matrix4.inverse(transfrom, transfrom),
            vector,
            vector
        );
        Cesium.Cartesian3.normalize(direction, direction);
        //因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
        return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
    }

    /**
    * 获取多边形面积
    * @param {array} positions //笛卡尔坐标数组
    * @param {String} unit //单位 kilometer平方千米，meter平方米
    * @return area面积
    */
    getArea(positions, unit = "kilometer") {
        let res = 0;
        //拆分三角曲面
        for (let i = 0; i < positions.length - 2; i++) {
            let j = (i + 1) % positions.length;
            let k = (i + 2) % positions.length;
            let totalAngle = this.computeAngle(positions[0], positions[j], positions[k]);
            let isR = this.judgeDirection([positions[0], positions[j], positions[k]]);
            if (isR) {
                totalAngle = 360 - totalAngle;
            }
            totalAngle = totalAngle * Math.PI / 180.0; //转换为弧度
            var dis_temp1 = this.getDistance(positions[0], positions[j]);
            var dis_temp2 = this.getDistance(positions[j], positions[k]);
            res += dis_temp1 * dis_temp2 * Math.sin(totalAngle) / 2;
        }
        switch (unit) {
            case "kilometer":
                return Math.abs(res / 1000000.0);
            case "meter":
                return Math.abs(res);
            default:
                return Math.abs(res / 1000000.0);
        }
    }

    /**
     * 获取两点之间的高度差
     * @param {*} positions 两个世界坐标点集合
     */
    getHeight(positions) {
        let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
        let cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
        let height_temp = cartographic1.height - cartographic.height;
        return Math.abs(height_temp);
    }

    /**
     * 判断绘制方向是否为逆时针
     * @param {Cartesian3} positions 
     */
    judgeDirection(positions) {
        var posArr = [];
        for (let i = 0; i < positions.length; i++) {
            var position = coordinate.cartesian3ToCartographic(
                positions[i],
                "Radians"
            );
            posArr.push(position);
        }
        var x1 = posArr[0].longitude;
        var y1 = posArr[0].latitude;
        var x2 = posArr[1].longitude;
        var y2 = posArr[1].latitude;
        var x3 = posArr[2].longitude;
        var y3 = posArr[2].latitude;
        var dirRes = (x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2);
        var isR = dirRes > 0;
        return isR;
    }

    /**
    * 计算线段交点
    * @param {Cartesian3[]} line1  线段的笛卡尔坐标数组
    * @param {Cartesian3[]} line2  线段的笛卡尔坐标数组
    * @param {Bool} includeExtend  是否计算延长线
    * @return {Cartesian3} 交点坐标
    */
    computeIntersectPoint(line1, line2, includeExtend) {
        let epsilon = 1e-9;
        let q1 = cartesian3Helper.subtract(line1[0], line1[1]);
        let q2 = cartesian3Helper.subtract(line2[0], line2[1]);
        let q3 = cartesian3Helper.subtract(line2[1], line1[1]);

        let t1 = q1.x * q2.y - q1.y * q2.x;
        let t2 = q1.x * q2.z - q1.z * q2.x;
        let t3 = q1.y * q2.z - q1.z * q2.y;
        let rmd1, rmd2;
        if (Math.abs(t1) > epsilon) {
            rmd1 = (q3.x * q2.y - q3.y * q2.x) / t1;
        } else if (Math.abs(t2) > epsilon) {
            rmd1 = (q3.x * q2.z - q3.z * q2.x) / t2;
        } else if (Math.abs(t3) > epsilon) {
            rmd1 = (q3.y * q2.z - q3.z * q2.y) / t3;
        } else {
            //两条线段重合
            return null;
        }
        if (Math.abs(q2.x) > epsilon)
            rmd2 = (rmd1 * q1.x - q3.x) / q2.x;
        else if (Math.abs(q2.y) > epsilon)
            rmd2 = (rmd1 * q1.y - q3.y) / q2.y;
        else
            rmd2 = (rmd1 * q1.z - q3.z) / q2.z;

        if (includeExtend == false && (rmd1 < 0 || rmd1 > 1 || rmd2 < 0 || rmd2 > 1))
            return null;
        if (Math.abs(rmd1) < epsilon)
            return line1[1];
        if (Math.abs(1 - rmd1) < epsilon)
            return line1[0];

        let rtv = cartesian3Helper.add(cartesian3Helper.multiplyByScalar(q1, rmd1), line1[1]);
        return rtv;
    }


    /**
    * 以某一点为原点，根据角度计算变换矩阵
    * @param {Cartesian3} origin   原点
    * @param {number} angle  z方向的旋转矩阵
    * @return {Matrix4} 4*4变换矩阵
    */
    computeTransformFromAngle(origin, angle) {
        var positionMatrax4 = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
        var positionMatrax3 = Cesium.Matrix4.getMatrix3(positionMatrax4, new Cesium.Matrix3);

        var rotation = Cesium.Matrix3.multiply(positionMatrax3, Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle)), new Cesium.Matrix3);
        var transform = Cesium.Matrix4.fromRotationTranslation(rotation, origin, new Cesium.Matrix4);

        return transform;
    }

    /**
    * 计算两点基于某个局部坐标系的偏移量 ，如计算基于某个3dtiles的局部坐标系x、y、z上的差值
    * @param {Matrix4} transform   4*4矩阵，如：tileset._root.computedTransform
    * @param {Cartesian3} point1  
    * @param {Cartesian3} point2  
    * @return {Cartesian3} 局部坐标系的偏移值
    */
    computePartOffset(transform, point1, point2) {
        var rotation = Cesium.Matrix4.getMatrix3(transform, new Cesium.Matrix3);
        var centerMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotation, point1, new Cesium.Matrix4);
        var inverseMatrix4 = Cesium.Matrix4.inverse(centerMatrix4, new Cesium.Matrix4);
        var resultMatrix = Cesium.Matrix4.fromRotationTranslation(rotation, point2, new Cesium.Matrix4)
        var offsetMatrix = Cesium.Matrix4.multiply(inverseMatrix4, resultMatrix, new Cesium.Matrix3);

        let offset = Cesium.Matrix4.getTranslation(offsetMatrix, new Cesium.Cartesian3);
        return offset;
    }

    /**
    * 计算3dtiles的旋转矩阵
    * @param {Cesium3DTileset} tileset  3dtiles
    * @return {Matrix3}  表示旋转的3*3矩阵
    */
    computeTilesetRotation(tileset) {
        var transform = tileset._root.computedTransform;
        //3dtiles的旋转矩阵
        var tileMatrix3 = Cesium.Matrix4.getMatrix3(transform, new Cesium.Matrix3);


        //当前经纬度下的旋转矩阵
        var positionMatrax4 = Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Matrix4.getTranslation(transform, new Cesium.Cartesian3)
        );
        var positionMatrax3 = Cesium.Matrix4.getMatrix3(positionMatrax4, new Cesium.Matrix3);

        //根据逆矩阵求所旋转的矩阵
        var inverseMatrix3 = Cesium.Matrix3.inverse(positionMatrax3, new Cesium.Matrix3);
        var rotation = Cesium.Matrix3.multiply(inverseMatrix3, tileMatrix3, new Cesium.Matrix3);

        return rotation;
    }
};

export default new AgMath();