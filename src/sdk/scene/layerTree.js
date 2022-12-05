import agcimLayerLoader from "./layerLoader";

/**
 * Class LayerTree 图层树
 */
class LayerTree {
    constructor() {
        this._viewer = null;
        this._layerTreeData = {};
        this._aglayers = [];
        this._aglayerIds = [];
        this._onLayerShowHandlers = [];
    }
    /**
     * 初始图层
     * @param {object} viewer viewer
     * @param {object} data 外部传入的图层树数据
     */
    loadInitializeLayers(viewer, data) {
        this._viewer = viewer;
        //图层树外部传入数据
        if (data) {
            let self = this;
            for (var i = 0; i < data.content[0].children.length; i++) {
                self._loadLayerFromServer(viewer, data.content[0].children[i]);
            }
        }
    }
    /**
     * 加载图层
     * @private
     * @param {object} viewer viewer
     * @param {object} item 图层节点
     */
    _loadLayerFromServer(viewer, item) {
        if (item.layers.length > 0) {
            for (let j = 0; j < item.layers.length; j++) {
                if ('2' === item.layers[j].proxyType) {
                    item.layers[j]['defaultVersion'] = item.layers[j].layerVersion.split(',')[0];
                    item.layers[j]['url1'] = item.layers[j].url;
                    item.layers[j].url = item.layers[j]['url1'] + item.layers[j].layerAggregateName + "/tileset.json?layerName=" + item.layers[j].text + "&version=" + item.layers[j].defaultVersion;
                }
                this._layerTreeData[item.layers[j].id] = item.layers[j];
            }
        }

        for (var i = 0; i < item.children.length; i++) {
            this._loadLayerFromServer(viewer, item.children[i]);
        }

        // 默认显示的
        for (var i = 0; i < item.layers.length; i++) {
            if (item.layers[i].state.checked) {
                this.addLayer(item.layers[i], viewer);
            }
        }
    }

    /*******************操作图层********************* */

    /**
     * 根据ids添加多个图层
     * @param {array} ids 图层id，数组如：[id1,id2，...]
     * @param {object} viewer viewer
     */
    addMany(ids, viewer) {
        viewer = viewer || CIM.viewer;
        for (let id of ids) {
            if (this._checkCancelDispose(id))
                continue;
            if (this._layerTreeData[id]) {
                //如果不存在就添加。 
                this.addLayer(this._layerTreeData[id], viewer);
            }
        }
    }
    /**
     * 添加图层到地图上 
     * @param {object} ly 图层
     * @param {object} viewer viewer
     */
    addLayer(ly, viewer) {
        if (this._checkCancelDispose(ly))
            return;
        let type = ly.layerType;
        for (let i = 0; i < agcimLayerLoader.length; i++) {
            if (agcimLayerLoader[i].supportTypes.indexOf(type) != -1) {
                this._aglayerIds.push(ly.id)
                agcimLayerLoader[i].add(viewer, ly, this);
                return;
            }
        }
    }
    /**
     * 从缓存中进行加载，
     * @function _checkCancelDispose
     * @memberof layerTree 
     * @param {object} ly ly可以是id，也可以是图层
     * @private
     */
    _checkCancelDispose(ly) {
        var id = ly.id ? ly.id : ly;
        for (let i = 0; i < this._aglayers.length; i++) {
            if (this._aglayers[i].id == id && this._aglayerIds.indexOf(id) < 0) {
                this._aglayers[i].cancelDispose();
                this._aglayerIds.push(id);
                this.triggleLayerShowHandler(id, true); //显示事件 eg:图例
                return true;
            }
        }
        return false;
    }

    /**
     * 去掉勾选 移除
     * @function removeMany
     * @memberof layerTree
     * @param {array} ids 数组id
     */
    removeMany(ids) {
        for (let id of ids) {
            this.removeLayerById(id);
        }
    }

    /**
     * 全部删除
     * @function removeAll
     * @memberof layerTree
     */
    removeAll() {
        let _layerTreeData = this._layerTreeData;
        var allIds = [];
        for (var item in _layerTreeData) {
            allIds.push(item);
        }
        this.removeMany(allIds);
    }

    /**********************图层id的控制******************************* */

    /**
     * 根据id找到图层并移除
     * @function removeLayerById
     * @memberof layerTree
     * @param {string} id 图层id 
     */
    removeLayerById(id, time = 30000) {
        var layer = this.getLayerById(id);
        if (layer) {
            this.removeLayer(layer, time)
            return true;
        }
        return false;
    }
    /**
     * 根据图层来删除
     * 需要获取到已加载的图层
     * @function removeLayer
     * @memberof layerTree
     * @param {object} layer （已加载的）图层
     * @param {object} viewer 场景
     */
    removeLayer(layer, time) {
        let _this = this;
        _this._removeLayerId(layer.id);
        this.triggleLayerShowHandler(layer, false);

        layer.dispose(time).then(function () {
            _this._removeLayerRef(layer)
        });
    }

