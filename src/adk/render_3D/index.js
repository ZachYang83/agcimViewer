/*
 * @author: pwz（潘文周）
 * @description: 三维绘制入口
 */

import PickerHelper from '@/sdk/interactive/pickerHelper.js'
import coordinate from '@/sdk/maths/coordinate'
import Draw from '@/sdk/interactive/draw.js'
import TurfHelper from "@/sdk/maths/turfHelper.js";
import createGeometry from "./createGeometry.js"
import Highlight from "@/sdk/renderer/highlightEntity.js"
import PointRender from "../render_2D/PointRender"

export default class Render3D {
    #viewer
    #pickerHelper
    #draw
    selectedEntity
    constructor(viewer) {
        this.#viewer = viewer;
        this.selectedEntity;
        this.#draw = new Draw(this.#viewer)
        this.#pickerHelper = new PickerHelper(this.#viewer)
        this.pointRender = new PointRender(this.#viewer)
        this.highlight = new Highlight({
            material: Cesium.Color.RED
        });
        this.pickModel();
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述
     * @param {String} type 需要绘制的模型类型
     * @param {Boolean} autoclampTerrain 是否自动贴地
     * @param {Object} modelOptions 模型的参数
     * @param {Object} pointEntity 绘制点的外观,笔触颜色
     * @return {Entity} 返回一个Entity
     */
    async drawPoint(type, autoclampTerrain, modelOptions, pointEntity) {
        this.#pickerHelper.setCursor("pointer");
        let pointObject = await this.pointRender.pickAndDrawPointOnce(0,pointEntity);
        let position = pointObject.position._callback();
        this.#viewer.entities.remove(pointObject);
        this.#pickerHelper.setCursor("default")
        this.#draw.removeAll();
        if (autoclampTerrain) position = this._changePointAddHeight(position, modelOptions);
        return this.#viewer.entities.add(createGeometry["add" + type](position, modelOptions));

    }
    /**
      * @author: pwz（潘文周） 
      * @description: 方法描述
      * @param {String} type 需要绘制的模型类型
      * @param {Boolean} autoclampTerrain 是否自动贴地
      * @param {Boolean} modelInterval 模型之间的间隔
      * @param {Object} modelOptions 模型的参数
      * @param {Object} polylineEntity 绘制线的外观
      * @param {Object} pointEntity 绘制点的外观
      * @return {Entity[]} 返回一个Entity数组
      */
    async drawPolyline(type, autoclampTerrain, modelInterval, modelOptions, polylineEntity = {}, pointEntity) {
        let coorsArr = await this.#draw.drawPolyline(polylineEntity, true, pointEntity).then(res => res.positions)
        this.#draw.removeAll();
        modelInterval = this._changeModelInterval(modelOptions, modelInterval);
        let positionArr = TurfHelper.getLineStepPoints(coorsArr, modelInterval);
        positionArr = await coordinate.changeHeightByTerrain(this.#viewer, positionArr)
        return positionArr.map(item => {
            if (autoclampTerrain) item = this._changePointAddHeight(item, modelOptions);
            let entity = createGeometry["add" + type](item, modelOptions);
            return this.#viewer.entities.add(entity);
        });

    }
    /**
      * @author: pwz（潘文周） 
      * @description: 方法描述
      * @param {String} type 需要绘制的模型类型
      * @param {Boolean} autoclampTerrain 是否自动贴地
      * @param {Boolean} modelInterval 模型之间的间隔
      * @param {Object} modelOptions 模型的参数
      * @param {Object} pointEntity 绘制点的外观
      * @return {Entity[]} 返回一个Entity数组
      */
    async drawPolygon(type, autoclampTerrain, modelInterval, modelOptions, polygonEntity) {
        let coorsArr = await this.#draw.drawPolygon(polygonEntity).then(res => res.positions)
        this.#draw.removeAll();
        modelInterval = this._changeModelInterval(modelOptions, modelInterval);
        let positionArr = TurfHelper.getGridPointWithinPolygon(coorsArr, modelInterval);
        positionArr = await coordinate.changeHeightByTerrain(this.#viewer, positionArr)
        return positionArr.map(item => {
            if (autoclampTerrain) item = this._changePointAddHeight(item, modelOptions);
            return this.#viewer.entities.add(createGeometry["add" + type](item, modelOptions));
        });


    }
    /**
     * @author: pwz（潘文周） 
     * @description: 拾取模型
     * @param {*}
     * @return {*}
     */
    pickModel() {
        this.picker = new PickerHelper(this.#viewer);
        this.picker.on("LEFT_CLICK", e => {
            let object = this.picker.getPickObject(e.position)
            if (object && object.id && object.id.name && object.id.name.includes("render")) {
                this.highlight.add(object.id);
                this.selectedEntity = object.id;
            }
        }).on("MOUSE_MOVE", e => {
            let object = this.picker.getPickObject(e.endPosition)
            if (object && object.id) {
                this.picker.setCursor("pointer");
            }
        })
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 删除模型
     */
    removeModel(callBack) {
        let entity = this.selectedEntity;
        //清除所有绘制的entity
        if (!entity) {
            let entities = this.#viewer.entities._entities._array;
            let removeEntity = [];
            for (let i = 0; i < entities.length; i++) {
                if (entities[i].name && entities[i].name.includes("render")) {
                    removeEntity.push(entities[i])
                }
            }
            removeEntity.forEach(entity => {
                this.#viewer.entities.remove(entity);
            })
            this.selectedEntity = undefined;
            return
        }
        //清除选中的entity
        if (callBack && callBack(entity)) {
            if (Array.isArray(entity)) {
                entity.forEach(item => {
                    this.#viewer.entities.remove(item);
                })
            } else {
                this.#viewer.entities.remove(entity);
            }
            this.selectedEntity = undefined;
        }
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 修改绘制点的高度
     * @param {*} position
     * @param {*} options
     * @return {*}
     */
    _changePointAddHeight(position, options) {
        if (options.radii) {
            position = coordinate.changePointAddHeight(position, options.radii);
        } else if (options.height) {
            position = coordinate.changePointAddHeight(position, options.height / 2);
        }
        return position;
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 修改间距
     * @param {*} params
     * @return {*}
     */
    _changeModelInterval(params, modelInterval) {
        if (params.radii) {
            modelInterval = params.radii + modelInterval;
        } else if (params.width) {
            modelInterval = params.width / 2 + modelInterval;
        }
        return modelInterval
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 清除
     */
    clear() {
        this.#pickerHelper.reset();
        this.picker.reset();
        this.selectedEntity = undefined;
        this.#draw.removeAll();
    }

}