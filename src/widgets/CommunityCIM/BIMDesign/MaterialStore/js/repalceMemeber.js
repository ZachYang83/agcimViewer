import axios from "@/views/js/net/http";
import user from "@/views/js/store/user";

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
        this.objectid = null;//被替换构件的objectid
    }
    async Initialize(selectedFeature, url, index = "1") {
        var id = null;
        this.repalceWay = index;
        if (!selectedFeature) return;
        this.selectTileset = this.getTileset(selectedFeature);
        
        id = this.getId(selectedFeature);
        this.objectid = id;
        this.tableName = this.selectTileset.tableName;
        this.subtract = this.selectTileset.subtract;
        this.obbCenter = this.selectTileset.obbCenter;
        //进行构件替换
        this.batchReplace(url, id, this.selectTileset);
    }
    async batchReplace(url, id, tileset) {
        var _this = this;
        var ids = [];
        var componentType;
        var modelMatrix = tileset._root.transform;
        let arraybuffer = await Cesium.Resource.fetchArrayBuffer(url);
        let modelResult = await _this.getData(_this.tableName, "objectid", id);
        if (!modelResult.success) return;
        let indexModel = modelResult.content.rows[0];
        componentType = indexModel.name;
        //删除上次引入的构件
        _this.removeSelectModel();//清空同种类型的构建
        if (_this.repalceWay === "1") {
            ids.push("${name} !== '" + indexModel.objectid + "'");
            var da = await _this.getModelMatrix(modelMatrix, indexModel);
            let _selectModelID = componentType + '$$' + indexModel.level + '@@'+ id;//level楼层 id具体构件是objectid
            //添加单个构件
            _this.add(url, indexModel, arraybuffer, da, tileset, _selectModelID)
            _this.selectModelID = _selectModelID;
        } else {
            let batchs = await _this.getData(_this.tableName, "name", componentType, true);
            if (!batchs.success) return;
            var manyDatas = batchs.content.rows;
            if (_this.repalceWay === "2") {
                manyDatas = manyDatas.filter(item => item.level === indexModel.level)
            }
            
            //添加多个构件
            for (let i = 0; i < manyDatas.length; i++) {
                ids.push("${name} !== '" + manyDatas[i].objectid + "'");
                var da = await _this.getModelMatrix(modelMatrix, manyDatas[i]);
                _this.add(url, manyDatas[i], arraybuffer, da, tileset, componentType + '$$'  + manyDatas[i].level + '@@'+ manyDatas[i].objectid)
            }
            _this.selectModelID = componentType + '$$' + indexModel.level + '@@'+  id;
        }

        //隐藏房屋原构件
        var style = new Cesium.Cesium3DTileStyle();
        var condition = ids.join("&&");
        if (
            tileset.style != null &&
            tileset.style.show != null
        ) {
            style.show =
                tileset.style.show.expression +
                "&&" + condition;
        } else {
            style.show = condition;
        }
        tileset.style = style;
    }
    //标记构件的长宽
    async sizeMarking(id, selectedFeature) { 
        var _this = this;
        this.selectTileset = this.getTileset(selectedFeature);
        this.tableName = this.selectTileset.tableName;
        this.selectModelID = undefined;//重置替换的构建类型
     
        var modelMatrix = this.selectTileset._root.transform;
        this.removeMark();
        this.allPolyLine = [];
        this.subtract = this.selectTileset.subtract;
        this.obbCenter = this.selectTileset.obbCenter; 
        //发送请求从后台取
        _this.getData(_this.tableName, "objectid", id).then((res) => { 
            if(res.success && res.content){
                var data = res.content.rows;
                var topology = eval("(" + data[0].topologyelements + ")");
                for (let i = 0; i < topology.Sizes.length; i++) {
                    _this.addLabel(topology.Facing, topology.Sizes[i], modelMatrix, Cesium.Color.RED).then(poly => {
                        _this.allPolyLine.push(poly);
                    }); 
                }
            }
            
        });
    }
    //获取tileset对象
    getTileset(selectedFeature) {
        if (selectedFeature.tileset) {//如果是3dtile就更新this.selectTileset
            return selectedFeature.tileset
        } else {
            return CIM.viewer.scene._primitives._primitives.find(item => {
                return item.tableName == selectedFeature.tableName
            })
        }

    }
    //获取id
    getId(selectedFeature) {
        if (selectedFeature instanceof Cesium.Model) {
            return selectedFeature.id;
        } else {
            return selectedFeature.getProperty("name");
        }

    }
    async getModelMatrix(modelMatrix, data) {

        let subtract = this.subtract;
        let obbCenter = this.obbCenter;
        var m1 = Cesium.Matrix3.fromRotationZ(
            Cesium.Math.toRadians(-90)
        );
        var modelMatrix1 = Cesium.Matrix4.multiplyByMatrix3(
            modelMatrix,
            m1,
            new Cesium.Matrix4()
        );

        var boundingbox = eval("(" + data.boundingbox + ")").BoundingBox;
        var topology = eval("(" + data.topologyelements + ")");

        var sphere = this.createBoundingBox(boundingbox);

        var m2 = new Cesium.Cartesian4(
            -(sphere.center.y - obbCenter.y),
            (sphere.center.x - obbCenter.x) ,
            (sphere.center.z - obbCenter.z)+1 ,
            0
        );

        var modelMatrix2 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix1,
            m2,
            new Cesium.Matrix4()
        );

        var finalMatrix = modelMatrix2;
        var face = topology.Facing;
        var m3 = null;
        if (face == "西") {
            m3 = Cesium.Matrix3.fromRotationZ(
                Cesium.Math.toRadians(270)
            );
        } else if (face == "北") {
            m3 = Cesium.Matrix3.fromRotationZ(
                Cesium.Math.toRadians(180)
            );
        } else if (face == "东") {
            m3 = Cesium.Matrix3.fromRotationZ(
                Cesium.Math.toRadians(90)
            );
        }

        if (m3 != null) {
            finalMatrix = Cesium.Matrix4.multiplyByMatrix3(
                modelMatrix2,
                m3,
                new Cesium.Matrix4()
            );
        }

        return finalMatrix;
    }
    add(url, data, arraybuffer, finalMatrix, option, componentType) {
        let id = data.objectid;
        var model = new Cesium.Model({
            id: data.objectid,
            gltf: arraybuffer,
            modelMatrix: finalMatrix,
            scale: 1,
            debugShowBoundingVolume: false
        })
        CIM.viewer.scene.primitives.add(model);
        if (option instanceof Cesium.Cesium3DTileset) {
            if (!option.components) option.components = [];
            option.components.push(data.objectid);
            model.tileUrl = option.url;
        } else {
            var tiles = CIM.viewer.scene.primitives._primitives.find(a => a.url == option.tileUrl);
            tiles.components.push(data.objectid);

            var index = tiles.components.indexOf(option);
            tiles.components.splice(index, 1);
            model.tileUrl = option.tileUrl;
        }
        model.componentType = componentType;
        model.boundingbox = data.boundingbox;//包围盒
        model.topologyelements = data.topologyelements;//拓扑关系
        model.url = url;
        model.userId = user.state.userId; //用户ID
        model.tableName = this.tableName;//对应的构件表名
        model.objectid = this.objectid;//替换掉的feature的objectid
        this.allModel.push(model);
        this.selectModelID = componentType;
    }
    removeSelectModel() {
        let componentType = this.selectModelID;//缓存里的构件
        if (!componentType) return;
        
        if (this.repalceWay && this.repalceWay === "2") {
            componentType = componentType.split('@@')[0];
        }
        if (this.repalceWay && this.repalceWay === "3") {
            componentType = componentType.split('$$')[0];
        }

        var components = CIM.viewer.scene.primitives._primitives;
        for (let i = components.length - 1; i >= 0; i--) {
            if (components[i] instanceof Cesium.Model &&
                components[i].componentType &&
                components[i].componentType.includes(componentType)) {
                CIM.viewer.scene.primitives.remove(components[i]);

                var index = this.allModel.indexOf(components[i]);
                this.allModel.splice(index, 1);
            }
        }
        this.selectModelID = undefined;

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
        var components = tilesets.components;
        if (components) {
            for (let i = 0; i < components.length; i++) {
                var component = this.findComponentById(components[i]);
                this.setModelMatrix(modelMatrix, component, component.id);
            }
        }
    }
    findComponentById(id) {
        var primitives = CIM.viewer.scene.primitives._primitives;
        var component = null;
        for (let i = 0; i < primitives.length; i++) {
            if (primitives[i].id == id) {
                component = primitives[i];
                return component;
            }
        }
    }
    // setModelMatrix(modelMatrix, model, id) {
    //     var _this = this;
    //     _this.getData(_this.tableName, "objectid", id).then((res) => {
    //         if (!res.success) return;
    //         var data = res.content;
    //         var finalMatrix = _this.getModelMatrix(modelMatrix, data[0]);
    //         finalMatrix.then(da => {
    //             model.modelMatrix = da;
    //         })
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
        // this.subtract = this.selectTileset.subtract;
        // this.obbCenter = this.selectTileset.obbCenter;
        let subtract = this.subtract || this.selectTileset.subtract;
        let obbCenter = this.obbCenter || this.selectTileset.obbCenter;

        var start = new Cesium.Cartesian3(data.Start.X, data.Start.Y, data.Start.Z);
        var end = new Cesium.Cartesian3(data.End.X, data.End.Y, data.End.Z);

        // var mz1 = new Cesium.Cartesian4(

        //     (start.x - obbCenter.x) * 0.3048 + subtract.x,
        //     (start.y - obbCenter.y) * 0.3048 + subtract.y,
        //     (start.z - obbCenter.z) * 0.3048 + subtract.z,
        //     0
        // );
        // var mz2 = new Cesium.Cartesian4(
        //     (end.x - obbCenter.x) * 0.3048 + subtract.x,
        //     (end.y - obbCenter.y) * 0.3048 + subtract.y,
        //     (end.z - obbCenter.z) * 0.3048 + subtract.z,
        //     0
        // );
        var mz1 = new Cesium.Cartesian4(
            start.x * 0.3048 - obbCenter.x,
            start.y * 0.3048 - obbCenter.y,
            start.z * 0.3048 - obbCenter.z+1,
            0
        );
        var mz2 = new Cesium.Cartesian4(
            (end.x) * 0.3048 - obbCenter.x,
            (end.y) * 0.3048 - obbCenter.y,
            (end.z) * 0.3048 - obbCenter.z+1,
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
        }


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


        var position1 = new Cesium.Cartesian3(mz10[12], mz10[13], mz10[14]);
        var position2 = new Cesium.Cartesian3(mz20[12], mz20[13], mz20[14]);

        var certerPosition = new Cesium.Cartesian3((position1.x + position2.x) / 2, (position1.y + position2.y) / 2, (position1.z + position2.z) / 2);
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

        var url = `agsupport-data-manager/agsupport-rest/BIM/dentity/find?` + param;

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
    addPoint(data, modelMatrix) {
        var boundingbox = eval("(" + data[0].boundingbox + ")").BoundingBox;
        var sphere = this.createBoundingBox(boundingbox);
        var mz2 = new Cesium.Cartesian4(
            (sphere.center.x - this.obbCenter.x) * 0.3048 + this.subtract.x,
            (sphere.center.y - this.obbCenter.y) * 0.3048 + this.subtract.y,
            (sphere.center.z - this.obbCenter.z) * 0.3048 + this.subtract.z,
            0
        );
        var mz20 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix,
            mz2,
            new Cesium.Matrix4()
        );
        var position1 = new Cesium.Cartesian3(mz20[12], mz20[13], mz20[14]);

        var point = CIM.viewer.entities.add({
            name: '尺寸标注',
            position: position1,
            point: {
                color: Cesium.Color.YELLOWGREEN, //点位颜色
                pixelSize: 10 //像素点大小
            }
        });
    }
    setStyle(style, condition, tileset, index) {
        setTimeout(function () {
            condition = tileset.style.show.expression + condition;
            style.show = condition;
            tileset.style = style;
        }, index * 3000);
        index++;
        return index;
    }

}

export default new RepalceMemeber();