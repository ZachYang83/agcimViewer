/*
动态绘制工具-primitive
点位拾取的是对象表面
针对3d tiles数据坐标拾取、遮挡entity情况
*/


// import PrimitivePolyline from "./primitivePolyline.js";
var EllipseGeometryLibraryEx = (function () {
    var EllipseGeometryLibrary = {};

    var rotAxis = new Cesium.Cartesian3();
    var tempVec = new Cesium.Cartesian3();
    var unitQuat = new Cesium.Quaternion();
    var rotMtx = new Cesium.Matrix3();

    function pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, result) {
        var azimuth = theta + rotation;

        Cesium.Cartesian3.multiplyByScalar(eastVec, Math.cos(azimuth), rotAxis);
        Cesium.Cartesian3.multiplyByScalar(northVec, Math.sin(azimuth), tempVec);
        Cesium.Cartesian3.add(rotAxis, tempVec, rotAxis);

        var cosThetaSquared = Math.cos(theta);
        cosThetaSquared = cosThetaSquared * cosThetaSquared;

        var sinThetaSquared = Math.sin(theta);
        sinThetaSquared = sinThetaSquared * sinThetaSquared;

        var radius = ab / Math.sqrt(bSqr * cosThetaSquared + aSqr * sinThetaSquared);
        var angle = radius / mag;

        // Create the quaternion to rotate the position vector to the boundary of the ellipse.
        Cesium.Quaternion.fromAxisAngle(rotAxis, angle, unitQuat);
        Cesium.Matrix3.fromQuaternion(unitQuat, rotMtx);

        Cesium.Matrix3.multiplyByVector(rotMtx, unitPos, result);
        Cesium.Cartesian3.normalize(result, result);
        Cesium.Cartesian3.multiplyByScalar(result, mag, result);
        return result;
    }

    var scratchCartesian1 = new Cesium.Cartesian3();
    var scratchCartesian2 = new Cesium.Cartesian3();
    var scratchCartesian3 = new Cesium.Cartesian3();
    var scratchNormal = new Cesium.Cartesian3();
    /**
     * Returns the positions raised to the given heights
     * @private
     */
    EllipseGeometryLibrary.raisePositionsToHeight = function (positions, options, extrude) {
        var ellipsoid = options.ellipsoid;
        var height = options.height;
        var extrudedHeight = options.extrudedHeight;
        var size = (extrude) ? positions.length / 3 * 2 : positions.length / 3;

        var finalPositions = new Float64Array(size * 3);

        var length = positions.length;
        var bottomOffset = (extrude) ? length : 0;
        for (var i = 0; i < length; i += 3) {
            var i1 = i + 1;
            var i2 = i + 2;

            var position = Cesium.Cartesian3.fromArray(positions, i, scratchCartesian1);
            ellipsoid.scaleToGeodeticSurface(position, position);

            var extrudedPosition = Cesium.Cartesian3.clone(position, scratchCartesian2);
            var normal = ellipsoid.geodeticSurfaceNormal(position, scratchNormal);
            var scaledNormal = Cesium.Cartesian3.multiplyByScalar(normal, height, scratchCartesian3);
            Cesium.Cartesian3.add(position, scaledNormal, position);

            if (extrude) {
                Cesium.Cartesian3.multiplyByScalar(normal, extrudedHeight, scaledNormal);
                Cesium.Cartesian3.add(extrudedPosition, scaledNormal, extrudedPosition);

                finalPositions[i + bottomOffset] = extrudedPosition.x;
                finalPositions[i1 + bottomOffset] = extrudedPosition.y;
                finalPositions[i2 + bottomOffset] = extrudedPosition.z;
            }

            finalPositions[i] = position.x;
            finalPositions[i1] = position.y;
            finalPositions[i2] = position.z;
        }

        return finalPositions;
    };

    var unitPosScratch = new Cesium.Cartesian3();
    var eastVecScratch = new Cesium.Cartesian3();
    var northVecScratch = new Cesium.Cartesian3();
    /**
     * options.semiMinorAxis：短半轴
     * options.semiMajorAxis：长半轴
     * options.rotation：旋转角度 弧度
     * options.center：中心点 笛卡尔坐标
     * options.granularity：粒度 弧度
       addFillPositions：是否插值
       addEdgePositions：是否添加端点
     * Returns an array of positions that make up the ellipse.
     * @private
     */
    EllipseGeometryLibrary.computeEllipsePositions = function (options, addEdgePositions) {
        var semiMinorAxis = options.semiMinorAxis;
        var semiMajorAxis = options.semiMajorAxis;
        var rotation = options.rotation;//法线
        var center = options.center;

        // Computing the arc-length of the ellipse is too expensive to be practical. Estimating it using the
        // arc length of the sphere is too inaccurate and creates sharp edges when either the semi-major or
        // semi-minor axis is much bigger than the other. Instead, scale the angle delta to make
        // the distance along the ellipse boundary more closely match the granularity.
        var granularity = options.granularity && (typeof options.granularity === "number") ? options.granularity : (Math.PI /180.0);// 角度间隔
        if (granularity > Math.PI / 12.0) { granularity = Math.PI / 12.0; }//最小分24
        if (granularity < Math.PI / 180.0) { granularity = Math.PI / 180.0; }//最大分360
        var aSqr = semiMinorAxis * semiMinorAxis;
        var bSqr = semiMajorAxis * semiMajorAxis;
        var ab = semiMajorAxis * semiMinorAxis;

        var mag = Cesium.Cartesian3.magnitude(center);//模

        var unitPos = Cesium.Cartesian3.normalize(center, unitPosScratch);
        var eastVec = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, center, eastVecScratch);
        eastVec = Cesium.Cartesian3.normalize(eastVec, eastVec);
        var northVec = Cesium.Cartesian3.cross(unitPos, eastVec, northVecScratch);

        // The number of points in the first quadrant 第一象限点数
        var numPts = 1 + Math.ceil(Cesium.Math.PI_OVER_TWO / granularity);

        var deltaTheta = Cesium.Math.PI_OVER_TWO / (numPts - 1);
        var theta = Cesium.Math.PI_OVER_TWO - numPts * deltaTheta;
        if (theta < 0.0) {
            numPts -= Math.ceil(Math.abs(theta) / deltaTheta);
        }

        // If the number of points were three, the ellipse
        // would be tessellated like below:
        //
        //         *---*
        //       / | \ | \
        //     *---*---*---*
        //   / | \ | \ | \ | \
        //  / .*---*---*---*. \
        // * ` | \ | \ | \ | `*
        //  \`.*---*---*---*.`/
        //   \ | \ | \ | \ | /
        //     *---*---*---*
        //       \ | \ | /
        //         *---*
        // The first and last column have one position and fan to connect to the adjacent column.
        // Each other vertical column contains an even number of positions.
        //var size = 2 * (numPts * (numPts + 2));
        //var positions = (addFillPositions) ? new Array(size * 3) : undefined;

        //var positions = (addFillPositions) ? new Array((numPts+1) * 3) : undefined;
        //var positionsdown = (addFillPositions) ? new Array((numPts + 1) * 3) : undefined;
        var positions =  new Array((numPts + 1) * 3);
        var positionsdown =  new Array((numPts + 1) * 3);

        var positionIndex = 0;
        var positionsdownIndex = 0;
        var position = scratchCartesian1;
        var reflectedPosition = scratchCartesian2;

        var outerPositionsLength = (numPts * 4) * 3;
        var outerRightIndex = outerPositionsLength - 1;
        var outerLeftIndex = 0;
        var outerPositions = (addEdgePositions) ? new Array(outerPositionsLength) : undefined;

        var i;
        var j;
        var numInterior;
        var t;
        var interiorPosition;

        // Compute points in the 'eastern' half of the ellipse 
        theta = Cesium.Math.PI_OVER_TWO;
        position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
        //起点 加到positions
        //if (addFillPositions) {
            positions[positionIndex++] = position.x;
            positions[positionIndex++] = position.y;
            positions[positionIndex++] = position.z;
        //}
        if (addEdgePositions) {
            outerPositions[outerRightIndex--] = position.z;
            outerPositions[outerRightIndex--] = position.y;
            outerPositions[outerRightIndex--] = position.x;
        }

        theta = Cesium.Math.PI_OVER_TWO - deltaTheta;
        for (i = 1; i < numPts + 1; ++i) {
            position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
            reflectedPosition = pointOnEllipsoid(Math.PI - theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, reflectedPosition);

            //if (addFillPositions) {
                //下半段
                //positions[positionIndex++] = position.x;
                //positions[positionIndex++] = position.y;
                //positions[positionIndex++] = position.z;
                positionsdown[positionsdownIndex++] = position.x;
                positionsdown[positionsdownIndex++] = position.y;
                positionsdown[positionsdownIndex++] = position.z;

                //中间线插值 画弧线不需要
                //numInterior = 2 * i + 2;
                //for (j = 1; j < numInterior - 1; ++j) {
                //    t = j / (numInterior - 1);
                //    interiorPosition = Cesium.Cartesian3.lerp(position, reflectedPosition, t, scratchCartesian3);
                //    positions[positionIndex++] = interiorPosition.x;
                //    positions[positionIndex++] = interiorPosition.y;
                //    positions[positionIndex++] = interiorPosition.z;
                //}

                //上半段
                positions[positionIndex++] = reflectedPosition.x;
                positions[positionIndex++] = reflectedPosition.y;
                positions[positionIndex++] = reflectedPosition.z;
            //}

            if (addEdgePositions) {
                outerPositions[outerRightIndex--] = position.z;
                outerPositions[outerRightIndex--] = position.y;
                outerPositions[outerRightIndex--] = position.x;
                outerPositions[outerLeftIndex++] = reflectedPosition.x;
                outerPositions[outerLeftIndex++] = reflectedPosition.y;
                outerPositions[outerLeftIndex++] = reflectedPosition.z;
            }

            theta = Cesium.Math.PI_OVER_TWO - (i + 1) * deltaTheta;
        }

        // Compute points in the 'western' half of the ellipse
        for (i = numPts; i > 1; --i) {
            theta = Cesium.Math.PI_OVER_TWO - (i - 1) * deltaTheta;

            position = pointOnEllipsoid(-theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
            reflectedPosition = pointOnEllipsoid(theta + Math.PI, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, reflectedPosition);

            //if (addFillPositions) {
                //下半段
                //positions[positionIndex++] = position.x;
                //positions[positionIndex++] = position.y;
                //positions[positionIndex++] = position.z;
                positionsdown[positionsdownIndex++] = position.x;
                positionsdown[positionsdownIndex++] = position.y;
                positionsdown[positionsdownIndex++] = position.z;

                //中间线插值 画弧线不需要
                //numInterior = 2 * (i - 1) + 2;
                //for (j = 1; j < numInterior - 1; ++j) {
                //    t = j / (numInterior - 1);
                //    interiorPosition = Cesium.Cartesian3.lerp(position, reflectedPosition, t, scratchCartesian3);
                //    positions[positionIndex++] = interiorPosition.x;
                //    positions[positionIndex++] = interiorPosition.y;
                //    positions[positionIndex++] = interiorPosition.z;
                //}

                //上半段
                positions[positionIndex++] = reflectedPosition.x;
                positions[positionIndex++] = reflectedPosition.y;
                positions[positionIndex++] = reflectedPosition.z;
            //}

            if (addEdgePositions) {
                outerPositions[outerRightIndex--] = position.z;
                outerPositions[outerRightIndex--] = position.y;
                outerPositions[outerRightIndex--] = position.x;
                outerPositions[outerLeftIndex++] = reflectedPosition.x;
                outerPositions[outerLeftIndex++] = reflectedPosition.y;
                outerPositions[outerLeftIndex++] = reflectedPosition.z;
            }
        }

        theta = Cesium.Math.PI_OVER_TWO;
        position = pointOnEllipsoid(-theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);

        var r = {};
        //终点 加到positiondown
        //if (addFillPositions) {
            //positions[positionIndex++] = position.x;
            //positions[positionIndex++] = position.y;
            //positions[positionIndex++] = position.z;
            positionsdown[positionsdownIndex++] = position.x;
            positionsdown[positionsdownIndex++] = position.y;
            positionsdown[positionsdownIndex++] = position.z;

            r.positions = positions;
            r.positionsdown = positionsdown;
            r.numPts = numPts;
        //}
        if (addEdgePositions) {
            outerPositions[outerRightIndex--] = position.z;
            outerPositions[outerRightIndex--] = position.y;
            outerPositions[outerRightIndex--] = position.x;
            r.outerPositions = outerPositions;
        }

        return r;
    };

    /**
    * options.semiMinorAxis：短半轴
    * options.semiMajorAxis：长半轴
    * options.rotation：旋转角度 弧度
    * options.center：中心点 笛卡尔坐标
    * options.granularity：粒度 弧度
    * Returns an array of positions that make up the ellipse.
    * @private
    */
    EllipseGeometryLibrary.computeEllipseEdgePositions = function (options) {
        var semiMinorAxis = options.semiMinorAxis;
        var semiMajorAxis = options.semiMajorAxis;
        var rotation = options.rotation;//法线
        var center = options.center;
        var granularity = options.granularity && (typeof options.granularity === "number") ? options.granularity : (Math.PI / 180.0);// 角度间隔
        if (granularity > Math.PI / 12.0) { granularity = Math.PI / 12.0; }//最小分24
        if (granularity < Math.PI / 180.0) { granularity = Math.PI / 180.0; }//最大分360
        var aSqr = semiMinorAxis * semiMinorAxis;
        var bSqr = semiMajorAxis * semiMajorAxis;
        var ab = semiMajorAxis * semiMinorAxis;
        var mag = Cesium.Cartesian3.magnitude(center);//
        var unitPos = Cesium.Cartesian3.normalize(center, unitPosScratch);
        var eastVec = Cesium.Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, center, eastVecScratch);
        eastVec = Cesium.Cartesian3.normalize(eastVec, eastVec);
        var northVec = Cesium.Cartesian3.cross(unitPos, eastVec, northVecScratch);
        var numPts = Math.ceil(Cesium.Math.PI*2 / granularity);
        var deltaTheta = granularity;
        var theta = 0;
        
        var position = scratchCartesian1;
        var i;
        var outerIndex = 0;
        var outerPositions = [];
        for (i = 0; i < numPts; i++) {
            theta = i * deltaTheta;
            position = pointOnEllipsoid(theta, rotation, northVec, eastVec, aSqr, ab, bSqr, mag, unitPos, position);
            
            outerPositions[outerIndex++] = position.x;
            outerPositions[outerIndex++] = position.y;
            outerPositions[outerIndex++] = position.z;
        }

        var r = {};
        r.numPts = numPts;
        r.outerPositions = outerPositions;
        return r;
    };
    return EllipseGeometryLibrary;
})();

