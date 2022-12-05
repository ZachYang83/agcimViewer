import ModelManager from "./modelManager"
import { getHouseIdByPickedFeature, getselectedFeatureId, getHouseTilesetById } from "./common"

import { BUILDING_HOUSE, BUILDING_METERIAL, BUILDING_TREE, BUILDING_CAR } from "./buildingType"

import axios from "@/views/js/net/http";
import tableServer from "./../server/tableServer";
import { sliceBox } from "./slice";
import { Message } from 'ant-design-vue';

class RepalceMemeber {
    constructor() {
        this.tableName;//当前选中的tableName
        this.selectTileset;//当前选中的Tileset对象
        this.allPolyLine = null;
        this.allModel = [];//
        this.cartList = [];
        this.obbCenter;//房屋包围盒中心
        this.subtract;
        this.selectModelID;//上次替换构件的id
        this.repalceWay = "1";//"1","2"分别表示单个替换和批量替换
        this.objectIds = [];//当前替换的构件
        this.store = {};//存储构件的状态
        this.step = 0;//当前进行的步数
    }
    //触发构建替换
    async Initialize(selectedFeature, e, index = "1") {
        var id = null, houseId;
        this.repalceWay = index;
        if (!selectedFeature) return;
        houseId = getHouseIdByPickedFeature(selectedFeature);
        this.selectTileset = getHouseTilesetById(houseId);
        id = getselectedFeatureId(selectedFeature);
        this.tableName = this.selectTileset.tableName;
        this.subtract = this.selectTileset.subtract;
        this.obbCenter = this.selectTileset.obbCenter;

        //记录构件替换的状态
        let indexStore = [];
        if (this.selectTileset.components) {
            indexStore = Array.prototype.concat([], this.selectTileset.components)
        }

        if (this.step == 0) {
            indexStore=indexStore.map(item => {
                if (item.value.clippingPlane) {
                    var primitives = CIM.viewer.scene.primitives._primitives;
                    var model = primitives.find((e) => {
                        if (e instanceof Cesium.Model)
                            return item.value.id == e.id;
                    });
                    if (model) {
                        item.value.clippingPlane=model.clippingPlanes;
                    }
                }
                return item;
            });
        }
        this.store[this.step] = indexStore;
        this.step++;

        //进行构件替换
        this.batchReplace(e, id, this.selectTileset);
    }
    //构件替换
    async batchReplace(e, id, tileset) {
        var _this = this;
        var selectModelID;
        var modelMatrix = tileset._root.transform;
        let modelResult = await _this.getData(_this.tableName, "objectid", id);
        if (!modelResult.success) return;
        let indexModel = modelResult.content.rows[0];
        selectModelID = tileset.id + "$$1" + indexModel.name;
        _this.selectModelID = selectModelID + '$$2' + indexModel.level + '$$3' + id;
        if (_this.repalceWay === "1") {//替换单个构件
            var modelSize = _this.getSizes(indexModel);

            var wallData = null;
            if (indexModel.catagory == "窗") {
                var wallid = indexModel.host;
                let wall = await _this.getData(_this.tableName, "objectid", wallid);
                wallData = wall.content.rows[0];

                var related = eval("(" + wallData.related + ")");

                if (e.specification == modelSize) {
                    _this.removeSelectModel();
                    related = null;
                }
                else {
                    var suitable = _this.isSuitable(indexModel, wallData, e.specification);
                    if (suitable == false) {
                        Message.error("该构件大小不合适，无法替换！");
                        return;
                    }
                }

                var clips = sliceBox(wallData, indexModel.boundingbox, e.specification);
                var wallPsoition = await _this.getModelMatrix(modelMatrix, wallData);
                let wallurl = tableServer.previewUrl + `?paramType=1&tableName=` + _this.tableName + `&id=` + wallData.id;
                _this.materialToHouse({//绑定构件到房屋
                    objectid: wallid,
                    url: wallurl,
                    modelMatrix: wallPsoition,
                    relationIds: wallid,
                    boundingbox: wallData.boundingbox,
                    topologyelements: wallData.topologyelements,//拓扑关系
                    designSchemeId: currentPlanId,//设计方案ID
                    tableName: tileset.tableName,//对应的构件表名
                    houseId: tileset.id,//房屋id 
                    clippingPlane: clips,
                    related: related, //与墙相关的构件：窗沿
                    size: e.specification
                })


            }
            _this.removeSelectModel();//清空同种类型的构建
            var modelPosition = await _this.getModelMatrix(modelMatrix, indexModel, e.specification, wallData);

            // let centerEntity = CIM.viewer.entities.add({
            //     position: new Cesium.Cartesian3(modelPosition[12], modelPosition[13], modelPosition[14]),
            //     point: {
            //         pixelSize: 10,
            //         color: Cesium.Color.YELLOW
            //     }
            // });


            _this.objectIds.push(id);
            _this.materialToHouse({//绑定构件到房屋
                objectid: id,
                // arraybuffer,
                url: e.url,
                modelMatrix: modelPosition,
                relationIds: _this.selectModelID,
                boundingbox: indexModel.boundingbox,
                topologyelements: indexModel.topologyelements,//拓扑关系
                designSchemeId: currentPlanId,//设计方案ID
                tableName: tileset.tableName,//对应的构件表名
                houseId: tileset.id,//房屋id 
                clippingPlane: undefined,
                related: null,
            })
            //_this.add(url, indexModel, arraybuffer, da, tileset, _this.selectModelID)
        } else {
            let batchs = await _this.getData(_this.tableName, "name", indexModel.name, true);
            if (!batchs.success) return;
            var manyDatas = batchs.content.rows;
            if (_this.repalceWay === "2") {//替换整层构件
                manyDatas = manyDatas.filter(item => item.level === indexModel.level)
            }
            //替换整栋房屋构件
            manyDatas.map(item => _this.objectIds.push(item.objectid));
            _this.removeSelectModel();//清空同种类型的构建
            //替换整栋房屋构件
            for (let i = 0; i < manyDatas.length; i++) {
                var da = await _this.getModelMatrix(modelMatrix, manyDatas[i]);
                _this.materialToHouse({//绑定构件到房屋
                    objectid: manyDatas[i].objectid,
                    // arraybuffer,
                    url,
                    modelMatrix: da,
                    relationIds: selectModelID + '$$2' + manyDatas[i].level + '$$3' + manyDatas[i].objectid,
                    boundingbox: manyDatas[i].boundingbox,
                    topologyelements: manyDatas[i].topologyelements,//拓扑关系
                    designSchemeId: currentPlanId,//设计方案ID
                    tableName: tileset.tableName,//对应的构件表名
                    houseId: tileset.id,//房屋id 
                })
                //_this.add(url, manyDatas[i], arraybuffer, da, tileset, selectModelID + '$$2' + manyDatas[i].level + '$$3' + manyDatas[i].objectid)
            }
        }
        //添加构件模型
        _this.run();
    }
    //获取构件尺寸
    getSizes(data) {
        var topology = eval("(" + data.topologyelements + ")");
        var sizes = [];
        var aFoot = 0.3048;
        for (let i = 0; i < topology.Sizes.length; i++) {
            var da = topology.Sizes[i];
            var length = (da.Length * aFoot).toFixed(4) * 1000;
            sizes.push(length);
        }
        if (topology.Facing == '南' || topology.Facing == '北')
            return sizes[0] + "×" + sizes[2];
        else return sizes[1] + "×" + sizes[2];
    }
    isSuitable(modelData, wallData, repaceData) {
        var modelBox = eval("(" + modelData.boundingbox + ")").BoundingBox;
        var modelSphere = this.createBoundingBox(modelBox);

        var wallBox = eval("(" + wallData.boundingbox + ")").BoundingBox;
        var wallSphere = this.createBoundingBox(wallBox);
        var wallSize = this.getSizes(wallData);

        var difference = new Cesium.Cartesian3(wallSphere.center.x - modelSphere.center.x, wallSphere.center.y - modelSphere.center.y, wallSphere.center.z - modelSphere.center.z);


        var leftwidth = (wallSize.split("×")[0] / 2 / 1000 - difference.x).toFixed(3);
        var rightwidth = (wallSize.split("×")[0] / 2 / 1000 + difference.x).toFixed(3);

        var topwidth = (wallSize.split("×")[1] / 2 / 1000 - difference.z).toFixed(3);
        var botoomwidth = (wallSize.split("×")[1] / 2 / 1000 + difference.z).toFixed(3);

        var modelwidth = repaceData.split("×")[0] / 2 / 1000;
        var modelheight = repaceData.split("×")[1] / 2 / 1000;
        if (leftwidth < modelwidth || rightwidth < modelwidth || topwidth < modelheight || botoomwidth < modelheight)
            return false;
        return true;

    }
    //将构件信息绑定到房屋对象
    materialToHouse(data) {
        let tileset = this.selectTileset;
        //将构件信息存储到房屋
        // if (!tileset.components) tileset.components = [];
        // tileset.components.push(data.objectid);
        // model.tileUrl = tileset.url;
        if (!tileset.components) tileset.components = [];
        //删除重复项
        let index = tileset.components.findIndex(item => item.key == data.objectid);
        if (index >= 0) {
            tileset.components.splice(index, 1);
        }
        tileset.components.push({
            key: data.objectid, value: {
                id: data.objectid,
                // gltf: data.arraybuffer,
                url: data.url,
                modelMatrix: data.modelMatrix,
                scale: 1,
                debugShowBoundingVolume: false,
                relationIds: data.relationIds,
                boundingbox: data.boundingbox,
                topologyelements: data.topologyelements,//拓扑关系
                designSchemeId: data.designSchemeId,//设计方案ID
                tableName: data.tableName,//对应的构件表名
                houseId: data.houseId,//房屋id
                objectid: data.objectid,//构件的objectid
                clippingPlane: data.clippingPlane,
                related: data.related,
                size: data.size
            }
        })
    }
    //添加构件
    async addMaterial(data) {
        let arraybuffer = await Cesium.Resource.fetchArrayBuffer(data.url);
        var model = new Cesium.Model({
            id: data.objectid,
            gltf: arraybuffer,
            modelMatrix: data.modelMatrix,
            scale: data.scale,
            debugShowBoundingVolume: data.debugShowBoundingVolume,
            clippingPlanes: data.clippingPlane
        })
        CIM.viewer.scene.primitives.add(model);
        ModelManager.initMaterialObj(model, {
            relationIds: data.relationIds,
            boundingbox: data.boundingbox,
            topologyelements: data.topologyelements,//拓扑关系
            url: data.url,
            designSchemeId: data.designSchemeId,//设计方案ID
            tableName: data.tableName,//对应的构件表名
            houseId: data.houseId,//房屋id
            objectid: data.objectid,
            size: data.size,
            clips: data.clippingPlane
        })
        this.allModel.push(model);
    }
    //隐藏掉需要替换掉的构件
    hideMatrial(data) {
        let tileset = this.selectTileset;
        displayFeatures(data.objectid);
        if (data.related == null) return;
        var relatedID = data.related;
        for (let i = 0; i < relatedID.length; i++) {
            displayFeatures(relatedID[i]);
        }
        function displayFeatures(objectId) {
            let filter = "${name} !== '" + objectId + "'"
            // let filters = objectIds.map(objectId => {
            //     return "${name} !== '" + objectId + "'"
            // })
            var style = new Cesium.Cesium3DTileStyle();
            let condition;
            if (
                tileset.style != null &&
                tileset.style.show != null
            ) {
                //style.show =tileset.style.show.expression +"&&" + condition;
                condition = tileset.style.show.expression;
                //filters.map(item => {
                if (!condition.includes(filter)) {
                    condition += "&&" + filter
                }
                //})
            } else {
                condition = filter;
            }
            style.show = condition;
            tileset.style = style;
        }

    }
    //清除需要进行构件替换的构件
    removeSelectModel() {
        let _this = this;
        //let objectIds = _this.objectIds;
        let tileset = _this.selectTileset;
        if (!tileset.components) return;
        let objectIds = Object.values(tileset.components);

        let housesId = tileset.id;
        displayFeatures(objectIds);//隐藏tiles对象的style
        removeModels(); //清除房屋上已经替换过的构件


        //_this.objectIds = [];//清空要替换掉的构件列表
        function displayFeatures(ids) {
            var res = []
            let filters = ids.map(objectId => {
                if (objectId.value.related) {
                    var re = objectId.value.related.map(id => { return "${name} !== '" + id + "'" })
                    res = Array.prototype.concat(res, re)
                }

                return "${name} !== '" + objectId.key + "'"
            })
            filters = Array.prototype.concat(res, filters);

            var style = new Cesium.Cesium3DTileStyle();
            let condition;
            if (
                tileset.style != null &&
                tileset.style.show != null
            ) {
                condition = tileset.style.show.expression;
                filters.map(item => {

                    if (condition.endsWith(item)) {
                        condition = condition.split("&&" + item).join("");
                        condition = condition.split(item).join("")
                    }
                    if (condition.includes(item)) {

                        condition = condition.split(item + "&&").join("");
                        condition = condition.split(item).join("")
                    }
                })
                if (condition === "") {
                    tileset.style = style;
                } else {
                    style.show = condition;
                    tileset.style = style;
                }

            }
            // else {
            //     condition = filters.join("&&");
            // }
            // style.show = condition;
            // tileset.style = style;
        }
        function removeModels() {
            var primitives = CIM.viewer.scene.primitives._primitives;
            try {
                for (let i = primitives.length - 1; i >= 0; i--) {
                    var isDelete = false;
                    if (primitives[i] && primitives[i] instanceof Cesium.Model && primitives[i].type === BUILDING_METERIAL) {
                        objectIds.map((objectId) => {
                            if (isDelete) return;
                            if (primitives[i].relationIds && primitives[i].relationIds.includes(housesId) && primitives[i].relationIds.includes(objectId.key)) {
                                if (primitives[i].clippingPlanes == undefined)
                                    CIM.viewer.scene.primitives.remove(primitives[i]);
                                var index = _this.allModel.indexOf(primitives[i]);
                                _this.allModel.splice(index, 1);
                                isDelete = true;
                            }
                        })
                    }

                }
            } catch (err) {
            }

        }
    }
    //添加构件
    add(url, data, arraybuffer, finalMatrix, tileset, relationIds) {
        var model = new Cesium.Model({
            id: data.objectid,
            gltf: arraybuffer,
            modelMatrix: finalMatrix,
            scale: 1,
            debugShowBoundingVolume: false
        })
        CIM.viewer.scene.primitives.add(model);
        // if (tileset instanceof Cesium.Cesium3DTileset) {

        // } else {
        //     var tiles = CIM.viewer.scene.primitives._primitives.find(a => a.url == tileset.tileUrl);
        //     tiles.components.push(data.objectid);
        //     var index = tiles.components.indexOf(tileset);
        //     tiles.components.splice(index, 1);
        //     model.tileUrl = tileset.tileUrl;
        // }
        ModelManager.initMaterialObj(model, {
            relationIds: relationIds,
            boundingbox: data.boundingbox,
            topologyelements: data.topologyelements,//拓扑关系
            url,
            designSchemeId: currentPlanId,//设计方案ID
            tableName: this.tableName,//对应的构件表名
            houseId: tileset.id,//房屋id
            objectid: data.objectid,
        })
        this.allModel.push(model);

        //将构件信息存储到房屋
        if (!tileset.components) tileset.components = [];
        tileset.components.push(data.objectid);
        model.tileUrl = tileset.url;
        if (!tileset.components) tileset.components = [];
        //删除重复项
        let index = tileset.components.findIndex(item => item.key == data.objectid);
        if (index) {
            tileset.components.splice(index, 1);
        }
        tileset.components.push({
            key: data.objectid, value: {
                id: data.objectid,
                gltf: arraybuffer,
                url: url,
                modelMatrix: finalMatrix,
                scale: 1,
                debugShowBoundingVolume: false
            }
        })
    }
    // //标记构件的长宽
    // async sizeMarking(id, selectTileset) {
    //     var _this = this;
    //     this.selectTileset = selectTileset;

