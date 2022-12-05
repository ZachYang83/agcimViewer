/**
 * class SwitchLayer 暂时没用
 */
import Ag3DTilesLayer from './ag3DTilesLayer';
class SwitchLayer {
    constructor(agFeatureLayer) {
        this.viewer = null;
        this.agFeatureLayer = agFeatureLayer;
        this.layerVisible = false;
    }

    /**
     * 添加图层切换监听
     * @param {object} viewer 
     */
    addListener(viewer) {
        let _t = this;
        viewer.camera.changed.addEventListener(function () {
            let checkedLayers = CIM.layerTree._aglayerIds;
            if (checkedLayers.length == 0) return;
            let camPosition = viewer.camera.position;
            for (let id of checkedLayers) {
                try {
                    // let subLayers = _t.getSublayers(id);
                    // if (subLayers.length == 0)
                    //     return;
                    _t.setLayerVisibleZoom(id);//暂时手动设置图层可视范围
                    let layerPosition = _t.getTargetLayerPosition(id);
                    if (layerPosition == null) continue;
                    let distance = _t.getSpaceDistance(camPosition, layerPosition);
                    let visibleZoom = _t.getLayerVisibleZoom(id);
                    if (_t.getLayerVisible(distance, visibleZoom)) {
                        _t.setLayerVisible(id, true);
                    } else {
                        _t.setLayerVisible(id, false);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }

    /**
     * 获取配置的子图层
     * @param {string} layerId 图层id
     * 返回所有配置的子图层集合
     */
    getSublayers(layerId) {
        let subLayers = [];
        return subLayers;
    }

    /**
     * 图层是否显示
     * @param {string} distance 距离
     * @param {string} visibleZoom  是否显示
     */
    getLayerVisible(distance, visibleZoom) {
        let visibleMinZoom = parseFloat(visibleZoom[0]);
        let visibleMaxZoom = parseFloat(visibleZoom[1]);
        distance = parseFloat(distance);
        if (visibleMinZoom < distance && distance < visibleMaxZoom) {
            this.layerVisible = true;
        } else {
            this.layerVisible = false;
        }
        return this.layerVisible;
    }

    /**
     * 添加子图层到地图
     * @param {object} viewer viewer
     * @param {string} url 图层url
     * 返回tileset对象
     */
    addSublayer(url, viewer) {
        let tilesLayer = new Ag3DTilesLayer(viewer);
        let item = tilesLayer.add(url);
        return item;
    }

    /**
     * 根据图层id获取可视范围
     * @param {*} id 图层id
     */
    getLayerVisibleZoom(id) {
        let visibleZoom = [];
        let layerTreeData = CIM.layerTree._layerTreeData;
        let layer = layerTreeData[id];
        visibleZoom.push(layer.visibleMinZoom);
        visibleZoom.push(layer.visibleMaxZoom);
        return visibleZoom;
    }

    /**
     * 获取目标图层坐标(中心点坐标)
     * @param {*} id 图层id
     */
    getTargetLayerPosition(id) {
        let targetLayer = CIM.layerTree.getLayerById(id);
        if (targetLayer._primitives.length == 0) return null;
        let targetLayerPosition = targetLayer._primitives[0].boundingSphere.center
        return targetLayerPosition;
    }

    /**
     * 计算空间两点位置
     * @param {*} p1 位置点
     * @param {*} p2 位置点
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
      * 根据图层id设置图层是否可见
      * @param {*} id  id
      * @param {*} state  状态true/false
      */
    setLayerVisible(id, state) {
        var layer = CIM.layerTree.getLayerById(id);
        if (layer) {
            layer._primitives[0].show = state;
        }
    }

    /**
      * 判断图层是否在视野范围内
      * @param {object} viewer viewer
      * @param {*} layerId 图层id
      */
    layerInViewExtent(viewer, layerId) {
        let status = false;
        let bounds = this.getCurrentViewExtent(viewer);
        let layerPosition = this.getTargetLayerPosition(layerId);
        let minLng = bounds.southwest.lng;
        let maxLng = bounds.northeast.lng;
        let minLat = bounds.southwest.lat;
        let maxLat = bounds.northeast.lat;
        var catographic = Cesium.Cartographic.fromCartesian(layerPosition);
        var longitude = Number(Cesium.Math.toDegrees(catographic.longitude).toFixed(6));
        var latitude = Number(Cesium.Math.toDegrees(catographic.latitude).toFixed(6));
        if (minLng < longitude && longitude < maxLng && minLat < latitude && latitude < maxLat) {
            status = true;
        }
        return status;
    }

    /**
      * 获取当前视野范围
      * @param {object} viewer 
      */
    getCurrentViewExtent(viewer) {
        var rectangle = viewer.camera.computeViewRectangle();
        var west = Number(Cesium.Math.toDegrees(rectangle.west).toFixed(6));
        var north = Number(Cesium.Math.toDegrees(rectangle.north).toFixed(6));
        var east = Number(Cesium.Math.toDegrees(rectangle.east).toFixed(6));
        var south = Number(Cesium.Math.toDegrees(rectangle.south).toFixed(6));
        var bounds = {
            southwest: {
                lng: west,
                lat: south
            },
            northeast: {
                lng: east,
                lat: north
            }
        }
        return bounds;
    }

    /**
    * 测试使用
    * 
    * 根据图层id设置可视范围
    * @param {*} id 图层id
    */
    setLayerVisibleZoom(id) {
        let layerTreeData = CIM.layerTree._layerTreeData;
        let layer = layerTreeData[id];
        if (layer.text.indexOf("精模") != -1) {
            layer.visibleMinZoom = 0;
            layer.visibleMaxZoom = 999;
        } else if (layer.text.indexOf("白模") != -1) {
            layer.visibleMinZoom = 1000;
            layer.visibleMaxZoom = 99999;
        } else {
            layer.visibleMinZoom = 0;
            layer.visibleMaxZoom = 99999;
        }
    }

    /**
      * 获取地图层级（没有用到）
      */
    getZoom() {
        var tilesToRender = viewer.scene.globe._surface._tilesToRender;
        console.log(tilesToRender);
        if (tilesToRender.length > 0) {
            var level = tilesToRender[0].level;
            return level;
        }
        return false;
    }
}
export default SwitchLayer;