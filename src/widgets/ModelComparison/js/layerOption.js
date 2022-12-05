import StyleCondition from "@/sdk/renderer/styleCondition";
class LayerOption {
    constructor() {
        this.tileset = null;
        this.panelWidth = null; 
        this.centerScreen = null;
        this.changeTiles = null;
        this.unchangeTiles = null;
        this.changedList = [];
        this.unchangeList = [];
        this.addOrDelete = [];
        this.styleConditionChange = null;
        this.styleConditionUnchange = null;
        this.flag;
    }
    initialization(vm) {
        let viewer = CIM.viewer;
        let layerList = viewer.scene.primitives._primitives;
        this.flag = vm.flag;
        for (var i = 0; i < layerList.length; i++) {
            if (layerList[i]["url"]===vm.selectedRows[0]["filePath"]) {
                this.changeTiles = layerList[i];
            } else if (layerList[i]["url"]===vm.selectedRows[1]["filePath"]) {
                this.unchangeTiles = layerList[i];
            }
        }
        //初始化StyleCondition
        this.styleConditionChange = new StyleCondition(this.changeTiles);
        this.styleConditionUnchange = new StyleCondition(this.unchangeTiles);
    }
    /**
        * 高亮当前选择的构件
        * @param {*} objectId 
        */
    hightlight(level, objectId, bigType, smallType) {
        let condition = `\${level} === '${level}' && \${id} === '${objectId}'`;
        let truecondition = "color('#FFFFFF',0.05)"
        let hideTiles = null;
        let showTiles = null;
        if (bigType === "change") {
            if (smallType == "unchange") {
                showTiles = this.unchangeTiles;
                hideTiles = this.changeTiles;
            } else if (smallType == "changed") {
                showTiles = this.changeTiles;
                hideTiles = this.unchangeTiles;
            }
        } else if (bigType === "add") {
            showTiles = this.changeTiles;
            hideTiles = this.unchangeTiles;
        } else if (bigType === "delete") {
            showTiles = this.unchangeTiles;
            hideTiles = this.changeTiles;
        }
        showTiles.show = true;
        hideTiles.show = false;
    }
    flyTo(data, type, smallType) {
        let boundFile = "boundingbox"
        if (type == "change") {
            if (smallType === "changed") {
                boundFile = "bboundingbox";
            } else if (smallType === "unchange") {
                boundFile = "tboundingbox";
            }
        }
        let tilesets = CIM.viewer.scene.primitives._primitives[0];
        var modelMatrix = tilesets.root.computedTransform;
        var info = data[boundFile];
        var sphere = null;
        // this.removeMark();
         if(info==='{"BoundingBox":}'){return;}
        var boundingbox = JSON.parse(info);
        var min = this.getWorldPosition(boundingbox.BoundingBox.Min, modelMatrix);
        var max = this.getWorldPosition(boundingbox.BoundingBox.Max, modelMatrix);
        sphere = Cesium.BoundingSphere.fromCornerPoints(min, max);
        var camera = CIM.viewer.scene.camera;
        var offset = new Cesium.HeadingPitchRange(
            camera.heading,
            camera.pitch,
            120
        );
        camera.flyToBoundingSphere(sphere, { offset: offset });
    }
    /**
     *从revit的局部坐标系转到Cartesian3坐标系
     * @param {object} localCoordinates 局部坐标系
     * @param {matrix4} modelMatrix 3dtiles的坐标矩阵
     * @param {number} scale 与米的换算单位，如为英寸则传入 0.3048
     * @param {string} face (可选) 构件朝向，仅在计算尺寸标注时需要传入
     * @returns {cartesian3} Cartesian3
     */
    getWorldPosition(localCoordinates, modelMatrix, scale = 1) {
        let coord = new Cesium.Cartesian3(
            localCoordinates.X * scale,
            localCoordinates.Y * scale,
            localCoordinates.Z * scale,
        );

        var mz = new Cesium.Cartesian4(
            coord.x,
            coord.y,
            coord.z
        )

        var mz10 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix,
            mz,
            new Cesium.Matrix4()
        );

