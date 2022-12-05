/*
 * @Author: pwz
 * @Date: 2020-09-23 17:12:53
 * @LastEditors: pwz
 * @LastEditTime: 2020-09-23 18:32:14
 * @FilePath: \village-building-design\src\widgets\villageBuilding\src\baseLine.js
 */
import tableServer from "./../../server/tableServer";
class BaseLine {
    constructor(tileset) {
        this.tileset = tileset;
        this.baseLine = [];
        this.outLine = [];
        this.modelMatrix = tileset._root.transform;
        this.obbCenter = tileset.obbCenter;
        this.subtract = tileset.subtract;
    }
    async add() {
        let _this = this;
        _this.remove();//先清除掉测量线
        let tileset = _this.tileset;
        let baseLine = [];
        baseLine = new Cesium.PrimitiveCollection();
        var polylines = new Cesium.PolylineCollection();
        baseLine.add(polylines);
        baseLine.houseId = tileset.id;
        CIM.viewer.scene.primitives.add(baseLine);
        _this.baseLine=baseLine;
        let outLine = await _this.getBaseLine(tileset.tableName);//测量线
        _this.outLine = outLine;
        for (let i = 0; i < outLine.length; i++) {
            _this.newLine(outLine[i], _this.modelMatrix, new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.RED,
            }), polylines);
        }
    }
    remove() {
        if(this.baseLine)
        CIM.viewer.scene.primitives.remove(this.baseLine);
    }
    //获取房屋的地基线
    async getBaseLine(indexTileTable) {
        let param = { entitytable: encodeURIComponent(indexTileTable), paramType: 1 }
        let result = await tableServer.findDentity(param);
        let data = result.content;
        let re = JSON.parse(data.baseline)
        return re;
    }

    /**
     * 
     * @description: 添加测量线
     * @param {type} data 测量线数据
     * @param {type} modelMatrix 房屋的位置
     * @param {type} color 颜色
     * @param {type} polylines 
     * @return {type} 
     */
    newLine(data, modelMatrix, color, polylines) {
        let { obbCenter, subtract } = this;
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
        mz1.z += (-13.2007874015748028 * 0.3048);
        mz2.z += (-13.2007874015748028 * 0.3048);
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
        polylines.add({
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
    static transform() {
    }
}
export default BaseLine;
