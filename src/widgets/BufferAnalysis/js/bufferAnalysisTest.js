import Draw from "@/sdk/interactive/draw";
import agMath from "@/sdk/maths/math";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import BufferAnalysis from "@/sdk/spatialAnalysis/bufferAnalysis";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import coordinate from "@/sdk/maths/coordinate";
import alphaShape from "alpha-shape";
import spatialAnalysis2Helper from "@/sdk/spatialAnalysis/spatialAnalysis2Helper";
import * as turf from '@turf/turf'

var agFeatureLayer;
/*
 * @author: caizj（蔡周峻）
 * @description: 二维缓冲分析测试案例
 */
class BufferAnalysisTest {
    constructor() {
        this.viewer = null;
        this.draw = null;
        agFeatureLayer = new AgFeatureLayer();
    }

    //点缓冲
    pointBufferTest(viewer, radius) {
        var _this = this;
        _this.viewer = viewer;
        _this.draw = new Draw(viewer);
        _this.draw.drawPoint().then(result => {
            var positions = result.positions;
            var pointPosition = positions[0];
            var bufferAnalysis = new BufferAnalysis(viewer);
            var points = bufferAnalysis.pointBuffer(pointPosition, radius);

            var greenRhumbLine = viewer.entities.add({
                name: "Green rhumb line",
                polyline: {
                    positions: points,
                    width: 5,
                    arcType: Cesium.ArcType.RHUMB,
                    material: Cesium.Color.GREEN,
                    clampToGround: true,
                },
            });
        }, error => {
            console.log(error);
        });

    }

    //线缓冲
    lineBufferTest(viewer, radius, bufferType) {
        var _this = this;
        _this.viewer = viewer;
        _this.draw = new Draw(viewer);
        _this.draw.drawMultiPolyline({
            show: true,
            material: Cesium.Color.fromCssColorString('#f99d0d'),
            width: 2,
        }).then(result => {
            positions = _this._removeSamePoint(result.positions);
            var bufferAnalysis = new BufferAnalysis(viewer);
            var points = bufferAnalysis.multiLineBuffer(positions, radius, bufferType);
            for (let index = 0; index < points.length; index++) {
                let polygon = points[index];
                for (let k = 0; k < polygon.length; k++) {
                    const element = polygon[k];
                    _this._drawPolygon(viewer, element);
                }
            }
        }, error => {
            console.log(error);
        });
    }

    //多边形缓冲
    polygonBufferTest(viewer, radius, bufferType) {
        var _this = this;
        _this.viewer = viewer;
        _this.draw = new Draw(viewer);
        _this.draw.drawPolygon({
            show: true,
            material: Cesium.Color.fromCssColorString('#f99d0d'),
            width: 2,
        }).then(result => {
            positions = _this._removeSamePoint(result.positions);
            //debugger;
            // positions[positions.length] = new Cesium.Cartesian3(positions[0].x,positions[0].y,positions[0].z);
            var bufferAnalysis = new BufferAnalysis(viewer);
            var points = bufferAnalysis.polygonBuffer(positions, radius, bufferType);
            for (let index = 0; index < points.length; index++) {
                let polygon = points[index];
                for (let k = 0; k < polygon.length; k++) {
                    const element = polygon[k];
                    _this._drawPolygon(viewer, element);
                }

            }
        }, error => {
            console.log(error);
        });

    }

    //面缓冲
    planeBufferTest(viewer, radius, bufferType) {
        var _this = this;
        _this.viewer = viewer;
        _this.draw = new Draw(viewer);
        _this.draw.drawPolygon({
            show: true,
            material: Cesium.Color.fromCssColorString('#f99d0d'),
            width: 2,
        }).then(result => {
            positions = _this._removeSamePoint(result.positions);
            var bufferAnalysis = new BufferAnalysis(viewer);
            var points = bufferAnalysis.planeBuffer(positions, radius);
            for (let index = 0; index < points.length; index++) {
                let polygon = points[index];
                for (let k = 0; k < polygon.length; k++) {
                    const element = polygon[k];
                    _this._drawPolygon(viewer, element);
                }
            }
        }, error => {
            console.log(error);
        });
    }