﻿/*
  绘制椭圆
  当a=b时是圆（笛卡尔坐标系下正圆）
*/
var PrimitiveEllipse = (
    function () {
        var positionArr = [];
        var colorArr = [];
        var indiceArr = [];
        var vertexShader;
        var fragmentShader;
        var geometry;
        var appearance;
        var viewer;
        var ellipsoid = Cesium.Ellipsoid.WGS84;
        function _(options) {
            viewer = options.viewer;
            vertexShader = VSPolylie();
            fragmentShader = FSPolyline(); //Cartographic  Cartesian
            if (options.center) {

                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                var height = options.height ? options.height:0 ;
                var slices = options.slices && options.slices >= 36 ? options.slices : 360;// 
                var semiMinorAxis = options.semiMinorAxis;
                var semiMajorAxis = options.semiMajorAxis;
                var rotation = Cesium.Math.toRadians(options.rotation);
                var eopt = {};
                eopt.semiMinorAxis = semiMinorAxis;
                eopt.semiMajorAxis = semiMajorAxis;
                eopt.rotation = rotation;
                eopt.center = Cesium.Cartesian3.fromRadians(options.center.longitude, options.center.latitude, height);
                eopt.granularity = Math.PI * 2.0 / parseFloat(slices);
                var ellipse = EllipseGeometryLibraryEx.computeEllipsePositions(eopt, false);
                var raiseopt={};
                raiseopt.ellipsoid=ellipsoid;
                raiseopt.height=height;
                raiseopt.extrudedHeight=0;

                ellipse.positions = EllipseGeometryLibraryEx.raisePositionsToHeight(ellipse.positions, raiseopt, false);
                ellipse.positionsdown = EllipseGeometryLibraryEx.raisePositionsToHeight(ellipse.positionsdown, raiseopt, false);
                //上半部
                for (var i = 0; i < ellipse.positions.length; i = i + 3) {
                    postionsTemp.push(ellipse.positions[i]);
                    postionsTemp.push(ellipse.positions[i + 1]);
                    postionsTemp.push(ellipse.positions[i + 2]);

                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = 1; i < ellipse.positions.length / 3; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                //下半部
                for (var i = 0; i < ellipse.positionsdown.length; i = i + 3) {
                    postionsTemp.push(ellipse.positionsdown[i]);
                    postionsTemp.push(ellipse.positionsdown[i + 1]);
                    postionsTemp.push(ellipse.positionsdown[i + 2]);

                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = ellipse.positions.length / 3 +1; i < ellipse.positionsdown.length*2 / 3; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                //接边缝隙
                //右缝隙
                indicesTesm.push(0);
                indicesTesm.push(ellipse.positions.length / 3);
                //左缝隙
                indicesTesm.push(ellipse.positions.length / 3-1);
                indicesTesm.push(ellipse.positionsdown.length * 2 / 3 -1);

                positionArr = new Float64Array(postionsTemp);
                colorArr = new Float32Array(colorsTemp);
                indiceArr = new Uint16Array(indicesTesm);

            } else {//if (options.CartographicCenter && options.CartographicPoint) {
                var p1 = Cesium.Cartesian3.fromDegrees(0, 0, -10);
                var p2 = Cesium.Cartesian3.fromDegrees(0, 0.001, -10);
                positionArr = new Float64Array([
                    p1.x, p1.y, p1.z,
                    p2.x, p2.y, p2.z
                ]);
                colorArr = new Float32Array([
                         0.0, 0.0, 1.0, 1.0,
                         0.0, 0.0, 1.0, 1.0
                ]);
                indiceArr = new Uint16Array([0, 1]);
            }

            geometry = CreateGeometry(positionArr, colorArr, indiceArr);
            appearance = CreateAppearence(fragmentShader, vertexShader);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geometry
                }),
                appearance: appearance,
                asynchronous: false
            }));
        }

        function CreateGeometry(positions, colors, indices) {
            return new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    color: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 4,
                        values: colors
                    })
                },
                indices: indices,
                primitiveType: Cesium.PrimitiveType.LINES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            });
        }

        function CreateAppearence(fs, vs) {
            return new Cesium.Appearance({
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,  //混合
                    depthTest: { enabled: true }, //深度测试
                    depthMask: true
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
        }

        function VSPolylie() {
            return "attribute vec3 position3DHigh;\
            attribute vec3 position3DLow;\
            attribute vec4 color;\
            varying vec4 v_color;\
            attribute float batchId;\
            void main()\
            {\
                vec4 p = czm_computePosition();\
                v_color =color;\
                p = czm_modelViewProjectionRelativeToEye * p;\
                gl_Position = p;\
                gl_PointSize=10.0;\
            }\
            ";
        }
        function FSPolyline() {
            return "varying vec4 v_color;\
            void main()\
            {\
                gl_FragColor =v_color;\
            }\
            ";
        }

        _.prototype.remove = function () {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                this.primitive = null;
            }
        }

        _.prototype.updatePosition = function (options) {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                //primitive = null;
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                var height = options.height ? options.height : 0;
                var slices = options.slices && options.slices >= 36 ? options.slices : 360;//默认72
                var semiMinorAxis = options.semiMinorAxis;
                var semiMajorAxis = options.semiMajorAxis;
                var rotation = Cesium.Math.toRadians(options.rotation);
                var eopt = {};
                eopt.semiMinorAxis = semiMinorAxis;
                eopt.semiMajorAxis = semiMajorAxis;
                eopt.rotation = rotation;
                eopt.center = Cesium.Cartesian3.fromRadians(options.center.longitude, options.center.latitude, height);
                eopt.granularity = Math.PI * 2.0 / parseFloat(slices);
                var ellipse = EllipseGeometryLibraryEx.computeEllipsePositions(eopt, false);

                var raiseopt = {};
                raiseopt.ellipsoid = ellipsoid;
                raiseopt.height = height;
                raiseopt.extrudedHeight = 0;

                ellipse.positions = EllipseGeometryLibraryEx.raisePositionsToHeight(ellipse.positions, raiseopt, false);
                ellipse.positionsdown = EllipseGeometryLibraryEx.raisePositionsToHeight(ellipse.positionsdown, raiseopt, false);
                //上半部
                for (var i = 0; i < ellipse.positions.length; i = i + 3) {
                    postionsTemp.push(ellipse.positions[i]);
                    postionsTemp.push(ellipse.positions[i + 1]);
                    postionsTemp.push(ellipse.positions[i + 2]);

                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = 1; i < ellipse.positions.length / 3; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                //下半部
                for (var i = 0; i < ellipse.positionsdown.length; i = i + 3) {
                    postionsTemp.push(ellipse.positionsdown[i]);
                    postionsTemp.push(ellipse.positionsdown[i + 1]);
                    postionsTemp.push(ellipse.positionsdown[i + 2]);

                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = ellipse.positions.length / 3 + 1; i < ellipse.positionsdown.length * 2 / 3; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                //接边缝隙
                //右缝隙
                indicesTesm.push(0);
                indicesTesm.push(ellipse.positions.length / 3);
                //左缝隙
                indicesTesm.push(ellipse.positions.length / 3 - 1);
                indicesTesm.push(ellipse.positionsdown.length * 2 / 3 - 1);

                positionArr = new Float64Array(postionsTemp);
                colorArr = new Float32Array(colorsTemp);
                indiceArr = new Uint16Array(indicesTesm);
                geometry = CreateGeometry(positionArr, colorArr, indiceArr);

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry
                    }),
                    appearance: appearance,
                    asynchronous: false
                }));
            } else { return; }
        }
         
        return _;
    })();

