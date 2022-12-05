/**
 * Class Draw 绘制类
 */
import agMath from "../maths/math";
import HighlightHelper from "../renderer/highlightHelper";
import PickerHelper from "./pickerHelper";
import AgFeatureLayer from "../layer/featureLayer";
import AgPoint from "../geometry/point";
import AgPolyline from "../geometry/polyline";
import AgPolygon from "../geometry/polygon";
import AgRectangle from "../geometry/rectangle";
import AgCircle from "../geometry/circle";
class Draw {
    constructor(viewer) {
        this.viewer = viewer;
        this.viewerContainer = this.viewer._element;
        this.pickerHelper = new PickerHelper(viewer);
        this.agFeatureLayer = new AgFeatureLayer(viewer);
        this.highlightHelper = new HighlightHelper();
    }

    /**
     * 画点
     * @param {object} options point属性对象，为空时使用默认样式
     * @return {Promise} 回调里面是positions点坐标、entity对象
     */
    drawPoint(options) {
        //坐标存储
        var positions = [];
        var point = null;
        //改变鼠标指针样式
        this.pickerHelper.setCursor("crosshair");
        return new Promise((resolve, reject) => {
            //单击鼠标左键画点
            this.pickerHelper.on("LEFT_CLICK", movement => {
                var cartesian;
                this.pickerHelper.hitTest(movement).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    positions.push(cartesian);
                    point = this._addPoint("agPoint", cartesian, options);
                    this.removeInputAction();
                    this.highlightHelper.remove();
                    resolve({ positions: positions, entity: point });
                });
            }).on("MOUSE_MOVE", movement => {
                let pickedFeature = this.viewer.scene.pick(movement.endPosition);
                this.highlightHelper.add(pickedFeature, this.viewer);
            }).on("RIGHT_CLICK", movement => {
                //单击鼠标右键取消画点
                this.removeInputAction();
                this.highlightHelper.remove();
                reject("取消绘制");
            });
        })
    }

    /**
     * 画单线
     * @param {object} options polyline属性对象，为空时使用默认样式
     * @param {boolean} hasPoint 是否绘制线段端点，默认为true
     * @param {object} pointStyle point属性对象，为空时使用默认样式
     * @return {Promise} 回调里面是positions点坐标、entity对象
     */
    drawPolyline(options, hasPoint = true, pointStyle = {}) {
        //坐标存储
        var positions = [];
        //单次绘制的对象
        var entities = [];
        var polyline = null;
        var pointCount = options.pointCount || 2;
        //改变鼠标指针样式
        this.pickerHelper.setCursor("crosshair");

        return new Promise((resolve, reject) => {
            //单击鼠标左键开始，右键取消
            this.pickerHelper.on("LEFT_CLICK", movement => {
                var cartesian;
                this.pickerHelper.hitTest(movement, [polyline]).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    if (positions.length == 0)
                        positions.push(cartesian.clone());
                    positions.push(cartesian);
                    //添加线段端点
                    if (hasPoint) {
                        var point = this._addPoint("agPoint", positions[positions.length - 1], pointStyle);
                        entities.push(point);
                    }
                    if (positions.length > pointCount) {
                        this.removeInputAction();
                        positions.pop();
                        this.highlightHelper.remove();
                        resolve({ positions: positions, entity: polyline });
                    }
                });
            }).on("MOUSE_MOVE", movement => {
                let pickedFeature = this.viewer.scene.pick(movement.endPosition);
                this.highlightHelper.add(pickedFeature, this.viewer);
                var cartesian;
                if (positions.length == 0)
                    return;
                this.pickerHelper.hitTest(movement, [polyline]).then(result => {
                    if (positions.length >= 2) {
                        if (result.results.length > 0)
                            cartesian = result.results[0].position;
                        else
                            cartesian = result.groundPoint;
                        if (!cartesian)
                            return;
                        if (!Cesium.defined(polyline)) {
                            var agPolyline = new AgPolyline("agPolyline", positions, options);
                            agPolyline.addToLayer(this.agFeatureLayer);
                            polyline = agPolyline.agPolyline;
                            entities.push(polyline);
                        } else {
                            positions.pop();
                            positions.push(cartesian);
                        }
                    }
                });
            }).on("RIGHT_CLICK", movement => {
                this.removeInputAction();
                this.remove(entities);
                this.highlightHelper.remove();
                reject("取消绘制");
            });
        })
    }

    /**
     * 画多段线
     * @param {object} options polyline属性对象，为空时使用默认样式
     * @param {boolean} hasPoint 是否绘制线段端点，默认为true
     * @param {object} pointStyle point属性对象，为空时使用默认样式
     * @return {Promise} 回调里面是positions点坐标、entity对象
     */
    drawMultiPolyline(options, hasPoint = true, pointStyle = {}) {
        //坐标存储
        var positions = [];
        //单次绘制的对象
        var entities = [];
        var polyline = null;
        //改变鼠标指针样式
        this.pickerHelper.setCursor("crosshair");

        return new Promise((resolve, reject) => {
            //单击鼠标左键开始，双击左键结束、右键取消
            this.pickerHelper.on("LEFT_CLICK", movement => {
                var cartesian;
                this.pickerHelper.hitTest(movement, [polyline]).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    }
                    positions.push(cartesian);
                    //添加线段端点
                    if (hasPoint) {
                        var point = this._addPoint("agPoint", positions[positions.length - 1], pointStyle);
                        entities.push(point);
                    }
                });
            }).on("MOUSE_MOVE", movement => {
                let pickedFeature = this.viewer.scene.pick(movement.endPosition);
                this.highlightHelper.add(pickedFeature, this.viewer);
                var cartesian;
                if (positions.length == 0)
                    return;
                this.pickerHelper.hitTest(movement, [polyline]).then(result => {
                    if (positions.length >= 2) {
                        if (result.results.length > 0)
                            cartesian = result.results[0].position;
                        else
                            cartesian = result.groundPoint;
                        if (!cartesian)
                            return;
                        if (!Cesium.defined(polyline)) {
                            var agPolyline = new AgPolyline("agPolyline", positions, options);
                            agPolyline.addToLayer(this.agFeatureLayer);
                            polyline = agPolyline.agPolyline;
                            entities.push(polyline);
                        } else {
                            positions.pop();
                            positions.push(cartesian);
                        }
                    }
                });
            }).on("LEFT_DOUBLE_CLICK", movement => {
                this.removeInputAction();
                positions.pop();
                this.highlightHelper.remove();
                resolve({ positions: positions, entity: polyline });
            }).on("RIGHT_CLICK", movement => {
                this.removeInputAction();
                this.remove(entities);
                this.highlightHelper.remove();
                reject("取消绘制");
            });
        })
    }

    /**
     * 画多边形
     * @param {object} options polygon属性对象，为空时使用默认样式
     * @param {boolean} hasPoint 是否绘制线段端点，默认为true
     * @param {object} pointStyle point属性对象，为空时使用默认样式
     * @return {Promise} 回调里面是positions点坐标、entity对象
     */
    drawPolygon(options, hasPoint = true, pointStyle = {}) {
        //坐标存储
        var positions = [];
        //单次绘制的对象
        var entities = [];
        var polygon = null;
        //改变鼠标指针样式
        this.pickerHelper.setCursor("crosshair");

        return new Promise((resolve, reject) => {
            //单击鼠标左键开始，双击左键结束、右键取消
            this.pickerHelper.on("LEFT_CLICK", movement => {
                var cartesian;
                this.pickerHelper.hitTest(movement, [polygon], 100).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    }
                    positions.push(cartesian);

                    //添加端点
                    if (hasPoint) {
                        var point = this._addPoint("agPoint", positions[positions.length - 1], pointStyle);
                        entities.push(point);
                    }
                });
            }).on("MOUSE_MOVE", movement => {
                let pickedFeature = this.viewer.scene.pick(movement.endPosition);
                this.highlightHelper.add(pickedFeature, this.viewer);
                var cartesian;
                if (positions.length == 0)
                    return;
                this.pickerHelper.hitTest(movement, [polygon], 100).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    if (positions.length >= 2) {
                        if (!Cesium.defined(polygon)) {
                            var agPolygon = new AgPolygon("agPolygon", positions, options);
                            agPolygon.addToLayer(this.agFeatureLayer);
                            polygon = agPolygon.agPolygon;
                            entities.push(polygon);
                        } else {
                            positions.pop();
                            positions.push(cartesian);
                        }
                    }
                });
            }).on("LEFT_DOUBLE_CLICK", movement => {
                this.removeInputAction();
                positions.pop();
                this.highlightHelper.remove();
                resolve({ positions: positions, entity: polygon });
            }).on("RIGHT_CLICK", movement => {
                this.removeInputAction();
                this.remove(entities);
                this.highlightHelper.remove();
                reject("取消绘制");
            });
        })
    }

    /**
     * 画矩形
     * @param {object} options rect属性对象，为空时使用默认样式
     * @param {boolean} hasPoint 是否绘制线段端点，默认为true
     * @param {object} pointStyle point属性对象，为空时使用默认样式
     * @return {Promise} 回调里面是positions点坐标、entity对象
     */
    drawRect(options, hasPoint = true, pointStyle = {}) {
        //坐标存储
        var positions = [];
        //单次绘制的对象
        var entities = [];
        var rectangle = null;
        //改变鼠标指针样式
        this.pickerHelper.setCursor("crosshair");

        return new Promise((resolve, reject) => {
            //单击鼠标左键开始、右键取消
            this.pickerHelper.on("LEFT_CLICK", movement => {
                var cartesian;
                this.pickerHelper.hitTest(movement, [rectangle]).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                    }
                    positions.push(cartesian);
                    //添加端点
                    if (hasPoint) {
                        var point = this._addPoint("agPoint", positions[positions.length - 1], pointStyle);
                        entities.push(point);
                    }
                    if (positions.length > 2) {
                        this.removeInputAction();
                        positions.pop();
                        this.highlightHelper.remove();
                        resolve({ positions: positions, entity: rectangle });
                    }
                });
            }).on("MOUSE_MOVE", movement => {
                let pickedFeature = this.viewer.scene.pick(movement.endPosition);
                this.highlightHelper.add(pickedFeature, this.viewer);
                var cartesian;
                if (positions.length == 0)
                    return;
                this.pickerHelper.hitTest(movement, [rectangle]).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    if (positions.length >= 2) {
                        if (!Cesium.defined(rectangle)) {
                            var agRectangle = new AgRectangle("agRectangle", positions, options);
                            agRectangle.addToLayer(this.agFeatureLayer);
                            rectangle = agRectangle.agRectangle;
                            entities.push(rectangle);
                        } else {
                            positions.pop();
                            positions.push(cartesian);
                        }
                    }
                });
            }).on("RIGHT_CLICK", movement => {
                this.removeInputAction();
                this.remove(entities);
                this.highlightHelper.remove();
                reject("取消绘制");
            });
        })
    }

    /**
     * 画圆
     * @param {object} options circle属性对象，为空时使用默认样式
     * @param {boolean} hasPoint 是否绘制线段端点，默认为true
     * @param {object} pointStyle point属性对象，为空时使用默认样式
     * @return {Promise} 回调里面是positions点坐标、entity对象
     */
    drawCircle(options, hasPoint = true, pointStyle = {}) {
        //坐标存储
        var positions = [];
        //单次绘制的对象
        var entities = [];
        var circle = null;
        //改变鼠标指针样式
        this.pickerHelper.setCursor("crosshair");

        return new Promise((resolve, reject) => {
            //单击鼠标左键开始、右键取消
            this.pickerHelper.on("LEFT_CLICK", movement => {
                var cartesian;
                this.pickerHelper.hitTest(movement, [circle]).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                        if (hasPoint) {
                            var point = this._addPoint("agPoint", cartesian, pointStyle);
                            entities.push(point);
                        }
                    }
                    positions.push(cartesian);
                    if (positions.length > 2) {
                        this.removeInputAction();
                        positions.pop();
                        this.highlightHelper.remove();
                        resolve({ positions: positions, entity: circle });
                    }
                });
            }).on("MOUSE_MOVE", movement => {
                let pickedFeature = this.viewer.scene.pick(movement.endPosition);
                this.highlightHelper.add(pickedFeature, this.viewer);
                var cartesian;
                if (positions.length == 0)
                    return;
                this.pickerHelper.hitTest(movement, [circle]).then(result => {
                    if (result.results.length > 0)
                        cartesian = result.results[0].position;
                    else
                        cartesian = result.groundPoint;
                    if (!cartesian)
                        return;
                    if (positions.length >= 2) {
                        if (!Cesium.defined(circle)) {
                            var radius = new Cesium.CallbackProperty(function () {
                                var r = agMath.getDistance(positions[0], positions[1]);
                                return r ? r : r + 1;
                            }, false);
                            var agCircle = new AgCircle("agCircle", positions[0], radius, options);
                            agCircle.addToLayer(this.agFeatureLayer);
                            circle = agCircle.agCircle;
                            entities.push(circle);
                        } else {
                            positions.pop();
                            positions.push(cartesian);
                        }
                    }
                });
            }).on("RIGHT_CLICK", movement => {
                this.removeInputAction();
                this.remove(entities);
                this.highlightHelper.remove();
                reject("取消绘制");
            });
        })
    }

    /**
     * 添加端点
     * @param {*} name 
     * @param {*} position 
     * @param {*} style 
     * @private
     */
    _addPoint(name, position, style) {
        var agPoint = new AgPoint(name, position, style);
        agPoint.addToLayer(this.agFeatureLayer);
        return agPoint.agPoint;
    }
    /**
     * 移除鼠标事件
     */
    removeInputAction() {
        //改变鼠标指针为默认
        this.pickerHelper.setCursor("default");
        this.pickerHelper.remove("LEFT_CLICK");
        this.pickerHelper.remove("RIGHT_CLICK");
        this.pickerHelper.remove("MOUSE_MOVE");
        this.pickerHelper.remove("LEFT_DOUBLE_CLICK");
    }
    /**
     * 移除指定对象
     * @param {object} entities entity数组
     */
    remove(entities) {
        for (let i = entities.length - 1; i > -1; i--) {
            this.viewer.entities.remove(entities[i]);
        }
    }
    /**
     * 移除所有绘制对象
     */
    removeAll() {
        this.agFeatureLayer.removeAll();
    }

    dispose() {
        this.removeAll();
        this.pickerHelper.off();
        //鼠标指针设为默认
        this.pickerHelper.setCursor("default");
    }
}
export default Draw;