    //体缓冲，谨慎使用，未完善
    tileBufferTest(viewer, radius, bufferType) {
        var _this = this;
        _this.viewer = viewer;
        let positions = [];
        let pickerHelper = new PickerHelper(viewer);
        pickerHelper.on("LEFT_CLICK", function (movement) {
            let pickedFeature = viewer.scene.pick(movement.position);
            let selected = pickedFeature._content._batchTable._properties.name[pickedFeature._batchId];

            let tilesList = pickedFeature.primitive.root.children;
            for (let tile in tilesList) {
                try {
                    if (tilesList[tile]._content._model != undefined) {
                        let featureIndex = _this._getFeatureIndex(selected, tilesList[tile]._content._batchTable);
                        if (featureIndex != -1) {
                            let vertexs = tilesList[tile]._content._model.vertexs[featureIndex];
                            positions = positions.concat(vertexs)
                        }
                    }
                    else {
                        /*  let contents = tilesList[tile]._content._contents;
                         for (let contentIndex = 0; contentIndex < contents.length; contentIndex++) {
                             const content = contents[contentIndex];
                             let vertexs = content._model.vertexs[pickedFeature._batchId];
                             positions = positions.concat(vertexs)
                         } */
                    }

                } catch (error) {
                    continue;
                }
            }

            for (let index = positions.length - 1; index >= 0; index--) {
                if (positions[index] == undefined) {
                    positions.splice(index, 1);
                }
            }

            var points = [];
            let tempText = "";
            let linePoints = positions.map((e) => {
                var linePoint = coordinate.cartesianToMercator(_this.viewer, e);
                points.push([linePoint.x, linePoint.y])
                tempText += linePoint.x + "," + linePoint.y + ";";
                return new Cesium.Cartesian3(linePoint.x, linePoint.y, 2);
            })
            console.log(tempText);

            var rings = _this._getShapeWithTurf(points);
            let cartesianPoints = rings.map((e) => {
                let mercatorPoint = new Cesium.Cartesian3(e[0], e[1], 1);
                let bufferPoint = coordinate.mercatorToCartesian(_this.viewer, mercatorPoint);
                return bufferPoint;
            })

            cartesianPoints = _this._removeSamePoint(cartesianPoints);
            var bufferAnalysis = new BufferAnalysis(viewer);
            var points = bufferAnalysis.planeBuffer(cartesianPoints, radius);
            for (let index = 0; index < points.length; index++) {
                let polygon = points[index];
                for (let k = 0; k < polygon.length; k++) {
                    const element = polygon[k];
                    _this._drawPolygon(viewer, element);
                }
            }
        })

        return positions;

    }

    //使用truf库构建凹包
    _getShapeWithTurf(points) {
        let turfPoints = [];
        for (let index = 0; index < points.length; index++) {
            turfPoints.push(turf.point(points[index]));
        }
        var points = turf.featureCollection(turfPoints);
        var hull = turf.concave(points);
        return hull.geometry.coordinates[0];
    }

    //使用AlphaShape算法构建凹包
    _getShapeWithAlpha(points) {
        let lines = alphaShape(0.005, points);
        let ringsIndex = [[lines[0][0], lines[0][1]]];
        this._buildRings(lines, { "index": 0 }, ringsIndex);
        ringsIndex.pop();
        let ringsPoints = [];
        for (let i = 0; i < ringsIndex.length; i++) {
            let ring = ringsIndex[i];
            let ringPoints = [];
            for (let j = 0; j < ring.length; j++) {
                let point = points[ring[j]];
                ringPoints.push(new Cesium.Cartesian3(point[0], point[1], 0));
            }
            ringsPoints.push(ringPoints);
        }
        let union = [[]];
        try {
            union = spatialAnalysis2Helper.polygonsUnion(ringsPoints)[0][0];
        } catch (error) {
        }
        return union;
    }

    //创建环
    _buildRings(lines, currentRing, ringsIndex) {
        let nextLines = lines.filter(element => element[0] == ringsIndex[currentRing.index][ringsIndex[currentRing.index].length - 1])
        let line, sameEleIndex;
        if (nextLines.length <= 1) {
            line = nextLines[0];
            sameEleIndex = ringsIndex[currentRing.index].indexOf(line[1]);
            if (sameEleIndex != -1) {
                if (sameEleIndex != 0) {
                    let temp = ringsIndex[currentRing.index].splice(sameEleIndex, ringsIndex[currentRing.index].length - sameEleIndex);
                    ringsIndex[currentRing.index] = temp;
                }
                ringsIndex[currentRing.index].push(line[1]);
                currentRing.index++;
                return;
            }
            ringsIndex[currentRing.index].push(line[1]);
            this._buildRings(lines, currentRing, ringsIndex);
        }
        else {
            for (let index = 0; index < nextLines.length; index++) {
                ringsIndex.push(ringsIndex[currentRing.index].concat());
                line = nextLines[index];
                sameEleIndex = ringsIndex[currentRing.index].indexOf(line[1]);
                if (sameEleIndex != -1) {
                    if (sameEleIndex != 0) {
                        let temp = ringsIndex[currentRing.index].splice(sameEleIndex, ringsIndex[currentRing.index].length - sameEleIndex);
                        ringsIndex[currentRing.index] = temp;
                    }
                    ringsIndex[currentRing.index].push(line[1]);
                    currentRing.index++;
                    continue;
                }

                ringsIndex[currentRing.index].push(line[1]);
                this._buildRings(lines, currentRing, ringsIndex);
            }
        }
    }

    //获取要素索引
    _getFeatureIndex(name, btachTable) {
        let featureIndex = -1;
        let nameArray = btachTable._properties.name;
        for (let index = 0; index < nameArray.length; index++) {
            const element = nameArray[index];
            if (element == name) {
                featureIndex = index;
                break;
            }
        }
        return featureIndex;
    }

    _drawPolygon(viewer, points) {
        var greenRhumbLine = viewer.entities.add({
            name: "Green rhumb line",
            polyline: {
                positions: points,
                width: 5,
                arcType: Cesium.ArcType.RHUMB,
                material: Cesium.Color.GREEN,
                clampToGround: true,
            },
        });
    }

    //移除相同点
    _removeSamePoint(positions) {
        var a = positions[positions.length - 1];
        var b = positions[positions.length - 2];
        if (a.x === b.x && a.y === b.y && a.z == b.z) {
            positions.pop();
        }
        return positions;

    }

    dispose() {
        if (this.draw != null) {
            this.draw.dispose();
        }

    }
}

export default new BufferAnalysisTest();