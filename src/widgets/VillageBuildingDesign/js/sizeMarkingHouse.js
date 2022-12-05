import {
    setHighlighted,
    getHouseTilesetById,
    getselectedFeatureId,
    getHouseIdByPickedFeature

} from "./common.js";
import modelManager from "./modelManager";
import { BUILDING_HOUSE, BUILDING_METERIAL, BUILDING_TREE, BUILDING_CAR, BUILDING_ENTITYPARCEL } from "./buildingType.js"
import axios from "@/views/js/net/http";
import tableServer from "./../server/tableServer";

class SizeMarkingHouse {
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
    // init() {
    //     let viewer = CIM.viewer;
    //     let _this = this;
    //     CIM.viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
    //         movement
    //     ) {
    //         var position = viewer.scene.pickPosition(movement.position);
    //         var pickedFeature;
    //         // todo  测试
    //         var pickedFeatures = viewer.scene.drillPick(movement.position); //获取当前坐标下的多个对象

    //         //先判断是否在地块包围盒里操作
    //         if (pickedFeatures[0] && pickedFeatures[0].id && pickedFeatures[0].id.name === BUILDING_ENTITYPARCEL) {

    //             pickedFeature = pickedFeatures[1];
    //             if (!Cesium.defined(pickedFeature)) {
    //                 return;
    //             }
    //             let id = getselectedFeatureId(pickedFeature)
    //             let houseId = getHouseIdByPickedFeature(pickedFeature);
    //             let currentSelectTileset =getHouseTilesetById(houseId);
    //             //点击的是房子
    //             if (currentSelectTileset) {
    //                 //高亮与尺寸标注
    //                 if (pickedFeature.primitive instanceof Cesium.Model) {
    //                     if (id && id.name != BUILDING_TREE && id.name != BUILDING_CAR) {
    //                         setHighlighted(undefined);
    //                         _this.sizeMarking(id, currentSelectTileset);
    //                     }
    //                 } else if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
    //                     setHighlighted(pickedFeature);
    //                     _this.sizeMarking(id, currentSelectTileset);
    //                 }
    //             }

    //         }

    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // }
  
    //标记构件的长宽
    async sizeMarking(id, selectTileset, callback) {
        var _this = this;
        this.selectTileset = selectTileset;

        this.tableName = selectTileset.tableName;
        this.selectModelID = undefined;//重置替换的构建类型

        var modelMatrix = this.selectTileset._root.transform;
        this.removeMark();
        this.allPolyLine = [];
        this.subtract = this.selectTileset.subtract;
        this.obbCenter = this.selectTileset.obbCenter;

        //发送请求从后台取
        _this.getData(_this.tableName, "objectid", id).then((res) => {
            if (!res.success || !res.content) return;
            var data = res.content.rows;
            var topology = eval("(" + data[0].topologyelements + ")");
            for (let i = 0; i < topology.Sizes.length; i++) {
                _this.addLabel(topology.Facing, topology.Sizes[i], modelMatrix, Cesium.Color.RED).then(poly => {
                    _this.allPolyLine.push(poly);
                });

            }
            if(callback){
                callback(res)
            }
        });
    }
    async getData(tableName, colName, id, isEncode = false) {
        let param = `tableName=` + tableName + `&page=1&rows=10000&${colName}=` + encodeURIComponent(id);
        var url = tableServer.findDentityUrl + "?" + param;
        let data = await axios.get(url);
        return data;
    }
    async addLabel(face, data, modelMatrix, color, isMark = true) {
        let subtract = this.subtract || this.selectTileset.subtract;
        let obbCenter = this.obbCenter || this.selectTileset.obbCenter;

        var start = new Cesium.Cartesian3(data.Start.X, data.Start.Y, data.Start.Z);
        var end = new Cesium.Cartesian3(data.End.X, data.End.Y, data.End.Z);
        //一英尺 等于 0.3048 米
         var aFoot = 0.3048
        //var aFoot = 1
        var mz1 = new Cesium.Cartesian4(
            (start.x * aFoot - obbCenter.x) + subtract.x,
            (start.y * aFoot - obbCenter.y) + subtract.y,
            (start.z * aFoot  - obbCenter.z) + subtract.z,
            0
        );
        var mz2 = new Cesium.Cartesian4(
            (end.x * aFoot - obbCenter.x) + subtract.x,
            (end.y * aFoot - obbCenter.y) + subtract.y,
            (end.z * aFoot  - obbCenter.z) + subtract.z,
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
            mz1.z += ((-6.2007874015748028 - 15) * aFoot);
            mz2.z += ((-6.2007874015748028 - 15) * aFoot);
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


        // var position1 = new Cesium.Cartesian3(mz10[12], mz10[13], mz10[14]);
        // var position2 = new Cesium.Cartesian3(mz20[12], mz20[13], mz20[14]);
        //换一种取位置的写法
        var position1 = Cesium.Matrix4.getTranslation(mz10, new Cesium.Cartesian3())
        var position2 = Cesium.Matrix4.getTranslation(mz20, new Cesium.Cartesian3())



        // var certerPosition = new Cesium.Cartesian3((position1.x + position2.x) / 2, (position1.y + position2.y) / 2, (position1.z + position2.z) / 2);
        //Cartesian3.midpoint
        var certerPosition = new Cesium.Cartesian3.midpoint(position1, position2, new Cesium.Cartesian3());//取两个世界坐标点的中心点
        var length = (data.Length * aFoot).toFixed(4) * 1000;
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

}
export default new SizeMarkingHouse();