    /**
     * 移除图层id
     * @function _removeLayerId
     * @memberof layerTree
     * @param {string} id 
     * @private
     */
    _removeLayerId(id) {
        for (var i = this._aglayerIds.length - 1; i > -1; i--) {
            if (this._aglayerIds[i] == id) {
                this._aglayerIds.splice(i, 1);
            }
        }
    }
    /**
     * 是否存在layerId
     * @function _isLayerIdExists
     * @memberof layerTree
     * @param {string} id 
     * @private
     */
    _isLayerIdExists(id) {
        return this._aglayerIds.indexOf(id) >= 0;
    }

    /**
     * 根据id来获得对象
     * @function getLayerById
     * @memberof layerTree
     * @param {string} id  图层id
     */
    getLayerById(id) {
        for (let i = 0; i < this._aglayers.length; i++) {
            if (this._aglayers[i].id == id) {
                return this._aglayers[i];
            }
        }
        return null;
    }
    /**
     * 根据图层名称来获得图层
     * @function getLayerByText
     * @memberof layerTree
     * @param {string} text 图层名称
     */
    getLayerByText(text) {
        for (var name in this._layerTreeData) {
            if (this._layerTreeData[name].nameCn == text) {
                return this._layerTreeData[name];
            }
        }
        return null;
    }

    /**
     * 判断某图层是否已加载
     * @function isLayerExist
     * @memberof layerTree
     * @param {object} layer 图层
     */
    isLayerExist(layer) {
        let ids = this._aglayerIds;
        if (layer && layer.id && ids.indexOf(layer.id) == -1) {
            return true;
        }
        return false;
    }
    /**
     * 删掉图层的引用记录
     * @function _removeLayerRef
     * @memberof layerTree
     * @param {object} layer 图层
     * @private
     */
    _removeLayerRef(layer) {
        for (var i = this._aglayers.length - 1; i > -1; i--) {
            if (this._aglayers[i] == layer) {
                this._aglayers.splice(i, 1);
                return;
            }
        }
    }
    /***********************定位到对象***************************** */
    /**
     * 根据id定位图层
     * @function zoomToLayerById
     * @memberof layerTree
     * @param {string} id 图层id
     */
    zoomToLayerById(id) {
        //定位到已经加载的图层
        var selLayer = this.getLayerById(id);
        if (selLayer) {
            let option = selLayer._imageryLayers;
            if (option && option[0]) {
                //wmts
                option.getViewableRectangle().then(function (rectangle) {
                    CIM.viewer.camera.setView({
                        destination: Cesium.Rectangle.fromDegrees(rectangle.west, rectangle.south, rectangle.east, rectangle.north)
                    });
                });
            } else {
                //3d tiles   wfs 
                let typeArr = ['_primitives', '_entities', '_dataSource'];
                for (let i = 0; i < typeArr.length; i++) {
                    if (selLayer[typeArr[i]] && selLayer[typeArr[i]].length > 0) {
                        CIM.viewer.flyTo(selLayer[typeArr[i]][0]);
                    }
                }
            }
            return true;
        }
        return false;
    }
    /**
     * 根据id设置图层透明度
     * @function setLayerOpacityById
     * @memberof layerTree
     * @param {string} id 图层id
     * @param {number} opacity 透明度：0 ~ 1.0
     */
    setLayerOpacityById(id, opacity) {
        var selLayer = this.getLayerById(id);
        if (selLayer) {
            selLayer.setOpacity(opacity)
            return true;
        }
        return false;
    }

    /********************操作节点************************ */

    /**
     * 通过图层节点文字设置图层可见，暂时没用上
     * @param {string} text 图层名
     * @param {boolean} visible 是否可见
     */
    setLayerVisibleByTreeNodeText(text, visible) {
        if (!this.vueDom)
            return;
        this.vueDom.setLayerVisibleByTreeNodeText(text, visible);
    }

    /************************响应事件*************************** */

    /**
     * 添加图层时，调用的事件
     * @param {function} handler 事件
     */
    addLayerShowHandler(handler) {
        var t = this._onLayerShowHandlers.indexOf(handler);
        if (t < 0) {
            this._onLayerShowHandlers.push(handler);
        }
    }
    /**
     * 删除图层时，调用的事件
     * @param {function} handler 事件
     */
    removeLayerShowHandler(handler) {
        var t = this._onLayerShowHandlers.indexOf(handler);
        if (t >= 0) {
            this._onLayerShowHandlers.splice(t, 1);
        }
    }
    /**
     * 图层添加和删除事件调用
     * @param {object} layer 图层
     * @param {boolean} isVisible 图层显示状态
     */
    triggleLayerShowHandler(layer, isVisible) {
        for (var i = 0; i < this._onLayerShowHandlers.length; i++) {
            this._onLayerShowHandlers[i](layer, isVisible);
        }
    }
}
export default LayerTree;