//封装PrimitivePolyline
var PrimitivePolyline=(
    function () {
        var vertexShader;
        var fragmentShader;
        //var geometry;
        //var appearance;
        var viewer;
        function _(options) {
            viewer = options.viewer;
            vertexShader = getVS();
            fragmentShader = getFS();
            if (options.Cartesians && options.Cartesians.length >= 2) {
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                if (options.Colors && options.Colors.length === options.Cartesians.length * 4) {
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        postionsTemp.push(options.Cartesians[i].x);
                        postionsTemp.push(options.Cartesians[i].y);
                        postionsTemp.push(options.Cartesians[i].z);
                    }
                    colorsTemp = options.Colors;
                } else {
                    for (var i = 0; i < options.Cartesians.length; i++) {
                        postionsTemp.push(options.Cartesians[i].x);
                        postionsTemp.push(options.Cartesians[i].y);
                        postionsTemp.push(options.Cartesians[i].z);
                        //
                        colorsTemp.push(0.0);
                        colorsTemp.push(0.0);
                        colorsTemp.push(1.0);
                        colorsTemp.push(1.0);
                    }
                }
                for (var i = 1; i < options.Cartesians.length; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colorsTemp);
                this.indiceArr = new Uint16Array(indicesTesm);

            } else { 
                var p1 = Cesium.Cartesian3.fromDegrees(0, 0, -10);
                var p2 = Cesium.Cartesian3.fromDegrees(0, 0.001, -10);
                this.positionArr = new Float64Array([
                    p1.x, p1.y, p1.z,
                    p2.x, p2.y, p2.z
                ]);
                //默认蓝色
                this.colorArr = new Float32Array([
                         0.0, 0.0, 1.0, 1.0,
                         0.0, 0.0, 1.0, 1.0
                ]);
                this.indiceArr = new Uint16Array([0, 1]);
            }
           
            this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
            this.appearance = CreateAppearence(fragmentShader, vertexShader);

            this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: this.geometry
                }),
                appearance: this.appearance,
                asynchronous: false
            }));
        }

        function CreateGeometry(positions, colors, indices) {
            return new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    color: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 4,
                        values: colors
                    })
                },
                indices: indices,
                primitiveType: Cesium.PrimitiveType.LINES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            });
        }

        function CreateAppearence(fs, vs) {
            return new Cesium.Appearance({         
                renderState: {
                    blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,  
                    depthTest: { enabled: true }, 
                    depthMask: true,
                    lineWidth: 1.0
                },
                fragmentShaderSource: fs,
                vertexShaderSource: vs
            });
        }

        function getVS() {
            return "attribute vec3 position3DHigh;\
            attribute vec3 position3DLow;\
            attribute vec4 color;\
            varying vec4 v_color;\
            attribute float batchId;\
            void main()\
            {\
                vec4 p = czm_computePosition();\
                v_color =color;\
                p = czm_modelViewProjectionRelativeToEye * p;\
                gl_Position = p;\
            }\
            ";
        }
        function getFS() {
            return "varying vec4 v_color;\
            void main()\
            {\
                gl_FragColor =v_color;\
            }\
            ";
        }
       
        _.prototype.remove = function () {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                this.positionArr = null;
                this.colorArr = null;
                this.indiceArr = null;
                this.geometry = null;
                this.appearance = null;
                this.primitive = null;
            }
        }
        _.prototype.updateCartesianPosition = function (cartesians) {
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (cartesians && cartesians.length < 2) { return; }
               
                //默认蓝色
                var postionsTemp = [];
                var colorsTemp = [];
                var indicesTesm = [];
                for (var i = 0; i < cartesians.length; i++) {
                    postionsTemp.push(cartesians[i].x);
                    postionsTemp.push(cartesians[i].y);
                    postionsTemp.push(cartesians[i].z);
                     
                    colorsTemp.push(0.0);
                    colorsTemp.push(0.0);
                    colorsTemp.push(1.0);
                    colorsTemp.push(1.0);
                }
                for (var i = 1; i < cartesians.length; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colorsTemp);
                this.indiceArr = new Uint16Array(indicesTesm);

                this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                this.appearance = CreateAppearence(fragmentShader, vertexShader);

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: this.geometry
                    }),
                    appearance: this.appearance,
                    asynchronous: false
                }));
            } else { return;}
        }
        _.prototype.updateCartesianPositionColor = function (cartesians, colors) {
            if (colors.length === cartesians.length * 4) { } else { return; }
            if (this.primitive != null) {
                viewer.scene.primitives.remove(this.primitive);
                if (cartesians && cartesians.length < 2) { return; }
          
                var postionsTemp = [];
                var indicesTesm = [];
                
                for (var i = 0; i < cartesians.length; i++) {
                    postionsTemp.push(cartesians[i].x);
                    postionsTemp.push(cartesians[i].y);
                    postionsTemp.push(cartesians[i].z);
                }
                for (var i = 1; i < cartesians.length; i++) {
                    indicesTesm.push(i - 1);
                    indicesTesm.push(i);
                }
                this.positionArr = new Float64Array(postionsTemp);
                this.colorArr = new Float32Array(colors);
                this.indiceArr = new Uint16Array(indicesTesm);

                this.geometry = CreateGeometry(this.positionArr, this.colorArr, this.indiceArr);
                this.appearance = CreateAppearence(fragmentShader, vertexShader);
           

                this.primitive = viewer.scene.primitives.add(new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: this.geometry
                    }),
                    appearance: this.appearance,
                    asynchronous: false
                }));
            } else { return; }
        }
        return _;
    })();