    //     this.tableName = selectTileset.tableName;
    //     this.selectModelID = undefined;//重置替换的构建类型

    //     var modelMatrix = this.selectTileset._root.transform;
    //     this.removeMark();
    //     this.allPolyLine = [];
    //     this.subtract = this.selectTileset.subtract;
    //     this.obbCenter = this.selectTileset.obbCenter;

    //     //发送请求从后台取
    //     _this.getData(_this.tableName, "objectid", id).then((res) => {
    //         if (!res.success) return;
    //         var data = res.content.rows;
    //         var topology = eval("(" + data[0].topologyelements + ")");
    //         for (let i = 0; i < topology.Sizes.length; i++) {
    //             _this.addLabel(topology.Facing, topology.Sizes[i], modelMatrix, Cesium.Color.RED).then(poly => {
    //                 _this.allPolyLine.push(poly);
    //             });

    //         }
    //     });
    // }
    //获取构件位置
    async getModelMatrix(modelMatrix, data, size, wallData) {

        let subtract = this.subtract;
        let obbCenter = this.obbCenter;

        var boundingbox = eval("(" + data.boundingbox + ")").BoundingBox;
        var topology = eval("(" + data.topologyelements + ")");

        var sphere = this.createBoundingBox(boundingbox);
        var face = topology.Facing;

        if (wallData) {
            var wallBox = eval("(" + wallData.boundingbox + ")").BoundingBox;
            var wallSphere = this.createBoundingBox(wallBox);
            if (face == "北" || face == "南")
                sphere.center.y = wallSphere.center.y;
            else
                sphere.center.x = wallSphere.center.x;
        }

        var m2 = new Cesium.Cartesian4(
            (sphere.center.x - obbCenter.x) + subtract.x,
            (sphere.center.y - obbCenter.y) + subtract.y,
            (sphere.center.z - obbCenter.z) + subtract.z,
            0
        );

        var m3 = null;
        if (face == "西") {
            m3 = Cesium.Matrix3.fromRotationZ(
                Cesium.Math.toRadians(180)
            );
        } else if (face == "北") {
            m3 = Cesium.Matrix3.fromRotationZ(
                Cesium.Math.toRadians(90)
            );
        } else if (face == "东") {
            m3 = Cesium.Matrix3.fromRotationZ(
                Cesium.Math.toRadians(0)
            );
        }
        else if (face == "南") {
            m3 = Cesium.Matrix3.fromRotationZ(
                Cesium.Math.toRadians(-90)
            );

            if (size == "1200×900") {
                m2.y += 0.2;
            } else if (size == "2100×1800") {
                m2.y -= 0.2;
            } else if (size == "1500×2100") {
                m2.y += 0.15;
            }
        }

        var modelMatrix2 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix,
            m2,
            new Cesium.Matrix4()
        );
        var finalMatrix = modelMatrix2;
        if (m3 != null) {
            finalMatrix = Cesium.Matrix4.multiplyByMatrix3(
                modelMatrix2,
                m3,
                new Cesium.Matrix4()
            );
        }

