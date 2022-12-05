
import modelManager from "../../common/modelManager";
export default function init(tileset) {
    let baseLine;
    let index3dTies = "http://106.53.221.204:6700/tileset/country_index/cesium3dtiles/villageBuildingNew/tileset.json";
    let outLine = [{ "Direction": { "Z": 0.0, "Y": 1.0, "X": 0.0 }, "Start": { "Z": 0.0, "Y": -16.355552736663405, "X": -17.834475865278545 }, "End": { "Z": 0.0, "Y": 28.908472987522593, "X": -17.834475865278545 }, "Length": 45.264025724186 },
    { "Direction": { "Z": 0.0, "Y": 1.0, "X": 0.0 }, "Start": { "Z": 0.0, "Y": -16.151904202350881, "X": -4.9735834768271463 }, "End": { "Z": 0.0, "Y": 28.908472987522583, "X": -4.9735834768271463 }, "Length": 45.060377189873464 },
    { "Direction": { "Z": 0.0, "Y": 1.0, "X": 0.0 }, "Start": { "Z": 0.0, "Y": -16.151904202350881, "X": 2.90043227120435 }, "End": { "Z": 0.0, "Y": 28.908472987522583, "X": 2.90043227120435 }, "Length": 45.060377189873464 },
    { "Direction": { "Z": 0.0, "Y": 1.0, "X": 0.0 }, "Start": { "Z": 0.0, "Y": -16.355552736663405, "X": 16.61434303235923 }, "End": { "Z": 0.0, "Y": 28.908472987522593, "X": 16.61434303235923 }, "Length": 45.264025724186 },
    { "Direction": { "Z": 0.0, "Y": 0.0, "X": 1.0 }, "Start": { "Z": 0.0, "Y": -7.3072786824327345, "X": -23.931870643991992 }, "End": { "Z": 0.0, "Y": -7.3072786824327345, "X": 24.93861086767965 }, "Length": 48.870481511671642 },
    { "Direction": { "Z": 0.0, "Y": 0.0, "X": 1.0 }, "Start": { "Z": 0.0, "Y": 2.5352410026066217, "X": -25.244206601997288 }, "End": { "Z": 0.0, "Y": 2.5352410026066217, "X": 24.938610867679646 }, "Length": 50.182817469676934 },
    { "Direction": { "Z": 0.0, "Y": 0.0, "X": 1.0 }, "Start": { "Z": 0.0, "Y": 9.0969207926328721, "X": -25.244206601997281 }, "End": { "Z": 0.0, "Y": 9.0969207926328721, "X": 24.938610867679653 }, "Length": 50.182817469676934 },
    { "Direction": { "Z": 0.0, "Y": 0.0, "X": 1.0 }, "Start": { "Z": 0.0, "Y": 20.5798604251788, "X": -25.244206601997281 }, "End": { "Z": 0.0, "Y": 20.5798604251788, "X": 24.938610867679653 }, "Length": 50.182817469676934 }]
    let obbCenter = getObbCenter();
    let subtract = {
        x: 0.16160769527778066,
        y: -0.35996915935538665,
        z: 1.90601902455091
    }

    //房子结构
    let BaseCategory = ["Walls", "Doors", "Floors", "Windows", "Roofs", "Columns", "Furniture", "PlumbingFixtures", "Casework", "Stairs", "SpecialtyEquipment", "Pipes", "PipeFitting", "StructuralColumns", "StructuralFoundation", "StructuralFraming", "StairsRailing"]
    let BldgLevel = [-1, 0, 1, 2, 3];
    let Walls = "${BaseCategory} === 'Walls'";
    let Columns = "(${BaseCategory} === 'Floors' || ${BaseCategory} === 'Columns' || ${BaseCategory} === 'StructuralColumns' || ${BaseCategory} === 'StructuralFoundation'  || ${BaseCategory} === 'StructuralFraming')";
    let Furniture = "(${BaseCategory} === 'Furniture' || ${BaseCategory} === 'PlumbingFixtures' || ${BaseCategory} === 'Stairs' || ${BaseCategory} === 'SpecialtyEquipment' || ${BaseCategory} === 'StairsRailing')";
    let Roofs = "${BaseCategory} === 'Roofs'";
    let Floors = "${BaseCategory} === 'Floors'";
    let Pipes = "(${BaseCategory} === 'Pipes' || ${BaseCategory} === 'PipeFitting' || ${Discipline} === 'Piping')";
    let DoorWindow = "(${BaseCategory} === 'Doors' || ${BaseCategory} === 'Windows')"

    // if (!selectBinPropety) {
    //     selectBinPropety = {
    //         url:
    //             "http://106.53.221.204:6700/tileset/country_index/cesium3dtiles/villageBuildingNew/tileset.json",
    //         name: "示例數據",
    //         property_url: "/getAll/villageBuilding1",
    //         tableName: "agcim3dentity_via",
    //         transform: JSON.parse(`{"0":0.4170574188373083,"1":0.5084878545420938,"2":-0.7533280899952831,"3":0,"4":-0.8391398271942255,"5":-0.10298382841103011,"6":-0.5340774115259442,"7":0,"8":-0.349152487903505,"9":0.854888549969519,"10":0.383742240731726,"11":0,"12":-2228070.034721209,"13":5455326.431980324,"14":2432356.1328094,"15":1}`)
    //     }
    // }

    var style = new Cesium.Cesium3DTileStyle();
    // style.color = {
    //     evaluateColor: function (feature, result) {

    //         // const targetColor = Cesium.Color.fromAlpha(Cesium.Color.YELLOW, 0.3);
    //         // feature.color = Cesium.Color.clone(targetColor, result);
    //         // return feature.color
    //         // if (highLight()) {

    //         // } else {
    //         //     return Cesium.Color.clone(Cesium.Color.WHITE, result);
    //         // }
    //         //
    //         return highLight(feature)
    //     }
    // };
    if (!tileset)
        tileset = CIM.viewer.scene.primitives._primitives.find(a => a.url === index3dTies);
    // //如果找不到就創建新的房子
    // tileset = createBuilding(position);

    var modelMatrix = tileset._root.transform;
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
    function measuringInit() {
        if (baseLine) {
            baseLine.show = false

        } else {
            // for (let i = 0; i < outLine.length; i++) {
            //     var poly = addLabel("下", outLine[i], modelMatrix, new Cesium.PolylineDashMaterialProperty({
            //         color: Cesium.Color.RED,
            //     }), false);

            //     baseLine.push(poly);
            // }
            addLabels();

            tileset.baseLine = baseLine;

        }

    }
    function hideIeasuring() {
        if (baseLine) {
            baseLine.show = false
        }
    }
    //显示房屋样式
    function _setStyle(condition) {
        if (condition) style.show = condition;
        // style.color = { conditions: [[Walls, 'color("red", 0.5)'],] }
        tileset.style = style;
        tileset.show = true;

    }
    //隐藏房屋
    function _hideStyle() {
        tileset.show = false;
    }
    //完成房屋设计
    function finishDesign() {
        _setStyle();
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
        // tileset.style = style;
        var condition = "";
        let houseDecoration = [
            // Floors,
            Columns,
            Walls
        ]
        //地基
        let foundationInit = () => {
            // hideIeasuring();
            tileset.show = true;
            condition = "${name} === '467164' || ${BaseCategory} === 'StructuralFoundation'";
            style.show = condition;
            tileset.style = style;
            return setStyle("|| (${BaseCategory} === 'Floors' && ${BldgLevel} === '-1')")();
        }
        function setStyle(condition) {
            return function () {
                _DecorationState[indexStep] = tileset.style.show.expression + condition;
                if (_DecorationState[indexStep - 1]) { lastDecorationsTyle = condition }
                condition = tileset.style.show.expression + condition;
                style.show = condition;
                tileset.style = style;
                tileset.show = true;
            }
        }
        //装饰构件，门，墙，家具等
        function initCondition(option) {
            return setStyle("|| " + option);
        }
        //实现每一层楼的通用装配
        function setFloorCommon(condition) {
            let filter = "";
            //设置过滤条件
            function setCondition(option) {
                if (filter == "") {
                    filter = option;
                    return filter;
                }
                filter = filter + " || " + option;
                return '(' + filter + ')';
            }
            return houseDecoration.map((item) => {
                return setStyle('|| (' + condition + ' && ' + setCondition(item) + ')');
            })
        }
        let setFloor_1 = () => {
            return setFloorCommon(" ${BldgLevel} === '-1'")
        }
        let setFloor0 = () => {
            return setFloorCommon(" ${BldgLevel} === '0'")
        }
        let setFloor1 = () => {
            return setFloorCommon(" ${BldgLevel} === '1'")
        }
        let setFloor2 = () => {
            return setFloorCommon(" ${BldgLevel} === '2'")
        }
        let setFloor3 = () => {
            return setFloorCommon(" ${BldgLevel} === '3'");
        }
        return [
            foundationInit, setFloor_1(), setFloor0(), setFloor1(), setFloor2(), setFloor3(),
            initCondition(Roofs), initCondition(Pipes), initCondition(DoorWindow), initCondition(Furniture)
        ].flat(Infinity)
    }
    function addLabel(face, data, modelMatrix, color, polylines) {

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

        //var certerPosition = new Cesium.Cartesian3((position1.x + position2.x) / 2, (position1.y + position2.y) / 2, (position1.z + position2.z) / 2);


        // var poly = CIM.viewer.entities.add({
        //     // name: '尺寸标注',
        //     // position: certerPosition,
        //     polyline: {
        //         pixelSize: 5,
        //         material: color,
        //         width: 2,
        //         positions: [position1, position2],
        //     },
        // });

        polylines.add({
            // pixelSize: 5,
            material: new Cesium.Material({
                fabric: {
                    type: 'Color',
                    uniforms: {
                        color: Cesium.Color.RED,
                    }
                }
            }),
            positions: [position1, position2],
            width: 2
        });


    }
    function addLabels() {
        baseLine = new Cesium.PrimitiveCollection();
        var polylines = new Cesium.PolylineCollection();
        baseLine.add(polylines);
        CIM.viewer.scene.primitives.add(baseLine)
        for (let i = 0; i < outLine.length; i++) {
            addLabel("下", outLine[i], modelMatrix, new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.RED,
            }), polylines);
        }
        return polylines;
    }
    function getObbCenter() {
        var obb = [{ "Z": -6.2007875442504883, "Y": -17.510686874389648, "X": -22.103395462036133 }, { "Z": -6.2007875442504883, "Y": 22.974874496459961, "X": -22.103395462036133 }, { "Z": -6.2007875442504883, "Y": 22.974874496459961, "X": 18.845314025878906 }, { "Z": -6.2007875442504883, "Y": -17.510686874389648, "X": 18.845314025878906 }, { "Z": 42.158794403076172, "Y": -17.510686874389648, "X": -22.103395462036133 }, { "Z": 42.158794403076172, "Y": -17.510686874389648, "X": 18.845314025878906 }, { "Z": 42.158794403076172, "Y": 22.974874496459961, "X": 18.845314025878906 }, { "Z": 42.158794403076172, "Y": 22.974874496459961, "X": -22.103395462036133 }];
        let cartList = []
        for (let i = 0; i < obb.length; i++) {
            cartList.push(new Cesium.Cartesian3(obb[i].X, obb[i].Y, obb[i].Z))
        }
        var aabb = Cesium.AxisAlignedBoundingBox.fromPoints(cartList);
        return aabb.center;
    }
    function start() {
        // buildingHouseStep.push({ type: "base", active: flattenInit, remove: hideFlatten });
        buildingHouseStep.push({ type: "base", active: measuringInit, remove: hideIeasuring });
        let houseArr = houseInit()//针对房屋拆解
        houseArr.map(item => {
            buildingHouseStep.push({ type: "house", active: item });
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
        if (indexStep < buildingHouseStep.length) {
            indexStep += 1;
            if (!runState(indexStep)) {
                run(indexStep);
            }
            if (callBack) {
                callBack(false, false)
            }

        } else {
            finishDesign();
            if (callBack) {
                callBack(false, true)
            }
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
    }
    //执行操作
    function run(index) {
        var fnOb = buildingHouseStep[index];
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
        CIM.viewer.scene.primitives.remove(tileset);
    }

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