var TooltipDiv = (function () {
    var isInit = false;
    function _() { };

    _.initTool = function (frameDiv) {
        if (isInit) { return; }
        
        var div = document.createElement('DIV');
        div.className = "tooltipdiv right";//类名

        var arrow = document.createElement('DIV');
        arrow.className = "tooltipdiv-arrow";
        div.appendChild(arrow);

        var title = document.createElement('DIV');
        title.className = "tooltipdiv-inner";
        div.appendChild(title);

        this._div = div;
        this._title = title;

        // add to frame div and display coordinates
        frameDiv.appendChild(div);

        isInit = true;
    }

    _.setVisible = function (visible) {
        if (!isInit) { return;}
        this._div.style.display = visible ? 'block' : 'none';
    };

    /*
    position屏幕坐标
    显示在屏幕上
    */
    _.showAt = function (position, message) {
        if (!isInit) { return; }
        if (position && message) {
            this.setVisible(true);
            this._title.innerHTML = message;
            this._div.style.left = position.x + 10 + "px";
            this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
        }
    };
  
return _;
})();




var DrawDynamicClampGround = function () {   
    //绘制圆--用于可视域分析
     function startDrawingCircle(viewer, callback) {
        // polyline初始化 
        var polyline = new PrimitivePolyline({ 'viewer': viewer });
        var circle = new PrimitiveEllipse({ 'viewer': viewer });

        var positions = [];
        viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
            movement
          ) {
            if (movement.position != null) {
                var cartesian = viewer.scene.pickPosition(movement.position);
                if (cartesian) {
                     if (positions.length == 0) {
                         positions.push(cartesian.clone());
                     } else if (positions.length == 1) {
                         positions.push(cartesian.clone());
                         if (typeof callback == 'function') {
                             callback(positions);
                         }
                         //移除entity
                         if (polyline) {
                             polyline.remove();
                             polyline = null;
                         }
                         if (circle) {
                             circle.remove();
                             circle = null;
                         }
                     }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        viewer.screenSpaceEventHandler.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (cartesian) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                if (cartographic) {  
                    if (positions.length == 0) {
                        TooltipDiv.showAt(movement.endPosition, '添加中心');
                    } else if (positions.length == 1) {
                        //更新entity
                        var positionArr = [];
                        positionArr.push(positions[0]);
                        positionArr.push(cartesian);
                        if (polyline) {
                            polyline.updateCartesianPosition(positionArr);
                        }
                        if (circle) {
                            //求距离
                            var cartographicCenter = Cesium.Cartographic.fromCartesian(positions[0]);
                            var cartesianCenterH0 = Cesium.Cartesian3.fromRadians(cartographicCenter.longitude, cartographicCenter.latitude, 0);
                            var cartesianPointH0 = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
                            var ab = Cesium.Cartesian3.distance(cartesianCenterH0, cartesianPointH0);
                            var eopt = {};
                            eopt.semiMinorAxis = ab;
                            eopt.semiMajorAxis = ab;
                            eopt.rotation = 0;
                            eopt.center = Cesium.Cartographic.fromCartesian(positions[0]);
                            eopt.center.height = 0;
                            eopt.slices = 360;
                            eopt.height = cartographic.height+1.0;
                            circle.updatePosition(eopt);          
                        }
                        TooltipDiv.showAt(movement.endPosition, "点击结束");
                    }
                 } 
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    };

    return {startDrawingCircle};
}();

export default DrawDynamicClampGround;