        return finalMatrix;
    }
    //重置
    reset() {
        this.removeSelectModel();
        var indexStore = this.store[0];
        if (indexStore) {
            this.selectTileset.components = indexStore;
        }
        this.run();
        this.store = [];
        this.step = 0;
    }
    //下一步
    next() {
        this.removeSelectModel();
        this.step = this.step + 1;
        if (this.step < 0) return;
        var indexStore = this.store[this.step];
        if (indexStore) {
            this.selectTileset.components = indexStore;
        }

        this.run();
    }
    //上一步
    prev() {
        if (this.step <= 0) return;
        this.removeSelectModel();

        this.step = this.step - 1;
        // if (this.step < 0) return;
        var indexStore = this.store[this.step];
        if (indexStore) {
            this.selectTileset.components = indexStore;
        }
        this.run();
    }
    //执行
    run() {
        let _this = this;
        let components = this.selectTileset.components;
        if (components) {
            components.map(item => {
                if (item.value.clippingPlane) {
                    var primitives = CIM.viewer.scene.primitives._primitives;
                    var model = primitives.find((e) => {e
                        if (e instanceof Cesium.Model)
                            return item.value.id == e.id &&item.value.designSchemeId==e.designSchemeId;
                    });
                    if (model) {
                        if (item.value.clippingPlane != "[]") {
                            var clippingPlaneCollection = item.value.clippingPlane
                            if (item.value.clippingPlane._owner)
                                clippingPlaneCollection = new Cesium.ClippingPlaneCollection({
                                    modelMatrix: item.value.clippingPlane.modelMatrix,
                                    planes: item.value.clippingPlane._planes,
                                    edgeWidth: 0,
                                    edgeColor: Cesium.Color.WHITE,
                                    enabled: true,
                                });
                            model.clippingPlanes = clippingPlaneCollection;
                        }
                        else
                            item.value.clippingPlane = model.clippingPlanes;
                        ModelManager.initMaterialObj(model, {
                            relationIds: item.value.relationIds,
                            boundingbox: item.value.boundingbox,
                            topologyelements: item.value.topologyelements,//拓扑关系
                            url: item.value.url,
                            designSchemeId: item.value.designSchemeId,//设计方案ID
                            tableName: item.value.tableName,//对应的构件表名
                            houseId: item.value.houseId,//房屋id
                            objectid: item.value.objectid,
                            size: item.value.size,
                            clips: model.clippingPlanes
                        })
                    }
                    else {
                        _this.addMaterial(item.value);
                    }
                    _this.hideMatrial(item.value);
                } else {
                    _this.hideMatrial(item.value);
                    _this.addMaterial(item.value);
                }

            })
        }
    }
    createBoundingBox(boundingBox) {
        let min = new Cesium.Cartesian3(
            boundingBox.Min.X,
            boundingBox.Min.Y,
            boundingBox.Min.Z
        );
        let max = new Cesium.Cartesian3(
            boundingBox.Max.X,
            boundingBox.Max.Y,
            boundingBox.Max.Z
        );

        let sphere = Cesium.BoundingSphere.fromCornerPoints(
            min,
            max,
            new Cesium.BoundingSphere()
        );

        return sphere;
    }
    transformWithTilsets(tilesets, modelMatrix) {
        this.subtract = tilesets.subtract;
        this.obbCenter = tilesets.obbCenter;
        var tableName = tilesets.tableName;
        if (tableName) {
            var components = this.findComponentByTableName(tableName);
            for (let i = 0; i < components.length; i++) {
                this.setModelMatrix(modelMatrix, components[i]);
            }
        }
    }
    findComponentByTableName(tableName) {
        var primitives = CIM.viewer.scene.primitives._primitives;
        var components = [];
        for (let i = 0; i < primitives.length; i++) {
            if (primitives[i] instanceof Cesium.Model && primitives[i].tableName == tableName) {
                components.push(primitives[i]);
            }
        }
        return components;
    }
    setModelMatrix(modelMatrix, model) {
        var data = {
            boundingbox: model.boundingbox,
            topologyelements: model.topologyelements
        }
        var finalMatrix = this.getModelMatrix(modelMatrix, data);
        finalMatrix.then(da => {
            model.modelMatrix = da;
        })
    }
    removeModel() {
        for (let i = 0; i < this.allModel.length; i++) {
            CIM.viewer.scene.primitives.remove(this.allModel[i]);
        }
        this.allModel = [];
    }
    reduction(id, tileset) {
        if (tileset.style != null && tileset.style.show != null) return;

        var components = CIM.viewer.scene.primitives._primitives;
        var model = components.find(a => a.id == id);
        CIM.viewer.scene.primitives.remove(model);
        var index = this.allModel.indexOf(model);
        this.allModel.splice(index, 1);

        var condition = "${name} !== '" + id + "'";
        var expression = tileset.style.show.expression;
        var index = expression.indexOf(condition);
        if (index < 0) {
            return;
        }
        else if (index = 0) {
            condition = condition + "&&"
        }
        else {
            condition = "&&" + condition
        }
        expression = expression.replace(condition, "");

        var style = new Cesium.Cesium3DTileStyle();
        style.show = expression;
        tileset.style = style;
    }
    hideModel() {
        for (let i = 0; i < this.allModel.length; i++) {
            this.allModel[i].show = false;
        }
    }
    showModel() {
        for (let i = 0; i < this.allModel.length; i++) {
            this.allModel[i].show = true;
        }
    }
    async addLabel(face, data, modelMatrix, color, isMark = true) {
        let subtract = this.subtract || this.selectTileset.subtract;
        let obbCenter = this.obbCenter || this.selectTileset.obbCenter;

        var start = new Cesium.Cartesian3(data.Start.X, data.Start.Y, data.Start.Z);
        var end = new Cesium.Cartesian3(data.End.X, data.End.Y, data.End.Z);

        var mz1 = new Cesium.Cartesian4(
            (start.x - obbCenter.x) * 0.3048 + subtract.x,
            (start.y - obbCenter.y) * 0.3048 + subtract.y,
            (start.z - obbCenter.z) * 0.3048 + subtract.z,
            0
        );
        var mz2 = new Cesium.Cartesian4(
            (end.x - obbCenter.x) * 0.3048 + subtract.x,
            (end.y - obbCenter.y) * 0.3048 + subtract.y,
            (end.z - obbCenter.z) * 0.3048 + subtract.z,
            0
        );

        if (face == "南") {
            mz1.y -= 0.15;
            mz2.y -= 0.15;
        } else if (face == "西") {
            mz1.x -= 0.15;
            mz2.x -= 0.15;
        } else if (face == "北") {
            mz1.y += 0.1;
            mz2.y += 0.1;
        } else if (face == "东") {
            mz1.x += 0.1;
            mz2.x += 0.1;
        } else if (face == "下") {
            mz1.z += (-6.2007874015748028 * 0.3048);
            mz2.z += (-6.2007874015748028 * 0.3048);
        }
        mz1.z += -13 * 0.3048;
        mz2.z += -13 * 0.3048;
        var mz10 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix,
            mz1,
            new Cesium.Matrix4()
        );

        var mz20 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix,
            mz2,
            new Cesium.Matrix4()
        );


        // var position1 = new Cesium.Cartesian3(mz10[12], mz10[13], mz10[14]);
        // var position2 = new Cesium.Cartesian3(mz20[12], mz20[13], mz20[14]);
        //换一种取位置的写法
        var position1 = Cesium.Matrix4.getTranslation(mz10, new Cesium.Cartesian3())
        var position2 = Cesium.Matrix4.getTranslation(mz20, new Cesium.Cartesian3())



        // var certerPosition = new Cesium.Cartesian3((position1.x + position2.x) / 2, (position1.y + position2.y) / 2, (position1.z + position2.z) / 2);
        //Cartesian3.midpoint
        var certerPosition = new Cesium.Cartesian3.midpoint(position1, position2, new Cesium.Cartesian3());//取两个世界坐标点的中心点
        var length = (data.Length * 0.3048).toFixed(4) * 1000;
        var text = length.toString() + "mm"
        var poly = CIM.viewer.entities.add({
            name: '尺寸标注',
            position: certerPosition,
            polyline: {
                pixelSize: 5,
                material: color,
                width: 2,
                positions: [position1, position2],
            },
        });

        if (isMark) {
            poly.label = {
                text: text,
                font: '14px sans-serif',
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, 5),
            }
        }

        return poly;
    }
    removeMark() {
        if (this.allPolyLine != null) {
            for (let i = 0; i < this.allPolyLine.length; i++) {
                CIM.viewer.entities.remove(this.allPolyLine[i])
            }
        }
        this.allPolyLine = null;
    }
    async getData(tableName, colName, id, isEncode = false) {
        let param = `tableName=` + tableName + `&page=1&rows=10000&${colName}=` + encodeURIComponent(id);
        var url = tableServer.findDentityUrl + "?" + param;
        let data = await axios.get(url);
        return data;
    }
    openDoor(selectTileset, id) {
        var _this = this;
        var style = new Cesium.Cesium3DTileStyle();
        if (
            selectTileset.style != null &&
            selectTileset.style.show != null
        ) {
            style.show =
                selectTileset.style.show.expression +
                "&&" +
                "${name} !== '" +
                id +
                "'";
        } else {
            style.show = "${name} !== '" + id + "'";
        }
        selectTileset.style = style;

        var modelMatrix = selectTileset._root.transform;
        _this.getData("agcim3dentity_repalce", "objectid", id).then((res) => {
            if (!res.success) return;
            var data = res.content;

            var url = data[0].geometry;
            Cesium.Resource.fetchArrayBuffer(url).then(arraybuffer => {

                var finalMatrix = _this.getModelMatrix(modelMatrix, data[0]);
                _this.add(url, id, arraybuffer, finalMatrix, selectTileset, data[0].name)
            })
        });
    }

}

export default new RepalceMemeber();