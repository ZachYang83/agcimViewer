/*
 * @Author: pwz
 * @Date: 2020-09-23 11:24:46
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-01-25 16:24:33
 * @FilePath: \village-building-design\src\widgets\villageBuilding\src\buildingHouse.js
 */

import modelManager from "./../../js/modelManager";
import tableServer from "./../../server/tableServer";
import BaseLine from "./baseLine.js"
/**
 * @description: 传入房屋3dtileset对象，进行装配式建筑初始化
 * @param {type}  
 * @return {type} 
 */
export default async function init(tileset) {

    let baseLine = new BaseLine(tileset);
    var tableName = tileset.tableName;
    console.log(tableName);
    
    //let outLineHeight = await getBaseLineHeight();//测量线高度
    // let outLine = await getBaseLine(tableName);//测量线
    //tileset.baseLine = outLine;//绑定测量地基线到房子对象

    // let obbCenter = tileset.obbCenter;
    // let subtract = tileset.subtract;
    //房子结构
    let BldgLevel = await getHouseLevel({
        tableName,
        level: "level"
    })
    //根据 墙壁 梁柱 地板 家具 管线划分构件大类
    let wallOption = ["墙"];
    let columnOption = ["结构柱", "结构框架"];
    let floorOption = ["楼板"];
    let roofOption = ["屋顶"];
    let pipeOption = ["管道"];
    let windowDoorOption = ["门", "窗"];
    let furnitureOption = ["家具"];
    let floorDecoration = [
        { key: floorOption, label: "铺设楼板" },//地板
        { key: columnOption, label: "浇筑梁柱" },//地板
        { key: wallOption, label: "砌墙" },//地板
    ]
    var style = new Cesium.Cesium3DTileStyle();
    if (!tileset) return;
    // var modelMatrix = tileset._root.transform;
    let buildingHouseStep = [];
    let indexStep = -1;
    //保持房子的装饰状态
    let _DecorationState = {};
    //基础设置状态
    let baseStationState = {};
    //上一个构件高亮状态
    let lastDecorationsTyle;


    function createBuilding(position) {
        var cartographic = Cesium.Cartographic.fromCartesian(position);
        modelManager.add3dTiles(selectBinPropety, cartographic);
    }

    function flattenInit() {
    }
    function hideFlatten(feature, condition) {
    }
    //测量线
    function measuringInit() {
        baseLine.add();
    }
    //隐藏测量线
    function hideIeasuring() {
        baseLine.remove();
    }
    //显示房屋样式
    function _setStyle(condition) {
        tileset.style = new Cesium.Cesium3DTileStyle({show:condition});
    }
    //隐藏房屋
    function _hideStyle() {
        tileset.show = false;
    }
    //完成房屋设计
    function finishDesign() {
        tileset.style=new Cesium.Cesium3DTileStyle({show:true});
        hideIeasuring();
    }
    //设置高亮
    function highLight(feature) {

        if (!lastDecorationsTyle) {
            return feature.color;
        } else {
            const targetColor = Cesium.Color.fromAlpha(feature.color, 0.95);
            return Cesium.Color.clone(targetColor, feature.color);
        }

    }

    function houseInit() {
        function initDecoration(param, description) {
            function fn() {
                getMaterials(param).then(da => {
                    // console.log(da);
                        let objectIdS = da.rows.map(item => item.objectid);
                        let condition = objectIdS.map(item => "${id} === '" + item + "'").join(" || ");
                    // let condition = "${id} === '" + da.id + "'";
                    // console.log(condition);
                    
                    setStyle(condition, description)();
                })
            }
            return { active: fn, label: description }

        }
        function setStyle(condition) {
            return function () {
                if (!condition) {
                    _DecorationState[indexStep] = tileset.style.show.expression;
                    return;
                }
                _DecorationState[indexStep] = tileset.style.show.expression + " || " + condition;
                if (_DecorationState[indexStep - 1]) { lastDecorationsTyle = condition }
                condition = tileset.style.show.expression + " || " + condition;
                _setStyle(condition);
            }
        }
        //地基
        let foundationInit = () => {
            let condition = "${id} === '467164' ";
            style.show = condition;
            tileset.style = style;
            initDecoration({
                catagory: "结构基础"
            }, "地基").active();
        }

        //设置每一层楼
        let setFloor = (index) => {
            return floorDecoration.map(item => {
                return initDecoration({
                    level: index,
                    catagory: item.key
                }, (index || "") + ":" + item.label)
            })
        }
        let floorsArr = BldgLevel.map(item => setFloor(item));
        return [
            { active: foundationInit, label: "地基" },
            floorsArr,
            initDecoration({
                catagory: roofOption
            }, "搭建屋顶"),
            initDecoration({
                catagory: pipeOption
            }, "布设管线"),
            initDecoration({
                catagory: windowDoorOption
            }, "安装门窗"),
            initDecoration({
                catagory: furnitureOption
            }, "摆设家具")
        ].flat(Infinity)
    }
    // function addLabel( data, modelMatrix, color, polylines) {

    //     var start = new Cesium.Cartesian3(data.Start.X, data.Start.Y, data.Start.Z);
    //     var end = new Cesium.Cartesian3(data.End.X, data.End.Y, data.End.Z);

    //     var mz1 = new Cesium.Cartesian4(
    //         (start.x - obbCenter.x) * 0.3048 + subtract.x,
    //         (start.y - obbCenter.y) * 0.3048 + subtract.y,
    //         (start.z - obbCenter.z) * 0.3048 + subtract.z,
    //         0
    //     );
    //     var mz2 = new Cesium.Cartesian4(
    //         (end.x - obbCenter.x) * 0.3048 + subtract.x,
    //         (end.y - obbCenter.y) * 0.3048 + subtract.y,
    //         (end.z - obbCenter.z) * 0.3048 + subtract.z,
    //         0
    //     );

    //     mz1.z += (-13.2007874015748028 * 0.3048);
    //     mz2.z += (-13.2007874015748028 * 0.3048);
    //     // if (face == "南") {
    //     //     mz1.y -= 0.15;
    //     //     mz2.y -= 0.15;
    //     // } else if (face == "西") {
    //     //     mz1.x -= 0.15;
    //     //     mz2.x -= 0.15;
    //     // } else if (face == "北") {
    //     //     mz1.y += 0.1;
    //     //     mz2.y += 0.1;
    //     // } else if (face == "东") {
    //     //     mz1.x += 0.1;
    //     //     mz2.x += 0.1;
    //     // } else if (face == "下") {
    //     //     mz1.z += (-13.2007874015748028 * 0.3048);
    //     //     mz2.z += (-13.2007874015748028 * 0.3048);
    //     // }

    //     var mz10 = Cesium.Matrix4.multiplyByTranslation(
    //         modelMatrix,
    //         mz1,
    //         new Cesium.Matrix4()
    //     );
    //     var mz20 = Cesium.Matrix4.multiplyByTranslation(
    //         modelMatrix,
    //         mz2,
    //         new Cesium.Matrix4()
    //     );


    //     var position1 = new Cesium.Cartesian3(mz10[12], mz10[13], mz10[14]);
    //     var position2 = new Cesium.Cartesian3(mz20[12], mz20[13], mz20[14]);
    //     polylines.add({
    //         // pixelSize: 5,
    //         material: new Cesium.Material({
    //             fabric: {
    //                 type: 'Color',
    //                 uniforms: {
    //                     color: Cesium.Color.RED,
    //                 }
    //             }
    //         }),
    //         positions: [position1, position2],
    //         width: 2
    //     });
    // }
    //测量线
    // function addBaseLine() {
    //     baseLine = new Cesium.PrimitiveCollection();
    //     var polylines = new Cesium.PolylineCollection();
    //     baseLine.add(polylines);
    //     baseLine.houseId = tileset.id;
    //     CIM.viewer.scene.primitives.add(baseLine)
    //     for (let i = 0; i < outLine.length; i++) {
    //         addLabel(outLine[i], modelMatrix, new Cesium.PolylineDashMaterialProperty({
    //             color: Cesium.Color.RED,
    //         }), polylines);
    //     }
    //     return polylines;
    // }
    // //移动测量线
    // function transfromBaseLine(){
    //     for (let i = 0; i < outLine.length; i++) {
    //         addLabel(outLine[i], modelMatrix, new Cesium.PolylineDashMaterialProperty({
    //             color: Cesium.Color.RED,
    //         }), polylines);
    //     }
    // }

    //开始装配
    function start() {
        buildingHouseStep.push({ type: "base", active: measuringInit, remove: hideIeasuring, label: "测量放线" });
        let houseArr = houseInit()//针对房屋拆解
        houseArr.map(item => {
            buildingHouseStep.push({ type: "house", active: item.active, label: item.label });
        })
    }
    //向后搭建
    function next(index, callBack) {
        if (index && index < buildingHouseStep.length) {
            indexStep = index;
            for (let i = 0; i <= indexStep; i++) {
                run(i);
            }
            return
        }
        if (indexStep < buildingHouseStep.length - 1) {
            indexStep += 1;
            if (!runState(indexStep)) {
                run(indexStep);
            }
            if (callBack) {
                callBack(false, false)
            }

            return { label: buildingHouseStep[indexStep].label, status: indexStep }

        } else {
            finishDesign();
            if (callBack) {
                callBack(false, true)
            }
            return { label: buildingHouseStep[buildingHouseStep.length - 1].label, status: undefined }
        }
    }
    //回退
    function prev(index, callBack) {
        if (indexStep < 0) {
            if (callBack) {
                callBack(true, false)
            }
            return
        }
        if (indexStep >= 0) {
            if (runState(indexStep, false)) {
                if (callBack) {
                    callBack(false, false)
                }
            }
        }
        indexStep = indexStep - 1;
        return { label: buildingHouseStep[indexStep].label, status: indexStep }
    }
    //执行操作
    function run(index) {
        var fnOb = buildingHouseStep[index];
        if (!fnOb) return;
        if (fnOb.type === "base") {//基础设施
            baseStationState[index] = fnOb;
            fnOb.active();
        } else if (fnOb.type === "house") {//房子设施
            fnOb.active();
        }
    }
    //从状态里执行操作,继续进行或者撤销操作
    function runState(index, doType = true) {
        //如果是房子操作有缓存状态
        if (_DecorationState[index]) {
            if (doType) {
                _setStyle(_DecorationState[index]);
            } else {
                if (_DecorationState[index - 1]) {
                    _setStyle(_DecorationState[index - 1]);
                } else {
                    _hideStyle();
                }
            }
            return true
        } else if (baseStationState[index]) {//基础设施的缓存状态
            if (doType) {//进行下一步
                baseStationState[index].active();
            } else {//撤销操作
                baseStationState[index].remove();
            }
            return true
        }
        return false
    }
    //重建
    function reset() {
        _setStyle("false");
        indexStep = -1;
        //保持房子的装饰状态
        _DecorationState = {};
        //基础设置状态
        baseStationState = {};
        //上一个构件高亮状态
        lastDecorationsTyle;
    }
    //清除房屋
    function remove() {
        hideIeasuring();
        modelManager.removeHouses(tileset);
        // CIM.viewer.scene.primitives.remove(tileset);
    }
    //通过参数获取构件列表
    async function getMaterials(param) {
        // console.log(param);
        param = Object.assign({}, param, {
            tableName,
            // entitytable:tableName,
            // paramType:1,
           page:0,  
            rows: 100000,
            filterType:"filterType"
        })
    
        console.log(param,'param1');
        //参数逗号分隔
        // console.log(param.catagory );
        // console.log(param.level );
        
        if (param.catagory && Array.isArray(param.catagory)) {
            param.catagory = param.catagory.join(",");
        }
        if (param.level && Array.isArray(param.level)) {
            param.level = param.level.join(",");
        }
        let re = await tableServer.findDentityy(param);
        console.log(re);
        
            return re.content;

            
    }
    //获取房子结构
    async function getHouseLevel(param) {
        let data = await tableServer.statisticsDentity(param);
        console.log(data);       
        let result = data.content.level;

        let filterData = result.map(item => {
            return item.name
        });
        return filterData.sort().filter(item => item !== " ");

    }
    // //获取房屋的地基线
    // async function getBaseLine(indexTileTable) {
    //     let param = {
    //         tableName: "agcim3dproject",
    //         projectname: encodeURIComponent(indexTileTable)
    //     }
    //     let result = await tableServer.findDentity(param);
    //     let data = result.content.rows;
    //     let re = JSON.parse(data[0].baseline)
    //     return re;
    // }
    //获取测量线相对房子的高度 默认为基础结构的高度
    // async function getBaseLineHeight() {
    //     let data = await getMaterials({
    //         catagory: "结构基础"
    //     });


    // }
    //建房子大业从这开始
    start();
    reset();
    next();//默认开始第一步
    return {
        flattenInit,
        houseInit,
        start,
        next,
        prev,
        reset,
        remove,
    }
}