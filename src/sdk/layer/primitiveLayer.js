/**
 * Class PrimitiveLayer
 */
class PrimitiveLayer {
    constructor(viewer = CIM.viewer) {
        this._entities = [];
        this.viewer = viewer;
    }
    /**
     * 添加点图层
     * @param {Array} arr 位置 [x, y, z] 
     * @param {object} style  样式同entity，默认10px黄点
     */
    addPoint(arr, style) {
        if (!style) {
            style = {
                pixelSize: 10,
                color: Cesium.Color.YELLOW
            }
        }
        let position = arr;
        if (arr instanceof Array) {
            position = Cesium.Cartesian3.fromArray(arr);
        }
        var item = this.viewer.entities.add({
            position: position,
            point: style
        });
        this._entities.push(item);
        return item;
    }
    /**
     * 添加线的图层
     * @param {object} arr 位置 [-75, 39, 250000, -125, 39, 250000]
     * @param {object} style 样式
     */
    addPolyline(arr, style) {
        var material;
        if (!style || (style.material == undefined)) {
            material = new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.ORANGE,
                outlineWidth: 2,
                outlineColor: Cesium.Color.BLACK
            })
        } else {
            material = style.material;
        }

        let positions = null;
        if (arr[0] instanceof Object) {
            positions = arr;
        } else {
            positions = Cesium.Cartesian3.fromDegreesArrayHeights(arr);
        }
        var item = this.viewer.entities.add({
            polyline: {
                positions: positions,
                width: (style && style.width) || 5,
                material: material
            }
        });
        this._entities.push(item);
        return item;
    }
    /**
     * 添加标注图层
     * @param {Array} arr 位置 [x, y, z] 
     * @param {object} style 样式
     */
    addAnnotion(arr, style) {
        if (!style) {
            style = {
                image: "../../assets/img/pathroam1.png",
                width: 18,
                height: 18,
            }
        }
        var item = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromArray(arr),
            billboard: style
        });
        this._entities.push(item);
        return item;
    }
    /**
     * 清除图层
     */
    removeAll() {
        let viewer = this.viewer;
        for (let i = this._entities.length - 1; i > -1; i--) {
            viewer.entities.remove(this._entities[i]);
        }
        this._entities.splice(0, this._entities.length);
    }

}

export default PrimitiveLayer;