import Color from '../renderer/color';
/**
 *  Class FeatureLayer 图层类
 */
class FeatureLayer {
    // #viewer
    constructor(viewer) {
        this._entities = [];
        this._primitives = [];
        this._dataSource = [];
        this._imageryLayers = [];
        this.viewer = viewer;
        this._toDisposing = false;
        this._toDispisingTime = null;
    }
    /**
     * 添加实体
     * @param {object} entityJson 
     */
    addEntity(entityJson) {
        let color = new Color();
        let newEntityJson = color.checkColor(entityJson);
        var item = this.viewer.entities.add(newEntityJson);
        this._entities.push(item);
        return item;
    }
    /**
     * 添加Primitive
     * @param {object} item 
     */
    addPrimitive(item) {
        CIM.viewer.scene.primitives.add(item);
        this._primitives.push(item);
        return item;
    }
    /**
     * 添加Datasource
     * @param {object} item 
     */
    addDatasource(item) {
        this.viewer.dataSources.add(item);
        this._dataSource.push(item);
        return item;
    }
    /**
     * 添加瓦片服务
     * @param {object} item 
     */
    addImagery(item) {
        var imageryLayer = this.viewer.imageryLayers.addImageryProvider(item);
        this._imageryLayers.push(imageryLayer);
        return imageryLayer;
    }
    /**
     * 从场景中移除给定的entity
     * @param {entity} entity 实体
     */
    removeEntity(entity) {
        if (entity instanceof Cesium.Entity) {
            this.viewer.entities.remove(entity);
        }
    }
    /**
     * 移除所有的内容
     * @param {boolean} destory 
     */
    removeAll(destory) {
        destory = destory || true;
        for (let i = this._entities.length - 1; i > -1; i--) {
            this.viewer.entities.remove(this._entities[i]);
        }
        for (let i = this._primitives.length - 1; i > -1; i--) {
            this.viewer.scene.primitives.remove(this._primitives[i]);
        }
        for (let i = this._dataSource.length - 1; i > -1; i--) {
            this.viewer.dataSources.remove(this._dataSource[i]);
        }
        for (let i = this._imageryLayers.length - 1; i > -1; i--) {
            this.viewer.imageryLayers.remove(this._imageryLayers[i], destory);
        }
        this._entities.splice(0, this._entities.length);
        this._primitives.splice(0, this._primitives.length);
        this._dataSource.splice(0, this._dataSource.length);
        this._imageryLayers.splice(0, this._imageryLayers.length);
    }
    /**
     * 卸载掉图层
     * @param {object} time 
     */
    dispose(time) {
        if (time == undefined) {
            time = 0;
        }
        if (time != 0) {
            this.setVisible(false);
            this._toDisposing = true;
            let _this = this;
            return new Promise(function (resolve, reject) {
                _this._toDispisingTime = setTimeout(() => {
                    _this.removeAll(_this.viewer);
                    resolve(_this);
                }, time)
            })
        }
        else {
            this.removeAll(this.viewer);
            let _this = this;
            return new Promise(function (resolve, reject) {
                resolve(_this);
            })
        }
    }
    /**
     * 设置对象可见不可见
     * @param {boolean} isShow 
     */
    setVisible(isShow) {
        for (let i = this._entities.length - 1; i > -1; i--) {
            this._entities[i].show = isShow;
        }
        for (let i = this._primitives.length - 1; i > -1; i--) {
            this._primitives[i].show = isShow;
        }
        for (let i = this._dataSource.length - 1; i > -1; i--) {
            this._dataSource[i].show = isShow;
        }
        for (let i = this._imageryLayers.length - 1; i > -1; i--) {
            this._imageryLayers[i].show = isShow;
        }
    }
    /**
     * 设置对象透明度
     * @param {Number} opacity 0 - 1.0
     */
    setOpacity(opacity) {
        for (let i = this._imageryLayers.length - 1; i > -1; i--) {
            this._imageryLayers[i].alpha = opacity;
        }

        for (let i = this._primitives.length - 1; i > -1; i--) {
            var transparentStyle = new Cesium.Cesium3DTileStyle({ color: "color('white', " + opacity + ")", show: true });
            this._primitives[i].style = transparentStyle;
        }

    }
    /**
     * 获得图例信息
     */
    getLegendData() {
        return null;
    }
    /**
     * 取消卸载
     */
    cancelDispose() {
        if (this._toDispisingTime) {
            window.clearTimeout(this._toDispisingTime);
            this._toDispisingTime = null;
        }
        this._toDisposing = false;
        this.setVisible(true);
    }
}

export default FeatureLayer;