        var position = Cesium.Matrix4.getTranslation(mz10, new Cesium.Cartesian3());
        return position;
    }
    /**
     * 展示修改树的构件
     * @create zgf 
     * @date 20201221
     * @param {*} data 
     */
    showChangeAllStructs(data, type, json, beforeOrChange, vm) {
        if(!this.flag){
            this.styleConditionChange.resetColorStyle("WHITE",0.05);
            this.styleConditionUnchange.resetColorStyle("WHITE",0.05);
            this.flag = true;
        }
        let conChanged = ``;
        let conUnchange = ``;
        if (data.length == 0) { return; }
        for (var i = 0; i < data.length; i++) {
            //当前为Root节点
            if (type == "Root") {
                //遍历data的每一项
                conUnchange = `\${name} === '${data[i].tobjectid}' `;
                conChanged = `\${name} === '${data[i].bobjectid}'`;
            } else if (type == "Level") {
                //根据level判断 当前为Level节点
                if (data[i]["tlevel"] == json["level"]) {
                    conUnchange = `\${name} === '${data[i].tobjectid}'`;
                }
                if (data[i]["blevel"] == json["level"]) {
                    conChanged = `\${name} === '${data[i].bobjectid}'`;
                }
            } else if (type == "small") {
                //当前为子节点
                if (beforeOrChange == "修改前") {
                    if (data[i]["tobjectid"] == json["objectid"]) {
                        conUnchange = `\${name} === '${data[i].tobjectid}' `;
                        continue;
                    }
                } else if (beforeOrChange == "修改后") {
                    if (data[i]["bobjectid"] == json["objectid"]) {
                        conChanged = `\${name} === '${data[i].bobjectid}'`;
                        continue;
                    }
                }
            } else if (type == "struct") {
                if (data[i]["tobjectid"] == json["objectid"]) {
                    conUnchange = `\${name} === '${data[i].tobjectid}' `;
                }
                if (data[i]["bobjectid"] == json["objectid"]) {
                    conChanged = `\${name} === '${data[i].bobjectid}'`;
                }
            }
            if (conUnchange !== ``) {
                var con2 = conUnchange;
                this.styleConditionUnchange.addColorStyle(con2 , "GREEN");
                this.unchangeList.push([conUnchange]);
                //conUnchange置为空后再进行循环
                conUnchange = ``;
            }
            if (conChanged !== ``) {
                var con = conChanged;
                this.styleConditionChange.addColorStyle(con , "TOMATO");
                this.changedList.push([conChanged]);
                //conChanged置为空后再进行循环
                 conChanged = ``;
            }
        }
        this.changeTiles.show = true;
        this.unchangeTiles.show = true;
    }
    /**
     * 取消checkbox时取消样式
     * @param {*} json 
     * @param {*} bigType 
     * @param {*} smallType 
     */
    removeStyleCondition(data,json, bigType, smallType, ss) {
        if (bigType == "change") {
            for (var i = 0; i < this.changedList.length; i++) {
                if (smallType == "Level") {
                    data.filter(e => {
                        if(  e.blevel == json["level"]){
                            if(this.changedList[i] != 0){
                                if (this.changedList[i][0].indexOf(e.bobjectid) >= 0) {
                                    this.changedList[i] = 0;
                                }
                            }
                        }
                    });
                } else if (smallType == "struct") {
                    if (this.changedList[i][0].indexOf(json["objectid"]) >= 0) {
                        this.changedList[i] = 0;
                    }
                } else if (smallType == "small") {
                    if (ss == "修改后") {
                        if (this.changedList[i][0].indexOf(json["objectid"]) >= 0) {
                            this.changedList[i] = 0;
                        }
                    }
                }
            }
            for (var j = 0; j < this.unchangeList.length; j++) {
                if (smallType == "Level") {                    
                    data.filter(e => {
                        if(  e.blevel == json["level"]){
                            if(this.unchangeList[j] != 0){
                                if (this.unchangeList[j][0].indexOf(e.bobjectid) >= 0) {
                                    this.unchangeList[j] = 0;
                                }
                            }
                        }
                    });
                } else if (smallType == "struct") {
                    if (this.unchangeList[j][0].indexOf(json["objectid"]) >= 0) {
                        this.unchangeList[j] = 0;
                    }
                } else if (smallType == "small") {
                    if (ss == "修改前") {
                        if (this.unchangeList[j][0].indexOf(json["objectid"]) >= 0) {
                            this.unchangeList[j] = 0;
                        }
                    }
                }
            }
            let changedList = [];
            let unchangeList = [];
            for (var m = 0; m < this.changedList.length; m++) {
                if (this.changedList[m] == 0) {
                    continue;
                } else {
                    if (this.changedList[m][0].indexOf("true") >= 0) { continue; }
                    changedList.push(this.changedList[m]);
                }
            }
            for (var n = 0; n < this.unchangeList.length; n++) {
                if (this.unchangeList[n] == 0) {
                    continue;
                } else {
                    if (this.unchangeList[n][0].indexOf("true") >= 0) { continue; }
                    unchangeList.push(this.unchangeList[n]);
                }
            }
            this.unchangeTiles.show = true;
            this.changeTiles.show = true;
            this.unchangeList = unchangeList;
            this.changedList = changedList;
            this.styleConditionUnchange.resetColorStyle("WHITE",0.05);
            this.styleConditionChange.resetColorStyle("WHITE",0.05);
            for (var o = 0; o < this.unchangeList.length; o++) {
                this.styleConditionUnchange.addColorStyle(this.unchangeList[o] ,"GREEN");
            }
            for (var p = 0; p < this.changedList.length; p++) {
                this.styleConditionChange.addColorStyle(this.changedList[p] , "TOMATO");
            }
        } else if (bigType == "add" || bigType == "delete") {
            for (var q = 0; q < this.addOrDelete.length; q++) {
                if (smallType == "Level") {                  
                    data.filter(e => {
                        if(  e.level == json["level"]){
                            if(this.addOrDelete[q] != 0){
                                if (this.addOrDelete[q][0].indexOf(e.objectid) >= 0) {
                                    this.addOrDelete[q] = 0;
                                }
                            }
                        }
                    });
                } else if (smallType == "struct") {
                    if (this.addOrDelete[q][0].indexOf(json["objectid"]) >= 0) {
                        this.addOrDelete[q] = 0;
                    }
                } else if (smallType == "small") {
                    if (this.addOrDelete[q][0].indexOf(json["objectid"]) >= 0) {
                        this.addOrDelete[q] = 0;
                    }
                }
            }
            let addOrDelete = [];
            for (var r = 0; r < this.addOrDelete.length; r++) {
                if (this.addOrDelete[r] == 0) {
                    continue;
                } else {
                    if (this.addOrDelete[r][0].indexOf("true") >= 0) { continue; }
                    addOrDelete.push(this.addOrDelete[r]);
                }
            }
            this.addOrDelete = addOrDelete;
            this.styleConditionUnchange.resetColorStyle("WHITE",0.05);
            this.styleConditionChange.resetColorStyle("WHITE",0.05);
            if (bigType == "add") {
                this.changeTiles.show = true;
                this.unchangeTiles.show = false;
                for(let s = 0; s < this.addOrDelete.length; s++){
                    this.styleConditionChange.addColorStyle(this.addOrDelete[s] , "TOMATO");
                }
            } else if (bigType == "delete") {
                this.unchangeTiles.show = true;
                this.changeTiles.show = false;
                for(let t = 0; t < this.addOrDelete.length; t++){
                    this.styleConditionUnchange.addColorStyle(this.addOrDelete[t] , "GREEN");
                }
            }
        }
    }
    /**
     * 展示添加或删除的构件
     * @param {*} data 
     * @param {*} type 
     * @param {*} json 
     * @param {*} beforeOrChange 
     */
    showAddOrDeleteStructs(data, type, json, bigType) {
        if(!this.flag){
            this.styleConditionChange.resetColorStyle("WHITE",0.05);
            this.styleConditionUnchange.resetColorStyle("WHITE",0.05);
            this.flag = true;
        }
        let addOrDelete = ``;
        if (data.length == 0) { return; }
        for (var i = 0; i < data.length; i++) {
            if (type == "Root") {
                addOrDelete = `\${name} === '${data[i].objectid}'`;
                this.addOrDelete.push([addOrDelete]);
            } else if (type == "Level") {
                if (data[i]["level"] == json["level"]) {
                    addOrDelete = `\${name} === '${data[i].objectid}'`;
                    this.addOrDelete.push([addOrDelete]);
                }
            } else if (type == "small") {
                if (data[i]["objectid"] == json["objectid"]) {
                    addOrDelete = `\${name} === '${data[i].objectid}'`;
                    this.addOrDelete.push([addOrDelete]);
                }
            } else if (type == "struct") {
                if (data[i]["objectid"] == json["objectid"]) {
                    addOrDelete = `\${name} === '${data[i].objectid}'`;
                    this.addOrDelete.push([addOrDelete]);
                }
            }
            if (addOrDelete !== ``) {
                if(bigType == 'add'){ 
                    this.changeTiles.show = true;
                    this.unchangeTiles.show = false;
                    for(let m = 0; m < this.addOrDelete.length; m++){
                        this.styleConditionChange.addColorStyle(this.addOrDelete[m] , "TOMATO");
                    }
                    
                }else if(bigType == 'delete'){
                    this.unchangeTiles.show = true;
                    this.changeTiles.show = false;
                    for(let n = 0; n < this.addOrDelete.length; n++){
                        this.styleConditionUnchange.addColorStyle(this.addOrDelete[n] , "GREEN");
                    }       
                };
            }
        }

    }
    /**
       *样式条件组合
       * @create zgf
       * @date 20201221
       * @param {*} objectList 
       */
    styleCheck(e, type, data) {
        let json = {};
        if (e.node.dataRef.category === "Root") {
            //根节点
            if (type == "change") {
                if (e.checked) {
                    this.showChangeAllStructs(data, "Root");
                } else {
                    this.changedList = [];
                    this.unchangeList = [];
                    this.cancelStyle();
                }
            } else if (type == "add" || type == "delete") {
                if (e.checked) {
                    this.showAddOrDeleteStructs(data, "Root", {}, type);
                } else {
                   this.addOrDelete=[];
                    this.cancelStyle();
                }
            }
        } else if (e.node.dataRef.category === "Level") {
            //level 节点
            if (type == "change") {
                json = { "level": e.node.dataRef.value, "objectid": e.node.dataRef.objectid };
                if (e.checked) {
                    this.showChangeAllStructs(data, "Level", json);
                } else {
                    this.removeStyleCondition(data,json, type, "Level");
                }
            } else if (type == "add" || type == "delete") {
                json = { "level": e.node.dataRef.value };
                if (e.checked) {
                    this.showAddOrDeleteStructs(data, "Level", json, type);
                } else {
                    this.removeStyleCondition(data,json, type, "Level");
                }
            }
        } else if (e.node.dataRef.category === "small") {
            //最下级目录
            if (type == "change") {
                json = { "objectid": e.node.dataRef.objectid };
                if (e.checked) {
                    this.showChangeAllStructs(data, "small", json, e.node.dataRef.name);
                } else {
                    this.removeStyleCondition(data,json, type, "small", e.node.dataRef.name);
                }
            } else if (type == "add" || type == "delete") {
                json = { "objectid": e.node.dataRef.objectid };
                if (e.checked) {
                    this.showAddOrDeleteStructs(data, "small", json, type);
                } else {
                    this.removeStyleCondition(data,json, type, "small", e.node.dataRef.name);
                }
            }
        } else {
            //最下级目录的上一级
            if (type == "change") {
                json = { "objectid": e.node.dataRef.objectid }
                if (e.checked) {
                    this.showChangeAllStructs(data, "struct", json);
                } else {
                    this.removeStyleCondition(data,json, type, "struct");
                }
            } else if (type == "add" || type == "delete") {
                json = { "objectid": e.node.dataRef.objectid }
                if (e.checked) {
                    this.showAddOrDeleteStructs(data, "struct", json, type);
                } else {
                    this.removeStyleCondition(data,json, type, "struct");
                }
            }
        }
    }
    /**
     * 取消样式
     */
    cancelStyle() {
        this.flag = false;
        this.changeTiles.show = true;
        this.unchangeTiles.show = true;
        this.styleConditionChange.resetColorStyle();
        this.styleConditionUnchange.resetColorStyle();
    }
}
var layerOption = new LayerOption();
export default layerOption;